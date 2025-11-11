import Razorpay from 'razorpay';

// This function now initializes and returns a new Razorpay instance on each call,
// ensuring it uses the current environment variables at runtime.
export function getRazorpayInstance() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        console.error('Razorpay Key ID or Key Secret is not defined in environment variables.');
        throw new Error('Razorpay credentials are not configured.');
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
}
