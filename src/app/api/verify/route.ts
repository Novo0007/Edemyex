
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { extensionId, licenseKey } = await req.json();

    if (!extensionId || !licenseKey) {
      return NextResponse.json({ valid: false, message: 'Missing parameters' }, { status: 400 });
    }

    const { firestore } = getFirebaseAdmin();

    // 1. Check if extension exists and is active
    const extDoc = await firestore.collection('extensions').doc(extensionId).get();
    if (!extDoc.exists || extDoc.data()?.status !== 'active') {
      return NextResponse.json({ valid: false, message: 'Extension not found or inactive' }, { status: 404 });
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
      return NextResponse.json({ valid: false, message: 'Invalid or revoked license key' });
    }

    return NextResponse.json({ valid: true, message: 'License verified' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ valid: false, message: 'Internal server error' }, { status: 500 });
  }
}
