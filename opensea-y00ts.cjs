const WebSocket = require('ws');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = 'YOUR_API_KEY';
const collectionAddress = '0x670fd103b1a08628e9557cD66B87DeD841115190';

// Create a WebSocket connection to the OpenSea Stream API
const ws = new WebSocket('wss://stream.opensea.io/?api_key=' + apiKey);

ws.on('open', () => {
    console.log('Connected to OpenSea Stream API');

    // Subscribe to the collection events
    const subscribeMessage = JSON.stringify({
        type: 'subscribe',
        channel: 'collection',
        payload: {
            collectionAddress: collectionAddress
        }
    });

    ws.send(subscribeMessage);
});

ws.on('message', (data) => {
    const message = JSON.parse(data);

    // Check if the event is a "Y00TS" event
    if (message.channel === 'collection' && message.payload.event_type === 'Y00TS') {
        console.log('Y00TS event:', message);
    }
});

ws.on('close', () => {
    console.log('Connection to OpenSea Stream API closed');
});
