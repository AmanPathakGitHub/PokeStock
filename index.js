const express = require('express');
const priceReceiver = require('./pricereceiver.js');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'pokecollection',
    password: 'postgres',
    port: 5432,
});

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
    console.log(`Fetching card details for set: ${name}`);

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

// Endpoint to add or update card data
app.post('/updateCollection', async (req, res) => {
    const {
        userId,
        setName,
        cardName,
        cardNumber,
        basePrice,
        reversePrice,
        pokeBallPrice,
        masterBallPrice,
        baseQuantity,
        reverseQuantity,
        pokeBallQuantity,
        masterBallQuantity,
    } = req.body;

    console.log(`\nUpdating collection for user ID: ${userId}, set: ${setName}, card: ${cardName}, number: ${cardNumber}`);

    try {
        const query = `
            INSERT INTO card_collection (user_id, set_name, card_name, card_number, base_price, reverse_price, poke_ball_price, master_ball_price, base_quantity, reverse_quantity, poke_ball_quantity, master_ball_quantity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (user_id, set_name, card_name, card_number)
            DO UPDATE SET
                base_price = $5,
                reverse_price = $6,
                poke_ball_price = $7,
                master_ball_price = $8,
                base_quantity = $9,
                reverse_quantity = $10,
                poke_ball_quantity = $11,
                master_ball_quantity = $12;
        `;
        const values = [
            userId,
            setName,
            cardName,
            cardNumber,
            basePrice,
            reversePrice,
            pokeBallPrice,
            masterBallPrice,
            baseQuantity,
            reverseQuantity,
            pokeBallQuantity,
            masterBallQuantity,
        ];

        await pool.query(query, values);
        res.status(200).send('Collection updated successfully');
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).send('Error updating collection');
    }
});

app.get('/getCollection/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log(`Fetching collection for user ID: ${userId}`);
    try {
        const query = 'SELECT * FROM card_collection WHERE user_id = $1';
        const values = [userId];
        const result = await pool.query(query, values);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).send('Error fetching collection');
    }
});

app.get('/getCard', async (req, res) => {
    const { setName, cardId } = req.query;
    console.log(`\nFetching card details for set: ${setName}, card ID: ${cardId}\n`);

    try {
        const query = `SELECT * FROM card_collection WHERE set_name = $1 AND card_number = $2`;
        const values = [setName, cardId];
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).send('Card not found');
        }
    } catch (error) {
        console.error('Error fetching card details:', error);
        res.status(500).send('Error fetching card details');
    }
});

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`);
    SetURLS = await priceReceiver.PopulateSetURLS()
    // // Write the JSON to a file
    // fs.writeFileSync('SetURLS.json', JSON.stringify(SetURLS, null, 2), 'utf-8');
    // console.log("SetURLS saved to SetURLS.json");
    console.log("loaded SetURLS: ", SetURLS);
});
