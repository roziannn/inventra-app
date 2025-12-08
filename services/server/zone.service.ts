import prisma from "@/lib/prisma";
import { CreateZoneDto, UpdateZoneDto } from "@/types/zone";

export const zoneService = {
  getAll: async () => {
    return await prisma.zone.findMany({
      orderBy: { name: "asc" },
    });
  },

  getById: async (id: string) => {
    return await prisma.zone.findUnique({
      where: { id },
      include: { storagelocation: true },
    });
  },

  getLOV: async () => {
    return await prisma.zone.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
  },

  create: async (payload: CreateZoneDto) => {
    return await prisma.zone.create({
      data: {
        id: crypto.randomUUID(),
        name: payload.name,
        isActive: payload.isActive ?? true,
        createdBy: payload.createdBy ?? "administrator",
      },
      include: { storagelocation: true },
    });
  },

  update: async (id: string, payload: UpdateZoneDto) => {
    return await prisma.zone.update({
      where: { id },
      data: {
        name: payload.name,
        isActive: payload.isActive,
        updatedAt: new Date(),
        updatedBy: payload.updatedBy ?? "administrator",
      },
      include: { storagelocation: true },
    });
  },

  delete: async (id: string) => {
    return await prisma.zone.delete({
      where: { id },
    });
  },
};
