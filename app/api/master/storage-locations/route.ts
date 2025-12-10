import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ========= GET =========
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'lov'
  const id = searchParams.get("id"); // get by id
  const zoneId = searchParams.get("zoneId"); // get by zone id

  try {
    if (type === "lov") {
      const storageLocations = await prisma.storagelocation.findMany({
        select: { id: true, name: true, maxCapacity: true, currentCapacity: true },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(storageLocations);
    }

    if (id) {
      const location = await prisma.storagelocation.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              stock: true,
              updatedAt: true,
              createdAt: true,
            },
          },
        },
      });

      if (!location) return NextResponse.json({ error: "Storage location not found" }, { status: 404 });

      return NextResponse.json(location);
    }

    if (zoneId) {
      const locations = await prisma.storagelocation.findMany({
        where: { zoneId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              stock: true,
              updatedAt: true,
              createdAt: true,
            },
          },
          zone: {
            select: { id: true, name: true },
          },
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(locations);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.storagelocation.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          zone: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.storagelocation.count(),
    ]);

    return NextResponse.json({
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch storage locations" }, { status: 500 });
  }
}

// ========= POST =========
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.code || !body.name) {
      return NextResponse.json({ error: "Code and Name are required" }, { status: 400 });
    }

    const newLocation = await prisma.storagelocation.create({
      data: {
        id: crypto.randomUUID(),
        code: body.code,
        name: body.name,
        description: body.description ?? null,
        type: body.type ?? null,
        zoneId: body.zone ?? null,
        maxCapacity: body.maxCapacity ?? null,
        currentCapacity: body.currentCapacity ?? null,
        capacityUnit: body.capacityUnit ?? null,
        isActive: body.isActive ?? true,
        createdBy: body.createdBy ?? "system",
      },
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create storage location" }, { status: 500 });
  }
}

// ========= DELETE =========
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing storage location ID" }, { status: 400 });

    const existing = await prisma.storagelocation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Storage location not found" }, { status: 404 });

    const deleted = await prisma.storagelocation.delete({ where: { id } });

    return NextResponse.json({ message: "Storage location deleted", data: deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete storage location" }, { status: 500 });
  }
}

// ========= PATCH (Update) =========
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json();

    if (!id) return NextResponse.json({ error: "Missing storage location ID" }, { status: 400 });

    const updated = await prisma.storagelocation.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        type: body.type,
        zoneId: body.zone ?? null,
        maxCapacity: body.maxCapacity,
        currentCapacity: body.currentCapacity,
        capacityUnit: body.capacityUnit,
        isActive: body.isActive,
        updatedAt: new Date(),
        updatedBy: body.updatedBy ?? "system",
      },
    });

    return NextResponse.json({ message: "Storage location updated", data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update storage location" }, { status: 500 });
  }
}
