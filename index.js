// index.js

const https = require('https');

const serverless = require('serverless-http');

const express = require('express')

const app = express()


app.get('/', function (req, res) {
    let data = '';
    let get_results = new Promise((resolve, reject) => {
        https.get('https://glossary.infil.net/json/glossary.json', (resp) => {
            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
                results = JSON.parse(data);
                resolve(results);
            });

            resp.on('error', (error) => {
                reject(error);
            });
        })
    })

    get_results.then((response) => {
        const searchedTerm = response.find(element => element.term === req.query.search)
        res.send(searchedTerm)
    }).catch((error) => {
        console.log(error);
    });
})


module.exports.handler = serverless(app);

