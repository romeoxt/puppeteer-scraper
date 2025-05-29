const express = require('express');
const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const html = await page.content();
    const title = await page.title();

    res.json({ url, title, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser !== null) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Scraper running on port ${PORT}`));
