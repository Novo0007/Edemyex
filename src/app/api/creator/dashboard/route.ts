
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { subMonths, format, startOfMonth } from 'date-fns';
import type { Purchase } from '@/lib/types';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

// Helper to get user and check role
export async function getCreatorFromToken(headers: ReadonlyHeaders) {
    const authorization = headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }
    const idToken = authorization.split('Bearer ')[1];
    
    const { auth, firestore } = getFirebaseAdmin();
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) return null;
        
        const user = userDoc.data();
        // Only allow creators or admins to access this
        if (user?.role === 'creator' || user?.role === 'admin') {
            return { id: decodedToken.uid, ...user };
        }
        return null;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

export async function GET(req: NextRequest) {
    const creator = await getCreatorFromToken(req.headers);

    if (!creator) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firestore } = getFirebaseAdmin();

    try {
        // --- 1. Get all purchases for the creator ---
        const purchasesSnapshot = await firestore.collection('purchases')
            .where('creatorId', '==', creator.id)
            .get();

        const purchases = purchasesSnapshot.docs.map(doc => doc.data() as Purchase);
        
        // --- 2. Calculate total revenue and unique students ---
        let totalRevenue = 0;
        const studentIds = new Set<string>();

        purchases.forEach(p => {
            totalRevenue += p.price || 0;
            studentIds.add(p.userId);
        });
        const totalStudents = studentIds.size;
        
        // --- 3. Get active course count ---
        const coursesSnapshot = await firestore.collection('courses')
            .where('creatorId', '==', creator.id)
            .where('status', '==', 'published')
            .count()
            .get();
        const activeCourses = coursesSnapshot.data().count;

        // --- 4. Aggregate sales by the last 6 months ---
        const salesByMonth: { [key: string]: number } = {};
        const monthLabels: string[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthKey = format(date, 'yyyy-MM');
            const monthLabel = format(date, 'MMM');
            salesByMonth[monthKey] = 0;
            monthLabels.push(monthLabel);
        }
        
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

        const recentPurchasesSnapshot = await firestore.collection('purchases')
            .where('creatorId', '==', creator.id)
            .where('purchaseDate', '>=', sixMonthsAgo) // Query using Date object
            .get();

        recentPurchasesSnapshot.docs.forEach(doc => {
            const purchase = doc.data() as Purchase;
            const purchaseTimestamp = purchase.purchaseDate as unknown as Timestamp;

            if (purchaseTimestamp) {
                const purchaseDate = purchaseTimestamp.toDate();
                const monthKey = format(purchaseDate, 'yyyy-MM');
                if (salesByMonth.hasOwnProperty(monthKey)) {
                    salesByMonth[monthKey] += purchase.price || 0;
                }
            }
        });

        const salesByMonthFormatted = monthLabels.map((label, index) => {
            const date = subMonths(new Date(), 5 - index);
            const key = format(date, 'yyyy-MM');
            return {
                monthLabel: label,
                sales: salesByMonth[key] || 0,
            };
        });

        return NextResponse.json({
            totalRevenue,
            totalStudents,
            activeCourses,
            salesByMonth: salesByMonthFormatted,
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
