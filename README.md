# Tampermonkey Script Search Engine

A web-based search engine that locates and provides install links for Tampermonkey userscripts based on user-described functionality. It uses AI to refine search queries, integrates with Bing Search API and Greasy Fork API, and features a clean, modern UI.

## Features
- AI-powered query refinement using OpenAI.
- Searches via Bing and Greasy Fork for script sources.
- Modern, responsive UI.
- Deployable on Netlify with serverless functions.

## Prerequisites
- Node.js (v18+)
- API keys: Bing Search API (from Azure), OpenAI API.

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   BING_API_KEY=your_bing_key
   OPENAI_API_KEY=your_openai_key
   ```
4. For local development: `npm start`
5. For testing: `npm test`

## Usage
- Open `public/index.html` in a browser.
- Enter desired script functionality (e.g., "ad blocker").
- Click links to install scripts directly in Tampermonkey.
- View and install scripts from results.

## Deployment
- Push to GitHub.
- Connect to Netlify.
- Set environment variables in Netlify dashboard.
- Deploy; functions handle backend.

## Troubleshooting
- Check logs in Netlify dashboard.
- Ensure API keys are valid.
- If no results display, check browser console for logs and ensure API keys return data.
- Use `/test` endpoint for debugging.

## License
MIT