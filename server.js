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
    const url = `https://greasyfork.org/scripts.json?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data && data.scripts) {
      const scripts = data.scripts.map(script => ({
        title: script.name,
        installUrl: script.install_url
      }));
      res.json(scripts);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('API fetch error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
