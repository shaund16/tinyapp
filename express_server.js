const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

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

//function lookUp
const lookUp = (email) => {
  for (const user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//filter url database for urls for users
const urlsForUser = function(userID, database) {
  let userURLs = {};
  for (const url in database) {
    if (database[url].userID === userID) {
      userURLs[url] = database[url].longURL;
    }
  }
  return userURLs;
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



/*****  GETS  ******/

//home page
app.get('/', (req, res) => {
  res.send("Hello!");
});

//url pages
app.get('/urls', (req, res) => {
  if (!req.session.userID) {
    return res.redirect('/Login');
  }
  const urls = urlsForUser(req.session.userID, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[req.session.userID]
  };
  res.render('urls_index', templateVars);
});

//create new URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  res.render('urls_new', templateVars);
});

//page with longURL and ShortURL
app.get('/urls/:shortURL', (req, res) => {
  const loggedInUser = req.session.userID;
  const databaseObj = urlDatabase[req.params.shortURL];
 
  if (!databaseObj) {
    res.status(404).send('Short Url not present!');
    return;
  }
  if (loggedInUser !== databaseObj.userID) {
    res.status(401).send('You are not authorized!');
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
  //if i have a cookie
  //short url not one of mine response with status code
  if (!databaseObj) {
    res.status(401).send('Short Url not present!');
    return;
  }
  if (loggedInUser !== databaseObj.userID) {
    res.status(401).send('You are not authorized!');
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
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//username login route
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userObject = lookUp(userEmail);
  if (lookUp(userEmail)) {
    if (bcrypt.compareSync(req.body.password, userObject.password)) {
      req.session.userID = userObject.id;
      res.redirect('/urls');
    } else {
      res.status(403).send('User Password doesnt match');
    }
  } else {
    res.status(403).send('Email Not Found');
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
  } else if (lookUp(userEmail)) {
    return res.status(400).send('This email is already in use');
  }
  users[userID] = {
    id: userID,
    email: userEmail,
    password: userPassword
  };
  //send back response with the 400 status code
  req.session.userID = userID;
  res.redirect('/urls');
});
 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
