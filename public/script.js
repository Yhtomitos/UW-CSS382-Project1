document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('query').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = 'Searching...';
  try {
    const response = await fetch('/.netlify/functions/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const scripts = await response.json();
    resultsDiv.innerHTML = scripts.map(script => `<p><a href="${script.installUrl}" target="_blank">${script.title}</a></p>`).join('');
  } catch (error) {
    resultsDiv.innerHTML = 'Error fetching results.';
  }
});
