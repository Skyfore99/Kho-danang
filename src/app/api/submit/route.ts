import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = process.env.GOOGLE_SCRIPT_URL;
    
    if (!url) {
      return NextResponse.json({ error: "Missing GOOGLE_SCRIPT_URL environment variable." }, { status: 500 });
    }

    // Default action to addKho if not provided
    const payload = body.action ? body : { action: "addKho", ...body };

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain" }, // Prevent preflight CORS issues with Apps script
    });
    
    const result = await res.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

