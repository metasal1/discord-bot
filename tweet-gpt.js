import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import fetch from 'node-fetch';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const tweetSchedule = schedule.scheduleJob('/45 * * * *', async function () {

    const access_token = process.env.TWITTER_ACCESS_TOKEN_SOLANA_FAQS;
    const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET_SOLANA_FAQS;

    const consumer_key = process.env.TWITTER_CONSUMER_KEY_SOLANA_FAQS;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET_SOLANA_FAQS;

    const endpointURL = `https://api.twitter.com/2/tweets`;
    const prompt = "Generate a tweet about Solana.";

    const oauth = OAuth({
        consumer: {
            key: consumer_key,
            secret: consumer_secret
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
    });

    async function generateTweet() {

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "write a tweet about solana",
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }
        );
        return response.data.choices[0].text.replace(`"`, ``);
    }

    async function getRequest(token, tweet) {
        const data = { "text": tweet };
        const authHeader = oauth.toHeader(oauth.authorize({
            url: endpointURL,
            method: 'POST'
        }, token));

        const req = await fetch(endpointURL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader["Authorization"],
                'content-type': "application/json",
                'accept': "application/json"
            },
            body: JSON.stringify(data)
        });

        console.log(req);
        if (req.body) {
            return req.body;
        } else {
            throw new Error('Unsuccessful request');
        }
    }


    (async () => {
        try {
            // Generate tweet
            const tweet = await generateTweet();
            console.log(`Generated tweet: ${tweet}`);

            // Get user token and secret
            const userToken = {
                key: access_token,
                secret: access_token_secret
            };
            // Make the request
            const response = await getRequest(userToken, tweet);
            console.log(response);
        } catch (e) {
            console.dir(e);
            process.exit(-1);
        }
        process.exit();
    })();

});
