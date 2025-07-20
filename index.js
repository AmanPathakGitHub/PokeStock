
const express = require('express');
const priceReceiver = require('./pricereceiver.js'); 
require('web-streams-polyfill/ponyfill');

const app = express();
const port = 3000;

const pokemonSet = 'pokemon-journey-together';
const pokemonName = 'n%27s-reshiram-167';

app.get('/', (req, res) => {
    const price = priceReceiver.getPrice(pokemonSet, pokemonName);
    
    price.then(price => {
        res.send("The price is: $" + price);
    }).catch(err => {
        console.error('Error fetching price:', err);
        res.send("Error fetching price");
    });
});

app.listen(port, () => { 
  console.log(`Example app listening at http://localhost:${port}`);
});

priceReceiver.fetchEbay(pokemonSet, pokemonName)
//console.log(`Price: ${price}`);
