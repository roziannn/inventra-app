import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/products?page=1&limit=10
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.code || !body.name || !body.productCategoryId || !body.storageLocationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        price: body.price ?? 0,
        stock: body.stock ?? 0,
        unit: body.unit ?? "",
        isActive: body.isActive ?? true,
        storageLocationId: body.storageLocationId,
        supplierId: body.supplierId ?? null,
        productCategoryId: body.productCategoryId,
        condition: body.condition ?? "New",
        restockDate: body.restockDate ? new Date(body.restockDate) : new Date(),
        imageUrl: body.imageUrl ?? null,
        barcode: body.barcode ?? null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PATCH /api/products?id=...
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        price: body.price,
        stock: body.stock,
        unit: body.unit,
        isActive: body.isActive,
        storageLocationId: body.storageLocationId,
        supplierId: body.supplierId,
        productCategoryId: body.productCategoryId,
        condition: body.condition,
        restockDate: body.restockDate ? new Date(body.restockDate) : undefined,
        imageUrl: body.imageUrl,
        barcode: body.barcode,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Product updated", data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products?id=...
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
