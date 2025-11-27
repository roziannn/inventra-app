import { NextRequest } from "next/server";
import { apiResponse } from "@/helper/apiResponse";
import { inboundService } from "@/services/server/inbound.service";

export async function GET(req: NextRequest) {
  try {
    const data = await inboundService.getAll();
    return apiResponse.success(
      data.map((d) => ({
        id: d.id,
        product: d.product?.name ?? "",
        supplier: d.supplier?.name ?? "",
        qty: d.qty,
        purchasePrice: d.purchasePrice.toNumber?.() ?? Number(d.purchasePrice),
        date: d.createdAt?.toISOString() ?? "",
        status: d.status ?? "",
        note: d.note ?? "",
      }))
    );
  } catch (err) {
    console.error(err);
    return apiResponse.error("Failed to fetch inbounds");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.productId || !body.qty || !body.purchasePrice) {
      return apiResponse.badRequest("Missing required fields");
    }

    const newInbound = await inboundService.create({
      ...body,
      createdBy: body.createdBy ?? "administrator",
    });

    return apiResponse.success("success create data");
  } catch (err) {
    console.error(err);
    return apiResponse.error("Failed to create inbound");
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return apiResponse.badRequest("Missing inbound id");

    const body = await req.json();
    if (!body.productId || !body.qty || !body.purchasePrice) {
      return apiResponse.badRequest("Missing required fields");
    }

    const updatedInbound = await inboundService.update(id, body);

    return apiResponse.success("success update data");
  } catch (err) {
    console.error(err);
    return apiResponse.error("Failed to update inbound");
  }
}
