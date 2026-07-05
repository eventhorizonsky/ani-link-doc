import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BASE = "/ani-link-doc/";
const HOSTNAME = "https://eventhorizonsky.github.io";
const DIST = join(import.meta.dirname, "..", ".vitepress", "dist");

/**
 * 递归收集 dist 目录下所有 .html 文件，返回相对于 dist 的路径列表
 */
function collectHtmlFiles(dir, baseDir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectHtmlFiles(fullPath, baseDir));
    } else if (entry.endsWith(".html")) {
      results.push(relative(baseDir, fullPath).replace(/\\/g, "/"));
    }
  }
  return results;
}

// 收集所有 HTML 文件，排除不需要收录的页面
const EXCLUDE = new Set([
  "404.html",                         // 错误页面
  "googlee549ed50dbbb401c.html",       // Google 站点验证文件
]);

const htmlFiles = collectHtmlFiles(DIST, DIST)
  .filter((file) => !EXCLUDE.has(file));

// 生成 sitemap URL 条目
const now = new Date().toISOString();
const urls = htmlFiles.map((file) => {
  // 去掉 .html 后缀；index.html 映射为目录路径
  let path;
  if (file === "index.html") {
    path = "";
  } else if (file.endsWith("/index.html")) {
    path = file.slice(0, -"index.html".length);
  } else if (file.endsWith(".html")) {
    path = file.slice(0, -".html".length);
  } else {
    path = file;
  }

  const loc = `${HOSTNAME}${BASE}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
  </url>`;
});

// 生成 XML
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>
`;

const outputPath = join(DIST, "sitemap.xml");
writeFileSync(outputPath, sitemap, "utf-8");
console.log(`✅ sitemap.xml generated with ${urls.length} URLs at ${outputPath}`);
