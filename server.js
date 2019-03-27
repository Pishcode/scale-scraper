const express = require('express');
const path = require('path');
const cheerio = require("cheerio");
const axios = require("axios");
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

function getContent(response) {
	const $ = cheerio.load(response.data);
	let linkContent = [];
	let linkTitle = $('h1').text();

	$('p').each(function (i, element) {
		linkContent.push($(element).text());
	});

	return {
		title: linkTitle,
		url: response.responseURL,
		content: linkContent
	};
}

app.route('/api/article').post((req, res) => {
	const url = decodeURIComponent(req.body.url);
	const urlArr = url.split('/');
	const baseUrl = urlArr[0] + '//' + urlArr[2];

	axios.get(url)
		.then((response) => {
			let links = [];
			let articles = [];
			let $ = cheerio.load(response.data);
			$('a').each(function (i, element) {
				let articleUrl = $(element).attr('href');
				if (/^\//.test(articleUrl)) {
					if(!links[articleUrl]) {
						links.push(articleUrl);
					}
				}
			});

			axios.all(links.map(l => {
				return axios.get(baseUrl + l)
					.then(lResponse => {
						const article = getContent(lResponse);

						if (article.content.length) {
							articles.push(article);
						}
					}).catch(function (e) {
					// console.log(e);
				});
			})).then(axios.spread(function (...responseAll) {
				res.send(articles);
			}));
		}).catch(function (e) {
		console.log(e);
	});
});

app.listen(process.env.PORT || 8080);
