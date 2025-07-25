const express = require('express');
const priceReceiver = require('./pricereceiver.js');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware


const app = express();
const port = 3000;

const pokemonSet = 'pokemon-journey-together';
const pokemonName = 'n%27s-reshiram-167';

let SetURLS = {};
const imageCache = {}; // In-memory cache for image links

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

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

    // let msg = "";

    // for (const [key, value] of Object.entries(SetURLS)) {
    //     msg += `${key}: ${value}`;
    // }

    // console.log(msg);

    res.send(SetURLS);

});

app.get('/give/:SetName', (req, res) => {
    const name = req.params.SetName.replace(/-/g, ' ').toLowerCase();

    // Check if the images for the set are already cached
    if (imageCache[name]) {
        console.log(`Using cached images for set: ${name}`);
        res.send(imageCache[name].join(' ')); // Return cached images
        return;
    }

    if (!SetURLS[name]) {
        console.error(`SetName "${name}" not found in SetURLS`);
        res.status(404).send(`Error: SetName "${name}" not found`);
        return;
    }

    const url = SetURLS[name].url;
    const imageLinks = priceReceiver.getPokemonImages(url);
    console.log("Fetching images for set: " + name + " from URL: " + url);

    imageLinks.then(images => {
        imageCache[name] = images; // Cache the fetched images
        let msg = images.join(' '); // Concatenate image URLs into a single string
        res.send(msg);
    }).catch(err => {
        console.error('Error fetching images:', err);
        res.status(500).send("Error fetching images");
    });
});

app.get('/seturls', async (req, res) => {
    SetURLS = await priceReceiver.PopulateSetURLS()
    console.log("loaded SetURLS: ", SetURLS);
});

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`);
    SetURLS = await priceReceiver.PopulateSetURLS()
    // // Write the JSON to a file
    // fs.writeFileSync('SetURLS.json', JSON.stringify(SetURLS, null, 2), 'utf-8');
    // console.log("SetURLS saved to SetURLS.json");
    console.log("loaded SetURLS: ", SetURLS);
});
