import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato do token inválido.' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}