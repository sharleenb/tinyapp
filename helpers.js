const express_server = require('./express_server');
const {urlDatabase, users} = require('./database');

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
      break;
    }
  }
  return null;
};
const generateRandomString = function() {
  let i = 0;
  let id = '';
  while (i < 6) {
    id += Math.random().toString(36).slice(2, 3);
    i++;
  }
  return id;
};

const urlsForUser = function(userID) {
  let urlDatabaseForUser = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      urlDatabaseForUser[id] = urlDatabase[id];
    }
  }
  return urlDatabaseForUser;
};
module.exports = {getUserByEmail, generateRandomString, urlsForUser };