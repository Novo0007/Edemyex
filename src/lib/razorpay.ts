import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error('Razorpay Key ID or Key Secret is not defined in environment variables.');
}

export const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});
