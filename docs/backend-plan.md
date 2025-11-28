# data-peek Backend & Business Plan

> Planning document for the data-peek licensing system, payment integration, and marketing site.

---

## Business Model

### Pricing Strategy

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Pro License** | ~~$99~~ **$29** (Early Bird) | Perpetual license, 1 year of updates, 3 device activations |
| **Free Tier** | $0 | Limited features (see below) |
| **Cloud** (Future) | ~$5-8/month | Connection sync, saved queries, team features |

### Early Bird Promotion
- **Regular Price:** $99
- **Launch Price:** $29 (Dec 2024 / Early Adopters)
- **Messaging:** "70% off for early supporters"

### Free vs Pro Features

| Feature | Free | Pro ($29) |
|---------|------|-----------|
| Connections | 2 | Unlimited |
| Query History | 50 queries | Unlimited |
| Editor Tabs | 3 | Unlimited |
| Export CSV/JSON | Yes | Yes |
| ER Diagrams | 1 schema | Unlimited |
| Inline Editing | View only | Full CRUD |
| Query Execution Plans | No | Yes |
| Updates | No | 1 year |
| Device Activations | 1 | 3 |

---

## Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Marketing Site | Next.js 14 (App Router) | SSR, API routes, great DX |
| Database | PostgreSQL (Supabase or Neon) | Familiar, reliable |
| Auth | NextAuth.js | Easy OAuth + credentials |
| Payments | DodoPayments | MoR, global reach, one-time + subscriptions |
| Email | Resend | Developer-friendly, good deliverability |
| Hosting | Vercel | Seamless Next.js deployment |
| File Storage | Cloudflare R2 or S3 | App binary downloads |
| Analytics | Plausible or PostHog | Privacy-friendly |

---

## DodoPayments Integration

### Why DodoPayments
- Merchant of Record (handles taxes, VAT globally)
- 150+ countries, 80+ currencies
- One-time payments support (perfect for perpetual licenses)
- SDKs for TypeScript/Node.js
- Webhook support for automation

### Product Setup in DodoPayments
```
Product: data-peek Pro License
Type: One-time payment
Price: $29 (promo) / $99 (regular)
Metadata:
  - license_type: "pro"
  - updates_duration: "1_year"
  - max_activations: 3
```

### Webhook Events to Handle
| Event | Action |
|-------|--------|
| `payment.completed` | Generate license key, store in DB, send email |
| `payment.refunded` | Revoke license, update status |
| `payment.failed` | Log for debugging, notify if needed |

---

## Database Schema

### Tables

```sql
-- Customers (synced from DodoPayments)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  dodo_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  license_key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active', -- active, revoked, expired
  max_activations INT NOT NULL DEFAULT 3,
  dodo_payment_id TEXT UNIQUE,
  dodo_product_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updates_until TIMESTAMPTZ NOT NULL, -- purchased_at + 1 year
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device Activations
CREATE TABLE activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL, -- Hardware fingerprint
  device_name TEXT, -- e.g., "MacBook Pro M2"
  os TEXT, -- macos, windows, linux
  app_version TEXT,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(license_id, device_id)
);

-- App Releases (for update checks)
CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT UNIQUE NOT NULL, -- semver: 1.0.0
  release_notes TEXT,
  download_url_mac TEXT,
  download_url_mac_arm TEXT,
  download_url_windows TEXT,
  download_url_linux TEXT,
  is_latest BOOLEAN DEFAULT FALSE,
  min_supported_version TEXT, -- for forced updates
  released_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_licenses_customer ON licenses(customer_id);
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_activations_license ON activations(license_id);
CREATE INDEX idx_activations_device ON activations(device_id);
```

---

## API Endpoints

### Public API (called by Electron app)

```
POST /api/license/validate
  Request:  { licenseKey, deviceId }
  Response: { valid, plan, status, updatesUntil, activationsRemaining }

POST /api/license/activate
  Request:  { licenseKey, deviceId, deviceName, os, appVersion }
  Response: { success, activation, license }

POST /api/license/deactivate
  Request:  { licenseKey, deviceId }
  Response: { success, activationsRemaining }

GET /api/updates/check?version=1.0.0&platform=macos
  Response: { hasUpdate, latestVersion, downloadUrl, releaseNotes, forceUpdate }
```

### Webhook Endpoint

```
POST /api/webhooks/dodo
  - Verify signature from DodoPayments
  - Handle payment.completed → create license
  - Handle payment.refunded → revoke license
```

### Protected API (requires auth, for account dashboard)

```
GET  /api/account/licenses      # List user's licenses
GET  /api/account/activations   # List active devices
POST /api/account/deactivate    # Deactivate a device remotely
GET  /api/account/downloads     # Get download links
```

---

## License Key Generation

### Format
```
DPRO-XXXX-XXXX-XXXX-XXXX
```
- Prefix: `DPRO` (data-peek pro)
- 4 groups of 4 alphanumeric characters
- Total: 20 characters (easy to type, hard to guess)

### Generation Logic
```typescript
import { randomBytes } from 'crypto'

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0, O, 1, I (avoid confusion)
  const segments: string[] = []

  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      const randomIndex = randomBytes(1)[0] % chars.length
      segment += chars[randomIndex]
    }
    segments.push(segment)
  }

  return `DPRO-${segments.join('-')}`
}
```

---

## Electron App Integration

### License Activation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FIRST LAUNCH                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│   │  Show       │    │  User enters │    │  Call /activate │   │
│   │  License    │───▶│  license key │───▶│  API endpoint   │   │
│   │  Dialog     │    │              │    │                 │   │
│   └─────────────┘    └──────────────┘    └────────┬────────┘   │
│                                                    │            │
│                           ┌────────────────────────┴──────┐     │
│                           ▼                               ▼     │
│                    ┌─────────────┐                ┌───────────┐ │
│                    │   Valid     │                │  Invalid  │ │
│                    │   License   │                │  Show     │ │
│                    │   Store     │                │  Error    │ │
│                    │   locally   │                │           │ │
│                    └─────────────┘                └───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Validation Strategy

```typescript
// On app startup
async function checkLicense(): Promise<LicenseStatus> {
  const stored = await getLicenseFromStore()

  if (!stored) {
    return { status: 'free', features: FREE_FEATURES }
  }

  // Try online validation
  try {
    const result = await validateOnline(stored.key, getDeviceId())

    if (result.valid) {
      // Update local cache
      await updateLicenseCache(result)
      return { status: 'pro', features: PRO_FEATURES, license: result }
    } else {
      // License revoked or invalid
      await clearLicenseStore()
      return { status: 'free', features: FREE_FEATURES, error: result.reason }
    }
  } catch (error) {
    // Offline - use cached validation (grace period)
    if (stored.cachedValidation && isWithinGracePeriod(stored.lastValidated)) {
      return { status: 'pro', features: PRO_FEATURES, offline: true }
    }
    return { status: 'free', features: FREE_FEATURES }
  }
}
```

### Device Fingerprinting

```typescript
import { machineIdSync } from 'node-machine-id'
import os from 'os'

function getDeviceId(): string {
  return machineIdSync() // Unique per machine
}

function getDeviceName(): string {
  return os.hostname()
}

function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    os: process.platform, // darwin, win32, linux
    appVersion: app.getVersion()
  }
}
```

---

## Marketing Site Structure

### Pages

```
/                       # Landing page
/pricing                # Pricing with buy button
/download               # Platform-specific downloads
/docs                   # Getting started guide
/docs/[slug]            # Individual doc pages
/faq                    # Frequently asked questions
/changelog              # Release history
/blog                   # Updates, tutorials (future)
/account                # Dashboard (protected)
/account/licenses       # Manage licenses (protected)
/account/downloads      # Download links (protected)
/login                  # Auth page
```

### Landing Page Sections

1. **Hero** - Tagline, screenshot, CTA button
2. **Problem** - Pain points with existing tools
3. **Features** - Key capabilities with visuals
4. **Demo** - GIF or video of the app in action
5. **Comparison** - vs pgAdmin, DBeaver, TablePlus
6. **Pricing** - Single tier, early bird callout
7. **FAQ** - Common questions
8. **CTA** - Final call to action

---

## Email Templates

### Welcome Email (after purchase)
```
Subject: Your data-peek Pro license 🎉

Hi {name},

Thank you for purchasing data-peek Pro!

Your license key: {license_key}

Quick start:
1. Download data-peek: {download_link}
2. Open the app and go to Settings → License
3. Enter your license key

Your license includes:
✓ 1 year of updates (until {updates_until})
✓ 3 device activations
✓ All Pro features unlocked

Need help? Reply to this email.

Happy querying!
— The data-peek team
```

### License Activation Email
```
Subject: data-peek activated on {device_name}

Your license was just activated on a new device:

Device: {device_name}
Activated: {timestamp}
Activations used: {used}/{max}

Not you? Manage your devices at {dashboard_link}
```

---

## Implementation Roadmap

### Phase 1: MVP (Week 1)
- [ ] Set up Next.js project with App Router
- [ ] Configure DodoPayments account and product
- [ ] Create database schema (Supabase/Neon)
- [ ] Implement `/api/webhooks/dodo` endpoint
- [ ] Implement `/api/license/validate` endpoint
- [ ] Implement `/api/license/activate` endpoint
- [ ] Build landing page with pricing
- [ ] Build download page
- [ ] Deploy to Vercel
- [ ] Test end-to-end purchase flow

### Phase 2: Polish (Week 2)
- [ ] Add account dashboard with NextAuth
- [ ] Implement device management UI
- [ ] Add email notifications (Resend)
- [ ] Implement update checker API
- [ ] Add analytics (Plausible)
- [ ] Write FAQ page
- [ ] Add basic docs/getting started

### Phase 3: Electron Integration (Week 2-3)
- [ ] Add license dialog to data-peek app
- [ ] Implement device fingerprinting
- [ ] Add license validation on startup
- [ ] Implement feature gating (free vs pro)
- [ ] Add "Check for updates" functionality
- [ ] Handle offline grace period
- [ ] Test activation/deactivation flow

### Phase 4: Launch Prep (Week 3)
- [ ] Create app store screenshots
- [ ] Record demo video/GIF
- [ ] Write launch blog post
- [ ] Set up social media accounts
- [ ] Prepare ProductHunt launch
- [ ] Build releases for all platforms
- [ ] Final QA testing

---

## Security Considerations

### API Security
- [ ] Rate limiting on all endpoints (prevent brute force)
- [ ] Webhook signature verification (DodoPayments)
- [ ] Input validation on all parameters
- [ ] SQL injection prevention (parameterized queries)

### License Security
- [ ] License keys stored hashed in DB? (or encrypted)
- [ ] Device ID cannot be spoofed easily
- [ ] Offline grace period limited (7-14 days)
- [ ] Anomaly detection (too many activations)

### Data Privacy
- [ ] Minimal data collection
- [ ] No tracking in the app
- [ ] Clear privacy policy
- [ ] GDPR compliance (if EU customers)

---

## Metrics to Track

### Business Metrics
- Total licenses sold
- Revenue (MRR if cloud tier added)
- Conversion rate (free → pro)
- Refund rate

### Product Metrics
- Daily/weekly active users
- Feature usage (which features are popular)
- Error rates
- Update adoption rate

### Marketing Metrics
- Website visitors
- Download counts
- Trial starts
- Email open/click rates

---

## Future Considerations

### Cloud Tier (v2)
- User accounts required
- Connection sync across devices
- Saved queries library
- Team sharing features
- Subscription billing via DodoPayments

### Additional Payment Options
- Regional pricing
- Team/volume licenses
- Educational discounts
- Lifetime deals (AppSumo?)

---

## Open Questions

- [ ] Exact DodoPayments webhook event names (check their docs)
- [ ] License key format preference
- [ ] Offline grace period duration (7 or 14 days?)
- [ ] Domain name for marketing site
- [ ] App signing certificates (macOS notarization, Windows signing)

---

## Resources

- [DodoPayments Docs](https://docs.dodopayments.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [NextAuth.js](https://next-auth.js.org/)
- [Resend](https://resend.com/docs)
- [Supabase](https://supabase.com/docs)
- [node-machine-id](https://www.npmjs.com/package/node-machine-id)

---

*Document created: November 2024*
*Last updated: November 2024*
