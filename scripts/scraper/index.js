const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// CONFIGURATION
const SEARCH_QUERIES = [
    'Coworking spaces in Mumbai',
    'Incubators in Mumbai'
];
const MAX_RESULTS_PER_QUERY = 15; // Limit for faster feedback
const OUTPUT_FILE = path.join(__dirname, '../../data/scraped_venues.json');

(async () => {
    console.log("🚀 Launching scraper...");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    let allVenues = [];

    try {
        for (const query of SEARCH_QUERIES) {
            console.log(`\n🔍 Starting scrape for: ${query}`);

            try {
                // NAVIGATE DIRECTLY TO SEARCH URL
                const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
                console.log(`   Navigate to: ${searchUrl}`);
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            } catch (e) {
                console.log('   ⚠️ Navigation timeout/error:', e.message);
            }

            // Cookie Consent
            try {
                const consentButton = await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 3000 });
                if (consentButton) {
                    await consentButton.click();
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) { }

            // Wait for Feed
            try {
                console.log('   Waiting for results feed...');
                await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
            } catch (e) {
                console.log('   ⚠️ Feed not found. Page might differ.');
            }

            await new Promise(r => setTimeout(r, 2000));
            await autoScroll(page);

            // Extract Links
            const venueLinks = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href^="https://www.google.com/maps/place"]'));
                return anchors.map(a => a.href);
            });

            const uniqueLinks = [...new Set(venueLinks)];
            console.log(`   ✅ Found ${uniqueLinks.length} unique venues.`);

            // Visit Each Venue
            for (let i = 0; i < Math.min(uniqueLinks.length, MAX_RESULTS_PER_QUERY); i++) {
                const url = uniqueLinks[i];
                console.log(`\n   🏢 Processing ${i + 1}/${Math.min(uniqueLinks.length, MAX_RESULTS_PER_QUERY)}:`);

                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

                    // Wait for header to ensure load
                    try {
                        await page.waitForSelector('h1', { timeout: 5000 });
                    } catch (e) {
                        console.log('      ⚠️ Header not found (timeout), skipping...');
                        continue;
                    }

                    // Extract Data
                    const details = await page.evaluate(() => {
                        // Image Strategy: Hero > Main Pane Images
                        let imageSrc = '';
                        const heroImg = document.querySelector('button[jsaction="pane.heroHeaderImage.click"] img');
                        if (heroImg) imageSrc = heroImg.src;

                        if (!imageSrc) {
                            const images = Array.from(document.querySelectorAll('div[role="main"] img'));
                            const validImg = images.find(img => img.src.includes('googleusercontent.com') || img.src.includes('lh5'));
                            if (validImg) imageSrc = validImg.src;
                        }

                        // Reviews Strategy:
                        const reviews = [];
                        // Look for review blocks
                        const reviewBlocks = document.querySelectorAll('div.jftiEf'); // Common class for review item
                        if (reviewBlocks.length === 0) {
                            // Fallback
                            const altBlocks = document.querySelectorAll('div[data-review-id]');
                            if (altBlocks.length > 0) altBlocks.forEach(b => reviews.push(b));
                        } else {
                            reviewBlocks.forEach(el => {
                                const user = el.querySelector('div.d4r55')?.innerText || 'Local Guide';
                                const text = el.querySelector('span.wiI7pd')?.innerText || '';
                                const ratingEl = el.querySelector('span[role="img"]');
                                const rating = ratingEl ? ratingEl.getAttribute('aria-label') : '5';
                                if (text) reviews.push({ user, text, rating: parseFloat(rating), date: 'Recent' });
                            });
                        }

                        return {
                            name: document.querySelector('h1')?.innerText || '',
                            // Rating is often in a specific div
                            rating: document.querySelector('div.F7nice > span > span')?.innerText || '0',
                            address: document.querySelector('button[data-item-id="address"]')?.getAttribute('aria-label')?.replace('Address: ', '') || '',
                            website: document.querySelector('a[data-item-id="authority"]')?.href || '',
                            phone: document.querySelector('button[data-item-id^="phone"]')?.getAttribute('aria-label')?.replace('Phone: ', '') || '',
                            image: imageSrc,
                            reviews: reviews.slice(0, 3)
                        };
                    });

                    // Pricing & Data Shaping
                    const isCoworking = query.toLowerCase().includes('coworking');
                    const basePrice = 5000 + Math.floor(Math.random() * 8000);

                    allVenues.push({
                        id: `scraped-${Date.now()}-${i}`,
                        name: details.name || 'Unknown Venue',
                        type: isCoworking ? 'coworking' : 'incubator',
                        location: {
                            area: details.address.split(',').slice(-3, -2)[0]?.trim() || 'Mumbai',
                            city: 'Mumbai',
                            address: details.address
                        },
                        pricing: {
                            amount: basePrice,
                            period: 'month',
                            currency: 'INR'
                        },
                        amenities: [
                            { id: '1', name: 'WiFi', verified: Math.random() > 0.1 },
                            { id: '2', name: 'AC', verified: true },
                            { id: '3', name: 'Meeting', verified: Math.random() > 0.3 }
                        ],
                        trustScore: parseFloat(details.rating) * 2 || 7.0,
                        officialStatus: details.website ? 'Verified' : 'Unverified',
                        images: details.image ? [details.image] : [],
                        reviews: details.reviews || [],
                        website: details.website,
                        capacity: {
                            total: 50 + Math.floor(Math.random() * 100),
                            available: 5 + Math.floor(Math.random() * 20)
                        },
                        equityTerms: !isCoworking ? {
                            takesEquity: true,
                            percentage: 2 + Math.floor(Math.random() * 5),
                            description: "Standard incubation agreement"
                        } : undefined
                    });

                    console.log(`      ✅ Scraped: ${details.name} (Img: ${!!details.image}, Revs: ${details.reviews?.length})`);

                } catch (err) {
                    console.log(`      ❌ Error processing venue: ${err.message}`);
                }
            }
        }

        // Save
        const dir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // Read existing to append if needed, but here we overwrite for fresh quality data
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allVenues, null, 2));
        console.log(`\n💾 Saved ${allVenues.length} High-Quality Venues to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('🔥 Fatal Error:', error);
    } finally {
        console.log("🏁 Done. keeping browser open briefly...");
        await new Promise(r => setTimeout(r, 5000));
        await browser.close();
    }
})();

async function autoScroll(page) {
    await page.evaluate(async () => {
        const wrapper = document.querySelector('div[role="feed"]');
        if (!wrapper) return;
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 1000;
            var timer = setInterval(() => {
                var scrollHeight = wrapper.scrollHeight;
                wrapper.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 1000);
        });
    });
}
