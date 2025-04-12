import { NextRequest, NextResponse } from "next/server";
import ratelimit from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Rate limit error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
