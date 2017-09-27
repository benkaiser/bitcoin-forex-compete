require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

var app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/static', express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(require('./controllers'));

app.listen(process.env.PORT || 8243, function() {
  console.log("Let's get this party started!");
});
