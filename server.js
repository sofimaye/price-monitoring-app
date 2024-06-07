const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fetchProductInfo = require('./fetchProductInfo');

dotenv.config();
console.log('Email user:', process.env.EMAIL_USER);
console.log('Email pass:', process.env.EMAIL_PASS);

const app = express();
const PORT = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;
const client = new MongoClient(mongoUri);

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

client.connect().then(mongo => {
    console.log('Connected to MongoDB');
    const db = mongo.db('monitoring-app');
    const usersCollection = db.collection('users');
    const productsCollection = db.collection('products');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const sendConfirmationEmail = async (to, productInfo) => {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Subscription Confirmation',
            text: `You have successfully subscribed to monitor the price of ${productInfo.productName} 
            at ${productInfo.url}. Current price is ${productInfo.price} грн.`,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);

        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    };

    const authenticateToken = (req, res, next) => {
        const authHeader = req.header('Authorization');
        if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
        const token = authHeader.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'Token missing or malformed' });

        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) return res.status(403).json({ message: 'Token is not valid' });

            const dbUser = await usersCollection.findOne({ _id: new ObjectId(user.userId) });
            if (!dbUser) return res.status(404).json({ message: 'User not found' });

            req.user = { ...user, email: dbUser.email };
            next();
        });
    };

    app.get('/', (req, res) => {
        res.send('Welcome to the Price Monitoring App API');
    });

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

            const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in', error });
        }
    });

    app.post('/api/add-product', authenticateToken, async (req, res) => {
        const { url } = req.body;
        try {
            const productInfo = await fetchProductInfo(url);
            if (productInfo) {
                const newProduct = { user_id: req.user.userId, url, current_price: productInfo.price, product_name: productInfo.productName, last_checked: new Date() };
                await productsCollection.insertOne(newProduct);
                console.log('Product added:', newProduct);

                await sendConfirmationEmail(req.user.email, productInfo);
                res.status(201).json(newProduct);
            } else {
                res.status(500).json({ message: 'Error fetching product info' });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ message: 'Error adding product', error });
        }
    });

    app.get('/api/products', authenticateToken, async (req, res) => {
        try {
            console.log('Authenticated user:', req.user);
            const products = await productsCollection.find({ user_id: req.user.userId }).toArray();
            console.log('Fetched products for user', req.user.userId, products);
            res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
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
