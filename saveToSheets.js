import { google } from 'googleapis';
import fs from 'fs';

// Load credentials from a JSON file obtained from the Google Cloud Console
import credentials from './client_secret_318911893669-9nsaafmt8bj6omprt1gi4lkt00f8nm59.apps.googleusercontent.com.json' assert { type: "json" };

// The ID of the Google Sheet you want to write to
const spreadsheetId = '1Ok2JBXzfwfZLxNDyeSkpEArJFlBRYRG4JWEc8LT1cwo';

// The range of cells where you want to write the new entries (e.g., Sheet1!A1:B2)
const range = 'Sheet1!A1:B2';

// Scopes required for accessing and modifying Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Authorize and authenticate the client with the Google Sheets API using a service account
function authorize(callback) {
    const { client_email, private_key } = credentials;

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email,
            private_key,
        },
        scopes: SCOPES,
    });

    callback(auth);
}

// Write new entries to the Google Sheet
function writeToSheet(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
        ['Value A1', 'Value B1'],
        ['Value A2', 'Value B2'],
    ];

    sheets.spreadsheets.values.update(
        {
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values,
            },
        },
        (err, result) => {
            if (err) {
                console.error('Error writing to sheet', err);
                return;
            }
            console.log(`${result.updatedCells} cells updated.`);
        }
    );
}

// Call the authorize function to start the authentication process
authorize(writeToSheet);
