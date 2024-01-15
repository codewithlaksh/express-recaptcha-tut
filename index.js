const express = require('express');
const path = require('path');
const axios = require('axios').default;
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use(session({
    secret: 'my secret', // Please do not hard code secret instead read from an .env file
    saveUninitialized: true,
    resave: false
}))

app.use((req, res, next) => {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    } else {
        res.locals.message = null;
    }
    next();
})

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Express reCAPTCHA Validation'
    })
})

app.post('/validate', (req, res) => {
    const captchaResponse = req.body["g-recaptcha-response"];
    console.log(process.env.RECAPTCHA_SECRET_KEY)
    const captchaData = {
        'secret': process.env.RECAPTCHA_SECRET_KEY,
        'response': captchaResponse
    }
    axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${captchaData.secret}&response=${captchaData.response}`)
    .then(response => {
        const success = response.data['success'];

        if (success) {
            req.session.message = {
                type: 'Success',
                class: 'success',
                message: 'Captcha verified!'
            }
            res.redirect('/');
        } else {
            req.session.message = {
                type: 'Error',
                class: 'danger',
                message: 'Invalid captcha!'
            }
            res.redirect('/');
        }
    })
})

app.listen(8080, () => {
    console.log(`Server app started on port 8080`);
})
