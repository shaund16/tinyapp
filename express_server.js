const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

//cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['purslow']
}));

app.use(bodyParser.urlencoded({extended: true}));

//url Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "2@example.com",
    password: bcrypt.hashSync("1234", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//ejs as the view engine
app.set('view engine', 'ejs');

/*****  GETS  ******/

// home page /
app.get('/', (req, res) => {
  if (!req.session.userID) {
    return res.redirect('/Login');
  } else {
    return res.redirect('/urls');
  }
});

//url pages /urls
app.get('/urls', (req, res) => {
  if (!req.session.userID) {
    res.status(401).send('<h1>401 - You are not authorized!</h1>');
  }
  const urls = urlsForUser(req.session.userID, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[req.session.userID]
  };
  res.render('urls_index', templateVars);
});

//create new URL /urls/new
app.get('/urls/new', (req, res) => {
  if (!req.session.userID) {
    return res.redirect('/Login');
  }
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render('urls_new', templateVars);
});

//page with shorturl edit
app.get('/urls/:shortURL', (req, res) => {
  const loggedInUser = req.session.userID;
  const databaseObj = urlDatabase[req.params.shortURL];
  
  if (!databaseObj) {
    res.status(404).send('<h1>404 - Short URL does not exist!</h1>');
    return;
  }
  if (loggedInUser !== databaseObj.userID) {
    res.status(401).send('Error ! You are not authorized!');
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userID]
  };
  console.log('urlDatabase', urlDatabase);
  res.render('urls_show', templateVars);
});

//link to longURL page (website)
app.get('/u/:shortURL', (req, res) => {
  const dataObj = urlDatabase[req.params.shortURL];
  if (!dataObj) {
    res.status(404).send('Short Url not present');
  }
  res.redirect(dataObj.longURL);
});

//registration page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.userID]
  };
  if (users[req.session.userID]) {
    return res.redirect('/urls');
  } else {
    return res.render('registration', templateVars);
  }
});

//login page
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.userID]
  };
  res.render('login', templateVars);
});

/*****  POSTS  ******/

//post new URL from form
app.post('/urls', (req, res) => {
  const loggedInUser = req.session.userID;
  //check the cookie
  if (!loggedInUser) {
    res.status(401).send('You must be logged in to create URL');
    return;
  }
  //generates 6 char string
  const shortUrlString = generateRandomString();
  //set key of 6 string to the longURL
  urlDatabase[shortUrlString] = { longURL: req.body.longURL, userID: req.session.userID };
  //redirects url with a new 6 string
  res.redirect(`urls/${shortUrlString}`);
});

//delete the URL resource
app.post('/urls/:shortURL/delete', (req, res) => {
  const loggedInUser = req.session.userID;
  const databaseObj = urlDatabase[req.params.shortURL];
  if (!databaseObj) {
    res.status(401).send('Short Url not present!');
    return;
  }
  if (loggedInUser !== databaseObj.userID) {
    res.status(403).send('You are not authorized!');
    return;
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//route that updates a URL resource
app.post('/urls/:id', (req, res) => {
  const loggedInUser = req.session.userID;
  if (!loggedInUser) {
    res.status(401).send("You must be logged in to gain access");
  }
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

//username login route
app.post('/login', (req, res) => {
  const userEmail = getUserByEmail(req.body.email, users);
  const loginUser = users[userEmail];
  if (loginUser) {
    if (bcrypt.compareSync(req.body.password, loginUser.password)) {
      req.session.userID = loginUser.id;
      res.redirect('/urls');
    } else {
      res.status(401).send('Error! Password doesnt match');
    }
  } else {
    res.status(401).send('Email Not Found');
  }
});

///username logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//create a registration handler
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = bcrypt.hashSync(req.body.password, 10);
  //if email or password are empty
  if (!userEmail || !userPassword) {
  //send back response with 400 status code
    return res.status(400).send('Please enter valid email and password!');
  //if someone tries to register with email that already in user object
  }  else if (getUserByEmail(userEmail, users)) {
    //send back response with the 400 status code
    return res.status(400).send('This email is already in use');
  } else {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPassword
    };
    req.session.userID = userID;
    res.redirect('/urls');
  }
});
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
