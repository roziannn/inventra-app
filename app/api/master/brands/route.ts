import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ========= GET =========
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const skip = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      prisma.brand.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.brand.count(),
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
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

// ========= POST =========
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    }

    const createdBy = body.createdBy ?? "system";

    const newBrand = await prisma.brand.create({
      data: {
        name: body.name,
        createdBy,
      },
    });

    return NextResponse.json(newBrand, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

// ========= DELETE =========
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing brand ID" }, { status: 400 });

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

    const deleted = await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ message: "Brand deleted", data: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}

// ========= PATCH =========
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing brand ID" }, { status: 400 });
    if (!body.name || body.name.trim() === "") return NextResponse.json({ error: "Brand name is required" }, { status: 400 });

    const updated = await prisma.brand.update({
      where: { id },
      data: { name: body.name, isActive: body.isActive },
    });

    return NextResponse.json({ message: "Brand updated", data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}
