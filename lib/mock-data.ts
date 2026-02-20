export interface Amenity {
    id: string;
    name: string;
    verified: boolean;
}

export interface Review {
    id: string;
    user: string;
    rating: number;
    text: string;
    date: string;
}

export interface Venue {
    id: string;
    name: string;
    type: "incubator" | "coworking";
    location: {
        area: string;
        city: string;
        address?: string;
        coordinates?: { lat: number; lng: number };
    };
    pricing: {
        amount: number;
        period: "month" | "day" | "seat";
        currency: string;
    };
    capacity?: {
        total: number;
        available: number;
        meetingRooms?: number;
    };
    amenities: Amenity[];
    equityTerms?: {
        takesEquity: boolean;
        percentage?: number;
        description?: string;
    };
    trustScore: number;
    officialStatus: "Verified" | "Unverified" | "Partner";
    images: string[];
    reviews: Review[];
    website?: string;
}

export const MOCK_VENUES: Venue[] = [
    {
        id: "1",
        name: "Innov8 Coworking",
        type: "coworking",
        location: {
            area: "Andheri East",
            city: "Mumbai",
        },
        pricing: {
            amount: 12000,
            period: "month",
            currency: "INR",
        },
        capacity: {
            total: 200,
            available: 45,
            meetingRooms: 5,
        },
        amenities: [
            { id: "1", name: "High-Speed WiFi", verified: true },
            { id: "2", name: "Conference Hall (60+)", verified: true },
            { id: "3", name: "24/7 Access", verified: true },
            { id: "4", name: "Coffee Machine", verified: false },
        ],
        trustScore: 8.9,
        officialStatus: "Verified",
        images: ["/images/venue1.jpg"],
        reviews: [
            {
                id: "r1",
                user: "Founder X",
                rating: 4.5,
                text: "Great vibe, but AC is too cold.",
                date: "2024-02-15",
            },
        ],
    },
    {
        id: "2",
        name: "TechHub Incubator",
        type: "incubator",
        location: {
            area: "Koramangala",
            city: "Bangalore",
        },
        pricing: {
            amount: 0,
            period: "month",
            currency: "INR",
        },
        equityTerms: {
            takesEquity: true,
            percentage: 2,
            description: "2% equity for 6 months support",
        },
        capacity: {
            total: 50,
            available: 5,
            meetingRooms: 2,
        },
        amenities: [
            { id: "1", name: "Mentorship", verified: true },
            { id: "2", name: "Cloud Credits", verified: true },
            { id: "3", name: "Legal Support", verified: true },
        ],
        trustScore: 9.2,
        officialStatus: "Verified",
        images: ["/images/venue2.jpg"],
        reviews: [],
    },
    {
        id: "3",
        name: "Garage Society",
        type: "coworking",
        location: {
            area: "Cyber City",
            city: "Gurugram",
        },
        pricing: {
            amount: 15000,
            period: "month",
            currency: "INR",
        },
        capacity: {
            total: 300,
            available: 12,
            meetingRooms: 8,
        },
        amenities: [
            { id: "1", name: "Event Space", verified: true },
            { id: "2", name: "Podcast Studio", verified: true },
        ],
        trustScore: 7.8,
        officialStatus: "Partner",
        images: ["/images/venue3.jpg"],
        reviews: [],
    },
];
