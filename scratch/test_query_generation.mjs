async function searchBingRss(query) {
  const results = [];
  try {
    const bingUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const bRes = await fetch(bingUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, text/xml, */*'
      }
    });
    clearTimeout(timeout);

    if (bRes.ok) {
      const xml = await bRes.text();
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      while ((match = itemRegex.exec(xml)) !== null && results.length < 5) {
        const block = match[1];
        const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
        const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/i);
        const descMatch = block.match(/<description>([\s\S]*?)<\/description>/i);
        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = block.match(/<News:Source>([\s\S]*?)<\/News:Source>/i);

        let rawTitle = titleMatch ? titleMatch[1] : '';
        rawTitle = rawTitle
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        let rawLink = linkMatch ? linkMatch[1].replace(/&amp;/g, '&').trim() : '';
        let articleUrl = rawLink;

        try {
          const parsed = new URL(rawLink);
          const direct = parsed.searchParams.get('url');
          if (direct && (direct.startsWith('http://') || direct.startsWith('https://'))) {
            articleUrl = direct;
          }
        } catch {}

        const sourceName = sourceMatch
          ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/&amp;/g, '&').trim()
          : 'News Source';

        let snippet = descMatch ? descMatch[1] : '';
        snippet = snippet
          .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();

        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

        if (rawTitle && articleUrl) {
          results.push({
            title: rawTitle,
            url: articleUrl,
            source: sourceName,
            snippet: snippet.slice(0, 350),
            pubDate
          });
        }
      }
    }
  } catch (err) {
    console.warn('Bing error:', err.message);
  }
  return results;
}

async function searchWiki(query) {
  const results = [];
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const wRes = await fetch(wikiUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'DigitalShield/1.0' }
    });
    clearTimeout(timeout);

    if (wRes.ok) {
      const wData = await wRes.json();
      const hits = (wData.query?.search || []).slice(0, 3);
      for (const h of hits) {
        const pageTitle = (h.title || '').trim();
        if (!pageTitle) continue;
        const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
        const rawSnippet = (h.snippet || '')
          .replace(/<[^>]+>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&#039;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();
        results.push({
          title: `${pageTitle} - Wikipedia`,
          url: pageUrl,
          source: 'Wikipedia',
          snippet: rawSnippet.slice(0, 350),
          pubDate: h.timestamp || ''
        });
      }
    }
  } catch (err) {
    console.warn('Wiki error:', err.message);
  }
  return results;
}

async function run() {
  console.log('Testing "government of india 10000 rupees per month fact check"...');
  const b1 = await searchBingRss('government of india 10000 rupees per month fact check');
  console.log('Bing found:', b1.length);
  b1.forEach(i => console.log(` - [${i.source}] ${i.title}\n   ${i.url}`));

  console.log('\nTesting "PIB fact check 10000 monthly scheme"...');
  const b2 = await searchBingRss('PIB fact check 10000 monthly scheme');
  console.log('Bing found:', b2.length);
  b2.forEach(i => console.log(` - [${i.source}] ${i.title}\n   ${i.url}`));
}

run();
