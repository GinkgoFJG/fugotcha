#!/usr/bin/env node

// Config
const baseUrl = 'https://www.dischord.com/fugazi_live_series';

// Includes
const program = require('commander');
const puppeteer = require('puppeteer');

program
  .on('--help', function() {
    console.log('');
    console.log("Fugotcha is a command-line utility for scraping data from the Fugazi Live Series on Dischord.com.");
  })
  .option('-p --page <page>',
    'Required. The slug of the page to scrape (the URL after "fugazi_live_series")')
  .option('-c --count [count]',
    'Optional. The number of pages to scrape (default: 1); 0 for infinity', 1)
  .action(function () {
    if (typeof(program.page) === 'undefined') {
      console.error('Page is a required parameter.');
      process.exit(1);
    }

    // in case the whole path is specified, just get the last bit
    let slug = program.page.replace('fugazi_live_series/', '');

    puppeteer.launch().then(async browser => {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/${slug}`);

      const tracks = await extractTracks(page);
      console.log(tracks.join(','));

      await browser.close();
    });
  })
  .parse(process.argv);

/**
 * Extracts track titles from a page.
 *
 * @params {Page} page
 *   @see https://github.com/GoogleChrome/puppeteer/blob/v1.10.0/docs/api.md#class-page
 * @return {Promise<Array[String]>}
 *   Promise which resolves to an Array of track titles.
 */
function extractTracks(page) {
  const trackListSelector = '.mp3_list';
  const trackSelector = '.track_name';

  // waiting is probably unnecessary since content appears to be rendered server-side
  return page.waitForSelector(trackListSelector).then(async elementHandle => {
    return await elementHandle.$$eval(trackSelector, matches => {
      return matches.map(track => {
        return track.innerHTML.trim();
      });
    });
  });
}
