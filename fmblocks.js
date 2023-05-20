// import blocks from './blocks50.json' assert { type: "json" };
import fetch from 'node-fetch';
import tweeter from './tweeter.js';
import sendTweet from './tweeter.js';

const url = `https://api.solana.fm/v0/blocks?pageSize=100`;
console.log(url)
const req = await fetch(url)
const blocks = await req.json();
console.log(blocks);


let totalTransactions = 0;

blocks.result.data.forEach(block => {
    totalTransactions += block.data.numberOfTransactions;
});

blocks.result.data.forEach(block => {
    totalTransactions += block.data.numberOfTransactions;
});

let maxBlockTime = -Infinity;
let minBlockTime = Infinity;

blocks.result.data.forEach(block => {
    const blockTime = block.data.blockTime;
    if (blockTime > maxBlockTime) {
        maxBlockTime = blockTime;
    }
    if (blockTime < minBlockTime) {
        minBlockTime = blockTime;
    }
});

const time = maxBlockTime - minBlockTime;
console.log("Total transactions:", totalTransactions.toLocaleString());
console.log("Average transactions per block:", Math.round(totalTransactions / blocks.result.data.length).toLocaleString());
console.log("Max block time:", maxBlockTime);
console.log("Min block time:", minBlockTime);
console.log("Block time:", maxBlockTime - minBlockTime);

// const tweet = `In the last ${time} seconds, there were ${totalTransactions.toLocaleString()} transactions on Solana, averaging ${Math.round(totalTransactions / blocks.result.data.length).toLocaleString()} transactions per block.`;
const tweet = `In the last ${time} seconds ⏱️, there were ${totalTransactions.toLocaleString()} transactions on Solana, with an average of ${Math.round(totalTransactions / time).toLocaleString()} transactions per second. 🤯`;

console.log(tweet);
sendTweet(tweet);