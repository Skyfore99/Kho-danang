import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.GOOGLE_SCRIPT_URL;
    // Fallback if env is missing (for local testing before user adds it)
    if (!url) {
      return NextResponse.json({ 
        kho: [], 
        settings: {}, 
        error: "Missing GOOGLE_SCRIPT_URL environment variable. Please add it to Vercel." 
      });
    }

    const res = await fetch(`${url}?action=getAll`, { cache: 'no-store' });
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

