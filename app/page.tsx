import { Navbar } from "@/components/navbar";
import { SmartSearchBar } from "@/components/smart-search-bar";
import { MapPin, Shield, Zap, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="px-4 py-16 md:py-28">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Find your next<br />
              <span className="text-rose-500">startup space</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
              Verified co-working spaces and incubators across India. Real photos, real reviews, no noise.
            </p>

            {/* AI-Powered Search Bar */}
            <SmartSearchBar />

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
              <Sparkles className="h-3 w-3" />
              <span>AI-powered search — try natural language like &ldquo;coworking in Mumbai with 20 seats&rdquo;</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-100 bg-gray-50 px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-500 mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Verified Listings</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Every space is verified through physical audits and API integrations. No stale data.</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-500 mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Hyper-Local Search</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Filter by micro-location, amenities, equity terms, and real-time availability.</p>
              </div>
              <div>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-500 mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Trust Scores</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Transparent ratings from Google Maps, founder reviews, and our own verification.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
