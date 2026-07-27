import express from 'express';
import cors from 'cors';
import guestRoutes from './routes/guestRoutes.js'; // Rota pública de RSVP
import authRoutes from './routes/authRoutes.js';   // Rota pública de Login
import adminRoutes from './routes/adminRoutes.js'; // Rotas privadas do Admin
import giftRoutes from './routes/giftRoutes.js';   // Rotas públicas de presentes

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/guests', guestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gifts', giftRoutes);

export default app;