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

//function lookUp check email
const getUserByEmail = function(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return userId;
    }
  }
  return undefined;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};