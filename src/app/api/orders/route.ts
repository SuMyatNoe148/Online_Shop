import { NextRequest, NextResponse } from "next/server";
import { OrderController } from "@/presentation/controllers/OrderController";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await OrderController.index();
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await OrderController.create(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
