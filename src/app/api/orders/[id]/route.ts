import { NextRequest, NextResponse } from "next/server";
import { OrderController } from "@/presentation/controllers/OrderController";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = await OrderController.updateStatus(params.id, body.status);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
