
const e = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

async function getPrice(pokemonSet, pokemonName) {
    const pricechartingPrice = getPriceChartingPrice(pokemonSet, pokemonName); 
    

    await pricechartingPrice;

    return [pricecharthingPrice];
    
}

async function getPriceChartingPrice(pokemonSet, pokemonName) {
    const psa10selector = '#manual_only_price > span.price.js-price';

    const url = `https://www.pricecharting.com/game/${pokemonSet}/${pokemonName}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Wait for the price element to appear
    await page.waitForSelector(psa10selector);

    // Extract the price
    const price = await page.$eval(psa10selector, el => {
        const priceText = el.textContent.trim();
        // Remove the dollar sign and commas, then parse to float
        return parseFloat(priceText.replace(/[$,]/g, ''));
    });



    await browser.close();
    return price;
}

async function getEbayPrice(pokemonSet, pokemonName) {
    const ebaySelector = '.s-item__price';
    //document.querySelector(".s-item.s-item__pl-on-bottom > div > div.s-item__info.clearfix > div.s-item__details.clearfix > div.s-item__details-section--primary > div:nth-child(1) > span")
    //#item24870f84e4 > div > div.s-item__info.clearfix > div.s-item__details.clearfix > div.s-item__details-section--primary > div:nth-child(1) > span
    pokemonSet = pokemonSet.replace(/-/g, '+');
    pokemonName = pokemonName.replace(/-/g, '+');
    const url = `https://www.ebay.com/sch/i.html?_nkw=${pokemonSet}+${pokemonName}&Grade=10`;
    console.log("Ebay URL: " + url);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector(ebaySelector);

    // Extract the price
    const price = await page.$eval(ebaySelector, el => {
        const priceText = el.textContent.trim();
        // Remove the dollar sign and commas, then parse to float
        return priceText;
    });
    console.log("Ebay Price: " + price);
    await browser.close();

    return price;
} 

async function fetchEbay(pokemonSet, pokemonName) {
    pokemonSet = pokemonSet.replace(/-/g, '+');
    pokemonName = pokemonName.replace(/-/g, '+');
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${pokemonSet}+${pokemonName}&Grade=10&_sop=16`;
  
    try {
      const { data } = await axios.get(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0", // mimic browser
        },
      });
  
      const $ = cheerio.load(data);
      const firstPrice = $(".s-item__price").first().text().trim();
  
      console.log('eBay Highest Price: ${firstPrice}');
    } catch (err) {
      console.error("Error fetching from eBay:", err.message);
    }
  }

exports.getPrice = getPrice;
exports.getPriceChartingPrice = getPriceChartingPrice;
exports.getEbayPrice = getEbayPrice;
exports.fetchEbay = fetchEbay; 