const token = process.env.FB_PAGE_TOKEN;
const vtoken = process.env.FB_VERIFY_TOKEN;
const port = process.env.PORT || 5000;

const http = require('http');
const Bot = require('messenger-bot');

let bot = new Bot({
  token: token,
  verify: vtoken
});

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (payload, reply) => {
  let text = payload.message.text;

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;

    reply({ text}, (err) => {
      if (err) throw err;

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
      console.log(JSON.stringify(profile, null, 2));
    });
  });
});

http.createServer(bot.middleware()).listen(port);
