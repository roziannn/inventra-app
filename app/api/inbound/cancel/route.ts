import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, canceledNote, updatedBy } = body;

    if (!id) return NextResponse.json({ error: "Inbound ID is required" }, { status: 400 });

    const updated = await prisma.inbound.update({
      where: { id },
      data: {
        status: "CANCELED",
        canceledDate: new Date(),
        canceledNote: canceledNote ?? "Canceled via system",
        updatedBy: updatedBy ?? "administrator",
      },
      include: { product: true, supplier: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to cancel inbound" }, { status: 500 });
  }
}
