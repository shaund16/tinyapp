const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;

//random 6 string
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
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));

//ejs as the view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//home page
app.get('/', (req, res) => {
  res.send("Hello!");
});

//url pages
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//create new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//page with longURL and ShortURL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

//post new URL from form
app.post('/urls', (req, res) => {
  //generates 6 char string
  const shortUrlString = generateRandomString();
  //set key of 6 string to the longURL
  urlDatabase[shortUrlString] = req.body.longURL;
  //redirects url with a new 6 string
  res.redirect(`urls/${shortUrlString}`);
});

//link to longURL page (website)
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//delete the URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//route that updates a URL resource
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

