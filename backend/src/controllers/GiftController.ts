import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-06-24.dahlia',
});

export class GiftController {
  async listAllGifts(req: Request, res: Response) {
    try {
      const gifts = await prisma.gift.findMany({
        orderBy: { price: 'asc' }
      });
      return res.json(gifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar presentes.' });
    }
  }

  async listPublicGifts(req: Request, res: Response) {
    try {
      const gifts = await prisma.$queryRaw`
        SELECT * FROM "Gift" WHERE "purchasedQuantity" < "totalQuantity" ORDER BY "price" ASC;
      `;
      return res.json(gifts);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar presentes.' });
    }
  }

  async createCheckoutSession(req: Request, res: Response) {
    try {
      // 1. Recebemos a mensagem do frontend
      const { giftId, quantityToBuy, buyerName, message } = req.body;

      const gift = await prisma.gift.findUnique({ where: { id: giftId } });
      if (!gift) return res.status(404).json({ error: 'Presente não encontrado.' });

      const available = gift.totalQuantity - gift.purchasedQuantity;
      if (quantityToBuy > available) return res.status(400).json({ error: `Apenas ${available} unidades disponíveis.` });

      const baseUrl = process.env.FRONTEND_URL;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: gift.name,
                ...(gift.description ? { description: gift.description } : {}),
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
          message: message || '',
          paymentMethod: 'STRIPE'
        },
        success_url: `${baseUrl}/presentes?pagamento=sucesso&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/presentes`,
      });

      return res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar pagamento.' });
    }
  }

  // GiftController.ts
async verifyCheckoutSession(req: Request, res: Response) {
  const { sessionId } = req.body;

  if (!sessionId) return res.status(400).json({ error: 'Session ID é obrigatório' });

  try {
    // 1. Busca a sessão direto no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Verifica se a pessoa pagou mesmo
    if (session.payment_status === 'paid' && session.metadata) {
      
      // 3. Verifica se já não demos baixa nessa compra (para evitar duplicidade se a pessoa atualizar a página)
      const existingPurchase = await prisma.purchase.findFirst({
        where: { stripeSession: session.id }
      });

      if (!existingPurchase) {
        const { giftId, quantityBought, buyerName, message } = session.metadata;

        // Cria a compra
        await prisma.purchase.create({
          data: {
            giftId: giftId ?? '',
            buyerName: buyerName || 'Não informado',
            message: message || 'Nenhuma mensagem',
            paymentMethod: 'STRIPE',
            quantityBought: parseInt(quantityBought || '1'),
            amountPaid: (session.amount_total || 0) / 100,
            status: 'PAID',
            stripeSession: session.id
          }
        });

        // Dá a baixa no estoque
        await prisma.gift.update({
          where: { id: giftId ?? '' },
          data: { purchasedQuantity: { increment: parseInt(quantityBought || '1') } }
        });

        return res.json({ success: true, message: 'Baixa concluída com sucesso!' });
      } else {
        return res.json({ success: true, message: 'Essa compra já havia sido processada.' });
      }
    }

    return res.status(400).json({ error: 'Pagamento ainda não foi concluído.' });

  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return res.status(500).json({ error: 'Erro interno ao verificar pagamento.' });
  }
}

  async registerManualPurchase(req: Request, res: Response) {
    try {
      const { giftId, quantityToBuy, buyerName, message, method } = req.body;

      if (!buyerName) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
      }

      const gift = await prisma.gift.findUnique({ where: { id: giftId } });
      if (!gift) return res.status(404).json({ error: 'Presente não encontrado.' });

      const available = gift.totalQuantity - gift.purchasedQuantity;
      if (quantityToBuy > available) return res.status(400).json({ error: `Apenas ${available} disponíveis.` });

      await prisma.purchase.create({
        data: {
          giftId,
          buyerName,
          message,
          paymentMethod: method,
          quantityBought: quantityToBuy,
          amountPaid: method === 'PIX_MANUAL' ? (gift.price * quantityToBuy) : 0,
          status: method === 'PIX_MANUAL' ? 'PAID' : 'EXTERNAL',
        }
      });

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
      const { name, description, specifications, storeLinks, photoUrl, price, totalQuantity } = req.body;

      const gift = await prisma.gift.create({
        data: {
          name,
          description,
          specifications, 
          storeLinks,     
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

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    try {
      const event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret as string);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const existingPurchase = await prisma.purchase.findFirst({
          where: { stripeSession: session.id }
        });

        if (!existingPurchase && session.metadata) {
          const { giftId, quantityBought, buyerName, message } = session.metadata;

          if (!giftId) {
            return res.status(400).send('Metadata incompleto: faltando giftId');
          }

          await prisma.purchase.create({
            data: {
              giftId,
              buyerName: buyerName || 'Não informado',
              message: message || 'Nenhuma mensagem',
              paymentMethod: 'STRIPE',
              quantityBought: parseInt(quantityBought || '1'),
              amountPaid: (session.amount_total || 0) / 100,
              status: 'PAID',
              stripeSession: session.id
            }
          });

          // 2. Dá baixa no estoque do presente!
          await prisma.gift.update({
            where: { id: giftId },
            data: { purchasedQuantity: { increment: parseInt(quantityBought || '1') } }
          });
        }
      }
      return res.json({ received: true });
    } catch (err: any) {
      console.error('Erro no Webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // EDITAR PRESENTE
  async updateGift(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { name, description, specifications, storeLinks, photoUrl, price, totalQuantity } = req.body;

      const gift = await prisma.gift.update({
        where: { id },
        data: {
          name,
          description,
          specifications,
          storeLinks,
          photoUrl,
          price: Number(price),
          totalQuantity: Number(totalQuantity),
        },
      });

      return res.json(gift);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar presente.' });
    }
  }

  // EXCLUIR PRESENTE
  async deleteGift(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // Importante: Você precisa deletar ou lidar com as compras vinculadas a esse presente antes de excluir ele
      await prisma.purchase.deleteMany({
        where: { giftId: id }
      });

      await prisma.gift.delete({
        where: { id }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir presente.' });
    }
  }

  async listPurchases(req: Request, res: Response) {
    try {
      const purchases = await prisma.purchase.findMany({
        include: { gift: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(purchases);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar compras.' });
    }
  }
}