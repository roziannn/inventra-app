import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type"); // cek LOV
  const id = searchParams.get("id"); // cek single product

  try {
    // ====== GET LOV ======
    if (type === "lov") {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(products);
    }

    // ====== GET SINGLE ======
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          supplier: true,
          storagelocation: true,
          category: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // ====== GET PAGINATED LIST ======
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: true,
          storagelocation: true,
          category: true,
        },
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

const generateProductCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return `PRD/${result}`;
};

// POST /api/products
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.productCategoryId || !body.storageLocationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stockToAdd = body.stock ?? 0;

    // Create product
    const newProduct = await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        code: generateProductCode(),
        name: body.name,
        price: body.price ?? 0,
        stock: stockToAdd,
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

    // update storage currentCapacity
    if (stockToAdd > 0) {
      await prisma.storagelocation.update({
        where: { id: body.storageLocationId },
        data: {
          currentCapacity: {
            increment: stockToAdd,
          },
        },
      });
    }

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

    const deleted = await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted", data: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
