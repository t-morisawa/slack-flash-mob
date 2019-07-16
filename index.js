/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.emojiHeaven = (req_, res_) => {
  // get good emojicode
  const emojiSentiment = require('emoji-sentiment');
  const emojiDataSource = require('emoji-datasource');

  const filtered = emojiSentiment.filter((element) => {
    return (element.score > 0.6);
  });

  const get_short_name = () => {
    while (1) {
      const selected = filtered[Math.floor(Math.random() * filtered.length)].sequence;
      const matched = emojiDataSource.filter((element) => {
        return (element.unified == selected);
      });
      if (matched.length > 0) {
        return matched[0].short_name;
      }
    }
  }

  const https = require('https');

  // single message from slack
  const payload = JSON.parse(req_.body.payload);

  for (i=0; i<8; i++) {
    const options = {
      hostname: 'slack.com',
      port: 443,
      path: '/api/reactions.add?token=' + process.env.SLACK_API_TOKEN + '&channel=' + payload.channel.id + '&timestamp=' + payload.message_ts + '&name=' + get_short_name(),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    const req = https.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    req.write('');
    req.end();
  }

  let message = req_.query.message || req_.body.message || 'Hello World!';
  res_.status(200).send(message);

};
