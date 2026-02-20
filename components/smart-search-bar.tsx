"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";

const EXAMPLE_QUERIES = [
    "Incubators in Bangalore",
    "Coworking space in Mumbai with 20 seats",
    "Zero equity incubators in Delhi",
    "Cheap office space in Pune with meeting rooms",
    "Government incubators in Hyderabad",
    "IIT incubators",
    "Startup space in Chennai",
    "Atal Incubation Centres",
    "Coworking near Koramangala",
    "Affordable desks in Ahmedabad",
];

export function SmartSearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Typewriter effect for placeholders
    useEffect(() => {
        if (query) return; // Don't animate when user is typing

        const target = EXAMPLE_QUERIES[placeholderIndex];
        let charIndex = 0;
        setDisplayedPlaceholder("");

        const typeTimer = setInterval(() => {
            if (charIndex <= target.length) {
                setDisplayedPlaceholder(target.slice(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typeTimer);
                // Wait then move to next
                setTimeout(() => {
                    setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_QUERIES.length);
                }, 2500);
            }
        }, 60);

        return () => clearInterval(typeTimer);
    }, [placeholderIndex, query]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        // Navigate to search with the natural language query
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setIsSearching(true);
        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="relative mb-4">
                <div className={`flex items-center border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all bg-white overflow-hidden pl-5 pr-2 py-2 ${isSearching ? "border-rose-300 shadow-rose-100" : "border-gray-200 focus-within:border-rose-400"
                    }`}>
                    <Search className={`h-4 w-4 mr-3 shrink-0 transition-colors ${isSearching ? "text-rose-500" : "text-gray-300"}`} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 text-base placeholder:text-gray-400 focus:outline-none bg-transparent"
                        placeholder={displayedPlaceholder || "Search spaces..."}
                        type="text"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="h-10 w-10 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                        {isSearching ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="h-4 w-4 text-white" />
                        )}
                    </button>
                </div>
            </form>

            {/* Quick suggestion pills */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
                {["Incubators in Bangalore", "Coworking in Mumbai", "Zero equity Delhi", "Govt incubators"].map((suggestion) => (
                    <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer group"
                    >
                        {suggestion}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>
        </div>
    );
}
