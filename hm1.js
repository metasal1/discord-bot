import dotenv from 'dotenv';
import fs from 'fs';
import { RestClient, NftSocialRequest } from '@hellomoon/api';
dotenv.config();

const client = new RestClient(process.env.HELLOMOON_API_KEY);
fs.createWriteStream('hm1.json');

const response = await client.send(new NftSocialRequest())
let pt = null;
response.paginationToken ? pt = response.paginationToken : pt = null;

while (pt) {
    const response = await client.send(new NftSocialRequest(pt))
    fs.appendFileSync('hm1.json', JSON.stringify(response, null, 2));
    console.log('got page', pt)
    pt = response.paginationToken;
}
