const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.post('/search', async (req, res) => {
  const query = req.body.query;
  try {
    const url = `https://greasyfork.org/en/scripts?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const scripts = [];
    $('.script-list-item').each((i, elem) => {
      const title = $(elem).find('.script-link').text().trim();
      const installUrl = $(elem).find('.install-link').attr('href');
      if (title && installUrl) {
        scripts.push({ title, installUrl: `https://greasyfork.org${installUrl}` });
      }
    });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
