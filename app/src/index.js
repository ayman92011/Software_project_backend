const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const ClassWrappers = require("./ClassWrappers");
const user_queries = require("./user_queries");

// Defining the Express app
const app = express();
// Adding Helmet to enhance your Rest API's security
app.use(helmet());
// Using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// Enabling CORS for all requests
app.use(cors());
// Adding morgan to log HTTP requests
app.use(morgan("combined"));

// Defining the endpoint to return the user
app.get("/get_person", (req, res) => {
  if (
    req.query["username"] == undefined ||
    req.query["password"] == undefined
  ) {
    res.send("you haven't entered all the fields");
    return;
  }
  let myuser = new ClassWrappers.User(
    req.query["username"],
    "",
    req.query["password"]
  );
  user_queries.get_person(myuser, res);
});

// Defining the endpoint to add the user
app.get("/add_user", (req, res) => {
  myUser = new ClassWrappers.User(
    req.query["username"],
    req.query["email"],
    req.query["password"],
    req.query["gender"] == undefined ? "" : req.query["gender"],
    req.query["birthday"] == undefined ? "" : req.query["birthday"],
    req.query["picture"] == undefined ? "" : req.query["picture"],
    req.query["first_name"] == undefined ? "" : req.query["first_name"],
    req.query["last_name"] == undefined ? "" : req.query["last_name"]
  );
  Phones = new ClassWrappers.Phone(req.query["phones"], req.query["username"]);
  user_queries.add_user(myUser, Phones, res);
});

// Defining the endpoint for the remove user
app.get("/remove_user", (req, res) => {
  myUser = new ClassWrappers.User(req.query["username"], "", "");
  user_queries.remove_user(myUser, res);
});

// Defining the endpoint for the edit user
app.get("/edit_user", (req, res) => {
  myUser = new ClassWrappers.User(req.query["old_username"], "", "");
  newPhones = new ClassWrappers.Phone(
    req.query["new_phones"],
    req.query["old_username"]
  );
  newUser = new ClassWrappers.User(
    req.query["new_username"] == undefined ? "" : req.query["new_username"],
    req.query["new_email"] == undefined ? "" : req.query["new_email"],
    req.query["new_password"] == undefined ? "" : req.query["new_password"],
    req.query["new_gender"] == undefined ? "" : req.query["new_gender"],
    req.query["new_birthday"] == undefined ? "" : req.query["new_birthday"],
    req.query["new_picture"] == undefined ? "" : req.query["new_picture"],
    req.query["new_first_name"] == undefined ? "" : req.query["new_first_name"],
    req.query["new_last_name"] == undefined ? "" : req.query["new_last_name"]
  );
  user_queries.edit_user(myUser, newUser, newPhones, res);
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});
