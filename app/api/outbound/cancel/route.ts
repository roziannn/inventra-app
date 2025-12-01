import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, canceledNote, updatedBy } = body;

    if (!id) return NextResponse.json({ error: "Outbound ID is required" }, { status: 400 });

    const updated = await prisma.outbound.update({
      where: { id },
      data: {
        status: "CANCELED",
        canceledDate: new Date(),
        note: canceledNote ?? null,
        updateBy: updatedBy ?? "administrator",
        updatedAt: new Date(),
      },
      include: { product: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to cancel outbound" }, { status: 500 });
  }
}
