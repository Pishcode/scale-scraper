const express = require('express');
const cheerio = require("cheerio");
const axios = require("axios");
router = express.Router();

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

function getLinks(response) {
    let links = [];
    let $ = cheerio.load(response.data);
    $('a').each(function (i, element) {
        let articleUrl = $(element).attr('href');
        if (/^\//.test(articleUrl)) {
            if (!links[articleUrl]) {
                links.push(articleUrl);
            }
        }
    });

    return links;
}

router.post('/api/article', (req, res) => {
    const url = decodeURIComponent(req.body.url);
    const urlArr = url.split('/');
    const baseUrl = urlArr[0] + '//' + urlArr[2];

    axios.get(url)
        .then((response) => {
            let links = getLinks(response);
            let articles = [];

            axios.all(links.map(link => {
                return axios.get(baseUrl + link)
                    .then(lResponse => {
                        const article = getContent(lResponse);

                        if (article.content.length) {
                            articles.push(article);
                        }
                    }).catch(function (e) {
                        // console.log(e);
                    });
            })).then(axios.spread(function () {
                res.send(articles);
            }));
        }).catch(function (e) {
        console.log(e);
    });
});

module.exports = router;
