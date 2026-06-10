"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#05050a', color: '#39ff14', fontFamily: 'monospace' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '2rem' }}>
        <Link href="/blog/diablo-4-season-8-boss-guide-meta-builds" passHref>
          <div className="guide-card" style={{ 
            padding: '2rem', 
            border: '2px solid #ff0055', 
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer'
          }}>
            <h2 style={{ color: '#ff0055', margin: '0 0 1rem 0' }}>Latest Meta Builds (Diablo 4 S8)</h2>
            <p style={{ color: '#39ff14', margin: 0 }}>Discover the most effective builds for the current season</p>
          </div>
        </Link>
        
        <Link href="/blog" passHref>
          <div className="guide-card" style={{ 
            padding: '2rem', 
            border: '2px solid #ff0055', 
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer'
          }}>
            <h2 style={{ color: '#ff0055', margin: '0 0 1rem 0' }}>Elden Ring Boss Guides</h2>
            <p style={{ color: '#39ff14', margin: 0 }}>Conquer challenging bosses with our expert strategies</p>
          </div>
        </Link>
        
        <Link href="/blog" passHref>
          <div className="guide-card" style={{ 
            padding: '2rem', 
            border: '2px solid #ff0055', 
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer'
          }}>
            <h2 style={{ color: '#ff0055', margin: '0 0 1rem 0' }}>PoE2 Collectibles</h2>
            <p style={{ color: '#39ff14', margin: 0 }}>Find rare items and complete your collection</p>
          </div>
        </Link>
      </div>

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
          © 2026 SPEH.CC - Pure Gaming Guides
        </p>
      </footer>
    </div>
  );
}
