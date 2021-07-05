const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;


const generateRandomString = () => {
  let result = '';
  let randomString =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  let randomStringLength = randomString.length;
  
  for (let i = 0; i < 6; i++) {
    result += randomString[Math.floor(Math.random() * randomStringLength)];
  }
  return result;
};




app.use(bodyParser.urlencoded({extended: true}));

//ejs as the view engine
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/hello', (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

