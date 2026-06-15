const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getJson(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const url = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
  const data = await getJson(url, { 'apikey': supabaseKey });
  if (data.definitions && data.definitions.submissions) {
    console.log('Submissions columns:', Object.keys(data.definitions.submissions.properties));
  } else {
    console.log('Could not find submissions definition in swagger:', Object.keys(data.definitions || {}));
  }
}

main().catch(console.error);
