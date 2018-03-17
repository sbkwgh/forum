process.env.NODE_ENV = 'test';

let chai = require('chai');
let server = require('../server');
let should = chai.should();
let expect = chai.expect;

let getOGPreviewData = require('../lib/linkPreview/getOGPreviewData');
let getPreviewHTML = require('../lib/linkPreview/getPreviewHTML');
let linkPreview = require('../lib/linkPreview');

let github = require('../lib/linkPreview/patterns/github');
let wikipedia = require('../lib/linkPreview/patterns/wikipedia');
let twitter = require('../lib/linkPreview/patterns/twitter');

const Errors = require('../lib/errors.js');

chai.use(require('chai-http'));
chai.use(require('chai-things'));


describe('link_expansion', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done();
		server.on('appStarted', done);
	});

	describe('getOGPreviewData', () => {
		it('should return an object containing relevant OG data', async () => {
			let data = await getOGPreviewData('https://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election')

			data.should.have.property(
				'title',
				'Revealed: 50 million Facebook profiles harvested for Cambridge Analytica in major data breach'
			);
			data.should.have.property(
				'description',
				'Whistleblower describes how firm linked to former Trump adviser Steve Bannon compiled user data to target American voters• How Cambridge Analytica’s algorithms turned ‘likes’ into a political tool'
			);
			data.should.have.property(
				'url',
				'http://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election'
			);
			data.should.have.property(
				'image',
				'https://i.guim.co.uk/img/media/97532076a6935a1e79eba294437ed91f3eb4df6b/0_626_4480_2688/master/4480.jpg?w=1200&h=630&q=55&auto=format&usm=12&fit=crop&crop=faces%2Centropy&bm=normal&ba=bottom%2Cleft&blend64=aHR0cHM6Ly91cGxvYWRzLmd1aW0uY28udWsvMjAxOC8wMS8zMS9mYWNlYm9va19kZWZhdWx0LnBuZw&s=365825fe053733ae12f9b050f5374594'
			);
		});
		it('should use other meta or title tags if there is no OG tags availible', async () => {
			let data = await getOGPreviewData('http://ejs.co');
			data.should.have.property('title', 'EJS -- Embedded JavaScript templates');
			data.should.have.property(
				'description',
				"'E' is for 'effective'. EJS is a simple templating language that lets you generate HTML markup with plain JavaScript. No religiousness about how to organize things. No reinvention of iteration and control-flow. It's just plain JavaScript."
			);
		});
		it('should return null if there is no OG tags availible', async () => {
			let data = await getOGPreviewData('http://blank.org');
			expect(data).to.be.null;
		});
	});

	describe('getPreviewHTML', () => {
		it('should return an HTML string for given object', () => {
			let HTML = getPreviewHTML({
				url: 'http://www.example.com',
				description: 'description',
				title: 'title',
				image: 'image'
			});

			(typeof HTML).should.equal('string');
		})
		it('should correctly deal with the conditional', () => {
			let HTML = getPreviewHTML({
				url: 'http://www.example.com',
				description: 'description',
				title: 'title'
			});
			(typeof HTML).should.equal('string');
		})
	});

	describe('linkPreview', () => {
		it('should get a HTML string from an OG link', async () => {
			let HTML = await linkPreview('https://www.theguardian.com/news/2018/mar/17/cambridge-analytica-facebook-influence-us-election');

			(typeof HTML).should.equal('string');
		});
		it('should return an empty string from an invalid site', async () => {
			let HTML = await linkPreview('http://blank.org');

			(typeof HTML).should.equal('string');
		});
	});

	describe('GitHub', () => {
		it('should match a valid GitHub url', () => {
			github.matches('https://github.com/sbkwgh/forum').should.not.be.null;
			github.matches('http://github.com/sbkwgh/forum').should.not.be.null;
			
			expect(github.matches('http://notgithub.com/sbkwgh/forum')).to.be.null;
		});
		it('should return a data object', async () => {
			let data = await github.getPreviewData('https://github.com/sbkwgh/forum');

			data.should.have.property('title', 'sbkwgh/forum')
			data.should.have.property('url', 'https://github.com/sbkwgh/forum')
			data.should.have.property('description', 'Forum software created using Express, Vue, and Sequelize')
		});
	});

	describe('Wikipedia', () => {
		it('should match a valid Wikipedia url', () => {
			wikipedia.matches('https://en.wikipedia.org/wiki/google').should.not.be.null;
			wikipedia.matches('http://fr.wikipedia.org/wiki/google').should.not.be.null;
			
			expect(wikipedia.matches('http://en.wikipedia.org/notapage')).to.be.null;
		});
		it('should return a data object', async () => {
			let data = await wikipedia.getPreviewData('https://en.wikipedia.org/wiki/google');

			data.should.have.property('title', 'Google')
			data.should.have.property('url', 'https://en.wikipedia.org/wiki/Google')
			data.description.should.have.length(503)
		});
	});

	describe('Twitter', () => {
		it('should match a valid Wikipedia url', () => {
			twitter.matches('https://twitter.com/user/status/12345').should.not.be.null;
			
			expect(twitter.matches('http://twitter.com/notapage/123456')).to.be.null;
			expect(twitter.matches('http://twitter.com/notapage/status/qwertyu')).to.be.null;
		});
		it('should return a data object', async () => {
			let HTML = await twitter.getPreviewData('https://twitter.com/Interior/status/463440424141459456');

			(typeof HTML).should.equal('string');
			HTML.should.have.length.above(0);
		});
	});
})