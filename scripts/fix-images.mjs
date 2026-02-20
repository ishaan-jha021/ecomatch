/**
 * Fix Venue Images Script
 * Replaces placeholder images with curated, high-quality Unsplash photos
 * of real coworking spaces, incubators, and office environments.
 * 
 * Run: node scripts/fix-images.mjs
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'scraped_venues.json');

// Placeholder image to detect
const PLACEHOLDER = 'AF1QipPRNKW2I3YUw8Beyw9az6vEZhCZHSU-BqD6n8zP';

// ═══════════════════════════════════════════════════════════════
// Curated Unsplash photo IDs — real coworking/office/lab photos
// Each photo ID maps to a real, high-quality Unsplash image
// ═══════════════════════════════════════════════════════════════

const COWORKING_PHOTOS = [
    // Modern open-plan offices, coworking desks, meeting rooms
    'photo-1497366216548-37526070297c', // modern bright office
    'photo-1497366811353-6870744d04b2', // open office with desks
    'photo-1504384308090-c894fdcc538d', // laptop on desk workspace
    'photo-1527192491265-7e15c55b1ed2', // coworking interior
    'photo-1556761175-5973dc0f32e7', // office meeting room
    'photo-1497215842964-222b430dc094', // creative workspace
    'photo-1517502884422-41eae6c63f6e', // modern office chairs
    'photo-1524758631624-e2822e304c36', // minimalist workspace
    'photo-1564069114553-7215e1ff1890', // coworking space setup
    'photo-1568992687947-868a62a9f521', // open workspace with lights
    'photo-1572025442646-866d16c84a54', // office interior design
    'photo-1600508774634-4e11d34730e2', // modern office building
    'photo-1519389950473-47ba0277781c', // tech workspace
    'photo-1522071820081-009f0129c71c', // team collaboration space
    'photo-1527137342181-19aab11a8ee8', // bright office with plants
    'photo-1505330622279-bf7d7fc918f4', // startup office
    'photo-1553877522-43269d4ea984', // open plan design office
    'photo-1604328698692-f76ea9498e76', // cozy coworking corner
    'photo-1562664377-709f2c337eb2', // meeting room glass walls
    'photo-1571624436279-b272aff752b5', // colorful workspace
    'photo-1497366754035-f200968a6e72', // aerial office view
    'photo-1555212697-194d092e3b8f', // laptop workspace coffee
    'photo-1600494603989-9650cf6ddd3d', // office lounge area
    'photo-1590381105924-c72589b9ef3f', // hot desk setup
    'photo-1585858229735-cd08d7ddd07b', // industrial coworking loft
    'photo-1531973576160-7125cd663d86', // bookshelf workspace
    'photo-1560264280-88b68371db39', // executive office room
    'photo-1606836576983-8b458e75221d', // neon modern office
    'photo-1542744173-8e7e53415bb0', // boardroom table
    'photo-1577412647305-991150c7d163', // minimalist meeting room
];

const INCUBATOR_PHOTOS = [
    // Tech labs, innovation centers, startup spaces, college campuses
    'photo-1581091226825-a6a2a5aee158', // technology lab
    'photo-1517245386807-bb43f82c33c4', // university campus
    'photo-1522202176988-66273c2fd55f', // students collaborating
    'photo-1531482615713-2afd69097998', // presentation room
    'photo-1523240795612-9a054b0db644', // university lecture hall
    'photo-1559136555-9303baea8ebd', // startup whiteboard session
    'photo-1552664730-d307ca884978', // team brainstorming
    'photo-1517048676732-d65bc937f952', // conference meeting
    'photo-1581092160607-ee22621dd758', // innovation lab equipment
    'photo-1562774053-701939374585', // modern glass building
    'photo-1497215728101-856f4ea42174', // city office building
    'photo-1486406146926-c627a92ad1ab', // skyscraper office
    'photo-1541746972996-4e0b0f43e02a', // startup pitch session
    'photo-1573164713988-8665fc963095', // research lab
    'photo-1504384764586-bb4cdc1707b0', // startup team desk
    'photo-1553028826-f4804a6dba3b', // innovation hub entrance
    'photo-1498050108023-c5249f4df085', // coding developer desk
    'photo-1460925895917-afdab827c52f', // data science dashboard
    'photo-1551434678-e076c223a692', // developer workspace
    'photo-1521737852567-6949f3f9f2b5', // team working together
    'photo-1581092921461-eab62e97a780', // electronics prototyping
    'photo-1518770660439-4636190af475', // microchip PCB lab
    'photo-1532094349884-543bc11b234d', // whiteboard planning
    'photo-1565688534245-05d6b5be184a', // incubation lab
    'photo-1521737604893-d14cc237f11d', // team collaboration
    'photo-1556761175-b413da4baf72', // shared workspace
    'photo-1557804506-669a67965ba0', // glass office interior
    'photo-1524178232363-1fb2b075b655', // lecture/seminar hall
    'photo-1517694712202-14dd9538aa97', // laptop macbook coding
    'photo-1559027615-cd4628902d4a', // 3D printing lab
];

const BIOTECH_PHOTOS = [
    'photo-1582719471384-894fbb16564e', // biotech lab
    'photo-1579154204601-01588f351e67', // science laboratory
    'photo-1581093458791-9d42e3c50802', // microscope research
    'photo-1576086213369-97a306d36557', // chemistry lab
    'photo-1559757148-5c350d0d3c56', // pharma lab
    'photo-1532187863486-abf9dbad1b69', // medical research
];

const CAMPUS_PHOTOS = [
    'photo-1562774053-701939374585', // modern campus
    'photo-1541339907198-e08756dedf3f', // university building
    'photo-1580582932707-520aed937b7b', // campus greenery
    'photo-1607237138185-eedd9c632b0b', // Indian campus
    'photo-1523050854058-8df90110c476', // tropical campus
];

function unsplash(photoId, w = 800, h = 500) {
    return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&q=80`;
}

function assignPhotos(venue, index) {
    const isBiotech = /biotech|pharma|bio-?incub|health|med|life.?science|nidhi.?coe/i.test(
        venue.name + ' ' + (venue.equityTerms?.description || '')
    );
    const isCampus = /university|iit|iim|iiit|nit|college|vidyapith|vidyavihar/i.test(venue.name);

    let pool;
    if (venue.type === 'coworking') {
        pool = COWORKING_PHOTOS;
    } else if (isBiotech) {
        pool = [...BIOTECH_PHOTOS, ...INCUBATOR_PHOTOS.slice(0, 10)];
    } else if (isCampus) {
        pool = [...CAMPUS_PHOTOS, ...INCUBATOR_PHOTOS.slice(0, 15)];
    } else {
        pool = INCUBATOR_PHOTOS;
    }

    // Use venue index as seed for deterministic but varied selection
    const start = (index * 7) % pool.length;
    const count = 3 + (index % 3); // 3 to 5 images per venue

    const selected = [];
    for (let i = 0; i < count; i++) {
        const photoIndex = (start + i * 3) % pool.length;
        selected.push(unsplash(pool[photoIndex]));
    }

    return selected;
}

// ── Main ────────────────────────────────────────────────────────
const venues = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

let fixed = 0;
let kept = 0;

venues.forEach((venue, i) => {
    const hasPlaceholder = venue.images.length === 1 && venue.images[0].includes(PLACEHOLDER);
    const hasSmallImage = venue.images.length === 1 && venue.images[0].includes('w63-h63');

    if (hasPlaceholder || hasSmallImage) {
        venue.images = assignPhotos(venue, i);
        fixed++;
    } else {
        kept++;
    }
});

fs.writeFileSync(DATA_PATH, JSON.stringify(venues, null, 2));

console.log(`\n🖼️  Image Fix Complete`);
console.log(`   ✅ Fixed: ${fixed} venues (placeholder → curated photos)`);
console.log(`   📸 Kept: ${kept} venues (already had real photos)`);
console.log(`   🎨 Avg images per venue: ${(venues.reduce((s, v) => s + v.images.length, 0) / venues.length).toFixed(1)}`);
console.log(`   📁 Saved to: ${DATA_PATH}\n`);
