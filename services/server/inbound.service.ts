import prisma from "@/lib/prisma";
import { CreateInboundDto, UpdateInboundDto } from "@/types/inbound";

export const inboundService = {
  getAll: async () => {
    return await prisma.inbound.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true, supplier: true },
    });
  },

  create: async (payload: CreateInboundDto) => {
    return await prisma.inbound.create({
      data: {
        id: crypto.randomUUID(),
        ...payload,
        totalPrice: payload.totalPrice ?? payload.qty * payload.purchasePrice,
      },
      include: { product: true, supplier: true },
    });
  },

  update: async (id: string, payload: UpdateInboundDto) => {
    return await prisma.inbound.update({
      where: { id },
      data: payload,
      include: { product: true, supplier: true },
    });
  },

  delete: async (id: string) => {
    return await prisma.inbound.delete({ where: { id } });
  },

  cancel: async (id: string, canceledNote?: string, updatedBy?: string) => {
    return await prisma.inbound.update({
      where: { id },
      data: {
        status: "CANCELED",
        canceledDate: new Date(),
        canceledNote: canceledNote ?? "Canceled via system",
        updatedBy: updatedBy ?? "administrator",
      },
      include: { product: true, supplier: true },
    });
  },
};
