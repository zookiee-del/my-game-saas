import { getPostsByCategory, getAllCategories } from "../../mdParser";
import Link from "next/link";

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    categoryId: cat.id,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const resolved = await params;
  const { categoryId } = resolved;
  const posts = getPostsByCategory(categoryId);
  const allCats = getAllCategories();

  const labels: Record<string, string> = {
    "meta-builds": "Meta Builds",
    "boss-guides": "Boss Guides",
    "collectibles": "Collectibles",
  };
  const categoryLabel = labels[categoryId] || categoryId;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
      <Link href="/blog" style={{ color: "#8be9fd", fontSize: "14px", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
        ← Back to All Guides
      </Link>

      <h1 style={{ color: "#9be8ff", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        {categoryLabel}
      </h1>
      <p style={{ color: "#cfeffd", opacity: 0.6, fontSize: "15px", marginBottom: "24px" }}>
        {posts.length} guide{posts.length !== 1 ? "s" : ""} in this category
      </p>

      {/* Category Navigation */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
        {allCats.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog/category/${cat.id}`}
            style={{
              padding: "8px 16px",
              background: cat.id === categoryId ? "#8be9fd" : "#0b1922",
              color: cat.id === categoryId ? "#05050a" : "#cfeffd",
              border: "1px solid rgba(139,233,253,0.2)",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {cat.label} ({cat.count})
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "#ff5555" }}>No guides found in this category.</p>
      ) : (
        <div style={{ display: "grid", gap: "24px" }}>
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{
                display: "block",
                padding: "24px",
                background: "#0b1922",
                border: "1px solid rgba(139,233,253,0.06)",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "border-color 0.2s, transform 0.2s",
              }}
            >
              <h2 style={{ color: "#8be9fd", margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>
                {post.title}
              </h2>
              {post.date && (
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>{post.date}</div>
              )}
              <div style={{ fontSize: "12px", color: "#50fa7b", fontWeight: 600 }}>
                Read Guide <span>→</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}