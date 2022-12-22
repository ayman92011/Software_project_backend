// Imports
const mysql = require("mysql2");
// mysql.autoCommit = true;

const dbConfig = require("./dbconfig.js");

// Constants
const DEBUG = require("./Debug").DEBUG;
const con = mysql.createConnection(dbConfig);

/**
 * Tests the connection to the db.
 */
function run() {
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });
}

run();

// function to add a user to db
// req prams (User object, Phone object, res)
/**
 *
 * @param {User} user : The user object.
 * @param {List[int]} phone_list : List of phone numbers to add.
 * @param {callback} res : The callback of the endpoint of express js
 */
async function add_user(user, phone_list, res) {
  const conn = mysql.createConnection(dbConfig);
  try {
    var res1 = await conn.promise().execute(user.getInsertPerson());
    var res2 = await conn.promise().execute(user.getInsertUser());
    let res3 = [];
    for (const sql of phone_list.getAddPhones()) {
      var res_temp = await conn.promise().execute(sql);
      res3.push(res_temp[0]);
    }
    if (DEBUG) {
      console.trace(
        "user created yah !!!!" +
          JSON.stringify(res1[0]) +
          JSON.stringify(res2[0]) +
          JSON.stringify(res3)
      );
    }
    res.send(
      JSON.stringify(res1[0]) + JSON.stringify(res2[0]) + JSON.stringify(res3)
    );
  } catch (error) {
    res.send(error);
  }
}

/**
 * This function is used to get the user or admin data from the db.
 * @param {User} user : The user object.
 * @param {callback} res : THe callback for the endpoint.
 */
async function get_person(user, res) {
  const conn = mysql.createConnection(dbConfig);
  var res1 = await conn.promise().execute(user.getSelectPerson());
  var res2 = await conn.promise().execute(user.getSelectUser());
  if (res1[0][0] != undefined) {
    res1 = res1[0][0];
  } else {
    res1 = res1[0];
  }
  // if (res2[0][0] != undefined) {
  //   res2 = res2[0][0];
  // } else {
  //   res2 = res2[0];
  // }
  res1["is_user"] = res2.length > 0;
  if (DEBUG) {
    console.trace(res1);
  }
  res.send(res1);
}

/**
 * The function used to remove a user from the db.
 * @param {User} user : The user object.
 * @param {callback} res : The callback for the endpoint.
 */
async function remove_user(user, res) {
  let res_list = [];
  const conn = mysql.createConnection(dbConfig);
  for (const statement of user.getDeleteUser()) {
    let result = await conn.promise().execute(statement);
    res_list.push(result[0].affectedRows);
  }
  if (DEBUG) {
    console.trace(res_list);
  }
  res.send(res_list);
}

async function edit_user(oldUser, newUser, newPhones, res) {
  let res_list = [];
  const conn = mysql.createConnection(dbConfig);
  for (const statement of newUser.getEditUser(oldUser)) {
    let result = await conn.promise().execute(statement);
    res_list.push(result[0].affectedRows);
  }
  if (DEBUG) {
    console.trace(res_list);
  }
  res.send(res_list);
}

module.exports = {
  add_user: add_user,
  remove_user: remove_user,
  get_person: get_person,
  edit_user: edit_user,
};
