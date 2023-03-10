const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs")

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  b2XVn2: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "bJ48lX",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "abc",
  },
  bJ48lX: {
    id: "bJ48lX",
    email: "user2@example.com",
    password: "123",
  },
};

const getUserByEmail = function(email) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user];
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
  let urlDatabaseForUser = {}
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      urlDatabaseForUser[id] = urlDatabase[id]
    }
  }
  return urlDatabaseForUser
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  console.log(req.session.user_id);
  if(req.session.user_id) {
    const templateVars = { urls: urlDatabase, 
    email: req.session.user_id };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please login or create an account to shorten the URL")
  }
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id) {
    const templateVars = { urls: urlDatabase, 
      email: req.session.user_id};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login')
  }
});

app.post("/urls", (req, res) => {
  console.log(req.session.user_id);
  if(req.session.user_id) {
  const shortId = generateRandomString()
  urlDatabase[shortId] = {longURL: req.body.longURL, userID: req.session.user_id}
  res.redirect('/urls/:' + shortId)
  } else {
    res.send("Please login or create an account to shorten the URL")
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const urlDatabaseForUser = urlsForUser(req.session.user_id);
  if(urlDatabaseForUser[req.params.id] && req.session.user_id) {
    delete urlDatabase[req.params.id]
    res.redirect('/urls')
  } else if(!urlDatabaseForUser[req.params.id]) {
    res.send("This id does not exist")
    } else {
      res.send("Please log in to access this page")
    }
});

app.post("/urls/:id/edit", (req, res) => {
  const urlDatabaseForUser = urlsForUser(req.session.user_id);
  if(urlDatabaseForUser[req.params.id] && req.session.user_id) {
  const templateVars = { id: req.params.id, 
  longURL: urlDatabaseForUser[req.params.id].longURL, 
  email: req.session.user_id};
  res.render("urls_show", templateVars);
  } else if(!urlDatabaseForUser[req.params.id]){
    res.send("This id does not exist");
  } else {
    res.send("Please log in to access this page");
  }
    
});

app.get("/urls/:id", (req, res) => {
  if(req.session.user_id) {
    const urlDatabaseForUser = urlsForUser(req.session.user_id);
    if(urlDatabaseForUser[req.params.id]) {
      const templateVars = { id: req.params.id, 
        longURL: urlDatabaseForUser[req.params.id].longURL, 
        email: req.session.user_id};
        res.render("urls_show", templateVars);
    } else {
      res.send("This url is not owned by you")
    }
  } else {
    res.send("Please login or create an account to shorten the URL")
  }
});

app.post('/urls/:id', (req, res) => {
  const urlDatabaseForUser = urlsForUser(req.session.user_id);
    if(urlDatabaseForUser[req.params.id] && req.session.user_id) {
    const newLongURL = req.body.userInput
    urlDatabase[req.params.id].longURL = newLongURL
    res.redirect("/urls")
    } else if (!urlDatabaseForUser[req.params.id]){
      res.send("This id does not exist")
    } else {
      res.send("Please log in to access this page")
    }
});

app.get("/u/:id", (req, res) => {
  if(urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL
    res.redirect(longURL);
  } else {
    res.send("This short URL does not exist, please try again.")
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// USER REGISTRATION CODE BELOW

app.get('/login', (req, res) => {
  if(!req.session.user_id) {
    const templateLogin = {email: req.params.email, password: req.params.password, user_id: req.body['user_id']}
    res.render('login', templateLogin)
  } else {
    res.redirect('/urls')
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let userObject = getUserByEmail(email);
  const hashedPassword = bcrypt.hashSync(password, 10);
    if(userObject) {
      if(!bcrypt.compareSync(userObject.password, hashedPassword)) return res.status(403).send('Password does not match');
    } else {
      return res.status(403).send('User registration is not found')
    }
  req.session.user_id = userObject.id;
  res.redirect ('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
});


app.get("/register", (req, res) => {
  if(!req.session.user_id) {
  const templateRegistration = {email: req.params.email, password: req.params.password, user_id: req.body['user_id'] }
  res.render("register", templateRegistration)
  } else {
  res.redirect('/urls')
  }
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const templateRegistration = {id: randomUserID, email: req.body.email, password: hashedPassword}
  if(templateRegistration.email === '' || templateRegistration.password === '' || getUserByEmail(templateRegistration.email)) {
    res.status(400).send("Please try again!")
  } else {
    users.user3RandomID = templateRegistration;
    req.session.user_id = templateRegistration.email
    res.redirect('/urls')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
