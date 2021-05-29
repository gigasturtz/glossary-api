const rawTerms = require('./terms.json')

function searchForTerm(termString) {

	prepareData(rawTerms);

	var s = stripPuncAndSpace(termString.toLowerCase());

	altMatches = {};

	var regex;
	try {
		regex = new RegExp(s, "i");
	}
	catch(err) {
		console.log("error with glossary search:",err);
		return; // badly formed search query, just abandon ship
	}
	
	// search in terms and in definitions separately
	var inTerm = [];
	var inDef = [];
	for (var t in terms) {
		var found = false;
		var bestMatch = null;
		for(var i=0; i<terms[t].termStripped.length; i++) {
			if(terms[t].termStripped[i].match(regex)) {
				found = true;

				// find out how close of a match it is based on # of letters in search term vs matching term
				var diff = terms[t].termStripped[i].length - s.length;
				// save this difference in the array (for now), so we can sort based on it
				// we don't know if this is our closest match yet, so keep track of our best match
				if(bestMatch === null || bestMatch[1] > diff) {
					bestMatch = [terms[t],diff];
					// this matched a secondary term, so save it in "altMatches" so we can display it later
					if(i > 0)
						altMatches[terms[t].term] = terms[t].altterm[i-1];
				}
			}
		}
		if(bestMatch)
			inTerm.push(bestMatch);
		// if not found in a term and length of search query is 3 or more letters, search in definition
		if(!found && (s.length > 2 || containsJapanese(s)) && terms[t].defStripped.match(regex))
			inDef.push(terms[t]);
	}

	function alpha(a,b) { return a.term.localeCompare(b.term); }
	
	inTerm.sort((a,b) => a[1] - b[1] || alpha(a[0],b[0])); // sort by closeness first, then alpha
	inTerm = inTerm.map(a => a[0]); // flatten the array now that we've sorted based on closeness
	inDef.sort(alpha);
	
	// concatenate all the sorted arrays
	inTerm.push.apply(inTerm, inDef);
	
	return inTerm;
}

function stripPuncAndSpace(s) {
	return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~() '"]/g,"").replace(/\s{2,}/g," ");
}

function prepareData(data) {
	terms = {};
	data.forEach(function(d) {
		if(d.term.length > 0) {
			terms[d.term.toLowerCase()] = d;
			d.termStripped = [stripPuncAndSpace(d.term)];
			if(d.hasOwnProperty('altterm')) {
				for(var st of d.altterm)
					d.termStripped.push(stripPuncAndSpace(st));
			}
			// create a definition stripped of punc and space that can be searched
			// we can just append the JP text to this so it is also searchable, this is never shown on screen
			d.defStripped = stripPuncAndSpace(d.def) + (d.hasOwnProperty('jp') ? stripPuncAndSpace(d.jp) : "");
			d.parsed = false;
		}
	});
}

module.exports = searchForTerm