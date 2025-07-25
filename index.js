const express = require('express');
const priceReceiver = require('./pricereceiver.js');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware


const app = express();
const port = 3000;

// const pokemonSet = 'pokemon-journey-together';
// const pokemonName = 'n%27s-reshiram-167';

let SetURLS = {};
const imageCache = {}; // In-memory cache for image links

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.get('/', (req, res) => {
    console.log("Server root accessed");
    res.send("Welcome to the PokeStock API! Use /cardPrice?pokemonSet=<set>&pokemonName=<name> to get card prices.");
});

app.get('/cardPrice', (req, res) => {
    const { pokemonSet, pokemonName } = req.query; // Extract query parameters
    console.log(`Fetching price for set: ${pokemonSet}, card: ${pokemonName}`);

    const price = priceReceiver.getPrice(pokemonSet, pokemonName);

    price.then(price => {
        res.send(price);
    }).catch(err => {
        console.error('Error fetching price:', err);
        res.status(500).send("Error fetching price");
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

    // Check if the card details for the set are already cached
    if (imageCache[name]) {
        console.log(`Using cached card details for set: ${name}`);
        res.json(imageCache[name]); // Return cached card details
        return;
    }

    if (!SetURLS[name]) {
        console.error(`SetName "${name}" not found in SetURLS`);
        res.status(404).send(`Error: SetName "${name}" not found`);
        return;
    }

    const url = SetURLS[name].url;
    const cardDetailsPromise = priceReceiver.getPokemonImages(url);
    console.log("Fetching card details for set: " + name + " from URL: " + url);

    cardDetailsPromise.then(cardDetails => {
        imageCache[name] = cardDetails; // Cache the fetched card details
        res.json(cardDetails); // Return the card details as JSON
    }).catch(err => {
        console.error('Error fetching card details:', err);
        res.status(500).send("Error fetching card details");
    });
});

app.get('/seturls', async (req, res) => {
    SetURLS = await priceReceiver.PopulateSetURLS()
    console.log("loaded SetURLS: ", SetURLS);
});

app.get('/card/:CardId', (req, res) => {
    const cardId = req.params.CardId;
    console.log(`Fetching details for card: ${cardId}`);
    // Mock data for demonstration purposes
    const cardDetails = {
        image: `https://example.com/cards/${cardId}.png`,
        price: Math.random() * 100, // Random price for demonstration
    };
    res.json(cardDetails);
});

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`);
    SetURLS = await priceReceiver.PopulateSetURLS()
    // // Write the JSON to a file
    // fs.writeFileSync('SetURLS.json', JSON.stringify(SetURLS, null, 2), 'utf-8');
    // console.log("SetURLS saved to SetURLS.json");
    console.log("loaded SetURLS: ", SetURLS);
});
