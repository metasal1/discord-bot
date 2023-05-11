import puppeteer from 'puppeteer';
import openai from 'openai-api';
import csv from 'csv-writer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://solana.com/news');

    // Wait for the news articles to load
    await page.waitForSelector('h2');

    // Extract the URL and title of the first news article on the page
    const articleNode = await page.$('a');
    const title = await articleNode.evaluate(node => node.innerText);
    const relativeUrl = await articleNode.evaluate(node => node.getAttribute('href'));

    const url = `https://solana.com${relativeUrl}`;

    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Navigate to the article page
    await page.goto(url);

    // Wait for the article to load
    await page.waitForSelector('h1');

    // Extract the content of the article
    const content = await page.$eval('p', node => node.innerText);

    console.log(`Content: ${content}`);

    // Use OpenAI to generate questions based on the article content
    const openaiClient = new openai(OPENAI_API_KEY);

    const prompt = `Please generate 5 questions based on the following news article:\n\n${content}`;
    const model = 'text-davinci-002';

    const { choices } = await openaiClient.completions.create({
        prompt,
        model,
        max_tokens: 60,
        n: 5,
        stop: ['\n'],
    });

    const questions = choices.map(choice => choice.text.trim());

    console.log('Questions:');
    console.log(questions);

    // Write the article data and questions to a CSV file
    const csvWriter = csv.createObjectCsvWriter({
        path: 'article.csv',
        header: [
            { id: 'title', title: 'Title' },
            { id: 'url', title: 'URL' },
            { id: 'content', title: 'Content' },
            { id: 'question_1', title: 'Question 1' },
            { id: 'question_2', title: 'Question 2' },
            { id: 'question_3', title: 'Question 3' },
            { id: 'question_4', title: 'Question 4' },
            { id: 'question_5', title: 'Question 5' },
        ],
    });

    const record = { title, url, content };

    questions.forEach((question, index) => {
        record[`question_${index + 1}`] = question;
    });

    await csvWriter.writeRecords([record]);

    // await browser.close();
})();
