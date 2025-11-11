import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { purchaseCourse } from '@/lib/data';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const text = await req.text();
  const signature = headers().get('x-razorpay-signature');

  if (!signature) {
      return NextResponse.json({ message: 'Signature missing' }, { status: 400 });
  }

  if (!webhookSecret) {
      console.error('Razorpay webhook secret is not set.');
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }

  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(text);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  // Signature is valid, process the event
  try {
    const event = JSON.parse(text);

    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const { userId, courseId } = payment.notes;

        if (userId && courseId) {
            console.log(`Processing purchase for userId: ${userId}, courseId: ${courseId}`);
            // Grant access to the course
            const success = await purchaseCourse(userId, courseId);
            if (!success) {
                 console.error(`Failed to grant course access for userId: ${userId}, courseId: ${courseId}`);
                 // You might want to add retry logic or manual alert here
            } else {
                 console.log(`Successfully granted course access for userId: ${userId}, courseId: ${courseId}`);
            }
        } else {
            console.warn('Webhook received without userId or courseId in notes', payment);
        }
    }
    
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ message: 'Error processing webhook' }, { status: 500 });
  }
}
