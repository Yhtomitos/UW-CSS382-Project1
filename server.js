const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/search', async (req, res) => {
  const userQuery = req.body.query;
  console.log('Received search query:', userQuery);
  let smartQuery = userQuery;
  try {
    console.log('Generating AI prompt...');
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Generate a smart search query for finding Tampermonkey scripts based on: "${userQuery}". Make it specific and include terms like "tampermonkey userscript".` }],
      max_tokens: 50
    });
    smartQuery = aiResponse.choices[0].message.content.trim();
    console.log('AI-generated query:', smartQuery);
  } catch (aiError) {
    console.error('AI prompt generation error:', aiError.message);
  }
  const scripts = [];
  try {
    console.log('Searching with Bing...');
    const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=tampermonkey+script+${encodeURIComponent(smartQuery)}`;
    const bingResponse = await axios.get(bingUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY }
    });
    const webPages = bingResponse.data.webPages?.value || [];
    console.log('Bing results count:', webPages.length);
    for (const page of webPages) {
      if (page.url.includes('greasyfork.org') || page.url.includes('openuserjs.org')) {
        // Extract title and assume install URL (simplified; in practice, fetch page for exact link)
        scripts.push({ title: page.name, installUrl: page.url });
      }
      if (scripts.length >= 10) break; // Limit results
    }
  } catch (bingError) {
    console.error('Bing search error:', bingError.message);
    // Fallback to Greasy Fork API
    try {
      const url = `https://greasyfork.org/scripts.json?q=${encodeURIComponent(smartQuery)}`;
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
  console.log('Final scripts count:', scripts.length);
  res.json(scripts);
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working', env: { bing: !!process.env.BING_API_KEY, openai: !!process.env.OPENAI_API_KEY } });
});

app.listen(3000, () => console.log('Server running on port 3000'));
