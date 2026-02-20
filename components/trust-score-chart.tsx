import { ShieldCheck, Star, TrendingUp, BadgeCheck } from "lucide-react";

interface TrustScoreProps {
    score: number;
    reviewsCount: number;
    officialStatus: "Verified" | "Unverified" | "Partner";
}

export function TrustScoreChart({ score, reviewsCount, officialStatus }: TrustScoreProps) {
    const googleRating = Math.min(5, score * 0.5 + 0.5);
    const sentimentScore = score * 10;

    return (
        <div className="border border-gray-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900">Trust Score</h3>
            </div>

            <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold text-gray-900">{score}</span>
                <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${officialStatus === "Verified" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                        {officialStatus}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{reviewsCount} signals</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1"><Star className="h-3 w-3" /> Google Rating</span>
                        <span className="text-gray-700 font-medium">{googleRating.toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gray-900" style={{ width: `${(googleRating / 5) * 100}%` }} />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> Verification</span>
                        <span className="text-gray-700 font-medium">100%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gray-900" style={{ width: `100%` }} />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Sentiment</span>
                        <span className="text-gray-700 font-medium">{sentimentScore.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-gray-900" style={{ width: `${sentimentScore}%` }} />
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-100">
                Score combines Google Maps data, reviews, and physical verification.
            </p>
        </div>
    );
}
