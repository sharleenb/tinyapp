const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "abc",
  },
  user2RandomID: {
    id: "user2RandomID",
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, 
  email: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, 
    email: req.cookies['user_id'] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortId = generateRandomString()
  urlDatabase[shortId] = req.body.longURL
  res.redirect('/urls/:' + shortId)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
});

app.post("/urls/:id/edit", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email: req.cookies['user_id'] };
  res.render("urls_show", templateVars)
});

app.post('/urls/:id', (req, res) => {
  const newLongURL = req.body.userInput
  urlDatabase[req.params.id] = newLongURL
  res.redirect("/urls")
});

app.post('/login', (req, res) => {
  const { email, password } = req.body
  let userObject = getUserByEmail(email)
    if(userObject) {
      if(userObject.password !== password) return res.status(403).send('Password does not match');
    } else {
      return res.status(403).send('User registration is not found')
    }
  res.cookie('user_id', userObject.id);
  res.redirect ('/urls');
});

app.post('/logout', (req, res) => {
  res
  .clearCookie('user_id')
  .redirect('/login')
});

app.get('/login', (req, res) => {
  const templateLogin = {email: req.params.email, password: req.params.password, user_id: req.body['user_id']}
  res.render('login', templateLogin)
});

app.get("/register", (req, res) => {
  const templateRegistration = {email: req.params.email, password: req.params.password, user_id: req.body['user_id'] }
  res.render("register", templateRegistration)
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const templateRegistration = {id: randomUserID, email: req.body.email, password: req.body.password}
  if(templateRegistration.email === '' || templateRegistration.password === '' || getUserByEmail(templateRegistration.email)) {
    res.status(400).send("Please try again!")
  } else {
    users.user3RandomID = templateRegistration;
    console.log(users);
    res
    .cookie('user_id', templateRegistration.email)
    .redirect('/urls')
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], email: req.cookies['user_id']};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
