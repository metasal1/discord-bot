import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import save from './savetodb.js';
import fetch from 'node-fetch';

const dummy = {
    "status": "Success",
    "message": "Retrieved Daily Active Users Data",
    "result": {
        "date": "18-05-2023",
        "activeUsers": 497218
    }
}
dotenv.config();

const tweetSchedule = schedule.scheduleJob('23 10 * * *', async function () {

    const access_token = process.env.TWITTER_ACCESS_TOKEN_SOLANA_FAQS;
    const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET_SOLANA_FAQS;

    const consumer_key = process.env.TWITTER_CONSUMER_KEY_SOLANA_FAQS;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET_SOLANA_FAQS;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formattedDate = `${yesterday.getDate().toString().padStart(2, '0')}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getFullYear()}`;
    console.log(formattedDate);

    const url = `https://api.solana.fm/v0/stats/active-users?date=${formattedDate}`;
    console.log(url)
    const req = await fetch(url)
    const res = await req.json();
    console.log(res);
    const dau = res.result.activeUsers.toLocaleString();
    console.log("DAU", dau);
    const data = { "text": `Did you know that yesterday, the number of users on Solana reached a staggering ${dau}? 🙆‍♂️` };
    console.log(data);
    const endpointURL = `https://api.twitter.com/2/tweets`;

    const oauth = OAuth({
        consumer: {
            key: consumer_key,
            secret: consumer_secret
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
    });

    async function getRequest(token) {
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
            save('twitter', 'tweetlog', req.body);
            return req.body;
        } else {
            throw new Error('Unsuccessful request');
        }
    }


    (async () => {
        try {
            // Get user token and secret
            const userToken = {
                key: access_token,
                secret: access_token_secret
            };
            // Make the request
            const response = await getRequest(userToken);
            console.log(response);
        } catch (e) {
            console.dir(e);
            process.exit(-1);
        }
        process.exit();
    })();

});
