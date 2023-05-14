import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export default async function update(id, tweetId) {
    try {

        const objectId = new ObjectId(id);

        // Connect to the MongoDB database
        const uri = process.env.MONGO_URI; // replace with your MongoDB URI
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();

        // Select the "faqs" collection
        const db = client.db('solana'); // replace with your database name
        const faqsCollection = db.collection('faqs');

        // Insert the FAQ object into the "faqs" collection
        const result = await faqsCollection.updateOne({ _id: objectId }, { $set: { tweetId: tweetId } })

        console.log(`Tweet Updated: ${JSON.stringify(result)}`);

        // Close the database connection
        await client.close();
    } catch (error) {
        console.error(error);
    }
}

// update('645ffece57344d1fc69764a0', 'abc');