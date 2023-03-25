const mysql = require('mysql');
require('dotenv').config();
const bluebird = require('bluebird');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
connection.connect((error) => {
  if (error) throw error;
  console.log('Database connect successfully');
});
connection.query = bluebird.promisify(connection.query);
module.exports = connection;
