import { Navbar } from "@/components/navbar";
import { FilterSidebar } from "@/components/filter-sidebar";
import { ResultCard } from "@/components/result-card";
import { SortSelect } from "@/components/sort-select";
import { searchVenues } from "@/lib/db";
import { parseQueryWithLLM, ParsedQuery } from "@/lib/smart-search";
import { SlidersHorizontal } from "lucide-react";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; type?: string; wifi?: string; meeting?: string; sort?: string; city?: string; zeroEquity?: string }>;
}) {
    const sp = await searchParams;
    const query = sp.q || "";

    // ── Smart search: parse natural language via LLM ──
    let parsedFilters: ParsedQuery = {};
    let isSmartSearch = false;

    if (query.trim()) {
        parsedFilters = await parseQueryWithLLM(query);
        isSmartSearch = Object.keys(parsedFilters).length > 0;
    }

    // Merge URL params with LLM-parsed filters (URL params take precedence)
    const filters = {
        type: sp.type || parsedFilters.type,
        city: sp.city || parsedFilters.city,
        wifi: sp.wifi === 'true' || parsedFilters.wifi || false,
        meeting: sp.meeting === 'true' || parsedFilters.meeting || false,
        zeroEquity: sp.zeroEquity === 'true' || parsedFilters.zeroEquity || false,
        minCapacity: parsedFilters.minCapacity,
        maxPrice: parsedFilters.maxPrice,
        governmentScheme: parsedFilters.governmentScheme,
        textSearch: parsedFilters.textSearch,
    };

    // Don't pass the raw query to text search when LLM already parsed it into structured filters
    const textQuery = isSmartSearch ? "" : query;
    let venues = await searchVenues(textQuery, filters);

    const sort = sp.sort || 'trust';
    if (sort === 'trust') venues = [...venues].sort((a, b) => b.trustScore - a.trustScore);
    else if (sort === 'price_low') venues = [...venues].sort((a, b) => a.pricing.amount - b.pricing.amount);
    else if (sort === 'price_high') venues = [...venues].sort((a, b) => b.pricing.amount - a.pricing.amount);

    // Build the "understood as" tags for displaying parsed filters
    const parsedTags: { label: string; value: string }[] = [];
    if (filters.type) parsedTags.push({ label: 'Type', value: filters.type });
    if (filters.city) parsedTags.push({ label: 'City', value: filters.city });
    if (filters.minCapacity) parsedTags.push({ label: 'Min Seats', value: `${filters.minCapacity}+` });
    if (filters.maxPrice) parsedTags.push({ label: 'Max Price', value: `₹${filters.maxPrice.toLocaleString()}` });
    if (filters.zeroEquity) parsedTags.push({ label: 'Equity', value: 'Zero equity' });
    if (filters.wifi) parsedTags.push({ label: 'WiFi', value: 'Required' });
    if (filters.meeting) parsedTags.push({ label: 'Meeting Rooms', value: 'Required' });
    if (filters.governmentScheme) parsedTags.push({ label: 'Scheme', value: filters.governmentScheme.toUpperCase() });
    if (filters.textSearch) parsedTags.push({ label: 'Keyword', value: filters.textSearch });

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-24 pb-12 container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="hidden w-56 shrink-0 md:block sticky top-24 self-start">
                        <FilterSidebar />
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="mb-5 flex items-baseline justify-between">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {venues.length} spaces {query && <>for &ldquo;{query}&rdquo;</>}
                            </h1>
                            <SortSelect />
                        </div>

                        {/* Smart search insight bar */}
                        {isSmartSearch && parsedTags.length > 0 && (
                            <div className="mb-5 bg-gradient-to-r from-gray-50 to-rose-50 border border-gray-200 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600">Showing results for:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {parsedTags.map((tag) => (
                                        <span key={tag.label} className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
                                            <span className="text-gray-400 font-medium">{tag.label}:</span>
                                            <span className="text-gray-900 font-semibold">{tag.value}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            {venues.map((venue, i) => (
                                <div key={venue.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                                    <ResultCard venue={venue} />
                                </div>
                            ))}
                            {venues.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-3xl mb-2">🔍</p>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No spaces found</h3>
                                    <p className="text-sm text-gray-500">Try adjusting your filters or search area.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
