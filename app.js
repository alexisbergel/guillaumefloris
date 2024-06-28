const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();

const cookieParser = require('cookie-parser');

app.use(cors({
    origin: 'https://guillaumefloris.com',
    optionsSuccessStatus: 200,
}));

const router = require('./routers');



app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

app.use(router);
app.listen(3000);



// Better Comments
//* Important
//! C'est mort
//? Qu'est-ce qu'on fait là ?
// TODO : non laisse tomber
//// YO LA FAMILLE