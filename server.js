require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fetchProductInfo = require('./fetchProductInfo');

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;

const client = new MongoClient(mongoUri);

async function main() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('monitoring-app');
        const productsCollection = db.collection('products');

        // Middleware
        app.use(bodyParser.json());

        // Email Service
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const sendNotificationEmail = (to, subject, text) => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: to,
                subject: subject,
                text: text
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        };

        // Function to check all products and send email notifications if price changes
        const checkAndNotifyPriceChange = async () => {
            const products = await productsCollection.find({}).toArray();
            const changedProducts = [];

            for (const product of products) {
                const productInfo = await fetchProductInfo(product.url);
                console.log(`Checking product: ${product.url}`);
                console.log(`Fetched price: ${productInfo ? productInfo.price : 'Error fetching product info'}`);
                console.log(`Current price in DB: ${product.current_price}`);

                if (productInfo && productInfo.price !== product.current_price) {
                    await productsCollection.updateOne(
                        { _id: product._id },
                        {
                            $set: {
                                current_price: productInfo.price,
                                last_checked: new Date()
                            }
                        }
                    );
                    sendNotificationEmail(
                        product.user_email,
                        'Price Change Alert',
                        `The price of the product ${productInfo.productName} at ${product.url} has changed from ${product.current_price} to ${productInfo.price}.`
                    );
                    changedProducts.push({
                        productName: productInfo.productName,
                        oldPrice: product.current_price,
                        newPrice: productInfo.price,
                        url: product.url
                    });
                }
            }

            return changedProducts;
        };

        // Schedule the function to run periodically (e.g., every hour)
        setInterval(checkAndNotifyPriceChange, 3600000); // 1 hour = 3600000 milliseconds

        // Routes
        app.get('/', (req, res) => {
            res.send('Welcome to the Price Monitoring App!');
        });

        app.post('/api/add-product', async (req, res) => {
            const { user_email, url } = req.body;
            try {
                const productInfo = await fetchProductInfo(url);
                if (productInfo) {
                    const newProduct = { user_email, url, current_price: productInfo.price, product_name: productInfo.productName, last_checked: new Date() };
                    await productsCollection.insertOne(newProduct);
                    res.status(201).json(newProduct);
                } else {
                    res.status(500).json({ message: 'Error fetching product info' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Error adding product', error });
            }
        });

        app.delete('/api/delete-product/:id', async (req, res) => {
            try {
                await productsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
                res.status(200).json({ message: 'Product deleted' });
            } catch (error) {
                res.status(500).json({ message: 'Error deleting product', error });
            }
        });

        app.get('/api/products', async (req, res) => {
            try {
                const products = await productsCollection.find({}).toArray();
                res.status(200).json(products);
            } catch (error) {
                res.status(500).json({ message: 'Error fetching products', error });
            }
        });

        app.get('/api/check-prices', async (req, res) => {
            try {
                const changedProducts = await checkAndNotifyPriceChange();
                res.status(200).json({ message: 'Price check completed.', changedProducts });
            } catch (error) {
                res.status(500).json({ message: 'Error checking prices', error });
            }
        });

        // Start the server
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(err);
    }
}

main().catch(console.error);
