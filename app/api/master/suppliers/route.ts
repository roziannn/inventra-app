import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ========= GET (Paginated) =========
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.supplier.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.count(),
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
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

// ========= POST =========
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }

    const createdBy = body.createdBy ?? "system";

    const newSupplier = await prisma.supplier.create({
      data: {
        name: body.name,
        isActive: body.isActive ?? true,
        createdBy,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

// ========= DELETE =========
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing supplier ID" }, { status: 400 });

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

    const deleted = await prisma.supplier.delete({ where: { id } });

    return NextResponse.json({ message: "Supplier deleted", data: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}

// ========= PATCH =========
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing supplier ID" }, { status: 400 });
    if (!body.name || body.name.trim() === "") return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name: body.name, isActive: body.isActive },
    });

    return NextResponse.json({ message: "Supplier updated", data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}
