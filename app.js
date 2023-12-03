const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = './token.json';


const credentials = require('./credentials.json');


const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);


function authorize(callback) {
  const token = fs.readFileSync(TOKEN_PATH);
  oAuth2Client.setCredentials(JSON.parse(token));
  callback(oAuth2Client);
}


function listRecentEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    maxResults: 5,
  }, (err, res) => {
    if (err) return console.error('The API returned an error:', err);

    const messages = res.data.messages;

    if (messages.length) {
      messages.forEach((message) => {
        
        gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        }, (err, res) => {
          if (err) return console.error('Error retrieving email details:', err);

          const email = res.data;
          
          console.log(`Subject: ${email.subject}`);
          console.log(`Snippet: ${email.snippet}`);
        });
      });
    } else {
      console.log('No emails found.');
    }
  });
}

authorize(listRecentEmails);
