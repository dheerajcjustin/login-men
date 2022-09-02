const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const filestore = require("session-file-store")(session);
const cookieparser = require("cookie-parser");
const app = express();
let meg = "";

app.use(
  session({
    name: "session-1",
    secret: "thisIsOurSecret",
    saveUninitialized: false,
    resave: true,
    store: new filestore(),
  })
);
const exp = app.use(cookieparser());

const user = {
  name: "sasi kuttan",
  email: "sasi@gmail.com",
  password: "pass1234",
};

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

const auth = (req, res, next) => {
  if (!req.cookies.username) {
    let err = new Error("You are not authenticated");
    res.setHeader("WWW-Authenticate", "Basic");
    err.status = 401;
    res.redirect("/login");
    next(err);
  }
  next();
};

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("pages/login", { message: meg });
  }
});

app.use("/login", (req, res) => {
  const { mail, password } = req.body;

  if (mail === user.email && password === user.password) {
    meg = "";
    req.session.user = mail;
    res.cookie("username", mail, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
    });

    console.log("its working cookins are saved");
    console.log(req.cookies.username);
    console.log("this is used to identify the above code ");
    req.session.name = user.name;

    res.redirect("/");
  } else {
    meg = "invalid";
    res.render("pages/login", { message: meg });
    meg = "";
  }
});

app.use(auth);

app.get("/", (req, res) => {
  if (req.session.user || req.cookies.username) {
    res.render("pages/index", { username: req.cookies.username });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.clearCookie("username");
    res.redirect("/login");
  });
});

app.listen(5000, () => {
  console.log("The server is listening...❤️💕");
});
