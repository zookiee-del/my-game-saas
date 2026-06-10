import { getAllPosts } from "./mdParser";

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 0" }}>
      <h1 style={{ color: "#9be8ff", fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
        Premium Technical Knowledge Base
      </h1>
      <p style={{ color: "#cfeffd", opacity: 0.6, fontSize: "15px", marginBottom: "40px" }}>
        Deep dives, regulatory frameworks, and systemic math proofs generated for professional builders.
      </p>

      {posts.length === 0 ? (
        <p style={{ color: "#ff5555" }}>No guides materialized yet. Please run ai_writer.py first!</p>
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
              <h2 style={{ color: "#8be9fd", margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>
                {post.title}
              </h2>
              <div style={{ fontSize: "12px", color: "#50fa7b", fontWeight: 600 }}>
                Read Technical Blueprint <span>→</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
