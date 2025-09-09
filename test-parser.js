const Parser = require('rss-parser');

async function testParser() {
  const parser = new Parser({
    customFields: {
      item: [
        ['category', 'categories', { keepArray: true }],
        ['dc:identifier', 'dcIdentifier']
      ]
    }
  });

  try {
    const feed = await parser.parseURL('https://travel.state.gov/_res/rss/TAsTWs.xml');
    console.log('Feed structure:');
    console.log(JSON.stringify(feed, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testParser();
