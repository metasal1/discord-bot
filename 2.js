import puppeteer from 'puppeteer';
import openai from 'openai-api';
import csv from 'csv-writer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://news.google.com/search?q=solana&hl=en-AU&gl=AU&ceid=AU%3Aen');

    // Wait for the news articles to load
    await page.waitForSelector('h3 a');

    // Extract the URL and title of the first news article on the page
    const articleNode = await page.$('h3 a');
    const title = await articleNode.evaluate(node => node.innerText);
    const relativeUrl = await articleNode.evaluate(node => node.getAttribute('href'));

    const url = `https://news.google.com${relativeUrl}`;

    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Navigate to the article page
    await page.goto(url);

    // Wait for the article to load
    await page.waitForSelector('article');

    // Extract the content of the article
    const content = await page.$eval('article', node => node.innerText);

    console.log(`Content: ${content}`);

    // Write the article data to a CSV file
    const csvWriter = csv.createObjectCsvWriter({
        path: 'article.csv',
        header: [
            { id: 'title', title: 'Title' },
            { id: 'url', title: 'URL' },
            { id: 'content', title: 'Content' },
        ],
    });

    await csvWriter.writeRecords([{ title, url, content }]);

    await browser.close();
})();
