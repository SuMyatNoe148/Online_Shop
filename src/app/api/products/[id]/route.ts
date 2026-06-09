import { NextRequest, NextResponse } from "next/server";
import { ProductController } from "@/presentation/controllers/ProductController";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = await ProductController.update(params.id, body);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data = await ProductController.destroy(params.id);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
