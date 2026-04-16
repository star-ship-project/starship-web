import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { processSurvey } from "@/lib/survey";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const eventType = payload.type || "";
    if (eventType !== "message.phone.received") {
      return NextResponse.json({ status: "ignored" });
    }

    const data = payload.data || {};
    const phone = data.contact;
    const text = data.content;
    const fromNumber = process.env.FROM_NUMBER;

    console.log("\n--- INCOMING WEBHOOK ---");
    console.log(`[DEBUG] Phone: ${phone}, Text: ${text}`);

    if (phone === fromNumber) {
      console.log("[DEBUG] Ignoring message from FROM_NUMBER");
      return NextResponse.json({ status: "ignored", reason: "from own number" });
    }

    if (!phone || !text) {
      return NextResponse.json({ status: "error", message: "Missing contact or content" }, { status: 400 });
    }

    try {
      await processSurvey(phone, text);
    } catch (surveyError) {
      console.error("[Survey Error]", surveyError);
      return NextResponse.json({ status: "error", message: "Survey processing failed" }, { status: 500 });
    }
    
    revalidateTag("dashboard-data");
    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("[Webhook Error]", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}