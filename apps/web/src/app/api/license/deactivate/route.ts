import { NextRequest, NextResponse } from 'next/server'
import { db, licenses, activations } from '@/db'
import { eq, and, count } from 'drizzle-orm'

interface DeactivateRequest {
  licenseKey: string
  deviceId: string
}

interface DeactivateResponse {
  success: boolean
  activationsRemaining?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeactivateRequest

    if (!body.licenseKey || !body.deviceId) {
      return NextResponse.json<DeactivateResponse>(
        { success: false, error: 'Missing licenseKey or deviceId' },
        { status: 400 }
      )
    }

    // Find the license
    const license = await db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, body.licenseKey),
    })

    if (!license) {
      return NextResponse.json<DeactivateResponse>(
        { success: false, error: 'License not found' },
        { status: 404 }
      )
    }

    // Find the activation
    const activation = await db.query.activations.findFirst({
      where: and(
        eq(activations.licenseId, license.id),
        eq(activations.deviceId, body.deviceId),
        eq(activations.isActive, true)
      ),
    })

    if (!activation) {
      return NextResponse.json<DeactivateResponse>(
        { success: false, error: 'Activation not found for this device' },
        { status: 404 }
      )
    }

    // Deactivate
    await db
      .update(activations)
      .set({ isActive: false })
      .where(eq(activations.id, activation.id))

    // Count remaining activations
    const [activationCount] = await db
      .select({ count: count() })
      .from(activations)
      .where(and(eq(activations.licenseId, license.id), eq(activations.isActive, true)))

    return NextResponse.json<DeactivateResponse>({
      success: true,
      activationsRemaining: license.maxActivations - (activationCount?.count ?? 0),
    })
  } catch (error) {
    console.error('License deactivation error:', error)
    return NextResponse.json<DeactivateResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
