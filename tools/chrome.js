const YOUR_CLIENT_ID = '232318875097-7d3m7sjfoccb3lebv3dggtc90n2kcv3d.apps.googleusercontent.com';
const YOUR_CLIENT_SECRET = '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';
const YOUR_REDIRECT_URL = 'http://localhost:3000/oauth2callback';
const code = '4/0AWtgzh6vXqqMABV0IGLV2fXsYFTNG-O8qNPanXXjSXMkRQejoz75OfGhoXUU6lea4cWaGg';

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL);

(async () => {
  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = ['https://www.googleapis.com/auth/androidpublisher'];
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes,
  });
  console.log(url);
})();
