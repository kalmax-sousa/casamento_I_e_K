import { prisma } from '../config/prisma.js';

export class AdminGuestService {
  // Cria a família já embutindo os convidados nela
  async createFamilyWithGuests(familyName: string, guestNames: string[]) {
    return await prisma.family.create({
      data: {
        name: familyName,
        guests: {
          create: guestNames.map((name) => ({ name })),
        },
      },
      include: { guests: true },
    });
  }

  // Lista todos os convidados para a tela de admin
  async getAllFamilies() {
    return await prisma.family.findMany({
      include: { guests: true },
      orderBy: { name: 'asc' },
    });
  }

  // Permite alterar o nome ou forçar a confirmação manualmente
  async updateGuest(guestId: string, data: { name?: string; isConfirmed?: boolean }) {
    return await prisma.guest.update({
      where: { id: guestId },
      data,
    });
  }

  async addGuestToFamily(familyId: string, guestName: string) {
    return await prisma.guest.create({
      data: { name: guestName, familyId },
    });
  }

  async deleteGuest(guestId: string) {
    return await prisma.guest.delete({ where: { id: guestId } });
  }
  
  async deleteFamily(familyId: string) {
    // Como colocamos onDelete: Cascade no schema, isso deleta os convidados dela também
    return await prisma.family.delete({ where: { id: familyId } });
  }
}