// Load Environment Variables
const dotenv = require('dotenv');
dotenv.load();
// Express Config
const port = process.env.PORT || 5000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const botly = require('./myBot');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Handle verification and Messaging
app.use('/', botly.router());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.send({status: 'ok', message: 'FB Bot Server is healthy'});
});

app.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }

  console.log(`FB Bot Server is listening on ${port}`);
});

module.exports = app;
