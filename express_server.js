const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


//url Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};


//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//function loopUp
const lookUp = (email) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
};

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




//ejs as the view engine
app.set('view engine', 'ejs');


//home page
app.get('/', (req, res) => {
  res.send("Hello!");
});

//url pages
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userID]
  };
  res.render('urls_index', templateVars);
});

//create new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID],
  };
  res.render('urls_new', templateVars);
});

//page with longURL and ShortURL
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.userID]
  };
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

//username login route
app.post('/login', (req, res) => {
  res.cookie('userID', req.body.username);
  console.log(req.body.username);
  res.redirect('/urls');
});

///username logout route
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

//registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID]
  };
  if (req.cookies.userID) {
    res.redirect('/urls');
  }
  res.render('registration', templateVars);
});

//create a registration handler
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  //if email or password are empty
  if (!userEmail || !userPassword) {
  //send back response with 400 status code
    res.status(400).send('Please enter valid email and password!');
  //if someone tries to register with email that already in user object
  } else if (lookUp(userEmail)) {
    res.status(400).send('This email is already in use');
  }
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  //send back response with the 400 status code
  res.cookie('userID', userID).redirect('/urls');
});
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

