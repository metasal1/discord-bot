import dotenv from 'dotenv';
import fetch from 'node-fetch';
import schedule from 'node-schedule';

dotenv.config();

const tweetSchedule = schedule.scheduleJob('0 */3 * * *', async function () {

    (async () => {
        try {
            const req = await fetch(`https://api.dune.com/api/v1/query/2476143/execute?api_key=${process.env.DUNE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'content-type': "application/json",
                    'accept': "application/json"
                }
            });

            const res = await req.json();
            console.log(res);
        } catch (e) {
            console.dir(e);
        }
    })();
});