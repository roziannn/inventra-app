import { zoneService } from "@/services/server/zone.service";
import { CreateZoneDto } from "@/types/zone";
import { NextRequest, NextResponse } from "next/server";

// ========= GET =========
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'lov' untuk list tanpa paging

  try {
    const data = await zoneService.getAll();

    const mapped = data.map((d) => ({
      id: d.id,
      name: d.name,
      isActive: d.isActive,
      createdBy: d.createdBy ?? null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt ?? null,
      updatedBy: d.updatedBy ?? null,
    }));

    return NextResponse.json({ success: true, data: mapped }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// ========= POST =========
export async function POST(req: NextRequest) {
  try {
    const body: CreateZoneDto = await req.json();

    body.isActive = true;

    const created = await zoneService.create(body);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
