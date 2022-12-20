const DEBUG = require("./Debug").DEBUG;

module.exports = {
  host: "localhost",
  port: "3306",
  database: "software_project",
  user: "root",
  password: "root",
};

if (DEBUG) {
  console.trace(module.exports);
}
