"use client";

import { useState, useMemo, useCallback } from "react";

interface SymbolEntry {
  symbol: string;
  count: number;
  probability: number;
  selfInfo: number;
  contribution: number;
}

function calculateEntropy(text: string): { entropy: number; entries: SymbolEntry[]; maxEntropy: number } {
  if (!text || text.length === 0) return { entropy: 0, entries: [], maxEntropy: 0 };
  const freq: Record<string, number> = {};
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  const n = text.length;
  const entries: SymbolEntry[] = [];
  let entropy = 0;
  for (const [symbol, count] of Object.entries(freq)) {
    const probability = count / n;
    const selfInfo = -Math.log2(probability);
    const contribution = probability * selfInfo;
    entropy += contribution;
    entries.push({ symbol, count, probability, selfInfo, contribution });
  }
  entries.sort((a, b) => b.count - a.count);
  const maxEntropy = Math.log2(Object.keys(freq).length);
  return { entropy, entries, maxEntropy };
}

function MetricCard({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color: string }) {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-600 mt-1">{sublabel}</p>}
    </div>
  );
}

export default function ShannonEntropyPage() {
  const [inputText, setInputText] = useState(
    "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the English alphabet at least once."
  );

  const result = useMemo(() => calculateEntropy(inputText), [inputText]);
  const ratio = result.maxEntropy > 0 ? result.entropy / result.maxEntropy : 0;
  const totalBits = result.entropy * inputText.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 text-gray-100">
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🧬</span>
            Shannon Entropy Calculator
            <span className="text-xs font-normal bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">Information Theory</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Measure the information content and randomness of any text using Shannon entropy (bits per symbol).</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📝</span> Input Text
              </h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm font-mono resize-y"
                placeholder="Enter text to analyze..."
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{inputText.length} characters</span>
                <button onClick={() => setInputText("")} className="text-red-400 hover:text-red-300 transition-colors">Clear</button>
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🎲</span> Sample Texts
              </h3>
              <div className="space-y-2">
                {[
                  { label: "English Text", text: "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune." },
                  { label: "Binary String", text: "1010101010101010101010101010" },
                  { label: "Random Chars", text: "a8Kz2pLq9mNx4rWs7YtB5uJc0fGh" },
                  { label: "Repeating", text: "abcabcabcabcabcabcabcabc" },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setInputText(s.text)}
                    className="w-full text-left px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:border-green-500/30 transition-all"
                  >
                    <span className="text-green-400 font-medium">{s.label}:</span> <span className="text-gray-500 truncate">{s.text.slice(0, 40)}...</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setInputText(inputText)}
              className="w-full py-3 rounded-xl text-base font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
                color: "#0a0a0a",
                boxShadow: "0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)",
              }}
            >
              ⚡ CALCULATE ENTROPY
            </button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Entropy" value={`${result.entropy.toFixed(4)}`} sublabel="bits/symbol" color="text-green-400" />
              <MetricCard label="Max Entropy" value={`${result.maxEntropy.toFixed(4)}`} sublabel="uniform dist." color="text-cyan-400" />
              <MetricCard label="Total Bits" value={`${totalBits.toFixed(0)}`} sublabel="to encode all" color="text-purple-400" />
              <MetricCard label="Unique Symbols" value={`${result.entries.length}`} sublabel="alphabet size" color="text-amber-400" />
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📊</span> Entropy Efficiency
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Randomness ratio</span>
                <span className="text-green-400 font-bold">{(ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ratio * 100)}%`, background: "linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)" }} />
              </div>
              <p className="text-xs text-gray-500">
                {ratio > 0.9 ? "High entropy: text is very random, near-uniform distribution." :
                 ratio > 0.6 ? "Medium entropy: typical for natural language text." :
                 "Low entropy: text has patterns and predictability."}
              </p>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🔤</span> Symbol Frequency Table
              </h3>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-500 font-medium">Symbol</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Count</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Probability</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Self-Info (bits)</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.entries.slice(0, 30).map((e) => (
                      <tr key={e.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-1.5 text-green-400 font-mono">{e.symbol === " " ? "␣" : e.symbol === "\n" ? "\\n" : e.symbol}</td>
                        <td className="py-1.5 text-right text-gray-300 font-mono">{e.count}</td>
                        <td className="py-1.5 text-right text-gray-300 font-mono">{(e.probability * 100).toFixed(2)}%</td>
                        <td className="py-1.5 text-right text-cyan-400 font-mono">{e.selfInfo.toFixed(3)}</td>
                        <td className="py-1.5 text-right text-purple-400 font-mono">{e.contribution.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.entries.length > 30 && <p className="text-xs text-gray-500 mt-2 text-center">...and {result.entries.length - 30} more symbols</p>}
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-lg">📐</span> Formula
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-center text-green-400">
                H(X) = -&Sigma; p(x) &middot; log<sub>2</sub>(p(x))
              </div>
              <p className="text-xs text-gray-500">Where p(x) is the probability of symbol x occurring in the text.</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-xs text-amber-300/80 leading-relaxed">
                <strong>⚠️ Disclaimer:</strong> This calculator uses Shannon entropy as defined in information theory (1948). Results are for educational purposes.
              </p>
            </div>
          </div>
        </div>

        <article className="mt-16 max-w-4xl mx-auto prose prose-invert">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 space-y-6 text-gray-300 leading-relaxed">
            <h2 className="text-2xl font-bold text-green-400">Shannon Entropy: The Mathematical Foundation of Information Theory</h2>
            <p>Shannon entropy, introduced by Claude Shannon in his landmark 1948 paper &ldquo;A Mathematical Theory of Communication,&rdquo; is the fundamental measure of information content in any message, signal, or data stream. It quantifies the average number of bits needed to represent each symbol in a message, providing a theoretical lower bound for data compression. Understanding Shannon entropy is essential for anyone working in computer science, cryptography, data compression, machine learning, or any field that deals with information processing.</p>

            <h3 className="text-xl font-semibold text-green-300">The Core Concept</h3>
            <p>At its heart, Shannon entropy measures uncertainty or surprise. A fair coin flip has exactly 1 bit of entropy because the outcome is completely unpredictable. A biased coin that lands heads 99% of the time has very low entropy (about 0.08 bits) because the outcome is highly predictable. The formula H(X) = -&Sigma; p(x) log2(p(x)) captures this mathematically: rare events contribute more information per occurrence than common events, but their lower probability means they contribute less to the overall entropy. The beauty of this formula is that it perfectly captures our intuitive notion of information: surprising events carry more information than expected ones.</p>

            <h3 className="text-xl font-semibold text-green-300">Applications in Data Compression</h3>
            <p>Shannon entropy provides the theoretical limit for lossless data compression. If a text has an entropy of 4.2 bits per character, no lossless compression algorithm can compress it below 4.2 bits per character on average. Practical compression algorithms like Huffman coding, LZ77/LZ78, and modern variants like Brotli and Zstandard approach this limit but can never exceed it. This is why understanding entropy is crucial for data engineers and system architects who need to estimate storage requirements and bandwidth usage. The entropy of English text is typically around 4.7 bits per character, which is why text files compress to roughly 40-60% of their original size.</p>

            <h3 className="text-xl font-semibold text-green-300">Entropy in Cryptography</h3>
            <p>In cryptography, entropy is synonymous with security. A cryptographic key with high entropy is harder to guess or brute-force. A 128-bit key with full entropy requires 2^128 attempts to crack, which is computationally infeasible with current technology. However, if the key generation process has low entropy (e.g., using predictable seeds or weak random number generators), the effective key space is much smaller, making the system vulnerable. Password strength meters are essentially entropy estimators: a password like &ldquo;password123&rdquo; has very low entropy because it follows predictable patterns, while a random string like &ldquo;k9Xm2pLq&rdquo; has much higher entropy. Security professionals use entropy analysis to evaluate the strength of random number generators, identify weaknesses in key derivation functions, and assess the overall security posture of cryptographic systems.</p>

            <h3 className="text-xl font-semibold text-green-300">Cross-Entropy and Machine Learning</h3>
            <p>Cross-entropy, an extension of Shannon entropy, is the most widely used loss function in machine learning classification tasks. It measures the difference between the predicted probability distribution and the true distribution. When a neural network predicts the wrong class with high confidence, the cross-entropy loss is high; when it predicts the correct class with high confidence, the loss is low. Binary cross-entropy (log loss) is used for binary classification, while categorical cross-entropy handles multi-class problems. The optimization of cross-entropy loss drives the training of language models like GPT, image classifiers like ResNet, and virtually every modern classification system. Understanding the information-theoretic foundations of these loss functions helps practitioners debug models, interpret results, and design better architectures.</p>

            <h3 className="text-xl font-semibold text-green-300">Maximum Entropy Principle</h3>
            <p>The principle of maximum entropy states that, among all probability distributions that satisfy given constraints, the one with the highest entropy should be preferred. This principle, formalized by E.T. Jaynes, provides a rigorous foundation for Bayesian inference and statistical mechanics. In practice, it means that when you have incomplete information, you should choose the distribution that makes the fewest additional assumptions. The uniform distribution maximizes entropy when no constraints are given; the Gaussian distribution maximizes entropy when only the mean and variance are known; the exponential distribution maximizes entropy when only the mean is known. This principle underlies many statistical methods and provides a philosophical justification for common distributional assumptions.</p>

            <h3 className="text-xl font-semibold text-green-300">Entropy in Natural Language</h3>
            <p>Natural languages exhibit characteristic entropy patterns that reflect their structure and redundancy. English text typically has an entropy of about 4.7 bits per character at the character level, significantly less than the theoretical maximum of about 4.7 bits for a 26-letter alphabet (log2(26) = 4.7). This gap exists because English has strong structural constraints: letter frequencies are non-uniform (e, t, a, o are much more common than z, q, x, j), letter pairs follow patterns (th, he, in are common; xz, qk are rare), and longer-range dependencies exist (grammar, syntax, semantics). When we account for these constraints, the &ldquo;true&rdquo; entropy of English drops to approximately 1-1.5 bits per character, as estimated by Shannon himself through prediction experiments. This redundancy is what makes crossword puzzles, spell-checkers, and speech recognition possible.</p>

            <h3 className="text-xl font-semibold text-green-300">Practical Uses of This Calculator</h3>
            <p>This Shannon Entropy Calculator provides real-time analysis of text entropy with detailed symbol-level breakdowns. Use it to evaluate the randomness of generated passwords, assess the compressibility of data files, analyze the information density of different languages or encodings, detect patterns in supposedly random data, and understand the theoretical limits of compression for your specific data. The symbol frequency table shows exactly which characters contribute most to the entropy, helping you identify patterns and biases in your data. For security applications, compare your entropy against the theoretical maximum (log2 of alphabet size) to assess how close your data is to true randomness.</p>

            <h3 className="text-xl font-semibold text-green-300">Conclusion</h3>
            <p>Shannon entropy is one of the most elegant and powerful concepts in all of mathematics and computer science. It bridges the gap between abstract information theory and practical engineering applications, from data compression and cryptography to machine learning and statistical inference. Whether you are a software engineer optimizing data storage, a security professional evaluating password policies, a data scientist building classification models, or a student learning the foundations of information theory, understanding Shannon entropy gives you a deeper appreciation for the nature of information itself. The formula H(X) = -&Sigma; p(x) log2(p(x)) is deceptively simple, but its implications are profound and far-reaching, touching virtually every aspect of modern digital technology.</p>
          </div>
        </article>
      </div>
    </div>
  );
}