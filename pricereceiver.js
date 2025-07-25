const e = require('express');
//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// {name: "pokemon-journey-together", url: "https://www.pokellector.com/sets/pokemon-journey-together", logo-image: "https://www.pokellector.com/sets/pokemon-journey-together/logo.png", images: ["https://www.pokellector.com/sets/pokemon-journey-together/1.jpg", "https://www.pokellector.com/sets/pokemon-journey-together/2.jpg"]}
let SetURLS = {};

async function getPrice(pokemonSet, pokemonName) {
  const pricechartingPrice = getPriceChartingPrice(pokemonSet, pokemonName);
  await pricechartingPrice;
  return pricechartingPrice;
}

async function getPriceChartingPrice(pokemonSet, pokemonName) {
  const psa10selector = '#manual_only_price > span.price.js-price';
  const ungradedSelector = '#used_price > span.price.js-price';
  console.log("Fetching price for: " + pokemonSet + " " + pokemonName);

  const url = `https://www.pricecharting.com/game/${pokemonSet}/${pokemonName}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  console.log("Navigated to PriceCharting URL: " + url);

  // Wait for the price element to appear
  await page.waitForSelector(ungradedSelector);
  console.log("PriceCharting selector found: " + ungradedSelector);

  // Extract the price
  const price = await page.$eval(ungradedSelector, el => {
    const priceText = el.textContent.trim();
    // Remove the dollar sign and commas, then parse to float
    return parseFloat(priceText.replace(/[$,]/g, ''));
  });

  await browser.close();
  console.log("PriceCharting Price: " + price);
  return price;
}

async function getEbayPrice(pokemonSet, pokemonName) {
    const ebaySelector = '.s-item__price';
    //document.querySelector(".s-item.s-item__pl-on-bottom > div > div.s-item__info.clearfix > div.s-item__details.clearfix > div.s-item__details-section--primary > div:nth-child(1) > span")
    //#item24870f84e4 > div > div.s-item__info.clearfix > div.s-item__details.clearfix > div.s-item__details-section--primary > div:nth-child(1) > span
    pokemonSet = pokemonSet.replace(/-/g, '+');
    pokemonName = pokemonName.replace(/-/g, '+');
    const url = `https://www.ebay.com/sch/i.html?_nkw=${pokemonSet}+${pokemonName}&Grade=10&_sop=16`;
    console.log("Ebay URL: " + url);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

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

async function PopulateSetURLS() {
    const url = "https://www.pokellector.com/sets";
    const setTableSelector = "#columnLeft";

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'], timeout: 0 });
    await page.waitForSelector(setTableSelector);
    const urls = await page.$eval(setTableSelector, (el) => {    
        let urls = {};
        const sections = el.querySelectorAll('div');
        sections.forEach(section => {
        const sectionLinks = section.querySelectorAll('a');
         sectionLinks.forEach(link => {
            
            const logo = link.querySelector("img").src;
            const setName = link.querySelector("span").textContent.toLowerCase();
            const setURL = link.href;
            urls[setName] = { url: setURL, logoImage: logo };
         });
        });
        return urls;
    });

    await browser.close();

    return urls;

}

async function getPokemonImages(url) {
    const cardTableSelector = "#columnLeft > div.content.cardlisting.small";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'], timeout: 0 });

    await page.waitForSelector(cardTableSelector);

    const cardDetails = await page.$eval(cardTableSelector, (el) => {
        const cards = el.querySelectorAll('.card');
        const details = [];

        cards.forEach(card => {
            const img = card.querySelector('img');
            const plaque = card.querySelector('.plaque');
            if (img && plaque) {
                const src = img.src ? img.src : img.getAttribute('data-src');
                const name = plaque.textContent.split('-')[0].trim(); // Extract name
                const cardNumber = plaque.textContent.split('-')[1].trim(); // Extract card number
                details.push({ name, cardNumber, image: src });
            }
        });

        return details;
    });

    await browser.close();
    return cardDetails;
}


exports.getPrice = getPrice;
exports.getPriceChartingPrice = getPriceChartingPrice;
exports.getEbayPrice = getEbayPrice;
exports.getPokemonImages = getPokemonImages;
exports.PopulateSetURLS = PopulateSetURLS;
exports.SetURLS = SetURLS;