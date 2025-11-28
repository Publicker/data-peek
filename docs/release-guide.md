# data-peek Release Guide

This document covers everything needed to ship data-peek for macOS, Windows, and Linux.

---

## TL;DR — Can I Ship for Free?

**Yes.** Here's the reality:

| Platform | Free Option | Paid Option | User Experience Difference |
|----------|-------------|-------------|---------------------------|
| **Linux** | ✅ No signing needed | N/A | No difference |
| **macOS** | ✅ Ad-hoc signing | $99/year Apple Developer | Warning dialog vs no warning |
| **Windows** | ✅ Unsigned | ~$200-400/year certificate | SmartScreen warning vs trusted |

Most open-source Electron apps ship unsigned. Users can bypass warnings.

---

## Platform-Specific Details

### Linux — No Signing Required ✅

Linux doesn't require code signing. Your current setup is ready:
- AppImage: Works out of the box
- Snap: Works out of the box
- Deb: Works out of the box

**Action needed:** None. Just build and distribute.

---

### macOS — Options

#### Option 1: Unsigned/Ad-hoc (Free) ✅

Users will see: *"data-peek can't be opened because Apple cannot check it for malicious software"*

**Workaround for users:**
1. Right-click the app → Open (first time only)
2. Or: `xattrs -cr /Applications/data-peek.app`

**Pros:** Free, works fine for developer tools
**Cons:** Scary warning, extra step for users

**Current config already supports this** — just build and distribute.

#### Option 2: Apple Developer Program ($99/year)

Users will see: No warning, app opens normally.

**What you get:**
- Developer ID certificate for signing
- Notarization (Apple scans your app)
- No Gatekeeper warnings

**When to consider:** If you want a polished user experience or plan to distribute via Mac App Store.

---

### Windows — Options

#### Option 1: Unsigned (Free) ✅

Users will see: *"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting"*

**Workaround for users:**
1. Click "More info"
2. Click "Run anyway"

**Pros:** Free
**Cons:** SmartScreen warning scares users, some corporate machines block unsigned apps

**Note:** SmartScreen builds reputation over time. After enough users download and run your app without issues, warnings may reduce.

#### Option 2: Code Signing Certificate ($200-600/year)

Traditional EV (Extended Validation) certificates from:
- DigiCert (~$400-600/year)
- Sectigo (~$200-400/year)
- SSL.com (~$200/year)

**Pros:** Immediate SmartScreen trust (EV certs), professional appearance
**Cons:** Expensive, annual renewal

#### Option 3: Azure Trusted Signing (~$10/month) 💡

Microsoft's newer, cheaper alternative:
- Pay-as-you-go pricing
- Works with electron-builder
- Builds SmartScreen reputation faster than unsigned

**Pros:** Cheap, modern, Microsoft-backed
**Cons:** Requires Azure account, slightly more setup

#### Option 4: SignPath (Free for Open Source) 💡

[SignPath.io](https://signpath.io) offers free code signing for open-source projects.

**Requirements:**
- Public GitHub repository
- OSS license (MIT qualifies)
- Apply and get approved

**Pros:** Completely free
**Cons:** Approval process, builds must go through their CI

---

## Recommended Approach

### For Initial Release (v1.0)

Ship unsigned on all platforms:

1. **Linux** — No changes needed
2. **macOS** — Users right-click → Open (one time)
3. **Windows** — Users click "More info" → "Run anyway"

Include clear installation instructions in README.

### For Future Releases

Consider signing when:
- You have paying users (Pro tier)
- Download volume justifies the cost
- Corporate users need signed apps

---

## Release Checklist

### Pre-Release

- [ ] Update `electron-builder.yml`:
  - [ ] Change `appId` to `com.datapeek.app`
  - [ ] Remove `electronDownload.mirror` line
  - [ ] Update `publish` config (see below)
- [ ] Update `package.json`:
  - [ ] Set proper `author`
  - [ ] Set `homepage` to GitHub repo
- [ ] Add LICENSE file (MIT)
- [ ] Add README with screenshots and install instructions
- [ ] Test builds on each platform

### electron-builder.yml Updates

```yaml
appId: com.datapeek.app
productName: data-peek

# ... keep existing config ...

# For GitHub Releases (recommended)
publish:
  provider: github
  owner: Rohithgilla12
  repo: data-peek

# Remove this line:
# electronDownload:
#   mirror: https://npmmirror.com/mirrors/electron/
```

### Building Releases

```bash
# From apps/desktop directory

# macOS (builds for current architecture)
pnpm build:mac

# macOS universal (Intel + Apple Silicon)
# Add to electron-builder.yml under mac:
#   target:
#     - target: dmg
#       arch: [x64, arm64]

# Windows
pnpm build:win

# Linux
pnpm build:linux
```

### Creating a GitHub Release

1. Tag your release:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Go to GitHub → Releases → Draft new release

3. Upload build artifacts:
   - `data-peek-desktop-1.0.0.dmg` (macOS)
   - `data-peek-desktop-1.0.0-setup.exe` (Windows)
   - `data-peek-desktop-1.0.0.AppImage` (Linux)
   - `data-peek-desktop-1.0.0.snap` (Linux)
   - `data-peek-desktop-1.0.0.deb` (Linux)

4. Write release notes and publish

---

## CI/CD (Optional but Recommended)

Automate builds with GitHub Actions. Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Build
        run: pnpm --filter @data-peek/desktop build

      - name: Build Electron app
        run: |
          cd apps/desktop
          pnpm exec electron-builder --publish never
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.os }}
          path: apps/desktop/dist/*.{dmg,exe,AppImage,snap,deb}
```

---

## Installation Instructions for Users

Include this in your README:

### macOS

1. Download `data-peek-desktop-x.x.x.dmg`
2. Open the DMG and drag to Applications
3. **First launch:** Right-click the app → Click "Open" → Click "Open" again

   (This is required because the app is not notarized)

### Windows

1. Download `data-peek-desktop-x.x.x-setup.exe`
2. Run the installer
3. **If you see SmartScreen warning:** Click "More info" → "Run anyway"

### Linux

**AppImage:**
```bash
chmod +x data-peek-desktop-x.x.x.AppImage
./data-peek-desktop-x.x.x.AppImage
```

**Snap:**
```bash
sudo snap install data-peek-desktop-x.x.x.snap --dangerous
```

**Deb:**
```bash
sudo dpkg -i data-peek-desktop-x.x.x.deb
```

---

## Cost Summary

| Approach | Cost | Notes |
|----------|------|-------|
| Ship unsigned | $0 | Users see warnings |
| macOS only signing | $99/year | Apple Developer Program |
| Windows only signing | $10-400/year | Azure TS or traditional cert |
| Both platforms signed | $109-500/year | Combined |
| SignPath (Windows) | $0 | Free for OSS, requires approval |

---

## Future Considerations

### Auto-Updates

Current config uses `electron-updater`. For unsigned apps:
- macOS: Auto-updates work but user must approve
- Windows: Auto-updates work
- Linux: AppImage supports auto-updates via `electron-updater`

### Mac App Store

Requires Apple Developer Program + additional review process. Consider only if:
- You want discoverability
- You're okay with Apple's 15-30% cut
- Your app meets their guidelines

### Windows Store

Possible but requires Microsoft Partner account. Similar considerations to Mac App Store.
