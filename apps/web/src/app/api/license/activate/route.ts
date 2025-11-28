import { NextRequest, NextResponse } from 'next/server'
import { db, licenses, activations } from '@/db'
import { eq, and, count } from 'drizzle-orm'

interface ActivateRequest {
  licenseKey: string
  deviceId: string
  deviceName?: string
  os?: string
  appVersion?: string
}

interface ActivateResponse {
  success: boolean
  activation?: {
    id: string
    deviceId: string
    deviceName: string | null
    activatedAt: string
  }
  license?: {
    plan: string
    updatesUntil: string
    activationsUsed: number
    activationsMax: number
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActivateRequest

    if (!body.licenseKey || !body.deviceId) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Missing licenseKey or deviceId' },
        { status: 400 }
      )
    }

    // Find the license
    const license = await db.query.licenses.findFirst({
      where: eq(licenses.licenseKey, body.licenseKey),
    })

    if (!license) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'License not found' },
        { status: 404 }
      )
    }

    // Check license status
    if (license.status === 'revoked') {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'License has been revoked' },
        { status: 403 }
      )
    }

    // Check if this device is already activated
    const existingActivation = await db.query.activations.findFirst({
      where: and(
        eq(activations.licenseId, license.id),
        eq(activations.deviceId, body.deviceId)
      ),
    })

    if (existingActivation) {
      // Reactivate if previously deactivated
      if (!existingActivation.isActive) {
        await db
          .update(activations)
          .set({
            isActive: true,
            lastValidatedAt: new Date(),
            appVersion: body.appVersion ?? existingActivation.appVersion,
          })
          .where(eq(activations.id, existingActivation.id))
      } else {
        // Update last validated
        await db
          .update(activations)
          .set({ lastValidatedAt: new Date() })
          .where(eq(activations.id, existingActivation.id))
      }

      // Get activation count
      const [activationCount] = await db
        .select({ count: count() })
        .from(activations)
        .where(and(eq(activations.licenseId, license.id), eq(activations.isActive, true)))

      return NextResponse.json<ActivateResponse>({
        success: true,
        activation: {
          id: existingActivation.id,
          deviceId: existingActivation.deviceId,
          deviceName: existingActivation.deviceName,
          activatedAt: existingActivation.activatedAt.toISOString(),
        },
        license: {
          plan: license.plan,
          updatesUntil: license.updatesUntil.toISOString(),
          activationsUsed: activationCount?.count ?? 0,
          activationsMax: license.maxActivations,
        },
      })
    }

    // Count current activations
    const [activationCount] = await db
      .select({ count: count() })
      .from(activations)
      .where(and(eq(activations.licenseId, license.id), eq(activations.isActive, true)))

    const currentActivations = activationCount?.count ?? 0

    // Check if max activations reached
    if (currentActivations >= license.maxActivations) {
      return NextResponse.json<ActivateResponse>(
        {
          success: false,
          error: `Maximum activations reached (${license.maxActivations}). Deactivate a device first.`,
        },
        { status: 403 }
      )
    }

    // Create new activation
    const [newActivation] = await db
      .insert(activations)
      .values({
        licenseId: license.id,
        deviceId: body.deviceId,
        deviceName: body.deviceName,
        os: body.os,
        appVersion: body.appVersion,
        isActive: true,
      })
      .returning()

    return NextResponse.json<ActivateResponse>({
      success: true,
      activation: {
        id: newActivation.id,
        deviceId: newActivation.deviceId,
        deviceName: newActivation.deviceName,
        activatedAt: newActivation.activatedAt.toISOString(),
      },
      license: {
        plan: license.plan,
        updatesUntil: license.updatesUntil.toISOString(),
        activationsUsed: currentActivations + 1,
        activationsMax: license.maxActivations,
      },
    })
  } catch (error) {
    console.error('License activation error:', error)
    return NextResponse.json<ActivateResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
