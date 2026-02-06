const fs = require("fs");
const path = require("path");

function generateSitemap() {
    const baseUrl = "https://quran.mr3od.dev";
    const pages = [];

    // Add static pages
    pages.push({ url: "", priority: "1.0", changefreq: "weekly" }); // home
    pages.push({ url: "search", priority: "0.9", changefreq: "weekly" });
    pages.push({ url: "bookmarks", priority: "0.7", changefreq: "monthly" });
    pages.push({ url: "settings", priority: "0.5", changefreq: "monthly" });

    // Dynamic pages - read from generated static data
    const pagesDir = path.join(__dirname, "../public/api/static/pages");
    if (fs.existsSync(pagesDir)) {
        const pageFiles = fs
            .readdirSync(pagesDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => parseInt(f.replace(".json", "")))
            .filter((num) => !isNaN(num))
            .sort((a, b) => a - b);

        pageFiles.forEach((num) => {
            pages.push({
                url: `pages/${num}`,
                priority: "0.8",
                changefreq: "yearly",
            });
        });

        console.log(`📊 Found ${pageFiles.length} pre-generated pages`);
    } else {
        // Fallback to hardcoded 604
        console.log("⚠️ Static pages not found, using fallback 1-604");
        for (let i = 1; i <= 604; i++) {
            pages.push({
                url: `pages/${i}`,
                priority: "0.8",
                changefreq: "yearly",
            });
        }
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
            .map(
                (page) => `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
            )
            .join("\n")}
</urlset>`;

    // Ensure dist directory exists
    const distDir = path.join(__dirname, "../dist");
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
    console.log(`✅ Sitemap generated with ${pages.length} URLs`);
    console.log(`📍 Location: ${path.join(distDir, "sitemap.xml")}`);
}

// Also generate robots.txt
function generateRobotsTxt() {
    const baseUrl = "https://quran.mr3od.dev";
    const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

    const distDir = path.join(__dirname, "../dist");
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(path.join(distDir, "robots.txt"), robots);
    console.log("✅ robots.txt generated");
}

if (require.main === module) {
    generateSitemap();
    generateRobotsTxt();
}

module.exports = { generateSitemap, generateRobotsTxt };
