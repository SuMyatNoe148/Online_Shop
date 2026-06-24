import { NextRequest, NextResponse } from "next/server";
import { AuthController } from "@/presentation/controllers/AuthController";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    const body = await req.json();

    if (action === "login") {
      const data = await AuthController.login(body);
      return NextResponse.json({ data });
    }

    if (action === "register") {
      const data = await AuthController.register(body);
      return NextResponse.json({ data }, { status: 201 });
    }

    if (action === "logout") {
      return NextResponse.json({ data: { loggedOut: true } });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 404 });
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes("Invalid email") ? 401
      : message.includes("already registered") ? 409
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "me") {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 404 });
}
