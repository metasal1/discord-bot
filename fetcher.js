import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import csv from 'csv-parser';
import save from './savetodb.js';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const inputLinks = [];

// Read links from file
fs.createReadStream('solana-links-master.csv')
    .pipe(csv())
    .on('data', (row) => {
        inputLinks.push(row.link);
    })
    .on('end', () => {
        console.log('Input links:', inputLinks);

        // inputLinks.forEach(generate);

        let index = 0;
        const intervalId = setInterval(() => {
            if (index < inputLinks.length) {
                generate(inputLinks[index++]);
            } else {
                clearInterval(intervalId);
            }
        }, 5000);
    });

async function generate(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document, {
            stripUnlikelyCandidates: true,
            removeScripts: true,
        });
        const article = reader.parse();

        const inputText = article.textContent;

        const openai = new OpenAIApi(configuration);

        const prompt = "write some faqs based on the following text and reply as a json array; " + inputText + "\n\nFaqs:\n";

        // Use OpenAI API to generate tweets about the input text
        const oaiResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const path = new URL(url).pathname;
        const tweets = oaiResponse.data.choices[0].text;
        const outputFileName = `solana_${encodeURIComponent(path)}.txt`;
        fs.writeFileSync(outputFileName, `${tweets}`, 'utf-8');
        console.log(`Saved generated tweets to ${outputFileName}`);

        const faqs = JSON.parse(tweets);
        console.log(faqs);
        const outputFileNameFAQS = `solana_faqs_${encodeURIComponent(path)}.json`;
        fs.writeFileSync(outputFileNameFAQS, `${tweets}`, 'utf-8');
        console.log(`Saved generated tweets to ${outputFileNameFAQS}`);

        // save('solana', 'articles', { path: path, article: inputText });
        faqs.forEach(faq => {
            console.log(faq)
            save('solana', 'faqs', faq);
        });

    } catch (error) {
        console.error(error.message);
        // process.exit(1);
        return;
    }
}
