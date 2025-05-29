const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

let browser; // Global browser instance
(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-zygote',
      '--single-process',
      '--no-first-run',
      '--disable-features=site-per-process',
      '--no-default-browser-check',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
    ],
    protocolTimeout: 180000, // Long timeout
  });
})();

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  if (!browser) return res.status(503).json({ error: 'Browser not ready' });

  let page = null;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

    const html = await page.content();
    const title = await page.title();

    res.json({ url, title, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close();
  }
});

app.get('/health', (req, res) => {
  res.send('✅ Scraper is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
