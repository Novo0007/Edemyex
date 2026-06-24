
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

/**
 * @fileOverview Remote verification API for Chrome Extensions.
 * Validates both the global extension status and individual license keys.
 */
export async function POST(req: NextRequest) {
  try {
    const { extensionId, licenseKey } = await req.json();

    if (!extensionId || !licenseKey) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Missing parameters: extensionId and licenseKey are required.' 
      }, { status: 400 });
    }

    const { firestore } = getFirebaseAdmin();

    // 1. Check if extension exists and is globally active
    const extDoc = await firestore.collection('extensions').doc(extensionId).get();
    
    if (!extDoc.exists) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Extension ID not recognized.' 
      }, { status: 404 });
    }

    const extensionData = extDoc.data();
    if (extensionData?.status === 'locked') {
      return NextResponse.json({ 
        valid: false, 
        reason: 'EXTENSION_LOCKED',
        message: 'This extension has been remotely locked by the developer.' 
      });
    }

    if (extensionData?.status !== 'active') {
      return NextResponse.json({ 
        valid: false, 
        reason: 'EXTENSION_INACTIVE',
        message: 'This extension is currently under maintenance.' 
      });
    }

    // 2. Check if license key is valid for this extension
    const licenseQuery = await firestore
      .collection('extensions')
      .doc(extensionId)
      .collection('licenses')
      .where('key', '==', licenseKey)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (licenseQuery.empty) {
      return NextResponse.json({ 
        valid: false, 
        reason: 'INVALID_LICENSE',
        message: 'Your license key is invalid or has been revoked.' 
      });
    }

    return NextResponse.json({ 
      valid: true, 
      message: 'License verified successfully.',
      extensionName: extensionData?.name 
    });
  } catch (error) {
    console.error('Remote verification error:', error);
    return NextResponse.json({ 
      valid: false, 
      message: 'Internal server security failure.' 
    }, { status: 500 });
  }
}
