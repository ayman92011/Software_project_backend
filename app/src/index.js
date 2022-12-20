const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const ClassWrappers = require("./ClassWrappers");
const user_queries = require("./user_queries");

// defining the Express app
const app = express();
// adding Helmet to enhance your Rest API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(cors());
// adding morgan to log HTTP requests
app.use(morgan("combined"));

// defining the endpoint to return the user
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

// defining the endpoint to add the user
app.get("/add_user", (req, res) => {
  myUser = new ClassWrappers.User(
    req.query["username"],
    req.query["email"],
    req.query["password"],
    req.query["gender"],
    req.query["birthday"],
    req.query["picture"],
    req.query["first_name"],
    req.query["last_name"]
  );
  Phones = new ClassWrappers.Phone(req.query["phones"], req.query["username"]);
  user_queries.add_user(myUser, Phones, res);
});

// defining the endpoint for the remove user
app.get("/remove_user", (req, res) => {
  myUser = new ClassWrappers.User(req.query["username"], "", "");
  user_queries.remove_user(myUser, res);
});

// starting the server
app.listen(3001, () => {
  console.log("listening on port 3001");
});
