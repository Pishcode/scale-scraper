const express = require('express');
const cheerio = require("cheerio");
const request = require("request");
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express.Application = express();

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};

app.use(bodyParser.json());;


app.use(cors(corsOptions))
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.route('/api/article').post((req, res) => {
	const url = decodeURIComponent(req.body.url);
	const urlSplited = url.split('/');
	const baseUrl = urlSplited[0] + '//' + urlSplited[2];

	request(url, (err, urlRes, urlHtml) => {
		const $ = cheerio.load(urlHtml);

		var articles = [];

		let count = 0;

		$('a.title-link').each(function (i, element) {
			let articleUrl = $(element).attr('href');
			if (/^\//.test(articleUrl)) {
				articleUrl = baseUrl + articleUrl;
			}
			let articleTitle = $(element).text().trim();

			request(articleUrl, (err, response, html) => {
				let articleContent = [];
				const $2 = cheerio.load(html);
				if($2('.story-body__inner p').text()) {
					$2('.story-body__inner p').each(function (j, element) {
						articleContent.push($2(element).text());
					});
				}

				if(!$2('.story-body__inner p').text()) {
					$2('.body-content p').each(function(j, element) {
						articleContent.push($2(element).text());
					});
				}

				articles.push({
					title: articleTitle,
					url: articleUrl,
					content: articleContent
				});
				count ++;

				if(count === $('a.title-link').length) {
					res.send(articles);
				}
			});

		});

		if (!count) {
			// res.status(404);
		}
	});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
