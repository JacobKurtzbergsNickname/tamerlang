import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { token } = await auth0.getAccessToken();
    return NextResponse.json({ token });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
