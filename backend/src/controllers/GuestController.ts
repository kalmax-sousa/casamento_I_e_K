import type { Request, Response } from 'express';
import { GuestService } from '../services/GuestService.js';

const guestService = new GuestService();

export class GuestController {
  async search(req: Request, res: Response) {
    try {
      const { name } = req.query;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Nome é obrigatório para a busca' });
      }

      const guests = await guestService.searchGuestsByName(name);
      return res.json(guests);
    } catch (error) {
      console.error('Erro na busca de convidados:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async confirm(req: Request, res: Response) {
    try {
      const { guestIds, isConfirmed = true } = req.body;

      if (!guestIds || !Array.isArray(guestIds)) {
        return res.status(400).json({ error: 'É necessário enviar um array de guestIds.' });
      }

      const result = await guestService.confirmPresence(guestIds, isConfirmed);

      return res.json({ 
        message: 'Confirmação atualizada com sucesso!', 
        updatedCount: result.count 
      });
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}