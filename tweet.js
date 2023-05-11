import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import dotenv from 'dotenv';
import schedule from 'node-schedule';

dotenv.config();

const tweetSchedule = schedule.scheduleJob('0 * * * *', async function () {

    const access_token = process.env.TWITTER_ACCESS_TOKEN_SOLANA_FAQS;
    const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET_SOLANA_FAQS;

    const consumer_key = process.env.TWITTER_CONSUMER_KEY_SOLANA_FAQS;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET_SOLANA_FAQS;

    const getSolanaPrice = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
    const solanaPrice = await getSolanaPrice.json();
    const price = solanaPrice.solana.usd;
    const data = { "text": `Solana is currently $${price}` };
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
