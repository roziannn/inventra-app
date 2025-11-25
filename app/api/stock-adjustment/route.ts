// app/api/stock-adjustment/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, type, quantity, reason, note, createdBy } = body;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const oldQty = product.stock;
    const qty = Number(quantity);
    if (isNaN(qty)) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });

    const newQty = type === "Increase" ? oldQty + qty : oldQty - qty;
    const difference = newQty - oldQty;

    const adjustment = await prisma.stockadjustment.create({
      data: {
        id: crypto.randomUUID(),
        oldQty,
        newQty,
        difference,
        type,
        reason,
        note,
        createdBy,
        product: { connect: { id: productId } },
      },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { stock: newQty },
    });

    return NextResponse.json(adjustment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create stock adjustment" }, { status: 500 });
  }
}

// GET /api/stock-adjustment?productId=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const adjustments = await prisma.stockadjustment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(adjustments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stock adjustments" }, { status: 500 });
  }
}
