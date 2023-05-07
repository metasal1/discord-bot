import got from 'got';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import qs from 'querystring';
import dotenv from 'dotenv';

import schedule from 'node-schedule';
dotenv.config();

const consumer_key = process.env.TWITTER_CONSUMER_KEY;
const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
const access_token = process.env.TWITTER_ACCESS_TOKEN;
const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

const tweetSchedule = schedule.scheduleJob('0 12 * * *', function () {

    const data = {
        "text": "GM!"
    };

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

        const req = await got.post(endpointURL, {
            json: data,
            responseType: 'json',
            headers: {
                Authorization: authHeader["Authorization"],
                'user-agent': "v2CreateTweetJS",
                'content-type': "application/json",
                'accept': "application/json"
            }
        });
        if (req.body) {
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
            console.dir(response, {
                depth: null
            });
        } catch (e) {
            console.log(e);
            process.exit(-1);
        }
        process.exit();
    })();
});

