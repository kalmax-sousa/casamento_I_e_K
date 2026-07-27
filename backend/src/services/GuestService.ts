import { prisma } from '../config/prisma.js';

export class GuestService {
  async searchGuestsByName(name: string) {
    const guests = await prisma.guest.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive', // Faz o papel do ILIKE
        },
      },
      // Já traz a família e os outros convidados daquela família
      include: {
        family: {
          include: {
            guests: true, 
          },
        },
      },
    });

    return guests;
  }

  async confirmPresence(guestIds: string[], isConfirmed: boolean) {
  // updateMany é perfeito para atualizar a família toda (ou parte dela) de uma vez
    const updated = await prisma.guest.updateMany({
      where: {
        id: {
          in: guestIds,
        },
      },
      data: {
        isConfirmed,
      },
    });

    return updated;
  }
}