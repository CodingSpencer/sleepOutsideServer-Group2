import express from 'express';
const router = express.Router();
import { getProductPrice } from '../services/product.service.mts'; 

router.post('/orders', async (req, res) => {
    const { cartItems, totals, payment } = req.body;

    if (!cartItems || !totals || !payment) {
        return res.status(400).json({ error: "Bad Request: Missing required order fields." });
    }

    let calculatedSubtotal = 0;

    for (const item of cartItems) {
        const serverPrice = await getProductPrice(item.id);
        if (!serverPrice) {
        return res.status(404).json({ error: `Product with ID ${item.id} not found.` });
        }
        calculatedSubtotal += serverPrice * item.quantity;
    }

    if (Math.abs(totals.subtotal - calculatedSubtotal) > 0.01) {
        return res.status(400).json({ 
        error: "Order total mismatch. The cart contents do not match the provided totals." 
        });
    }

    const { cardNumber, expirationDate } = payment;

    // Restrict to one specific card number (e.g., standard Visa test card)
    const ALLOWED_TEST_CARD = "4111111111111111"; 
    if (cardNumber !== ALLOWED_TEST_CARD) {
        return res.status(422).json({ error: "Payment Processor Error: Card declined or invalid test card number." });
    }

    // Validate Expiration Date (Format: MM/YY)
    const expMatch = expirationDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
    if (!expMatch) {
        return res.status(400).json({ error: "Invalid expiration date format. Use MM/YY." });
    }

    const [_, expMonth, expYear] = expMatch;
    const currentYear = parseInt(new Date().getFullYear().toString().slice(-2));
    const currentMonth = new Date().getMonth() + 1;
    const yearInt = parseInt(expYear);
    const monthInt = parseInt(expMonth);

    if (yearInt < currentYear || (yearInt === currentYear && monthInt < currentMonth)) {
        return res.status(422).json({ error: "Payment Processor Error: The provided card is expired." });
    }

    try {
        const newOrder = {
        orderId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        status: "Paid",
        items: cartItems,
        grandTotal: calculatedSubtotal,
        createdAt: new Date()
        };

        return res.status(201).json({
        message: "Order placed successfully!",
        order: newOrder
        });

    } catch (dbError) {
        return res.status(500).json({ error: "Internal Server Error: Failed to save the order." });
    }
});

export default router;