# PokeStock Backend

## Overview
The PokeStock backend is a Node.js application that provides APIs for managing and fetching data related to Pokémon card collections. It integrates with a PostgreSQL database and uses Puppeteer for web scraping to fetch card prices from external sources.

## Features
- Fetch Pokémon card prices from external sources (e.g., PriceCharting, eBay).
- Manage user card collections in a PostgreSQL database.
- Provide APIs for fetching and updating card data.
- Cache images and set URLs for efficient data retrieval.

## Prerequisites
- Node.js (v18 or later)
- PostgreSQL database
- Docker (optional, for running PostgreSQL in a container)

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PokeStock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the PostgreSQL database:
   - If using Docker, start the database with:
     ```bash
     docker-compose up -d
     ```
   - Ensure the database credentials match the configuration in `index.js`:
     ```javascript
     const pool = new Pool({
         user: 'postgres',
         host: 'localhost',
         database: 'pokecollection',
         password: 'postgres',
         port: 5432,
     });
     ```

4. Start the server:
   ```bash
   npm dev
   ```

## API Endpoints

### Root Endpoint
- **`GET /`**
  - Returns a welcome message and basic usage instructions.

### Card Price
- **`GET /cardPrice`**
  - Fetches the price of a specific Pokémon card.
  - **Query Parameters:**
    - `pokemonSet`: The set name of the card.
    - `pokemonName`: The name of the card.

### Card Images
- **`GET /images`**
  - Returns cached set URLs and images.

### Card Details by Set
- **`GET /give/:SetName`**
  - Fetches card details for a specific set.
  - **Path Parameter:**
    - `SetName`: The name of the set.

### Set URLs
- **`GET /seturls`**
  - Populates and returns set URLs.

### Card Details by ID
- **`GET /card/:CardId`**
  - Fetches details for a specific card.
  - **Path Parameter:**
    - `CardId`: The ID of the card.

### Update Collection
- **`POST /updateCollection`**
  - Adds or updates card data in the user's collection.
  - **Request Body:**
    ```json
    {
      "userId": "user123",
      "setName": "set-name",
      "cardName": "card-name",
      "cardNumber": "card-number",
      "basePrice": 10.0,
      "reversePrice": 12.0,
      "pokeBallPrice": 15.0,
      "masterBallPrice": 20.0,
      "baseQuantity": 1,
      "reverseQuantity": 2,
      "pokeBallQuantity": 3,
      "masterBallQuantity": 4
    }
    ```

### Get User Collection
- **`GET /getCollection/:userId`**
  - Fetches the card collection for a specific user.
  - **Path Parameter:**
    - `userId`: The ID of the user.

### Get Card Details
- **`GET /getCard`**
  - Fetches details for a specific card in a set.
  - **Query Parameters:**
    - `setName`: The name of the set.
    - `cardId`: The ID of the card.

## Environment Variables
- `EXPO_PUBLIC_API_BASE_URL`: Base URL for the API (used in the frontend).

## License
This project is licensed under the MIT License.
