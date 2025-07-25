
const express = require('express');
const priceReceiver = require('./pricereceiver.js'); 

const app = express();
const port = 3000;

const pokemonSet = 'pokemon-journey-together';
const pokemonName = 'n%27s-zekrom';

let SetURLS = {};

app.get('/', (req, res) => {
    const price = priceReceiver.getPrice(pokemonSet, pokemonName);
    
    price.then(price => {
        res.send("The price is: $" + price);
    }).catch(err => {
        console.error('Error fetching price:', err);
        res.send("Error fetching price");
    });
});

app.get('/images', (req, res) => {

    let msg = "";
    // priceReceiver.SetURLS.map((value, key) => {
    //     msg += `${key}: ${value}\n`;
    // });

    for (const [key, value] of Object.entries(SetURLS)) {
        msg += `${key}: ${value} </br>`;
    }

    console.log(msg);

    res.send(msg);

});

app.get('/give/:SetName', (req, res) => {
    const name = req.params.SetName.replace(/-/g, ' ').toLowerCase();
    const url = SetURLS[name];
    const imageLinks = priceReceiver.getPokemonImages(url);

    imageLinks.then(images => {
        let msg = "";
        for (const image of images) {
            msg += `<img src="${image}" alt="Pokemon Image" /> </br>`;
        }
        res.send(msg);
    }).catch(err => {
        console.error('Error fetching images:', err);
        res.send("Error fetching images");
    });
});

app.listen(port, async () => { 
  console.log(`Example app listening at http://localhost:${port}`);
  SetURLS = await priceReceiver.PopulateSetURLS()
  console.log("loaded SetURLS: ", SetURLS);
});
