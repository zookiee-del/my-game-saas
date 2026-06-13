/**
 * agent_core.mjs — Fully Autonomous Game Tools & Content Pipeline
 *
 * Environment variables required (set in .env or system):
 *   SERPER_API_KEY   — Serper.dev Google Search API key
 *   LLM_API_KEY      — OpenAI-compatible LLM API key
 *   LLM_BASE_URL     — LLM API base URL  (default: https://api.openai.com/v1)
 *   LLM_MODEL        — Model name         (default: gpt-4o)
 *
 * Usage:  node agent_core.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Zero-dependency .env loader ────────────────────────────────────────────
(function loadDotEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes (single or double)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Don't override existing env vars
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
})();

// ─── Environment Config (Cloud-Native process.env) ──────────────────────────
// 优先读取系统环境变量（云端机制），如果没有，再尝试读取常规地方
const serperKey = process.env.SERPER_API_KEY;
const llmKey    = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const LLM_MODEL    = process.env.LLM_MODEL    || 'gpt-4o';

if (!serperKey || !llmKey) {
    console.error("[FATAL] Missing env keys. Cloud debug values:", { hasSerper: !!serperKey, hasLLM: !!llmKey });
    process.exit(1);
}

// ─── Logging ─────────────────────────────────────────────────────────────────
const log  = (msg) => console.log(`[agent_core] ${new Date().toISOString()} ${msg}`);
const warn = (msg) => console.warn(`[agent_core][WARN] ${new Date().toISOString()} ${msg}`);

// ─── 1. Trend Research via Serper.dev ────────────────────────────────────────
async function serperSearch(query, num = 10) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': serperKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num, hl: 'en', gl: 'us' }),
  });
  if (!res.ok) throw new Error(`Serper API error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function researchTrends() {
  log('Phase 1: Researching global trends via Serper.dev ...');

  const queries = [
    'global popular Steam games 2026',
    'best boss攻略攻略暗黑风游戏',
    'DPS计算器 tools for MMORPG players',
    'strongest character builds in popular RPG games 2026',
    'gaming community most wanted tools 2026',
    'top MMORPG boss strategies and guides',
    'best DPS optimization calculators for gamers',
    'popular character build guides for current games'
  ];

  const allResults = [];
  for (const q of queries) {
    try {
      const data = await serperSearch(q, 5);
      const items = (data.organic || []).map((r) => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
      }));
      allResults.push({ query: q, items });
      log(`  ✓ "${q}" → ${items.length} results`);
    } catch (e) {
      warn(`  ✗ "${q}" failed: ${e.message}`);
    }
  }

  return allResults;
}

// ─── 2. LLM-Powered Planning & Generation ───────────────────────────────────
async function llmChat(systemPrompt, userPrompt, jsonMode = false) {
  const body = {
    model: LLM_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${llmKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LLM API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function planContent(trendsJson) {
  log('Phase 2: Asking LLM to plan articles based on trends ...');

  const systemPrompt = `You are an elite content strategist and SEO expert for the gaming industry.
Given a set of Google search results about trending topics in gaming, Steam, MMORPGs, RPGs, and player tools,
you must decide what 3 pure text/image SEO blog articles to create RIGHT NOW to maximize organic traffic and player engagement.

Focus on articles about:
- Boss攻略攻略
- Game strategies and guides
- Character build guides
- Game mechanics explanations
- Top builds for current meta
- Complete collection guides
- Advanced gameplay techniques

The articles should be of these types:
- Boss攻略攻略: Detailed strategies for defeating challenging bosses
- Game strategies: Comprehensive guides for completing difficult content
- Character builds: In-depth analysis of optimal character configurations
- Collection guides: Complete walkthroughs for achieving 100% completion

Return a JSON object with this exact schema:
{
  "articles": [
    {
      "slug": "url-safe-slug",
      "title": "SEO-Optimized Article Title",
      "meta_description": "150-char meta description for SEO",
      "target_keywords": ["kw1", "kw2", "kw3"],
      "outline": ["H2 heading 1", "H2 heading 2", "H2 heading 3", "H2 heading 4"]
    },
    {
      "slug": "url-safe-slug",
      "title": "SEO-Optimized Article Title",
      "meta_description": "150-char meta description for SEO",
      "target_keywords": ["kw1", "kw2", "kw3"],
      "outline": ["H2 heading 1", "H2 heading 2", "H2 heading 3", "H2 heading 4"]
    },
    {
      "slug": "url-safe-slug",
      "title": "SEO-Optimized Article Title",
      "meta_description": "150-char meta description for SEO",
      "target_keywords": ["kw1", "kw2", "kw3"],
      "outline": ["H2 heading 1", "H2 heading 2", "H2 heading 3", "H2 heading 4"]
    }
  ],
  "rationale": "Brief explanation of why these articles will perform well"
}`;

  const userPrompt = `Here are today's trending search results:\n\n${JSON.stringify(trendsJson, null, 2)}\n\nAccording to search trends, autonomously plan and output 3 pure text/image long-tail SEO strategy articles of 2000+ words each (no tools, no calculators, only guides). Guide types include: Boss攻略攻略, dungeon/raid guides, character builds/build guides, and complete collection guides. Return ONLY valid JSON.`;

  const raw = await llmChat(systemPrompt, userPrompt, true);
  const plan = JSON.parse(raw);
  log(`  ✓ Plan: 3 articles planned`);
  return plan;
}

async function generateArticle(plan) {
  log('Phase 2b: Generating SEO article ...');

  const systemPrompt = `You are an expert gaming content writer and SEO specialist.
Write a comprehensive, high-engagement English blog article in Markdown format about video games.

Requirements:
- Minimum 2000 words
- Use proper Markdown headings (##, ###)
- Include an engaging introduction paragraph
- Each H2 section should have 300+ words with actionable insights
- Include a "Key Takeaways" bullet list near the top
- Include practical examples with numbers, stats, or calculations where relevant
- End with a strong conclusion and FAQ section
- Naturally incorporate target keywords (do NOT keyword-stuff)
- Write in a professional yet accessible gaming community tone
- DO NOT include any YAML frontmatter — just pure Markdown content`;

  for (const article of plan.articles) {
    const outlineStr = article.outline.map((h, i) => `${i + 1}. ${h}`).join('\n');

    const userPrompt = `Write a comprehensive gaming SEO article:
- Title: ${article.title}
- Meta description: ${article.meta_description}
- Target keywords: ${article.target_keywords.join(', ')}
- Outline:
${outlineStr}

Write the full article in Markdown. Minimum 2000 words. No frontmatter.`;

    const articleContent = await llmChat(systemPrompt, userPrompt);
    const clean = articleContent.replace(/^```(?:md|markdown)?\n?/m, '').replace(/\n?```\s*$/m, '').trim();

    // Prepend H1 title if not already present
    const finalContent = clean.startsWith('# ')
      ? clean
      : `# ${article.title}\n\n${clean}`;

    log(`  ✓ Article generated (${finalContent.length} chars)`);
    writeArticle(article.slug, finalContent);
    updateArticlesMeta(article.slug, article.title);
   }
 }

// ─── 3. File System Writers ─────────────────────────────────────────────────
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    log(`  ✓ Created directory: ${dirPath}`);
  }
}

function writeToolPage(slug, code) {
  const toolDir = join(__dirname, 'app', 'tools', slug);
  ensureDir(toolDir);
  const filePath = join(toolDir, 'page.tsx');
  writeFileSync(filePath, code, 'utf-8');
  log(`  ✓ Tool page written: ${filePath}`);
  return filePath;
}

function writeArticle(slug, content) {
  const contentDir = join(__dirname, 'content');
  ensureDir(contentDir);
  const filePath = join(contentDir, `${slug}.md`);
  writeFileSync(filePath, content, 'utf-8');
  log(`  ✓ Article written: ${filePath}`);
  return filePath;
}

// ─── 4. Home Page Auto-Updater ──────────────────────────────────────────────
function updateHomePage(toolName, toolSlug) {
  log('Phase 3: Updating app/home.tsx with new tool entry ...');
  const homePath = join(__dirname, 'app', 'home.tsx');
  let src = readFileSync(homePath, 'utf-8');

  // Build the new tool entry
  const newEntry = `  { name: '${toolName}', path: '/tools/${toolSlug}' },`;

  // Strategy: find the tools array and insert before the closing comment or bracket
  // Pattern 1: insert before "// Add more tools as needed"
  if (src.includes('// Add more tools as needed')) {
    src = src.replace(
      /(\s*\/\/ Add more tools as needed)/,
      `\n${newEntry}\n$1`,
    );
  }
  // Pattern 2: insert before "];" that closes the tools array
  else if (/const tools = \[/.test(src)) {
    src = src.replace(
      /(\];)/,
      `${newEntry}\n$1`,
    );
  }
  else {
    warn('Could not locate tools array in home.tsx — skipping tool injection.');
    return false;
  }

  writeFileSync(homePath, src, 'utf-8');
  log(`  ✓ Injected tool "${toolName}" into home.tsx tools array`);
  return true;
}

// ─── 5. Articles Meta Index Updater ─────────────────────────────────────────
function updateArticlesMeta(articleSlug, articleTitle) {
  log('Phase 3b: Updating content/articles_meta.json ...');
  const metaPath = join(__dirname, 'content', 'articles_meta.json');

  let meta = [];
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  } catch {
    warn('articles_meta.json not found or invalid — creating new.');
  }

  // Prevent duplicates
  const blogPath = `/blog/${articleSlug}`;
  if (meta.some((e) => e.path === blogPath)) {
    log('  ⚠ Article already exists in meta index — skipping.');
    return false;
  }

  meta.push({
    title: articleTitle,
    path: blogPath,
  });

  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');
  log(`  ✓ Appended "${articleTitle}" to articles_meta.json (${meta.length} total)`);
  return true;
}

// ─── 6. Git Auto-Publish ────────────────────────────────────────────────────
function gitAutoPublish(articlesCount, rationale) {
  log('Phase 4: Git auto-publish ...');
  try {
    execSync('git add .', { cwd: __dirname, stdio: 'pipe' });
    log('  ✓ git add .');

    const msg = `auto: add ${articlesCount} articles as planned - ${rationale.substring(0, 50)}...`;
    // Truncate commit message to 72 chars for convention
    const shortMsg = msg.length > 72 ? msg.slice(0, 69) + '...' : msg;

    execSync(`git commit -m "${shortMsg}"`, { cwd: __dirname, stdio: 'pipe' });
    log(`  ✓ git commit -m "${shortMsg}"`);

    execSync('git push origin main', { cwd: __dirname, stdio: 'pipe' });
    log('  ✓ git push origin main');
    return true;
  } catch (e) {
    // If commit fails because "nothing to commit", that's not a real error
    const stderr = e.stderr?.toString() || '';
    if (stderr.includes('nothing to commit')) {
      log('  ⚠ Nothing to commit — no changes detected.');
      return true;
    }
    warn(`  ✗ Git publish failed: ${e.message}`);
    return false;
  }
}

// ─── Main Orchestrator ──────────────────────────────────────────────────────
async function main() {
  const t0 = Date.now();
  log('═══════════════════════════════════════════════════════════');
  log('  AGENT CORE — Autonomous Pipeline v1.0');
  log('═══════════════════════════════════════════════════════════');

  try {
    // Phase 1: Research
    const trends = await researchTrends();
    if (trends.every((t) => t.items.length === 0)) {
      warn('No trend data retrieved. Aborting pipeline.');
      process.exit(1);
    }

    // Phase 2: Plan & Generate
    const plan = await planContent(trends);
    await generateArticle(plan); // Generate all 3 articles

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    log('═══════════════════════════════════════════════════════════');
    log(`  PIPELINE COMPLETE in ${elapsed}s`);
    log(`  Generated: 3 articles as planned`);
    log(`  Rationale: ${plan.rationale}`);
    log('═══════════════════════════════════════════════════════════');
  } catch (err) {
    console.error(`[FATAL] Pipeline crashed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();