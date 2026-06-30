import { NextRequest, NextResponse } from "next/server";
import { OrderController } from "@/presentation/controllers/OrderController";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
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
