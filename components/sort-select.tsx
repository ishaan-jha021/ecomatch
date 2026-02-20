"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const current = searchParams.get('sort') || 'trust';

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        const value = e.target.value;
        if (value === 'trust') params.delete('sort');
        else params.set('sort', value);
        const query = params.toString();
        router.push(`/search${query ? `?${query}` : ''}`);
    }, [searchParams, router]);

    return (
        <select
            value={current}
            onChange={handleChange}
            className="text-sm text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 cursor-pointer font-medium underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 transition-colors"
        >
            <option value="trust">Top rated</option>
            <option value="price_low">Price: low first</option>
            <option value="price_high">Price: high first</option>
        </select>
    );
}
