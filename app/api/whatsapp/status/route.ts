import { NextRequest, NextResponse } from "next/server";
import { refreshWhatsappState } from "@/app/actions/whatsapp";

export async function POST(request: NextRequest) {
  // Refresh may update the stored connection state; accept same-origin requests only.
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false, error: "Origem inválida." }, { status: 403 });
  }
  const result = await refreshWhatsappState();
  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
