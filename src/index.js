require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const ussdRouter = require('./views/ussdRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet());

app.use((req, res, next) => {
    //console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.status(200).send('USSD Server is UP and Running!');
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/ussd', ussdRouter);
app.use((req, res) => {
    //console.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).send(`Cannot ${req.method} ${req.url} - Check your endpoint configuration.`);
});

app.listen(PORT, () => {
    //console.log(`USSD Server is running on port ${PORT}`);
});
