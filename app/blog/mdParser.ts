import fs from "fs";
import path from "path";

export interface Post {
  slug: string;
  title: string;
  toolBinding?: string;
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content");

export function getAllPosts(): Post[] {
  if (!fs.existsSync(contentDirectory)) return [];
  const files = fs.readdirSync(contentDirectory);
  
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, file);
      const rawContent = fs.readFileSync(fullPath, "utf-8");
      
      // 极其简单的元数据（Frontmatter）粗暴解析
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

      return { slug, title, toolBinding, content };
    });
}

export function getPostBySlug(slug: string): Post | null {
  const all = getAllPosts();
  return all.find((p) => p.slug === slug) || null;
}
