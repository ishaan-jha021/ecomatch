import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    venueName: string;
    venueType: string;
    city: string;
    message: string;
    submittedAt: string;
}

function getLeads(): Lead[] {
    try {
        if (fs.existsSync(LEADS_FILE)) {
            return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
        }
    } catch { }
    return [];
}

function saveLeads(leads: Lead[]) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { name, email, phone, venueName, venueType, city, message } = body;

        if (!name || !email || !phone || !venueName || !city) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const lead: Lead = {
            id: `lead-${Date.now()}`,
            name,
            email,
            phone,
            venueName,
            venueType: venueType || "coworking",
            city,
            message: message || "",
            submittedAt: new Date().toISOString(),
        };

        const leads = getLeads();
        leads.push(lead);
        saveLeads(leads);

        return NextResponse.json({ success: true, id: lead.id });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }
}

export async function GET() {
    const leads = getLeads();
    return NextResponse.json(leads);
}
