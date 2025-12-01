import prisma from "@/lib/prisma";
import { CreateOutboundDto, OutboundStatus } from "@/types/outbound";

export const outboundService = {
  getAll: async () => {
    return await prisma.outbound.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
  },

  create: async (payload: CreateOutboundDto) => {
    const status: OutboundStatus = payload.isShipping ? "SHIPPED" : payload.isPickup ? "PICKED_UP" : payload.status ?? "PROCESSING";

    return await prisma.outbound.create({
      data: {
        id: crypto.randomUUID(),
        product: {
          connect: { id: payload.productId },
        },
        qty: payload.qty ?? 0,
        totalValue: payload.totalValue ?? 0,
        operationalCost: payload.operationalCost,
        status,
        reason: payload.reason,
        note: payload.note,
        createdBy: payload.createdBy ?? "administrator",

        // shipping info
        isShipping: payload.isShipping,
        shippingDate: payload.shippingDate ? new Date(payload.shippingDate) : null,
        courier: payload.courier,
        isResi: payload.isResi ?? false,
        resiImg: payload.resiImg,
        resiUploadDate: payload.resiUploadDate ? new Date(payload.resiUploadDate) : null,

        // pickup info
        isPickup: payload.isPickup,
        pickupDate: payload.pickupDate ? new Date(payload.pickupDate) : null,
        pickupBy: payload.pickupBy,
      },
      include: { product: true },
    });
  },

  update: async (id: string, payload: CreateOutboundDto) => {
    const status: OutboundStatus = payload.isShipping ? "SHIPPED" : payload.isPickup ? "PICKED_UP" : payload.status ?? "PROCESSING";

    return await prisma.outbound.update({
      where: { id },
      data: {
        product: {
          connect: { id: payload.productId },
        },
        qty: payload.qty ?? 0,
        totalValue: payload.totalValue ?? 0,
        operationalCost: payload.operationalCost,
        status,
        reason: payload.reason,
        note: payload.note,
        createdBy: payload.createdBy ?? "administrator",

        // shipping info
        isShipping: payload.isShipping,
        shippingDate: payload.shippingDate ? new Date(payload.shippingDate) : null,
        courier: payload.courier,
        isResi: payload.isResi ?? false,
        resiImg: payload.resiImg,
        resiUploadDate: payload.resiUploadDate ? new Date(payload.resiUploadDate) : null,

        // pickup info
        isPickup: payload.isPickup,
        pickupDate: payload.pickupDate ? new Date(payload.pickupDate) : null,
        pickupBy: payload.pickupBy,
      },
      include: { product: true },
    });
  },

  delete: async (id: string) => {
    return await prisma.outbound.delete({
      where: { id },
    });
  },

  cancel: async (id: string, canceledNote?: string, updateBy?: string) => {
    return await prisma.outbound.update({
      where: { id },
      data: {
        status: "CANCELED",
        note: canceledNote ?? "Canceled via system",
        updateBy: updateBy ?? "administrator",
      },
      include: { product: true },
    });
  },
};
