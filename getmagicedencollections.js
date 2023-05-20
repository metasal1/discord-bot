import fetch from 'node-fetch';
import { writeFile, appendFile } from 'fs/promises';

const apiUrl = 'https://api-mainnet.magiceden.dev/v2/collections';
const csvFolderPath = 'magiceden';
const limit = 100;
let offset = 0;

async function fetchData() {
    try {
        const collections = [];

        while (true) {
            const response = await fetch(`${apiUrl}?offset=${offset}&limit=${limit}`);
            const data = await response.json();
            const retrievedCollections = data.map((collection) => ({
                symbol: collection.symbol,
                name: collection.name,
                description: collection.description,
                // Add more properties as needed
            }));
            collections.push(...retrievedCollections);

            // Save the data for each page
            const csvData = [
                Object.keys(retrievedCollections[0]).join(','),
                ...retrievedCollections.map((collection) =>
                    Object.values(collection).map((value) => `"${value}"`).join(',')
                ),
            ].join('\n');
            const pageCsvFilePath = `${csvFolderPath}/collections_page_${offset / limit + 1
                }.csv`;
            await writeFile(pageCsvFilePath, csvData);
            console.log(
                `Data for page ${offset / limit + 1} saved to ${pageCsvFilePath}`
            );

            if (retrievedCollections.length < limit) {
                break; // Exit the loop if the retrieved data is less than the limit
            }

            offset += limit; // Increase the offset for the next iteration
        }

        // Convert the entire data to CSV format
        const csvData = [
            Object.keys(collections[0]).join(','),
            ...collections.map((collection) =>
                Object.values(collection).map((value) => `"${value}"`).join(',')
            ),
        ].join('\n');

        // Save the entire data as a CSV file
        const completeCsvFilePath = `${csvFolderPath}/collections.csv`;
        await appendFile(completeCsvFilePath, csvData);
        console.log(`Data appended to ${completeCsvFilePath}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();
