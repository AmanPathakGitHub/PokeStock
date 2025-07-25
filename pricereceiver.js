
const e = require('express');
//const puppeteer = require('puppeteer');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


// {name: "pokemon-journey-together", url: "https://www.pokellector.com/sets/pokemon-journey-together", logo-image: "https://www.pokellector.com/sets/pokemon-journey-together/logo.png", images: ["https://www.pokellector.com/sets/pokemon-journey-together/1.jpg", "https://www.pokellector.com/sets/pokemon-journey-together/2.jpg"]}
let SetURLS = [];

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
        const urls = [];
        const sections = el.querySelectorAll('div');
        sections.forEach(section => {
        const sectionLinks = section.querySelectorAll('a');
         sectionLinks.forEach(link => {
            
            const logo = link.querySelector("img").src;
            const setName = link.querySelector("span").textContent.toLowerCase();
            const setURL = link.href;
            urls.push({ name: setName, url: setURL, logoImage: logo });
         });
        });
        return urls;
    });

    await browser.close();


    return urls;


}

async function getPokemonImages(url) {
    //const url = "https://www.pokellector.com/Black-Bolt-EN-Expansion";
    const cardTableSelector = "#columnLeft > div.content.cardlisting.small";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'], timeout: 0 });

    await page.waitForSelector(cardTableSelector);

    const imageList = await page.$eval(cardTableSelector, (el) => {
        const images = [];
        const cards = el.querySelectorAll('.card');
        cards.forEach(card => {
            const img = card.querySelector('img');
            if (img) {
                const src = img.src ? img.src : img.getAttribute('data-src');
                images.push(src);
            }
        });
        return images;
    });
    await browser.close();
    return imageList;
}


exports.getPrice = getPrice;
exports.getPriceChartingPrice = getPriceChartingPrice;
exports.getEbayPrice = getEbayPrice;
exports.getPokemonImages = getPokemonImages;
exports.PopulateSetURLS = PopulateSetURLS;
exports.SetURLS = SetURLS;