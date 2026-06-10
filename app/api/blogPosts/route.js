export async function GET() {
  const fs = require('fs');
  const path = require('path');

  const blogDir = path.join(process.cwd(), 'content');
  const files = fs.readdirSync(blogDir);
  const posts = files.filter(file => file.endsWith('.md')).map(file => ({
    title: file.replace('.md', ''),
    path: `/blog/${file.replace('.md', '')}`
  }));

  return new Response(JSON.stringify(posts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const dynamic = "force-static";