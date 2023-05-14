import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export default async function save(database, collection, data) {
    try {
        // Connect to the MongoDB database
        const uri = process.env.MONGO_URI; // replace with your MongoDB URI
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();

        // Select the "faqs" collection
        const db = client.db(database); // replace with your database name
        const faqsCollection = db.collection(collection);

        // Insert the FAQ object into the "faqs" collection
        const result = await faqsCollection.insertOne(data);

        console.log(`Inserted FAQ with _id: ${result.insertedId}`);

        // Close the database connection
        await client.close();
    } catch (error) {
        console.error(error);
    }
}

// saveFAQ({ question: 'What is Solana?', answer: 'Solana is a fast, secure, and censorship resistant blockchain providing the open infrastructure required for global adoption.' })

// save('solana', 'faqs', { question: 'What is Solana?', answer: 'Solana is a fast, secure, and censorship resistant blockchain providing the open infrastructure required for global adoption.' })