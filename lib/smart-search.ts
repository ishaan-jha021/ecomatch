import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ParsedQuery {
    type?: string;       // "coworking" | "incubator"
    city?: string;       // e.g. "Mumbai", "Bangalore"
    minCapacity?: number; // e.g. 20
    maxPrice?: number;   // e.g. 5000
    zeroEquity?: boolean;
    wifi?: boolean;
    meeting?: boolean;
    amenities?: string[];
    textSearch?: string; // fallback text query for name matching
    governmentScheme?: string; // e.g. "AIM", "SISFS", "DST"
}

const SYSTEM_PROMPT = `You are a search query parser for Indian coworking spaces and incubators.

Given a user's natural language query, extract structured search filters.

Available filters:
- type: "coworking" or "incubator" (coworking = shared office, co-working space, hot desk; incubator = startup incubator, accelerator, innovation hub)
- city: Indian city name, properly capitalized (e.g., "Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Kolkata", "Jaipur", "Kochi", "Bhubaneswar", "Patna", "Goa", etc.)
- minCapacity: minimum number of seats/people (integer)
- maxPrice: maximum monthly price in INR (integer)
- zeroEquity: true if user wants no-equity / zero-equity incubators
- wifi: true if user specifically asks for WiFi
- meeting: true if user mentions meeting rooms / conference rooms
- governmentScheme: "AIM" for Atal Incubation Centres, "SISFS" for Seed Fund Scheme, "DST" for DST-TBIs, "state" for state government incubators
- textSearch: any specific name or keyword to match (e.g., venue name, area name, specific amenity)

Rules:
1. Only include filters that are clearly implied by the query
2. For city names, use the canonical Indian city name (e.g., "Bengaluru" → "Bangalore", "Bombay" → "Mumbai")
3. If user says "cheap" or "affordable", set maxPrice to 5000
4. If user says "large" or "big", set minCapacity to 100
5. If user mentions "government" or "govt", set governmentScheme to "state"
6. Return ONLY valid JSON, no markdown, no explanation

Examples:
Query: "coworking space in mumbai with 20 seats"
{"type":"coworking","city":"Mumbai","minCapacity":20}

Query: "incubators in bangalore"
{"type":"incubator","city":"Bangalore"}

Query: "zero equity incubators in delhi"
{"type":"incubator","city":"Delhi","zeroEquity":true}

Query: "cheap office space in pune with meeting rooms"
{"type":"coworking","city":"Pune","maxPrice":5000,"meeting":true}

Query: "IIT incubators"
{"type":"incubator","textSearch":"IIT"}

Query: "atal incubation centre"
{"type":"incubator","governmentScheme":"AIM"}

Query: "startup space near electronic city bangalore"
{"city":"Bangalore","textSearch":"Electronic City"}

Query: "government incubators in hyderabad"
{"type":"incubator","city":"Hyderabad","governmentScheme":"state"}`;

export async function parseQueryWithLLM(query: string): Promise<ParsedQuery> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        // Fallback: basic rule-based parsing when no API key
        return fallbackParse(query);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nQuery: "${query}"\nJSON:` }]
            }],
            generationConfig: {
                temperature: 0,
                maxOutputTokens: 200,
            }
        });

        const text = result.response.text().trim();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as ParsedQuery;
        }

        return fallbackParse(query);
    } catch (error) {
        console.error('LLM parse error, falling back to rule-based:', error);
        return fallbackParse(query);
    }
}

// ── Rule-based fallback when Gemini is unavailable ──────────────
function fallbackParse(query: string): ParsedQuery {
    const q = query.toLowerCase();
    const parsed: ParsedQuery = {};

    // Type detection
    if (/cowork|co-work|shared\s*office|hot\s*desk|office\s*space/i.test(q)) {
        parsed.type = 'coworking';
    } else if (/incubat|accelerat|startup\s*hub|innovation/i.test(q)) {
        parsed.type = 'incubator';
    }

    // City detection
    const cities: Record<string, string> = {
        'mumbai': 'Mumbai', 'bombay': 'Mumbai',
        'bangalore': 'Bangalore', 'bengaluru': 'Bangalore',
        'delhi': 'Delhi', 'new delhi': 'Delhi',
        'hyderabad': 'Hyderabad', 'pune': 'Pune',
        'chennai': 'Chennai', 'madras': 'Chennai',
        'ahmedabad': 'Ahmedabad', 'kolkata': 'Kolkata', 'calcutta': 'Kolkata',
        'jaipur': 'Jaipur', 'kochi': 'Kochi', 'cochin': 'Kochi',
        'goa': 'Goa', 'lucknow': 'Lucknow', 'noida': 'Noida',
        'gurugram': 'Gurugram', 'gurgaon': 'Gurugram',
        'chandigarh': 'Chandigarh', 'indore': 'Indore', 'nagpur': 'Nagpur',
        'bhopal': 'Bhopal', 'patna': 'Patna', 'varanasi': 'Varanasi',
        'bhubaneswar': 'Bhubaneswar', 'coimbatore': 'Coimbatore',
        'surat': 'Surat', 'kanpur': 'Kanpur', 'thiruvananthapuram': 'Thiruvananthapuram',
        'trivandrum': 'Thiruvananthapuram', 'kozhikode': 'Kozhikode',
        'guwahati': 'Guwahati', 'raipur': 'Raipur', 'mohali': 'Mohali',
        'visakhapatnam': 'Visakhapatnam', 'vizag': 'Visakhapatnam',
    };

    for (const [key, value] of Object.entries(cities)) {
        if (q.includes(key)) { parsed.city = value; break; }
    }

    // Capacity detection
    const capMatch = q.match(/(\d+)\s*(seat|people|person|member|desk|capacity)/);
    if (capMatch) parsed.minCapacity = parseInt(capMatch[1]);

    // Price detection
    const priceMatch = q.match(/(\d+)\s*(rs|rupee|inr|₹|price|budget)/);
    if (priceMatch) parsed.maxPrice = parseInt(priceMatch[1]);
    if (/cheap|affordable|budget|low.?cost/i.test(q)) parsed.maxPrice = 5000;

    // Features
    if (/zero.?equity|no.?equity|equity.?free/i.test(q)) parsed.zeroEquity = true;
    if (/wifi|wi-fi|internet/i.test(q)) parsed.wifi = true;
    if (/meeting.?room|conference|board.?room/i.test(q)) parsed.meeting = true;

    // Government scheme
    if (/atal|aic|aim/i.test(q)) parsed.governmentScheme = 'AIM';
    if (/sisfs|seed.?fund/i.test(q)) parsed.governmentScheme = 'SISFS';
    if (/dst|nstedb|nidhi|tbi/i.test(q)) parsed.governmentScheme = 'DST';
    if (/government|govt|state/i.test(q) && !parsed.governmentScheme) parsed.governmentScheme = 'state';

    // Text search fallback — remaining keywords after removing parsed parts
    let remaining = q;
    const removePatterns = [
        /cowork\w*/gi, /co-work\w*/gi, /incubat\w*/gi, /accelerat\w*/gi,
        /space[s]?/gi, /office/gi, /hub/gi, /in\b/gi, /with\b/gi, /and\b/gi,
        /near\b/gi, /around\b/gi, /for\b/gi, /the\b/gi, /a\b/gi,
        /seat\w*/gi, /people/gi, /person/gi, /desk\w*/gi, /capacity/gi,
        /cheap/gi, /affordable/gi, /budget/gi, /meeting\s*room\w*/gi,
        /wifi/gi, /zero\s*equity/gi, /government/gi, /govt/gi,
        /\d+/g,
    ];
    for (const p of removePatterns) remaining = remaining.replace(p, '');
    // Remove parsed city name
    if (parsed.city) remaining = remaining.replace(new RegExp(parsed.city, 'gi'), '');
    remaining = remaining.replace(/\s+/g, ' ').trim();
    if (remaining.length > 2) parsed.textSearch = remaining;

    return parsed;
}
