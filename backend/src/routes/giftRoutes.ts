import { Router } from 'express';
import { GiftController } from '../controllers/GiftController.js';

const router = Router();
const giftController = new GiftController();

router.get('/', giftController.listPublicGifts);
router.post('/checkout', giftController.createCheckoutSession);
router.post('/manual', giftController.registerManualPurchase);
router.post('/verify-session', giftController.verifyCheckoutSession);

export default router;