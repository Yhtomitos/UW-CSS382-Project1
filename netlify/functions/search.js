const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { query: userQuery } = JSON.parse(event.body);
  console.log('Received search query:', userQuery);
  let smartQuery = userQuery;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Generate a smart search query for finding Tampermonkey scripts based on: "${userQuery}". Make it specific and include terms like "tampermonkey userscript".` }],
      max_tokens: 50
    });
    smartQuery = aiResponse.choices[0].message.content.trim();
    console.log('AI-generated query:', smartQuery);
  } catch (aiError) {
    console.error('AI error:', aiError.message);
  }
  const scripts = [];
  try {
    const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=tampermonkey+script+${encodeURIComponent(smartQuery)}`;
    const bingResponse = await axios.get(bingUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY }
    });
    const webPages = bingResponse.data.webPages?.value || [];
    console.log('Bing raw results:', webPages.length);
    for (const page of webPages) {
      if (page.url.includes('greasyfork.org') || page.url.includes('openuserjs.org') || page.url.includes('userscript')) {
        try {
          const pageResponse = await axios.get(page.url);
          const $ = cheerio.load(pageResponse.data);
          const installLink = $('.install-link').attr('href') || $('a[href*=".user.js"]').attr('href');
          if (installLink) {
            const fullInstallUrl = installLink.startsWith('http') ? installLink : `https://greasyfork.org${installLink}`;
            scripts.push({ title: page.name, installUrl: fullInstallUrl });
            console.log('Added installable script:', page.name);
          }
        } catch (scrapeError) {
          console.error('Scrape error for', page.url, scrapeError.message);
        }
      }
      if (scripts.length >= 10) break;
    }
  } catch (bingError) {
    console.error('Bing error:', bingError.message);
    // Fallback to Greasy Fork
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
      console.error('Greasy Fork error:', gfError.message);
    }
  }
  console.log('Scripts found:', scripts.length);
  console.log('Returning scripts:', scripts);
  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    body: JSON.stringify(scripts)
  };
};
