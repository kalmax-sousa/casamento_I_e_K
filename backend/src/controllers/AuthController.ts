import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export class AuthController {
  // Rota para o login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.adminUser.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      // Compara a senha digitada com o hash salvo no banco
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      // Gera o Token válido por 1 dia
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: '1d',
      });

      return res.json({ user: { email: user.email }, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }

  // Rota para criar o primeiro admin (só funciona se a tabela estiver vazia)
  async setup(req: Request, res: Response) {
    try {
      const count = await prisma.adminUser.count();
      if (count > 0) {
        return res.status(403).json({ error: 'O setup já foi realizado.' });
      }

      const { email, password } = req.body;

      console.log('Setup request received with email:', email);
      console.log('Setup request received with password:', password);
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.adminUser.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({ message: 'Admin criado com sucesso!', email: user.email });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  }
}