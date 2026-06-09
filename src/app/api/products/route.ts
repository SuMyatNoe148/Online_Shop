import { NextRequest, NextResponse } from "next/server";
import { ProductController } from "@/presentation/controllers/ProductController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const data = await ProductController.index({
      category: searchParams.get("category"),
      featured: searchParams.get("featured"),
      search: searchParams.get("search"),
    });
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
    const data = await ProductController.create(body);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
