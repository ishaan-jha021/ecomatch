import fs from 'fs';
import path from 'path';
import { Venue, MOCK_VENUES } from './mock-data';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'scraped_venues.json');

export async function getVenues(): Promise<Venue[]> {
    try {
        if (fs.existsSync(DATA_FILE_PATH)) {
            const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
            const realData = JSON.parse(fileContent) as Venue[];
            if (realData.length > 0) {
                return realData;
            }
        }
    } catch (error) {
        console.warn('Failed to load scraped data, falling back to mock data:', error);
    }
    return MOCK_VENUES;
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
    const venues = await getVenues();
    return venues.find((v) => v.id === id);
}

export interface SearchFilters {
    type?: string;
    city?: string;
    wifi?: boolean;
    meeting?: boolean;
    zeroEquity?: boolean;
    minCapacity?: number;
    maxPrice?: number;
    governmentScheme?: string;
    textSearch?: string;
}

export async function searchVenues(query: string, filters?: SearchFilters): Promise<Venue[]> {
    let venues = await getVenues();

    // 1. Text Search (name, area, city, address)
    if (query) {
        const lowerQuery = query.toLowerCase();
        venues = venues.filter(v =>
            v.name.toLowerCase().includes(lowerQuery) ||
            v.location.area.toLowerCase().includes(lowerQuery) ||
            v.location.city.toLowerCase().includes(lowerQuery) ||
            (v.location.address?.toLowerCase().includes(lowerQuery))
        );
    }

    // 2. Type Filter
    if (filters?.type) {
        venues = venues.filter(v => v.type === filters.type);
    }

    // 3. City Filter
    if (filters?.city) {
        const cityLower = filters.city.toLowerCase();
        venues = venues.filter(v => v.location.city.toLowerCase() === cityLower);
    }

    // 4. WiFi filter
    if (filters?.wifi) {
        venues = venues.filter(v => v.amenities?.some(a => a.name.toLowerCase().includes('wifi')));
    }

    // 5. Meeting rooms filter
    if (filters?.meeting) {
        venues = venues.filter(v => v.amenities?.some(a => a.name.toLowerCase().includes('meeting')));
    }

    // 6. Zero equity filter (incubators that don't take equity)
    if (filters?.zeroEquity) {
        venues = venues.filter(v =>
            v.equityTerms && !v.equityTerms.takesEquity
        );
    }

    // 7. Minimum capacity filter
    if (filters?.minCapacity) {
        venues = venues.filter(v =>
            v.capacity && v.capacity.total >= filters.minCapacity!
        );
    }

    // 8. Max price filter
    if (filters?.maxPrice) {
        venues = venues.filter(v =>
            v.pricing.amount <= filters.maxPrice!
        );
    }

    // 9. Government scheme filter
    if (filters?.governmentScheme) {
        const scheme = filters.governmentScheme.toLowerCase();
        venues = venues.filter(v => {
            const gs = (v as unknown as Record<string, unknown>).governmentScheme as string | undefined;
            if (!gs) return false;
            const gsLower = gs.toLowerCase();
            if (scheme === 'aim') return gsLower.includes('aim') || gsLower.includes('atal') || gsLower.includes('niti');
            if (scheme === 'sisfs') return gsLower.includes('sisfs') || gsLower.includes('seed');
            if (scheme === 'dst') return gsLower.includes('dst') || gsLower.includes('nstedb') || gsLower.includes('nidhi');
            if (scheme === 'state') return gsLower.includes('govt') || gsLower.includes('government') || gsLower.includes('state');
            return gsLower.includes(scheme);
        });
    }

    // 10. Text search (targeted name/description search from LLM parsing)
    if (filters?.textSearch) {
        const ts = filters.textSearch.toLowerCase();
        venues = venues.filter(v =>
            v.name.toLowerCase().includes(ts) ||
            v.location.area.toLowerCase().includes(ts) ||
            (v.equityTerms?.description?.toLowerCase().includes(ts)) ||
            (v.location.address?.toLowerCase().includes(ts))
        );
    }

    return venues;
}

// Get unique cities in the dataset
export async function getCities(): Promise<string[]> {
    const venues = await getVenues();
    return [...new Set(venues.map(v => v.location.city))].sort();
}
