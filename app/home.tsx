"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
// import fs from 'fs';

const tools = [
  { name: 'Shannon Entropy Alpha Simulator', path: '/tools/shannon-entropy' },
  { name: 'Quant Tax-Hedge Arbitrage Simulator', path: '/tools/tax-hedge' },
  { name: 'SaaS MRR Runway Calculator', path: '/tools/mrr-runway' },
  { name: '2026 Self-Employment & 1099 Tax Calculator', path: '/tools/2026-self-employment-tax-calculator' },
  { name: 'Diablo 4 Season 8 DPS & Build Calculator', path: '/tools/diablo-4-season-8-dps-calculator' },


  // Add more tools as needed
];

import articles from '@/content/articles_meta.json';

export default function HomePage() {
  const [blogPosts, setBlogPosts] = useState<{ title: string; path: string }[]>([]);

  useEffect(() => {
setBlogPosts(articles);
  }, []);

  return (
    <div style={{ backgroundColor: '#05050a', color: '#39ff14', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#ff0055' }}>KEUHZ TOOLBOX PORTAL</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {tools.map(tool => (
          <Link key={tool.path} href={tool.path} passHref>
            <div style={{ padding: '1rem', border: '1px solid #39ff14', borderRadius: '4px' }}>
              <h2>{tool.name}</h2>
            </div>
          </Link>
        ))}
      </div>
      <h2 style={{ color: '#ff0055' }}>Latest Deep Insights</h2>
      <ul>
        {blogPosts.map(post => (
          <li key={post.path}>
            <Link href={post.path} passHref>
              <a style={{ color: '#39ff14' }}>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>

      <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #1a1a2e', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Link href="/privacy-policy" passHref>
            <a style={{ color: '#39ff14', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.7 }}>Privacy Policy</a>
          </Link>
          <Link href="/terms-of-service" passHref>
            <a style={{ color: '#39ff14', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.7 }}>Terms of Service</a>
          </Link>
          <Link href="/contact" passHref>
            <a style={{ color: '#39ff14', textDecoration: 'none', fontSize: '0.85rem', opacity: 0.7 }}>Contact Us</a>
          </Link>
        </div>
        <p style={{ color: '#333', fontSize: '0.75rem' }}>
          © {new Date().getFullYear()} KEUHZ. All rights reserved. Tools are for educational purposes only.
        </p>
      </footer>
    </div>
  );
}
