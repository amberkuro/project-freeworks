import { NextResponse } from "next/server";
import { trackDelivery } from "@/lib/delivery";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tracking = searchParams.get("tracking");

  if (!tracking) {
    return NextResponse.json({ error: "운송장 번호를 입력해 주세요." }, { status: 400 });
  }

  const result = await trackDelivery(tracking);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
