const DEBUG = require("./Debug").DEBUG;

module.exports = {
  host: "localhost",
  port: "3306",
  database: "SOFTWARE_PROJECT",
  user: "root",
  password: "root",
};

if (DEBUG) {
  console.trace(module.exports);
}
