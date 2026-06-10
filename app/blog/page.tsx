import { getAllPosts, getAllCategories } from "./mdParser";
import Link from "next/link";

export default function BlogListPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
      <h1 style={{ color: "#9be8ff", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        Gaming Strategy Guides
      </h1>
      <p style={{ color: "#cfeffd", opacity: 0.6, fontSize: "15px", marginBottom: "24px" }}>
        Meta builds, boss guides, and collectible walkthroughs for hardcore gamers.
      </p>

      {/* Category Navigation */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/blog/category/${cat.id}`}
            style={{
              padding: "8px 16px",
              background: "#0b1922",
              color: "#cfeffd",
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
        <p style={{ color: "#ff5555" }}>No guides materialized yet. Please run the content generator first!</p>
      ) : (
        <div style={{ display: "grid", gap: "24px" }}>
          {posts.map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{
              display: "block",
              padding: "24px",
              background: "#0b1922",
              border: "1px solid rgba(139,233,253,0.06)",
              borderRadius: "12px",
              textDecoration: "none",
              transition: "border-color 0.2s, transform 0.2s"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{
                  fontSize: "11px",
                  color: "#50fa7b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  {post.category}
                </span>
                {post.date && (
                  <span style={{ fontSize: "11px", color: "#555" }}>{post.date}</span>
                )}
              </div>
              <h2 style={{ color: "#8be9fd", margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>
                {post.title}
              </h2>
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