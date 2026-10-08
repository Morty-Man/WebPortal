// Reports whether a URL can be shown in an iframe (X-Frame-Options / CSP frame-ancestors).
// Test it directly: /.netlify/functions/check?url=https://example.com
exports.handler = async (event) => {
  const H = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  const out = (embeddable, reason) => ({ statusCode: 200, headers: H, body: JSON.stringify({ embeddable, reason }) });
  try {
    const q = event.queryStringParameters || {};
    const u = new URL(q.url);
    if (!/^https?:$/.test(u.protocol) || /^(localhost$|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname)) return out(false, 'bad url');
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 6000);
    const r = await fetch(u, { redirect: 'follow', signal: c.signal, headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml', 'accept-language': 'en-US,en;q=0.9' } });
    clearTimeout(t); try { r.body && r.body.cancel(); } catch {}
    // Error / bot-challenge pages carry their own blocking headers, so they say nothing about the real site.
    if (r.status >= 400) return out(true, 'inconclusive status ' + r.status);
    const xfo = (r.headers.get('x-frame-options') || '').toLowerCase();
    if (/deny|sameorigin|allow-from/.test(xfo)) return out(false, 'x-frame-options: ' + xfo);
    const csp = (r.headers.get('content-security-policy') || '').toLowerCase();
    const m = csp.match(/frame-ancestors([^;,]*)/);
    if (m) {
      const tokens = m[1].trim().split(/\s+/).filter(Boolean);
      const host = (q.origin || '').replace(/^https?:\/\//, '').toLowerCase();
      const open = tokens.some(x => x === '*' || x === 'https:' || x === 'http:' || x.startsWith('*.') || (host && x.includes(host)));
      if (!open) return out(false, 'csp frame-ancestors: ' + tokens.join(' '));
    }
    return out(true, 'ok');
  } catch (e) { return out(true, 'check failed: ' + e.message); }
};
