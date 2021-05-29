// index.js

const serverless = require('serverless-http');

const express = require('express')

const searchForTerm = require('./searchForTerm')

const app = express()

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
    return `for more information visit ${encodeURI(`https://glossary.infil.net/?t=${str}`)}`
}

const trimmedDef = (str) => {
    return `${str.substring(0,199)}...`
}

function doDefFormatting(str) {
	// parse out the in-glossary links from the definition and assign them as actual working hyperlinks
	var sind = str.indexOf("!<");
	while(sind >= 0) {
		var eind = str.indexOf('>',sind);
		if(eind < 0)
			break; // something bad happened and we didn't format the link properly
		
		// index [0] is the code term name, [1] is the text to display (unless we only have one term, then [0] is for both)
		var tokens = str.substring(sind+3,eind-1).split("','");
        var properTerm = tokens.length > 1 ? tokens[1] : tokens[0];
        str = str.substring(0, sind) + properTerm + str.substring(eind+1);
		sind = str.indexOf("!<");
	}
	
	// parse out links to non-glossary pages
	var sind = str.indexOf("?<");
	while(sind >= 0) {
		var eind = str.indexOf('>',sind);
		if(eind < 0)
			break; // something bad happened and we didn't format the link properly
		
		// index [1] is the code term name, [3] is the text to display
		var tokens = str.substring(sind,eind+1).split("'");
        str = tokens[3]
		sind = str.indexOf("?<");
	}

	return trimmedDef(str);
}

app.get('/', function (req, res) {
    let searchedTerm = searchForTerm(req.query.search)
    try{
        let processedTerm = {};
        processedTerm.glossaryLink = glossaryLink(searchedTerm[0].term)
        processedTerm.def = doDefFormatting(searchedTerm[0].def)
        processedTerm.term = searchedTerm[0].term
        res.send(processedTerm)
    }
    catch(err) {
    res.send({ term: req.query.search, def: "No results found!", glossaryLink: "Try browsing the glossary to find what you're looking for... https://glossary.infil.net"})
    }
})

module.exports.handler = serverless(app);

