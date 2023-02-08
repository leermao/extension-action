const http = require('http');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');
const { google } = require('googleapis');

const YOUR_CLIENT_ID = '232318875097-7d3m7sjfoccb3lebv3dggtc90n2kcv3d.apps.googleusercontent.com';
const YOUR_CLIENT_SECRET = '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';
const YOUR_REDIRECT_URL = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, YOUR_REDIRECT_URL);

async function authenticate(scopes) {
  return new Promise((resolve, reject) => {
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
    console.log({ authorizeUrl });
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            console.log(qs.get('code'));
            res.end('Authentication successful! Please return to the console.');
            server.destroy();

            const { tokens } = await oauth2Client.getToken(qs.get('code'));
            console.log(tokens);
            oauth2Client.credentials = tokens;
            resolve(oauth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3000, () => {
        opn(authorizeUrl, { wait: false }).then((cp) => cp.unref());
      });
    destroyer(server);
  });
}

async function runSample(client) {
  console.log(client);
}

const scopes = ['https://www.googleapis.com/auth/androidpublisher'];

authenticate(scopes)
  .then((client) => runSample(client))
  .catch(console.error);
