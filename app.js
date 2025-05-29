const express = require('express');
const { chromium } = require('playwright');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000, // global timeout
    });

    const page = await browser.newPage();

    // Set a generous timeout and fail gracefully if page is slow
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000, // wait max 20 seconds
    });

    const html = await page.content();
    const title = await page.title();

    res.json({ url, title, html });
  } catch (err) {
    console.error(`[SCRAPER ERROR]: ${err.message}`);
    res.status(500).json({ error: 'Failed to scrape the page', details: err.message });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error(`[BROWSER CLOSE ERROR]: ${e.message}`);
      }
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
