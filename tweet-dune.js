import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import dotenv from 'dotenv';
import schedule from 'node-schedule';

const dummy = {
    "execution_id": "01H0H8GT1WPQBK2NY0XF7FSW7S",
    "query_id": 2476143,
    "state": "QUERY_STATE_COMPLETED",
    "submitted_at": "2023-05-16T03:09:04.957661Z",
    "expires_at": "2023-08-14T03:09:11.934855Z",
    "execution_started_at": "2023-05-16T03:09:05.015941Z",
    "execution_ended_at": "2023-05-16T03:09:11.934854Z",
    "result": {
        "rows": [
            {
                "_col0": 1366637
            }
        ],
        "metadata": {
            "column_names": [
                "_col0"
            ],
            "result_set_bytes": 12,
            "total_row_count": 1,
            "datapoint_count": 1,
            "pending_time_millis": 58,
            "execution_time_millis": 6918
        }
    }
}
dotenv.config();

const tweetSchedule = schedule.scheduleJob('51 * * * *', async function () {

    const access_token = process.env.TWITTER_ACCESS_TOKEN_SOLANA_FAQS;
    const access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET_SOLANA_FAQS;

    const consumer_key = process.env.TWITTER_CONSUMER_KEY_SOLANA_FAQS;
    const consumer_secret = process.env.TWITTER_CONSUMER_SECRET_SOLANA_FAQS;

    const req = await fetch(`https://api.dune.com/api/v1/query/2476143/results?api_key=${process.env.DUNE_API_KEY}`)
    const res = await req.json();
    console.log(res);
    const tx = res.result.rows[0]._col0;
    console.log("Transactions", tx);
    const data = { "text": `Did you know the Solana Blockchain performed ${tx.toLocaleString()} transactions in the past hour ? 🤯 That's ${Math.round(tx / 60).toLocaleString()} per minute!` };
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
