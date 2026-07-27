import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-06-24.dahlia',
});

export class GiftController {
  async listPublicGifts(req: Request, res: Response) {
    try {
      const gifts = await prisma.gift.findMany({
        orderBy: { price: 'asc' }
      });
      return res.json(gifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar presentes.' });
    }
  }

  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { giftId, quantityToBuy, buyerName } = req.body;

      const gift = await prisma.gift.findUnique({ where: { id: giftId } });

      if (!gift) {
        return res.status(404).json({ error: 'Presente não encontrado.' });
      }

      const available = gift.totalQuantity - gift.purchasedQuantity;
      if (quantityToBuy > available) {
        return res.status(400).json({ error: `Apenas ${available} unidades disponíveis.` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: gift.name,
                description: gift.description || '',
                images: gift.photoUrl ? [gift.photoUrl] : [],
              },
              unit_amount: Math.round(gift.price * 100), 
            },
            quantity: quantityToBuy,
          },
        ],
        mode: 'payment',
        metadata: {
          giftId: gift.id,
          quantityBought: quantityToBuy.toString(),
          buyerName: buyerName || 'Não informado',
        },
        success_url: `${process.env.FRONTEND_URL}/presentes/sucesso`,
        cancel_url: `${process.env.FRONTEND_URL}/presentes`,
      });

      return res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar pagamento.' });
    }
  }

  // Nova função para registrar presente dado por fora do site
  async registerExternalPurchase(req: Request, res: Response) {
    try {
      const { giftId, quantityToBuy, buyerName } = req.body;

      if (!buyerName) {
        return res.status(400).json({ error: 'O nome é obrigatório para esta opção.' });
      }

      const gift = await prisma.gift.findUnique({ where: { id: giftId } });
      if (!gift) return res.status(404).json({ error: 'Presente não encontrado.' });

      const available = gift.totalQuantity - gift.purchasedQuantity;
      if (quantityToBuy > available) return res.status(400).json({ error: `Apenas ${available} disponíveis.` });

      // 1. Registra a compra
      await prisma.purchase.create({
        data: {
          giftId,
          buyerName,
          quantityBought: quantityToBuy,
          amountPaid: 0, // Como foi por fora, o site não processou valor
          status: 'EXTERNAL',
        }
      });

      // 2. Dá baixa no estoque
      await prisma.gift.update({
        where: { id: giftId },
        data: { purchasedQuantity: { increment: quantityToBuy } }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao registrar presente.' });
    }
  }

  async createGift(req: Request, res: Response) {
    try {
      const { name, description, photoUrl, price, totalQuantity } = req.body;

      const gift = await prisma.gift.create({
        data: {
          name,
          description,
          photoUrl,
          price: Number(price),
          totalQuantity: Number(totalQuantity),
        },
      });

      return res.status(201).json(gift);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar presente.' });
    }
  }
}