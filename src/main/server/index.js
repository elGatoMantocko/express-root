const express = require('express');
const app = express();

app.get('/', function(req, res) {
  const {query} = req;
  res.send('Hello world!');
});

app.listen(3000);