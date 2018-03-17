let fs = require('fs');
let path = require('path')

let getOGPreviewData = require('./getOGPreviewData');
let getPreviewHTML = require('./getPreviewHTML');

let previewPatterns = 
	fs.readdirSync(path.join(__dirname, 'patterns'))
	  .map(file => {
	      return require(path.join(__dirname, 'patterns', file));
	  });

module.exports =  async function linkPreview(url) {
	let previewData;

	for(let pattern of previewPatterns) {
		if(pattern.matches(url)) {
			previewData = await pattern.getPreviewData(url);
			break;
		}
	}

	//If the url doesn't match a pattern for a specific
	//site, try getting a possible preview using OG tags
	if(!previewData) previewData = await getOGPreviewData(url);

	//If there is some data scraped from the site for a
	//preview, generate a HTML string
	//Otherwise return an empty string
	if(typeof previewData === 'object' && previewData !== null) {
		return getPreviewHTML(previewData);
	} else if(typeof previewData === 'string') {
		return previewData;
	} else {
		return '';
	}
}