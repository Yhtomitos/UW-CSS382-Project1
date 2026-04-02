document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('query').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = 'Searching...';
  try {
    console.log('Sending query:', query);
    const response = await fetch('/.netlify/functions/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    console.log('Response status:', response.status);
    const scripts = await response.json();
    console.log('Received scripts:', scripts);
    if (scripts.length === 0) {
      resultsDiv.innerHTML = 'No scripts found. Try refining your query.';
    } else {
      resultsDiv.innerHTML = scripts.map(script => `<p><a href="${script.installUrl}" target="_blank">${script.title}</a></p>`).join('');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    resultsDiv.innerHTML = 'Error fetching results.';
  }
});
