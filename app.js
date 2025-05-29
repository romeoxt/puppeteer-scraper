const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

let browser;

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
    protocolTimeout: 180000, // ⬅ Increase this
  });
})();

app.post('/scrape', async (req, res) => {
  const { url, timeout = 60000 } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: parseInt(timeout),
    });

    const html = await page.content();
    const title = await page.title();

    await page.close();
    res.json({ url, title, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.send('Scraper is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});
