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
fs.createReadStream('twitter-links.csv')
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
        const dom = new JSDOM(html, {
            url,
            runScripts: 'dangerously',
            resources: 'usable',
            requestOptions: {
                followRedirect: false
            }

        }); const reader = new Readability(dom.window.document, {
            stripUnlikelyCandidates: true,
            removeScripts: true,
        });
        const article = reader.parse();

        const path = new URL(url).pathname;
        const outputFileName = `scraped-twitter.csv`;
        // fs.writeFileSync(outputFileName, `${article.textContent}`, 'utf-8');
        fs.appendFileSync(outputFileName, article.textContent, 'utf-8');
        console.log(`Saved generated tweets to ${outputFileName}`);

    } catch (error) {
        console.error(error.message);
        // process.exit(1);
        return;
    }
}
