import { NextRequest, NextResponse } from "next/server";
import { outboundService } from "@/services/server/outbound.service";
import { CreateOutboundDto } from "@/types/outbound";

export async function GET() {
  try {
    const data = await outboundService.getAll();

    const mapped = data.map((d) => ({
      id: d.id,
      productId: d.product?.id,
      product: d.product.name,
      pickupBy: d.pickupBy,
      qty: d.qty,
      operationalCost: Number(d.operationalCost),
      total: Number(d.qty) + Number(d.operationalCost),
      reason: d.reason,
      date: d.createdAt ?? "",
      status: d.status ?? "",
      note: d.note ?? "",
      shippingDate: d.shippingDate ?? null,
      courier: d.courier ?? "",
      isShipping: d.isShipping,
      isResi: d.isResi ?? false,
      resiImg: d.resiImg ?? "",
      resiUploadDate: d.resiUploadDate ?? null,
      pickupDate: d.pickupDate ?? null,
    }));

    return NextResponse.json({ success: true, data: mapped }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOutboundDto = await req.json();

    body.status = body.isShipping ? "SHIPPED" : body.isPickup ? "PICKED_UP" : "PROCESSING";

    const created = await outboundService.create(body);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const id = Number(idParam);
    const body: CreateOutboundDto = await req.json();

    body.status = body.isShipping ? "SHIPPED" : body.isPickup ? "PICKED_UP" : body.status ?? "PROCESSING";

    const updated = await outboundService.update(id, body);

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
