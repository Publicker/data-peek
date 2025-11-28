import { NextRequest, NextResponse } from 'next/server'
import { db, licenses, activations } from '@/db'
import { eq, and, count } from 'drizzle-orm'

interface ValidateRequest {
  licenseKey: string
  deviceId: string
}

interface ValidateResponse {
  valid: boolean
  plan?: string
  status?: string
  updatesUntil?: string
  activationsUsed?: number
  activationsMax?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ValidateRequest

    if (!body.licenseKey || !body.deviceId) {
      return NextResponse.json<ValidateResponse>(
        { valid: false, error: 'Missing licenseKey or deviceId' },
        { status: 400 }
      )
    }

    // Find the license
    const license = await db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, body.licenseKey),
    })

    if (!license) {
      return NextResponse.json<ValidateResponse>(
        { valid: false, error: 'License not found' },
        { status: 404 }
      )
    }

    // Check license status
    if (license.status === 'revoked') {
      return NextResponse.json<ValidateResponse>(
        { valid: false, error: 'License has been revoked' },
        { status: 403 }
      )
    }

    // Count active activations
    const [activationCount] = await db
      .select({ count: count() })
      .from(activations)
      .where(and(eq(activations.licenseId, license.id), eq(activations.isActive, true)))

    const activationsUsed = activationCount?.count ?? 0

    // Check if this device is already activated
    const existingActivation = await db.query.activations.findFirst({
      where: and(
        eq(activations.licenseId, license.id),
        eq(activations.deviceId, body.deviceId),
        eq(activations.isActive, true)
      ),
    })

    // Update last validated timestamp if device is activated
    if (existingActivation) {
      await db
        .update(activations)
        .set({ lastValidatedAt: new Date() })
        .where(eq(activations.id, existingActivation.id))
    }

    return NextResponse.json<ValidateResponse>({
      valid: true,
      plan: license.plan,
      status: license.status,
      updatesUntil: license.updatesUntil.toISOString(),
      activationsUsed,
      activationsMax: license.maxActivations,
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json<ValidateResponse>(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
