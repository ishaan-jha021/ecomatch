"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

// Major cities - shown as pills by default
const TOP_CITIES = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Kolkata'];

// All other cities available
const MORE_CITIES = [
    'Gurugram', 'Jaipur', 'Kochi', 'Bhubaneswar', 'Lucknow', 'Noida', 'Mohali',
    'Coimbatore', 'Chandigarh', 'Indore', 'Nagpur', 'Thiruvananthapuram',
    'Goa', 'Varanasi', 'Kozhikode', 'Surat', 'Gandhinagar', 'Kanpur',
    'Jodhpur', 'Udaipur', 'Bhopal', 'Raipur', 'Guwahati', 'Patna',
    'Visakhapatnam', 'Mangaluru', 'Greater Noida', 'Roorkee', 'Kharagpur',
    'Pilani', 'Mandi', 'Srinagar', 'Jammu', 'Kohima', 'Gangtok',
    'Aizawl', 'Dhanbad', 'Sambalpur', 'Rourkela', 'Sonipat',
].sort();

export function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showMoreCities, setShowMoreCities] = useState(false);
    const [citySearch, setCitySearch] = useState('');

    const toggleFilter = useCallback((key: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (key === 'type' || key === 'city') {
            if (current.get(key) === value) current.delete(key);
            else current.set(key, value);
        } else {
            if (current.has(key)) current.delete(key);
            else current.set(key, 'true');
        }
        const search = current.toString();
        router.push(`/search${search ? `?${search}` : ''}`);
    }, [searchParams, router]);

    const clearAll = useCallback(() => router.push('/search'), [router]);

    const isActive = (key: string, value?: string) =>
        value ? searchParams.get(key) === value : searchParams.has(key);

    const hasAnyFilter = searchParams.has('type') || searchParams.has('wifi') ||
        searchParams.has('meeting') || searchParams.has('city') || searchParams.has('zeroEquity');

    const Pill = ({ label, active, onClick, small }: { label: string; active: boolean; onClick: () => void; small?: boolean }) => (
        <button
            onClick={onClick}
            className={`${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} rounded-lg font-medium transition-all border ${active
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                }`}
        >
            {label}
        </button>
    );

    const filteredMoreCities = citySearch
        ? MORE_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
        : MORE_CITIES;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Filters</h3>
                {hasAnyFilter && (
                    <button onClick={clearAll} className="text-xs font-medium text-gray-500 hover:text-gray-900 underline transition-colors">
                        Clear all
                    </button>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* City — Major Cities */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</h4>
                <div className="flex flex-wrap gap-2">
                    {TOP_CITIES.map(city => (
                        <Pill key={city} label={city} active={isActive('city', city)} onClick={() => toggleFilter('city', city)} />
                    ))}
                </div>

                {/* More Cities toggle */}
                <button
                    onClick={() => setShowMoreCities(!showMoreCities)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    {showMoreCities ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showMoreCities ? 'Show less' : `+${MORE_CITIES.length} more cities`}
                </button>

                {showMoreCities && (
                    <div className="space-y-2">
                        {/* Search within cities */}
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search city..."
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                            />
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                            {filteredMoreCities.map(city => (
                                <Pill key={city} label={city} active={isActive('city', city)} onClick={() => toggleFilter('city', city)} small />
                            ))}
                            {filteredMoreCities.length === 0 && (
                                <p className="text-xs text-gray-400 py-2">No cities found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Type */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Space type</h4>
                <div className="flex flex-wrap gap-2">
                    <Pill label="Co-Working" active={isActive('type', 'coworking')} onClick={() => toggleFilter('type', 'coworking')} />
                    <Pill label="Incubator" active={isActive('type', 'incubator')} onClick={() => toggleFilter('type', 'incubator')} />
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Features */}
            <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</h4>
                <div className="flex flex-wrap gap-2">
                    <Pill label="WiFi" active={isActive('wifi')} onClick={() => toggleFilter('wifi', 'true')} />
                    <Pill label="Meeting Rooms" active={isActive('meeting')} onClick={() => toggleFilter('meeting', 'true')} />
                    <Pill label="Zero Equity" active={isActive('zeroEquity')} onClick={() => toggleFilter('zeroEquity', 'true')} />
                </div>
            </div>
        </div>
    );
}
