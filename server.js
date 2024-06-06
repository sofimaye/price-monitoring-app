const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to disable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Setting this to an empty string effectively disables CORS
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.use(bodyParser.json());

client.connect().then(mongo => {
    console.log('Connected to MongoDB');
    const db = mongo.db('monitoring-app');
    const usersCollection = db.collection('users');
    const productsCollection = db.collection('products');

    const authenticateToken = (req, res, next) => {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
        const token = authHeader.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Token missing or malformed' });

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token is not valid' });
            req.user = user;
            next();
        });
    };

    app.post('/api/register', async (req, res) => {
        const { email, password } = req.body;

        if (password.length < 5 || password.length > 10) {
            return res.status(400).json({ message: 'Password must be between 5 and 10 characters long' });
        }

        try {
            const userExists = await usersCollection.findOne({ email });
            if (userExists) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { email, password: hashedPassword };
            await usersCollection.insertOne(newUser);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error });
        }
    });

    app.post('/api/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            console.log(`Login attempt: email = ${email}, password = ${password}`);
            const user = await usersCollection.findOne({ email });
            if (!user) {
                console.log('User not found');
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in', error });
        }
    });

    app.post('/api/add-product', authenticateToken, async (req, res) => {
        const { url } = req.body;
        try {
            const productInfo = await fetchProductInfo(url); // Assuming fetchProductInfo is implemented
            if (productInfo) {
                const newProduct = { user_id: req.user.userId, url, current_price: productInfo.price, product_name: productInfo.productName, last_checked: new Date() };
                await productsCollection.insertOne(newProduct);
                res.status(201).json(newProduct);
            } else {
                res.status(500).json({ message: 'Error fetching product info' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error adding product', error });
        }
    });

    app.get('/api/products', authenticateToken, async (req, res) => {
        try {
            const products = await productsCollection.find({ user_id: req.user.userId }).toArray();
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    });

    app.delete('/api/delete-product/:id', authenticateToken, async (req, res) => {
        try {
            await productsCollection.deleteOne({ _id: new ObjectId(req.params.id), user_id: req.user.userId });
            res.status(200).json({ message: 'Product deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product', error });
        }
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
