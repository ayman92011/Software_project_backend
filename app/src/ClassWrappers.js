// Constants
const DEBUG = require("./Debug").DEBUG;
const StatementGenerateStrings = {
  String: ["'", "', "],
  Int: ["", ", "],
  Date: ["STR_TO_DATE('", "', '%Y/%d/%m'), "],
  Pic: ["'", "', "],
};

// Helper Functions
/**
 * The functions that throws an error if something wasn't provided.
 * @param {string} param : The name of the field that was not provided.
 */
const isRequired = (param) => {
  console.trace();
  throw new Error(`${param} is required`);
};

/**
 * Function used to throws an error if the object doesn't have the property requested.
 * @param {Object} obj : The object that you want to check if it has the property.
 * @param {String} propertyName : The property name that you want to check.
 * @returns : The property that you want.
 * @throws {Unknown property: propertyName} : Throws error with the undefined property
 */
const getSafe = (obj, propertyName) => {
  if (obj.hasOwnProperty(propertyName)) return obj[propertyName];
  console.trace();
  throw new Error(`Unknown property: ${propertyName}`);
};

// Classes
class Field {
  /**
   * This a class used to wrap the data with its data type so that you can automatically generate the
   * required symbols in the sql statement
   * @param {value} value
   * @param {dtype} dtype
   */
  constructor(value, dtype) {
    this.val = value;
    this.dtype = dtype;
  }
}

class Parent {
  /**
   * Class Used to generate all the Statements to any table, and is the parent of all the classes.
   */
  constructor() {}

  /**
   * Function to generate any insert statement for any table, uses the class attributes as the values to add.
   * @param {String} tableName : The Table Name that you want to insert into.
   * @param {{String: Field}} values : The values that you want to add.
   * @returns :The insert statement for that table
   */
  getInsert(tableName, values) {
    // Loops through the fields in the sub class and adds the correct statements for the
    // field data type
    // Insert into a Table
    let str_before = `INSERT INTO ${tableName}(`;
    let str_after = ") VALUES (";
    for (const [key, value] of Object.entries(values)) {
      str_before += key + ", ";
      str_after += getSafe(StatementGenerateStrings, value.dtype)[0];
      if (value.dtype == "Pic") {
        var buf = Buffer.from("" + value.val);
        str_after += buf;
      } else {
        str_after += value.val;
      }
      str_after += getSafe(StatementGenerateStrings, value.dtype)[1];
    }
    str_after = str_after.slice(0, -2);
    str_after += ")";
    let statement_insert_into_table = str_before.slice(0, -2) + str_after;
    if (DEBUG) {
      console.trace(statement_insert_into_table);
    }
    return statement_insert_into_table;
  }

  /**
   * Function to generate select statement for a table in the DB.
   * @param {List<String>} fields : The field that you want to get from the DB.
   * @param {String} tableName : The table that you want to get the fields from.
   * @param {{String: String}} conditions : The conditions that you want to apply on the query.
   * @returns : The Select statement.
   */
  getSelect(fields, tableName, conditions) {
    let query = "SELECT\n";
    for (const field of fields) {
      query += field + ", ";
    }
    query = query.slice(0, -2);
    query += "\n" + "FROM\n" + tableName + "\n" + "WHERE\n";
    for (const [key, value] of Object.entries(conditions)) {
      query += key + " = '" + value + "' AND ";
    }
    query = query.slice(0, -5);
    if (DEBUG) {
      console.trace(query);
    }
    return query;
  }

  /**
   * Function for deleting rows from multiple tables.
   * @param {List<String>} tableNames : List of table names to delete from.
   * @param {List<String: String>} conditions : The conditions that you want to delete the row for.
   * @returns : A list of delete Statements.
   */
  getDelete(tableNames, conditions) {
    var zip = (a, b) => a.map((x, i) => [x, b[i]]);
    let statements = [];
    for (let [tableName, condition] of zip(tableNames, conditions)) {
      let statement = `DELETE FROM ${tableName}\n  WHERE\n`;
      for (const [key, value] of Object.entries(condition)) {
        statement += key + " = '" + value + "' AND ";
      }
      statement = statement.slice(0, -5);
      statements.push(statement);
    }
    if (DEBUG) {
      console.trace(statements);
    }
    return statements;
  }

  /**
   * Function to update tables
   * @param {List<String>} tableNames : The table names that you want to edit.
   * @param {List<{String: Field}>} values_list : The list of values that you want to update.
   * @param {List<{String: String}>} conditions : The list of conditions for every update statement.
   */
  getEdit(tableNames, values_list, conditions) {
    let statements = [];
    var zip = (a, b, c) => a.map((x, i) => [x, b[i], c[i]]);
    for (let [tableName, values, condition] of zip(
      tableNames,
      values_list,
      conditions
    )) {
      let statement = `UPDATE \n\t ${tableName}\n  SET\n`;
      console.log(values);
      for (const [key, value] of Object.entries(values)) {
        if (value.val == "") continue;
        statement += key + " = ";
        statement += getSafe(StatementGenerateStrings, value.dtype)[0];
        if (value.dtype == "Pic") {
          var buf = Buffer.from("" + value.val);
          statement += buf;
        } else {
          statement += value.val;
        }
        statement += getSafe(StatementGenerateStrings, value.dtype)[1];
      }
      statement = statement.slice(0, -2);
      statement += `\nWHERE\n`;
      for (const [key, value] of Object.entries(condition)) {
        statement += key + " = '" + value + "' AND ";
      }
      statement = statement.slice(0, -5);
      statements.push(statement);
    }
    return statements;
  }
}

class User extends Parent {
  /**
   * The User class Wrapper used to store all the user field, and can be used to generate the
   * sql statements for the INSERT, SELECT, DROP, EDIT for the user class, uses the PERSON, MYUSER, PERSONPHONE, VISA
   * from the DBMS tables.
   * @param {string} username : The person's name, required.
   * @param {string} email : The person's email, required.
   * @param {string} password : The person's password, required.
   * @param {int} gender : The person's gender, 0 female, 1 male, not required.
   * @param {string} birthday : The person's birthday, must be in format "YYYY/MM/DD", not required.
   * @param {List<List<int>>} pic : The person's profile picture, must be a image, not required.
   * @param {string} first_name : The person's first name, not required.
   * @param {string} last_name : The person's last name, not required.
   * @throws {username is required} If the username is not provided.
   * @throws {email is required} If the email is not provided.
   * @throws {password is required} If the password is not provided.
   */
  constructor(
    username,
    email,
    password,
    gender,
    birthday,
    pic,
    first_name,
    last_name
  ) {
    super();
    this.username = new Field(
      username != undefined ? username : isRequired("username"),
      "String"
    );
    this.email = new Field(
      email != undefined ? email : isRequired("email"),
      "String"
    );
    this.password = new Field(
      password != undefined ? password : isRequired("password"),
      "String"
    );
    this.gender = new Field(gender, "Int");
    this.birthday = new Field(birthday, "Date");
    this.pic = new Field(pic, "Pic");
    this.first_name = new Field(first_name, "String");
    this.last_name = new Field(last_name, "String");
  }

  /**
   * Used to generate the insert statement for the person table.
   * @returns The insert statement for the insert into person.
   */
  getInsertPerson() {
    // Loops through the fields in the user class and adds the correct statements for the
    // field data type
    // Insert into person
    return this.getInsert("PERSON", this);
  }

  /**
   * Used to generate the insert statement for the myuser table.
   * @returns The insert statement for the insert into myuser.
   */
  getInsertUser() {
    return this.getInsert("MYUSER", { USERNAME: this.username });
  }

  /**
   * Used to generate the select statement for the person table.
   * @returns The select statement for the person table.
   */
  getSelectPerson() {
    return this.getSelect(
      [
        "USERNAME",
        "EMAIL",
        "PASSWORD",
        "GENDER",
        "BIRTHDAY",
        "PIC",
        "first_name",
        "last_name",
      ],
      "PERSON",
      { USERNAME: this.username.val, PASSWORD: this.password.val }
    );
  }

  /**
   * Used to generate the select statement for the myuser table.
   * @returns The select statement for the myuser table.
   */
  getSelectUser() {
    return this.getSelect(["USERNAME"], "MYUSER", {
      USERNAME: this.username.val,
    });
  }

  /**
   * Used to generate the delete statements for the user and its dependencies.
   * @returns The delete statements for the user deletion and its dependencies.
   */
  getDeleteUser() {
    return this.getDelete(
      ["PERSONPHONE", "VISA_MYUSER", "MYUSER", "PERSON"],
      [
        { PERSON_USERNAME: this.username.val },
        { PERSON_USERNAME: this.username.val },
        { USERNAME: this.username.val },
        { USERNAME: this.username.val },
      ]
    );
  }

  /**
   * Function to Update the user info
   * @param {User} oldUser : The old User info
   * @returns : The statements to update the user
   */
  getEditUser(oldUser) {
    return this.getEdit(
      ["PERSON", "MYUSER"],
      [this, { USERNAME: this.username }],
      [{ USERNAME: oldUser.username.val }, { USERNAME: oldUser.username.val }]
    );
  }
}

// class User {
//   /**
//    * The User class Wrapper used to store all the user field, and can be used to generate the
//    * sql statements for the INSERT, SELECT, DROP, EDIT for the user class, uses the PERSON, MYUSER, PERSONPHONE, VISA
//    * from the DBMS tables.
//    * @param {string} username : The person's name, required.
//    * @param {string} email : The person's email, required.
//    * @param {string} password : The person's password, required.
//    * @param {int} gender : The person's gender, 0 female, 1 male, not required.
//    * @param {string} birthday : The person's birthday, must be in format "YYYY/MM/DD", not required.
//    * @param {List[List[int]]} pic : The person's profile picture, must be a image, not required.
//    * @param {string} first_name : The person's first name, not required.
//    * @param {string} last_name : The person's last name, not required.
//    * @throws {username is required} If the username is not provided.
//    * @throws {email is required} If the email is not provided.
//    * @throws {password is required} If the password is not provided.
//    */
//   constructor(
//     username,
//     email,
//     password,
//     gender,
//     birthday,
//     pic,
//     first_name,
//     last_name
//   ) {
//     this.username = new Field(
//       username != undefined ? username : isRequired("username"),
//       "String"
//     );
//     this.email = new Field(
//       email != undefined ? email : isRequired("email"),
//       "String"
//     );
//     this.password = new Field(
//       password != undefined ? password : isRequired("password"),
//       "String"
//     );
//     this.gender = new Field(gender, "Int");
//     this.birthday = new Field(birthday, "Date");
//     this.pic = new Field(pic, "Pic");
//     this.first_name = new Field(first_name, "String");
//     this.last_name = new Field(last_name, "String");
//   }

//   /**
//    * Used to generate the insert statement for the person table.
//    * @returns The insert statement for the insert into person.
//    */
//   getInsertPerson() {
//     // Loops through the fields in the user class and adds the correct statements for the
//     // field data type
//     // Insert into person
//     let str_before = "INSERT INTO PERSON(";
//     let str_after = ") VALUES (";
//     for (const [key, value] of Object.entries(this)) {
//       str_before += key + ", ";
//       str_after += getSafe(StatementGenerateStrings, value.dtype)[0];
//       if (value.dtype == "Pic") {
//         var buf = Buffer.from("" + value.val);
//         str_after += buf;
//       } else {
//         str_after += value.val;
//       }
//       str_after += getSafe(StatementGenerateStrings, value.dtype)[1];
//     }
//     str_after = str_after.slice(0, -2);
//     str_after += ")";
//     let statement_insert_into_person = str_before.slice(0, -2) + str_after;
//     if (DEBUG) {
//       console.trace(statement_insert_into_person);
//     }
//     return statement_insert_into_person;
//   }

//   /**
//    * Used to generate the insert statement for the myuser table.
//    * @returns The insert statement for the insert into myuser.
//    */
//   getInsertUser() {
//     let statement = `INSERT INTO MYUSER(
//       USERNAME
//       )
//       VALUES
//       (
//         '${this.username.val}'
//         )`;
//     if (DEBUG) {
//       console.trace(statement);
//     }
//     return statement;
//   }

//   /**
//    * Used to generate the select statement for the person table.
//    * @returns The select statement for the person table.
//    */
//   getSelectPerson() {
//     let statement = `
//     SELECT
//         USERNAME,
//         EMAIL,
//         PASSWORD,
//         GENDER,
//         BIRTHDAY,
//         PIC,
//         first_name,
//         last_name
//     FROM
//         PERSON
//     WHERE
//         USERNAME = '${this.username.val}' and PASSWORD = '${this.password.val}'`;
//     if (DEBUG) {
//       console.trace(statement);
//     }
//     return statement;
//   }

//   /**
//    * Used to generate the select statement for the myuser table.
//    * @returns The select statement for the myuser table.
//    */
//   getSelectUser() {
//     let statement = `
//     SELECT
//         USERNAME
//     FROM
//         MYUSER
//     WHERE
//         USERNAME = '${this.username.val}'`;
//     if (DEBUG) {
//       console.trace(statement);
//     }
//     return statement;
//   }

//   /**
//    * Used to generate the delete statements for the user and its dependencies.
//    * @returns The delete statements for the user deletion and its dependencies.
//    */
//   getDeleteUser() {
//     let statements = [
//       `
//     DELETE FROM PERSONPHONE
//       WHERE
//           PERSON_USERNAME = '${this.username.val}'
//       `,
//       `
//     DELETE FROM VISA_MYUSER
//       WHERE
//           PERSON_USERNAME = '${this.username.val}'
//     `,
//       `
//     DELETE FROM MYUSER
//       WHERE
//           USERNAME = '${this.username.val}'
//     `,
//       `
//     DELETE FROM PERSON
//       WHERE
//           USERNAME = '${this.username.val}'
//     `,
//     ];
//     if (DEBUG) {
//       console.trace(statements);
//     }
//     return statements;
//   }

//   getEditUser(oldUser) {
//     let statements = [];
//     if (this.username.val != "") {
//       statements.push(
//         `UPDATE
//             person
//          SET
//             USERNAME = "${this.username}"
//          WHERE
//             USERNAME = "${oldUser.username.val}";`
//       );
//       statements.push(
//         `UPDATE
//             myuser
//          SET
//             USERNAME = "${this.username}"
//          WHERE
//             USERNAME = "${oldUser.username.val}";`
//       );
//     }
//     let str = `UPDATE person SET`;
//     for (const [key, value] of Object.entries(this)) {
//       str += key + " = ";
//       str += getSafe(StatementGenerateStrings, value.dtype)[0];
//       if (value.dtype == "Pic") {
//         var buf = Buffer.from("" + value.val);
//         str += buf;
//       } else {
//         str += value.val;
//       }
//       str += getSafe(StatementGenerateStrings, value.dtype)[1];
//     }
//     str = str.slice(0, -2);
//     str += `
//     WHERE
//       USERNAME = "${oldUser.username.val}"`;
//     statements.push(str);
//   }
// }

class Phone extends Parent {
  constructor(phone_list, userName) {
    super();
    if (typeof phone_list == "string") {
      this.phone_list = new Field([phone_list], "List[String]");
    } else {
      this.phone_list = new Field(phone_list, "List[String]");
    }
    this.userName = userName;
  }

  getAddPhones() {
    let statements = [];
    for (const phone of this.phone_list.val) {
      statements.push(
        this.getInsert("PERSONPHONE", {
          PERSON_USERNAME: this.userName,
          PHONE: phone,
        })
      );
    }
    return statements;
  }

  getSelectPhones() {
    return this.getSelect(["PERSON_USERNAME", "PHONE"], "PERSONPHONE", {
      PERSON_USERNAME: this.userName,
    });
  }

  getDeletePhones() {}

  getUpdatePhones() {
    let statements = [];

    statements.push(this.getAddPhones());
  }
}

module.exports = {
  User: User,
  Phone: Phone,
};
