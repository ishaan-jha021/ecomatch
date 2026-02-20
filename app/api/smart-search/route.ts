import { NextRequest, NextResponse } from "next/server";
import { parseQueryWithLLM } from "@/lib/smart-search";

export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q") || "";

    if (!query.trim()) {
        return NextResponse.json({ filters: {}, query: "" });
    }

    try {
        const parsed = await parseQueryWithLLM(query);
        return NextResponse.json({ filters: parsed, query });
    } catch (error) {
        console.error("Smart search error:", error);
        return NextResponse.json({ filters: { textSearch: query }, query });
    }
}
