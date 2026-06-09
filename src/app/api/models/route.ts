import { NextRequest, NextResponse } from "next/server";
import { ModelController } from "@/presentation/controllers/ModelController";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  try {
    const data = await ModelController.index(
      searchParams.get("featured") === "true",
    );
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
