const axios = require('axios');
const cheerio = require('cheerio');

const fetchProductInfo = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let priceString;
        let price;

        // Check if there's an old price (indicating a discount)
        const oldPriceElement = $('.old-price .price').first();
        const specialPriceElement = $('.special-price .price').first();

        if (oldPriceElement.length && specialPriceElement.length) {
            // If both old price and special price exist, use the special price
            priceString = specialPriceElement.text();
        } else if (specialPriceElement.length) {
            // If only special price exists
            priceString = specialPriceElement.text();
        } else {
            // If only old price exists
            priceString = $('.price-box .price').first().text();
        }

        // Debug: Log the raw price string
        console.log(`Raw price string: ${priceString}`);

        // Extract the price from the string
        price = parseFloat(priceString.replace(/\s/g, '').replace('грн', '').replace(/\D/g, '').trim());

        // Debug: Log the parsed price
        console.log(`Parsed price: ${price}`);

        // Extract product name using the correct selector
        const brand = $('span.h1-brand').text().trim();
        const name = $('span.h1-name').text().trim();
        const productName = `${brand} ${name}`;

        console.log(`Fetched price: ${price}, product name: ${productName}`);

        return { price, productName };
    } catch (error) {
        console.error('Error fetching or parsing product info:', error);
        return null;
    }
};

module.exports = fetchProductInfo;
