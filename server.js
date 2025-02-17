const express = require('express');
const googleTrends = require('google-trends-api');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // Serve static files from 'public' directory

app.get('/api/google-trends', async (req, res) => {
  try {
    const results = await googleTrends.dailyTrends({ geo: 'US' });
    const parsedResults = JSON.parse(results);
    const trendingSearches = parsedResults.trendingSearchesDays[0].trendingSearches.map(item => item.title.query);
    res.json(trendingSearches);
  } catch (error) {
    console.error("Error fetching Google Trends:", error);
    res.status(500).json({ error: 'Failed to fetch Google Trends' });
  }
});

app.get('/api/reddit-trends', async (req, res) => {
  try {
    const response = await fetch('https://www.reddit.com/r/all/hot.json?limit=10');
    const data = await response.json();
    const postTitles = data.data.children.map(post => post.data.title);
    res.json(postTitles);
  } catch (error) {
    console.error("Error fetching Reddit trends:", error);
    res.status(500).json({ error: 'Failed to fetch Reddit trends' });
  }
});

app.get('/api/trends', async (req, res) => {
  try {
    const googleTrendsPromise = googleTrends.dailyTrends({ geo: 'US' });
    const redditTrendsPromise = fetch('https://www.reddit.com/r/all/hot.json?limit=10').then(res => res.json());

    const [googleTrendsData, redditTrendsData] = await Promise.all([googleTrendsPromise, redditTrendsPromise]);

    const parsedGoogleTrends = JSON.parse(googleTrendsData);
    const googleTrendingSearches = parsedGoogleTrends.trendingSearchesDays[0].trendingSearches.map(item => item.title.query);
    const redditPostTitles = redditTrendsData.data.children.map(post => post.data.title);

    const combinedTrends = [...googleTrendingSearches, ...redditPostTitles];
    res.json(combinedTrends);
  } catch (error) {
    console.error("Error fetching combined trends:", error);
    res.status(500).json({ error: 'Failed to fetch combined trends' });
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
