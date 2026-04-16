import { NextResponse } from "next/server";
import { getAllTeachersBio } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = await getAllTeachersBio();
    return NextResponse.json(teachers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json([]);
  }
}