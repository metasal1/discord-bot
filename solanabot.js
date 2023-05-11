import got from 'got';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import qs from 'querystring';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import schedule from 'node-schedule';
dotenv.config();

const consumer_key = process.env.TWITTER_CONSUMER_KEY;
const consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
const access_token = process.env.TWITTER_ACCESS_TOKEN;
const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// seconds, minutes, hours, day of month, month, day of week
const tweetSchedule = schedule.scheduleJob('*/10 * * * * *', async function () {


    const message = await getEpochTime().then((data) => {
        const epoch = data.epoch;
        const price = data.price;
        var message = `Solana is currently $${price} and the current Epoch ${epoch}!`;
        return message
    });

    const data = { "text": message };

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


const getEpochTime = async () => {
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
    }

    let bodyContent = JSON.stringify({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getEpochInfo"
    });

    let response = await fetch(`https://rpc.helius.xyz/?api-key=${process.env.HELIUS_KEY}`, {
        method: "POST",
        body: bodyContent,
        headers: headersList
    });

    let data = await response.json();
    const epoch = data.result.epoch;

    const getSolanaPrice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const solanaPrice = await getSolanaPrice.json();
    const price = solanaPrice.solana.usd;

    return { epoch, price }

}

console.log(tweetSchedule)