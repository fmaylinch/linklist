require('dotenv').config();
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cheerio = require('cheerio');

const uri = process.env.MONGO_URL;
const dbName = "linklist";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function listItems() {
    try {
        console.log("Connecting to Mongodb");
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('items');

        console.log("Searching items");
        const cursor = collection.find({url: /imdb/}, {limit: 1});

        console.log("Processing items");
        for await (let doc of cursor) {
            const searchTitle = doc.title.replace(/[^\w\s]/g, '').replace(/\s+/g, '+');
            const searchUrl = `https://letterboxd.com/search/films/${searchTitle}`;
            console.log(`searchUrl: ${searchUrl}`);

            const link = await fetchAndExtractUrl(searchUrl)
            console.log(`Found link: ${link}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

async function fetchAndExtractUrl(targetUrl) {
    try {
        // Fetch the HTML content from the URL
        const response = await axios.get(targetUrl);
        const html = response.data;

        // Load the HTML into cheerio
        const $ = cheerio.load(html);

        // TODO: doesn't find the results because they're loaded async on the website
        const firstAnchor = $('ul.results li a').first();

        // Get the URL from the "a" tag's href attribute
        const extractedUrl = firstAnchor.attr('href');

        if (extractedUrl) {
            return extractedUrl;
        } else {
            console.log('No link found matching the CSS selector.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching the URL:', error);
        throw error;
    }
}

listItems();
