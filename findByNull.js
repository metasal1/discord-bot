import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export default async function findByNull() {
    try {
        // Connect to the MongoDB database
        const uri = process.env.MONGO_URI; // replace with your MongoDB URI
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();

        // Select the "faqs" collection
        const db = client.db('solana'); // replace with your database name
        const faqsCollection = db.collection('faqs');

        // Insert the FAQ object into the "faqs" collection
        const result = await faqsCollection.findOne({ tweetId: { $eq: null } });

        console.log(`Tweet Found: ${result._id}  ${result.question} ${result.answer} ${result.tweetId}`);

        // Close the database connection
        await client.close();
        return result;
    } catch (error) {
        console.error(error);
    }
}

// findByNull();