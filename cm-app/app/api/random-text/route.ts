import { generatePassage } from "@/lib/generate-passage";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

function cleanText(text: string): string {
    return text
        .replace(/\s+/g, " ") // normalize whitespace
        .replace(/\[.*?\]/g, "") // remove [citation needed]
        .trim();
}
export async function GET(req: NextRequest) {
    try {
        const passage = generatePassage();
        const text = cleanText(passage);

        return NextResponse.json(text);
    }
    catch (error) {
        console.log("RANDON_TEXT_ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch random text" }, { status: 500 });
    }
}