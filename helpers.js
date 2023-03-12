const express_server = require('./express_server')

const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
      break;
    }
  }
  return null;
};

module.exports = {getUserByEmail}