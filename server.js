const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/search', async (req, res) => {
  const query = req.body.query;
  const scripts = [];
  try {
    // First, try Bing Search API
    const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=tampermonkey+script+${encodeURIComponent(query)}`;
    const bingResponse = await axios.get(bingUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY }
    });
    const webPages = bingResponse.data.webPages?.value || [];
    for (const page of webPages) {
      if (page.url.includes('greasyfork.org') || page.url.includes('openuserjs.org')) {
        // Extract title and assume install URL (simplified; in practice, fetch page for exact link)
        scripts.push({ title: page.name, installUrl: page.url });
      }
      if (scripts.length >= 10) break; // Limit results
    }
  } catch (bingError) {
    console.log('Bing search failed, falling back to Greasy Fork');
    // Fallback to Greasy Fork API
    try {
      const url = `https://greasyfork.org/scripts.json?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      const data = response.data;
      if (data && data.scripts) {
        scripts.push(...data.scripts.slice(0, 10).map(script => ({
          title: script.name,
          installUrl: script.install_url
        })));
      }
    } catch (gfError) {
      console.error('Greasy Fork fallback failed:', gfError);
    }
  }
  res.json(scripts);
});

app.listen(3000, () => console.log('Server running on port 3000'));
