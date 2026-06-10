import { getAllPosts, getPostBySlug } from "../mdParser";
import { notFound } from "next/navigation";

// 同样为了静态导出（output: export），必须喂给 Next.js 所有的文章路由参数
export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article style={{ maxWidth: "720px", margin: "0 auto", padding: "30px 20px" }}>
      <header style={{ marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "20px" }}>
        <a href="/blog" style={{ color: "#8be9fd", fontSize: "14px", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
          ← Back to Intelligence Hub
        </a>
        <h1 style={{ color: "#9be8ff", fontSize: "36px", fontWeight: 800, lineHeight: "1.2", margin: 0 }}>
          {post.title}
        </h1>
      </header>

      {/* 极简纯文本换行渲染层，最大程度防范样式塌陷，完全符合美金极客风 */}
      <div style={{ color: "#dff8ff", fontSize: "16px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
        {post.content}
      </div>
    </article>
  );
}
