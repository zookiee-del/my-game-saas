import fs from "fs";
import path from "path";

export interface Post {
  slug: string;
  title: string;
  category?: string;
  date?: string;
  toolBinding?: string;
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content");

// Load articles_meta.json for category/date metadata
function getMetaMap(): Record<string, { category: string; date: string }> {
  const metaPath = path.join(contentDirectory, "articles_meta.json");
  if (!fs.existsSync(metaPath)) return {};
  try {
    const raw = fs.readFileSync(metaPath, "utf-8");
    const arr = JSON.parse(raw) as Array<{ slug: string; category: string; date: string }>;
    const map: Record<string, { category: string; date: string }> = {};
    for (const item of arr) {
      map[item.slug] = { category: item.category, date: item.date };
    }
    return map;
  } catch {
    return {};
  }
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(contentDirectory)) return [];
  const files = fs.readdirSync(contentDirectory);
  const metaMap = getMetaMap();

  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, file);
      const rawContent = fs.readFileSync(fullPath, "utf-8");

      // Simple frontmatter parser
      let title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      let toolBinding = "";
      let content = rawContent;

      if (rawContent.startsWith("---")) {
        const parts = rawContent.split("---");
        if (parts.length >= 3) {
          const yaml = parts[1];
          content = parts.slice(2).join("---").trim();

          const titleMatch = yaml.match(/title:\s*"(.*)"/);
          if (titleMatch) title = titleMatch[1];

          const toolMatch = yaml.match(/tool_binding:\s*"(.*)"/);
          if (toolMatch) toolBinding = toolMatch[1];
        }
      }

      // Merge category and date from articles_meta.json
      const meta = metaMap[slug];
      const category = meta?.category || "uncategorized";
      const date = meta?.date || "";

      return { slug, title, category, date, toolBinding, content };
    });
}

export function getPostBySlug(slug: string): Post | null {
  const all = getAllPosts();
  return all.find((p) => p.slug === slug) || null;
}

export function getPostsByCategory(categoryId: string): Post[] {
  const all = getAllPosts();
  return all.filter((p) => p.category === categoryId);
}

export function getAllCategories(): { id: string; label: string; count: number }[] {
  const all = getAllPosts();
  const catMap: Record<string, number> = {};
  for (const post of all) {
    const cat = post.category || "uncategorized";
    catMap[cat] = (catMap[cat] || 0) + 1;
  }
  const labels: Record<string, string> = {
    "meta-builds": "Meta Builds",
    "boss-guides": "Boss Guides",
    "collectibles": "Collectibles",
  };
  return Object.entries(catMap).map(([id, count]) => ({
    id,
    label: labels[id] || id,
    count,
  }));
}