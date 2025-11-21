import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ========= GET =========
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// ========= POST =========
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || body.name.trim() === "") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const createdBy = body.createdBy ?? "system";

    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        createdBy,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// ========= DELETE =========
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // ambil ID dari query

    if (!id) return NextResponse.json({ error: "Missing category ID" }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const deleted = await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted", data: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

// ========= PATCH =========
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // ambil ID dari query
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    if (!body.name || body.name.trim() === "") return NextResponse.json({ error: "Category name is required" }, { status: 400 });

    const updated = await prisma.category.update({
      where: { id },
      data: { name: body.name },
    });

    return NextResponse.json({ message: "Category updated", data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
