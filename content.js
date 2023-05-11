import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://solana.com/ecosystem/explore');

    // Wait for the news articles to load   

    const element = await page.waitForSelector('div > .fihFtt');
    const articleData = await element.evaluate(() => {

        const articles = Array.from(document.querySelectorAll('div.card'));

        console.log(articles);
    });
})();