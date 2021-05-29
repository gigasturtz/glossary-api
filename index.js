// index.js

const https = require('https');

const serverless = require('serverless-http');

const express = require('express')

const app = express()

const terms = require('./terms.json')

const toTitleCase = (str) => {
    if(str){
        return str.replace(
          /\w\S*/g,
          function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
        );
    }
    return "";
}

const glossaryLink = (str) => {
    return `for more information visit https://glossary.infil.net/?t=${str}`
}

const trimmedDef = (str) => {
    return `${str.substring(0,199)}...`
}

app.get('/', function (req, res) {
    const correctedTerm = toTitleCase(req.query.search)
    let searchedTerm = terms.find(element => element.term === correctedTerm)
    if (searchedTerm){
        let processedTerm = {};
        processedTerm.glossaryLink = glossaryLink(correctedTerm)
        processedTerm.def = trimmedDef(searchedTerm.def)
        processedTerm.term = searchedTerm.term
        res.send(processedTerm)
    }
    res.send("No results!")
})

module.exports.handler = serverless(app);

