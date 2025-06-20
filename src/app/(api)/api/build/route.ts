import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    buildId: process.env.BUILD_ID || null,
  });
}
