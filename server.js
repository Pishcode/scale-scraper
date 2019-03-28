const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express.Application = express();

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.static(__dirname + '/dist/scale-scraper'));

app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname + '/dist/scale-scraper/index.html'));
});

app.use(require('./server/scraper'));

app.listen(process.env.PORT || 8080);
