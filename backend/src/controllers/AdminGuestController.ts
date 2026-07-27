import type { Request, Response } from 'express';
import { AdminGuestService } from '../services/AdminGuestService.js';

const adminService = new AdminGuestService();

export class AdminGuestController {
  async createFamily(req: Request, res: Response) {
    try {
      const { familyName, guestNames } = req.body;
      
      if (!familyName || !Array.isArray(guestNames) || guestNames.length === 0) {
        return res.status(400).json({ error: 'Nome da família e array de convidados são obrigatórios.' });
      }

      const family = await adminService.createFamilyWithGuests(familyName, guestNames);
      return res.status(201).json(family);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar família.' });
    }
  }

  async listFamilies(req: Request, res: Response) {
    try {
      const families = await adminService.getAllFamilies();
      return res.json(families);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar famílias.' });
    }
  }

  async updateGuest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, isConfirmed } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'O ID do convidado é obrigatório e deve ser um texto.' });
      }
      
      const updated = await adminService.updateGuest(id, { name, isConfirmed });
      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar convidado.' });
    }
  }

  async addGuest(req: Request, res: Response) {
    try {
      const { familyId } = req.params;
      const { name } = req.body;

      if (!name) return res.status(400).json({ error: 'Nome do convidado é obrigatório.' });

      if (!familyId || typeof familyId !== 'string') {
        return res.status(400).json({ error: 'O ID da família é obrigatório e deve ser um texto.' });
      }

      const newGuest = await adminService.addGuestToFamily(familyId, name);
      return res.status(201).json(newGuest);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao adicionar convidado.' });
    }
  }

  async deleteGuest(req: Request, res: Response) {
    try {
      const { id } = req.params || "";

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'O ID do convidado é obrigatório e deve ser um texto.' });
      }

      await adminService.deleteGuest(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar convidado.' });
    }
  }

  async deleteFamily(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'O ID da família é obrigatório e deve ser um texto.' });
      }

      await adminService.deleteFamily(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar família.' });
    }
  }
}