import { NextRequest, NextResponse } from "next/server";
import { ProductController } from "@/presentation/controllers/ProductController";

export const dynamic = "force-dynamic";

function requireAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return payload?.role === "admin" && payload?.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

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
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
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
