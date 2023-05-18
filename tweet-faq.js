import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import fetch from 'node-fetch';
import findByNull from './findByNull.js';
import update from './updatefaq.js';
import save from './savetodb.js';

dotenv.config();

var faq_id = null;
const tweetSchedule = schedule.scheduleJob('27 * * * *', async function () {

    const access_token = process.env.TWITTER_ACCESS_TOKEN_SOLANA_FAQS;
    const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET_SOLANA_FAQS;

    const consumer_key = process.env.TWITTER_CONSUMER_KEY_SOLANA_FAQS;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET_SOLANA_FAQS;

    const endpointURL = `https://api.twitter.com/2/tweets`;

    const oauth = OAuth({
        consumer: {
            key: consumer_key,
            secret: consumer_secret
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
    });

    async function findFaq() {

        const faq = await findByNull();
        console.log(faq);

        faq_id = faq._id;
        return faq;
    }

    async function getRequest(token, tweet) {
        const data = { "text": tweet.question + " " + tweet.answer };
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

        const json = await req.json();
        save('twitter', 'tweetlog', json);

        return json;

    }


    (async () => {
        try {
            // Generate tweet
            const tweet = await findFaq();
            // console.log(`Found tweet: ${tweet}`);

            // Get user token and secret
            const userToken = {
                key: access_token,
                secret: access_token_secret
            };
            // Make the request
            const response = await getRequest(userToken, tweet);

            const tweetId = response.data.id;
            // Update tweetId in database

            console.log(`Tweet ID: ${tweetId}`);
            const result = await update(faq_id, tweetId);
            console.log(result);

        } catch (e) {
            console.dir(e);
            process.exit(-1);
        }
        process.exit();
    })();

});