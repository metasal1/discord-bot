import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const url = process.argv[2] || 'https://solana.com/';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generate() {
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

        const prompt = "generate upto 20 tweets with emojis based on the following text; " + inputText + "\n\n";

        // Use OpenAI API to generate tweets about the input text
        const oaiResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        const tweets = oaiResponse.data.choices[0].text;
        console.log(tweets);

        const outputFileName = `output_${encodeURIComponent(url)}.txt`;

        fs.writeFileSync(outputFileName, `${inputText}\n\n${tweets}`, 'utf-8');

        console.log(`Saved generated tweets to ${outputFileName}`);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

generate();
