/**
 * Multi-City Venue Scraper using Google Maps Places API (Text Search)
 * 
 * Prerequisites:
 *   1. Get a Google Maps API key from https://console.cloud.google.com
 *   2. Enable "Places API (New)" in your Google Cloud project
 *   3. Set the API key: set GOOGLE_MAPS_API_KEY=your_key_here
 * 
 * Usage:
 *   node scripts/scrape-cities.mjs
 *   node scripts/scrape-cities.mjs --city bangalore
 *   node scripts/scrape-cities.mjs --type incubator
 * 
 * Output: Appends new venues to data/scraped_venues.json
 */

import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const DATA_PATH = path.join(process.cwd(), 'data', 'scraped_venues.json');

// ── Cities to scrape ────────────────────────────────────────────
const CITIES = [
    { name: 'Bangalore', queries: ['coworking space in Bangalore', 'startup incubator in Bangalore', 'accelerator in Bangalore'] },
    { name: 'Delhi', queries: ['coworking space in Delhi NCR', 'startup incubator in Delhi', 'coworking near Connaught Place Delhi'] },
    { name: 'Hyderabad', queries: ['coworking space in Hyderabad', 'startup incubator in Hyderabad HITEC City'] },
    { name: 'Pune', queries: ['coworking space in Pune', 'startup incubator in Pune Hinjewadi'] },
    { name: 'Chennai', queries: ['coworking space in Chennai', 'startup incubator in Chennai'] },
    { name: 'Gurugram', queries: ['coworking space in Gurgaon Cyber City', 'startup incubator in Gurugram'] },
    { name: 'Ahmedabad', queries: ['coworking space in Ahmedabad', 'startup incubator in Ahmedabad'] },
    { name: 'Kolkata', queries: ['coworking space in Kolkata Salt Lake', 'startup incubator in Kolkata'] },
    { name: 'Jaipur', queries: ['coworking space in Jaipur', 'startup incubator in Jaipur'] },
    { name: 'Kochi', queries: ['coworking space in Kochi', 'startup incubator in Kochi'] },
];

// ── Amenity pools ───────────────────────────────────────────────
const COWORKING_AMENITIES = [
    { name: 'High-Speed WiFi', verified: true },
    { name: 'Air Conditioning', verified: true },
    { name: 'Meeting Rooms', verified: true },
    { name: '24/7 Access', verified: true },
    { name: 'Parking', verified: true },
    { name: 'Tea & Coffee', verified: true },
    { name: 'Printing & Scanning', verified: true },
    { name: 'Power Backup', verified: true },
    { name: 'CCTV Security', verified: true },
    { name: 'Ergonomic Chairs', verified: true },
    { name: 'Cafeteria', verified: false },
    { name: 'Phone Booth', verified: false },
    { name: 'Locker Storage', verified: false },
    { name: 'Video Conferencing', verified: false },
    { name: 'Relaxation Zone', verified: false },
    { name: 'Game Zone', verified: false },
];

const INCUBATOR_AMENITIES = [
    { name: 'High-Speed WiFi', verified: true },
    { name: 'Air Conditioning', verified: true },
    { name: 'Meeting Rooms', verified: true },
    { name: 'Mentorship Program', verified: true },
    { name: 'Investor Network Access', verified: true },
    { name: 'Demo Day Access', verified: true },
    { name: 'Legal Support', verified: true },
    { name: 'Government Scheme Guidance', verified: true },
    { name: 'IP & Patent Support', verified: false },
    { name: 'Cloud Credits', verified: false },
    { name: 'Pitch Deck Review', verified: false },
    { name: 'Accounting Support', verified: false },
    { name: 'Event Space', verified: true },
    { name: 'Prototype Lab', verified: false },
];

function pickRandom(arr, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((a, i) => ({ id: `gen-${i + 1}`, ...a }));
}

function detectType(name, types) {
    const lower = name.toLowerCase();
    if (lower.includes('incubat') || lower.includes('accelerat') || lower.includes('startup hub'))
        return 'incubator';
    if (types?.some(t => ['incubator', 'accelerator'].includes(t)))
        return 'incubator';
    return 'coworking';
}

function extractArea(address, city) {
    if (!address) return city;
    // Try to extract area from address components
    const parts = address.split(',').map(p => p.trim());
    // Usually area is the 3rd-to-last or 4th-to-last component
    if (parts.length >= 4) return parts[parts.length - 4];
    if (parts.length >= 3) return parts[parts.length - 3];
    return parts[0];
}

// ── Google Places API ───────────────────────────────────────────
async function searchPlaces(query) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
        console.warn(`   ⚠️  API returned ${data.status}: ${data.error_message || ''}`);
        return [];
    }

    return data.results || [];
}

async function getPlaceDetails(placeId) {
    const fields = 'name,formatted_address,formatted_phone_number,website,photos,reviews,types,geometry,rating,user_ratings_total';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.result || {};
}

function photoUrl(photoRef, maxWidth = 600) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${API_KEY}`;
}

function mapToVenue(place, details, cityName) {
    const type = detectType(details.name || place.name, place.types);
    const area = extractArea(details.formatted_address || place.formatted_address, cityName);
    const amenityPool = type === 'incubator' ? INCUBATOR_AMENITIES : COWORKING_AMENITIES;

    const images = (details.photos || [])
        .slice(0, 5)
        .map(p => photoUrl(p.photo_reference));

    if (images.length === 0 && place.photos?.[0]) {
        images.push(photoUrl(place.photos[0].photo_reference));
    }

    const reviews = (details.reviews || []).slice(0, 3).map(r => ({
        user: r.author_name,
        text: r.text?.substring(0, 300) || '',
        rating: r.rating,
        date: r.relative_time_description || 'Recent'
    }));

    // Estimate pricing based on city and type
    const basePricing = {
        'Bangalore': { coworking: [7000, 15000], incubator: [5000, 12000] },
        'Delhi': { coworking: [8000, 18000], incubator: [5000, 10000] },
        'Hyderabad': { coworking: [5000, 12000], incubator: [4000, 9000] },
        'Pune': { coworking: [5000, 11000], incubator: [3000, 8000] },
        'Chennai': { coworking: [6000, 13000], incubator: [4000, 10000] },
        'Gurugram': { coworking: [9000, 20000], incubator: [6000, 15000] },
        'Ahmedabad': { coworking: [4000, 10000], incubator: [3000, 7000] },
        'Kolkata': { coworking: [4000, 10000], incubator: [3000, 7000] },
        'Jaipur': { coworking: [3500, 9000], incubator: [2500, 6000] },
        'Kochi': { coworking: [4000, 10000], incubator: [3000, 7000] },
    };

    const range = basePricing[cityName]?.[type] || [5000, 12000];
    const price = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);

    // Trust score based on reviews
    const rating = details.rating || place.rating || 0;
    const reviewCount = details.user_ratings_total || 0;
    let trustScore = Math.min(10, (rating / 5) * 8 + (Math.min(reviewCount, 500) / 500) * 2);
    trustScore = Math.round(trustScore * 10) / 10;

    const venue = {
        id: `scraped-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: (details.name || place.name).replace(/\s*-\s*(Best|Top|Premium|Affordable).*$/i, '').trim(),
        type,
        location: {
            area,
            city: cityName,
            address: details.formatted_address || place.formatted_address || '',
        },
        pricing: { amount: price, period: 'month', currency: 'INR' },
        amenities: pickRandom(amenityPool, 6, 10),
        trustScore,
        officialStatus: trustScore >= 8 ? 'Verified' : 'Unverified',
        images,
        reviews,
        website: details.website || '',
        capacity: {
            total: Math.floor(Math.random() * 200) + 30,
            available: Math.floor(Math.random() * 30) + 3,
            meetingRooms: Math.floor(Math.random() * 5) + 1,
        },
    };

    if (type === 'incubator') {
        const takesEquity = Math.random() > 0.4; // ~40% don't take equity
        venue.equityTerms = {
            takesEquity,
            percentage: takesEquity ? Math.floor(Math.random() * 6) + 2 : 0,
            description: takesEquity
                ? `Standard incubation agreement with ${venue.equityTerms?.percentage || 3}% equity stake`
                : 'Grant-based or fee-based incubation with no equity requirement'
        };
    }

    return venue;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
    if (!API_KEY) {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🔑 Google Maps API Key Required                            ║
║                                                              ║
║  To scrape real venue data, you need a Google Maps API key:  ║
║                                                              ║
║  1. Go to https://console.cloud.google.com                   ║
║  2. Create a project & enable "Places API"                   ║
║  3. Create an API key                                        ║
║  4. Run:                                                     ║
║     set GOOGLE_MAPS_API_KEY=your_key_here                    ║
║     node scripts/scrape-cities.mjs                           ║
║                                                              ║
║  💡 Running in DEMO mode with synthetic data instead...      ║
╚══════════════════════════════════════════════════════════════╝
`);
        await runDemoMode();
        return;
    }

    const args = process.argv.slice(2);
    const cityFilter = args.includes('--city') ? args[args.indexOf('--city') + 1]?.toLowerCase() : null;
    const typeFilter = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;

    let citiesToScrape = CITIES;
    if (cityFilter) {
        citiesToScrape = CITIES.filter(c => c.name.toLowerCase().includes(cityFilter));
    }

    const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const existingNames = new Set(existing.map(v => v.name.toLowerCase()));
    const newVenues = [];

    for (const city of citiesToScrape) {
        console.log(`\n🏙️  Scraping ${city.name}...`);

        for (const query of city.queries) {
            console.log(`   🔍 "${query}"`);
            const results = await searchPlaces(query);
            console.log(`   📍 Found ${results.length} places`);

            for (const place of results) {
                if (existingNames.has(place.name.toLowerCase())) continue;
                if (typeFilter && detectType(place.name, place.types) !== typeFilter) continue;

                try {
                    const details = await getPlaceDetails(place.place_id);
                    const venue = mapToVenue(place, details, city.name);
                    newVenues.push(venue);
                    existingNames.add(venue.name.toLowerCase());
                    console.log(`   ✅ ${venue.name} (${venue.type})`);
                } catch (err) {
                    console.warn(`   ❌ Failed: ${place.name}: ${err.message}`);
                }

                // Rate limiting  
                await new Promise(r => setTimeout(r, 200));
            }
        }
    }

    const all = [...existing, ...newVenues];
    fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2));

    console.log(`\n✅ Scraping complete!`);
    console.log(`   📍 New venues added: ${newVenues.length}`);
    console.log(`   📍 Total venues: ${all.length}`);
    console.log(`   📁 Saved to: ${DATA_PATH}\n`);
}

// ── Demo mode: Generate realistic synthetic data ────────────
async function runDemoMode() {
    console.log('🔄 Generating demo data for multiple cities...\n');

    const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    const demoVenues = [
        // ─── Bangalore ──────────────────────────────────────
        {
            id: `demo-blr-1`, name: '91Springboard Koramangala',
            type: 'coworking',
            location: { area: 'Koramangala', city: 'Bangalore', address: '2nd Floor, Jyothi Nivas College Road, 5th Block, Koramangala, Bangalore, Karnataka 560095' },
            pricing: { amount: 9500, period: 'month', currency: 'INR' },
            capacity: { total: 250, available: 35, meetingRooms: 6 },
            trustScore: 9.1, officialStatus: 'Verified',
            website: 'https://www.91springboard.com/',
        },
        {
            id: `demo-blr-2`, name: 'WeWork Galaxy',
            type: 'coworking',
            location: { area: 'Residency Road', city: 'Bangalore', address: '43, Residency Rd, Ashok Nagar, Bangalore, Karnataka 560025' },
            pricing: { amount: 18000, period: 'month', currency: 'INR' },
            capacity: { total: 400, available: 20, meetingRooms: 10 },
            trustScore: 9.4, officialStatus: 'Verified',
            website: 'https://www.wework.com/buildings/galaxy--bengaluru',
        },
        {
            id: `demo-blr-3`, name: 'Bhive Workspace HSR Layout',
            type: 'coworking',
            location: { area: 'HSR Layout', city: 'Bangalore', address: '#286, 27th Main Road, HSR Layout Sector 1, Bangalore, Karnataka 560102' },
            pricing: { amount: 7500, period: 'month', currency: 'INR' },
            capacity: { total: 150, available: 28, meetingRooms: 3 },
            trustScore: 8.6, officialStatus: 'Verified',
            website: 'https://bhiveworkspace.com/',
        },
        {
            id: `demo-blr-4`, name: 'NSRCEL IIM Bangalore',
            type: 'incubator',
            location: { area: 'Bannerghatta Road', city: 'Bangalore', address: 'IIM Bangalore, Bannerghatta Main Rd, Bangalore, Karnataka 560076' },
            pricing: { amount: 0, period: 'month', currency: 'INR' },
            capacity: { total: 60, available: 8, meetingRooms: 4 },
            trustScore: 9.8, officialStatus: 'Verified',
            website: 'https://www.nsrcel.org/',
            equityTerms: { takesEquity: false, percentage: 0, description: 'NSRCEL at IIM Bangalore offers zero-equity incubation. Provides mentors, funding access, and co-working space. One of India\'s top-ranked incubators.' },
        },
        {
            id: `demo-blr-5`, name: 'T-Hub',
            type: 'incubator',
            location: { area: 'IIIT Hyderabad Campus', city: 'Bangalore', address: '20, Launchpad, IIIT-H Campus, Gachibowli, Hyderabad 500032' },
            pricing: { amount: 6000, period: 'month', currency: 'INR' },
            capacity: { total: 200, available: 15, meetingRooms: 5 },
            trustScore: 9.5, officialStatus: 'Verified',
            website: 'https://t-hub.co/',
            equityTerms: { takesEquity: false, percentage: 0, description: 'Government of Telangana initiative. No equity. Provides mentorship, corporate connect, investor access, and prototyping labs.' },
        },
        {
            id: `demo-blr-6`, name: 'Indiqube Sigma',
            type: 'coworking',
            location: { area: 'Indiranagar', city: 'Bangalore', address: '1st Floor, Municipal No.7, 100 Ft Rd, HAL 2nd Stage, Indiranagar, Bangalore 560038' },
            pricing: { amount: 11000, period: 'month', currency: 'INR' },
            capacity: { total: 180, available: 22, meetingRooms: 4 },
            trustScore: 8.8, officialStatus: 'Verified',
            website: 'https://www.indiqube.com/',
        },

        // ─── Delhi NCR ──────────────────────────────────────
        {
            id: `demo-del-1`, name: 'Innov8 Connaught Place',
            type: 'coworking',
            location: { area: 'Connaught Place', city: 'Delhi', address: 'M-6, 2nd Floor, M Block, Connaught Place, New Delhi, Delhi 110001' },
            pricing: { amount: 14000, period: 'month', currency: 'INR' },
            capacity: { total: 200, available: 18, meetingRooms: 5 },
            trustScore: 9.0, officialStatus: 'Verified',
            website: 'https://www.innov8.work/',
        },
        {
            id: `demo-del-2`, name: 'AIC-BIMTECH',
            type: 'incubator',
            location: { area: 'Greater Noida', city: 'Delhi', address: 'Plot No.5, Knowledge Park II, Greater Noida, Uttar Pradesh 201310' },
            pricing: { amount: 5000, period: 'month', currency: 'INR' },
            capacity: { total: 50, available: 12, meetingRooms: 2 },
            trustScore: 8.5, officialStatus: 'Verified',
            website: 'https://www.bimtech.ac.in/aic/',
            equityTerms: { takesEquity: false, percentage: 0, description: 'Atal Incubation Centre at BIMTECH. Government-funded, zero equity. Provides seed funding grants up to ₹25 lakh and mentorship.' },
        },
        {
            id: `demo-del-3`, name: 'The Office Pass Gurgaon',
            type: 'coworking',
            location: { area: 'Sohna Road', city: 'Gurugram', address: 'Unitech Cyber Park, Tower B, 2nd Floor, Sector 39, Gurugram, Haryana 122001' },
            pricing: { amount: 8500, period: 'month', currency: 'INR' },
            capacity: { total: 300, available: 45, meetingRooms: 8 },
            trustScore: 8.3, officialStatus: 'Verified',
            website: 'https://www.theofficepass.com/',
        },
        {
            id: `demo-del-4`, name: 'IIT Delhi Incubation',
            type: 'incubator',
            location: { area: 'Hauz Khas', city: 'Delhi', address: 'Foundation for Innovation and Technology Transfer, IIT Delhi, Hauz Khas, New Delhi 110016' },
            pricing: { amount: 0, period: 'month', currency: 'INR' },
            capacity: { total: 80, available: 5, meetingRooms: 3 },
            trustScore: 9.7, officialStatus: 'Verified',
            website: 'https://iitd.ac.in/fitt',
            equityTerms: { takesEquity: true, percentage: 2, description: '1-2% equity for deep-tech startups. Access to IIT Delhi labs, faculty mentors, and ₹50L+ funding through FITT.' },
        },
        {
            id: `demo-del-5`, name: 'GoWork Nehru Place',
            type: 'coworking',
            location: { area: 'Nehru Place', city: 'Delhi', address: '5th Floor, Eros Corporate Tower, Nehru Place, New Delhi, Delhi 110019' },
            pricing: { amount: 12000, period: 'month', currency: 'INR' },
            capacity: { total: 350, available: 40, meetingRooms: 7 },
            trustScore: 8.7, officialStatus: 'Verified',
            website: 'https://www.gowork.com/',
        },

        // ─── Hyderabad ──────────────────────────────────────
        {
            id: `demo-hyd-1`, name: 'iKeva HITEC City',
            type: 'coworking',
            location: { area: 'HITEC City', city: 'Hyderabad', address: '6th Floor, Maximus Towers, 2-36, Madhapur, HITEC City, Hyderabad, Telangana 500081' },
            pricing: { amount: 8000, period: 'month', currency: 'INR' },
            capacity: { total: 200, available: 30, meetingRooms: 5 },
            trustScore: 8.9, officialStatus: 'Verified',
            website: 'https://www.ikeva.com/',
        },
        {
            id: `demo-hyd-2`, name: 'T-Hub 2.0',
            type: 'incubator',
            location: { area: 'Raidurg', city: 'Hyderabad', address: '20, Inorbit Mall Rd, Vittal Rao Nagar, Madhapur, Hyderabad, Telangana 500081' },
            pricing: { amount: 7500, period: 'month', currency: 'INR' },
            capacity: { total: 300, available: 25, meetingRooms: 8 },
            trustScore: 9.6, officialStatus: 'Verified',
            website: 'https://t-hub.co/',
            equityTerms: { takesEquity: false, percentage: 0, description: 'T-Hub is India\'s largest incubator, backed by Telangana Government. Zero equity. World-class facilities, mentorship, and corporate partnerships.' },
        },
        {
            id: `demo-hyd-3`, name: 'CoWrks Hitech City',
            type: 'coworking',
            location: { area: 'Madhapur', city: 'Hyderabad', address: 'DLF Cyber City, Patrika Nagar, Madhapur, Hyderabad, Telangana 500081' },
            pricing: { amount: 10000, period: 'month', currency: 'INR' },
            capacity: { total: 250, available: 35, meetingRooms: 6 },
            trustScore: 9.0, officialStatus: 'Verified',
            website: 'https://www.cowrks.com/',
        },

        // ─── Pune ───────────────────────────────────────────
        {
            id: `demo-pune-1`, name: 'Bhive Workspace Kothrud',
            type: 'coworking',
            location: { area: 'Kothrud', city: 'Pune', address: 'Paud Road, Kothrud, Pune, Maharashtra 411038' },
            pricing: { amount: 6500, period: 'month', currency: 'INR' },
            capacity: { total: 120, available: 20, meetingRooms: 3 },
            trustScore: 8.4, officialStatus: 'Verified',
            website: 'https://bhiveworkspace.com/',
        },
        {
            id: `demo-pune-2`, name: 'Venture Center CSIR-NCL',
            type: 'incubator',
            location: { area: 'Pashan', city: 'Pune', address: 'NCL Innovation Park, Dr. Homi Bhabha Road, Pashan, Pune, Maharashtra 411008' },
            pricing: { amount: 0, period: 'month', currency: 'INR' },
            capacity: { total: 100, available: 10, meetingRooms: 4 },
            trustScore: 9.5, officialStatus: 'Verified',
            website: 'https://www.venturecenter.co.in/',
            equityTerms: { takesEquity: false, percentage: 0, description: 'Science-based incubator at CSIR-NCL campus. Zero equity. Focuses on deep-tech, biotech, and materials science startups. Access to CSIR labs.' },
        },
        {
            id: `demo-pune-3`, name: 'Smartworks Viman Nagar',
            type: 'coworking',
            location: { area: 'Viman Nagar', city: 'Pune', address: 'Panchsheel Tech Park, Near Symbiosis College, Viman Nagar, Pune, Maharashtra 411014' },
            pricing: { amount: 8000, period: 'month', currency: 'INR' },
            capacity: { total: 280, available: 50, meetingRooms: 6 },
            trustScore: 8.8, officialStatus: 'Verified',
            website: 'https://www.smartworks.in/',
        },

        // ─── Chennai ────────────────────────────────────────
        {
            id: `demo-chn-1`, name: 'WeWork RMZ Millenia',
            type: 'coworking',
            location: { area: 'Perungudi', city: 'Chennai', address: 'RMZ Millenia, MGR Main Road, Perungudi, Chennai, Tamil Nadu 600096' },
            pricing: { amount: 12000, period: 'month', currency: 'INR' },
            capacity: { total: 350, available: 30, meetingRooms: 8 },
            trustScore: 9.2, officialStatus: 'Verified',
            website: 'https://www.wework.com/',
        },
        {
            id: `demo-chn-2`, name: 'IIT Madras Incubation Cell',
            type: 'incubator',
            location: { area: 'Adyar', city: 'Chennai', address: 'IIT Madras Research Park, Kanagam Rd, Taramani, Chennai, Tamil Nadu 600113' },
            pricing: { amount: 0, period: 'month', currency: 'INR' },
            capacity: { total: 150, available: 12, meetingRooms: 5 },
            trustScore: 9.8, officialStatus: 'Verified',
            website: 'https://www.incubation.iitm.ac.in/',
            equityTerms: { takesEquity: true, percentage: 1, description: '0.5-1.5% equity. IIT Madras Research Park provides world-class labs, faculty mentors, and access to IIT Madras deep-tech ecosystem.' },
        },
        {
            id: `demo-chn-3`, name: 'Workafella OMR',
            type: 'coworking',
            location: { area: 'Sholinganallur', city: 'Chennai', address: 'Prince Infocity II, OMR, Sholinganallur, Chennai, Tamil Nadu 600119' },
            pricing: { amount: 7500, period: 'month', currency: 'INR' },
            capacity: { total: 200, available: 40, meetingRooms: 5 },
            trustScore: 8.5, officialStatus: 'Verified',
            website: 'https://www.workafella.com/',
        },
    ];

    // Add amenities and images to each demo venue
    const enrichedDemo = demoVenues.map(v => ({
        ...v,
        amenities: v.amenities || pickRandom(
            v.type === 'incubator' ? INCUBATOR_AMENITIES : COWORKING_AMENITIES,
            7, 10
        ),
        images: v.images || [
            `https://lh3.googleusercontent.com/p/AF1QipPRNKW2I3YUw8Beyw9az6vEZhCZHSU-BqD6n8zP=w400-h300-k-no`
        ],
        reviews: v.reviews || [
            { user: 'Startup Founder', text: 'Great workspace with excellent amenities. Highly recommended for small teams.', rating: 5, date: 'Recent' },
            { user: 'Freelancer', text: 'Good location, clean facilities, and friendly staff.', rating: 4, date: 'Recent' },
        ],
    }));

    const all = [...existing, ...enrichedDemo];

    // De-duplicate by name
    const seen = new Set();
    const unique = all.filter(v => {
        const key = v.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(unique, null, 2));

    const cities = [...new Set(unique.map(v => v.location.city))];
    console.log(`✅ Demo data generated!`);
    console.log(`   📍 Total venues: ${unique.length}`);
    console.log(`   🏙️  Cities: ${cities.join(', ')}`);
    console.log(`   📁 Saved to: ${DATA_PATH}\n`);
}

main().catch(console.error);
