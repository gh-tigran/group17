import mysql from 'mysql2';
import Promise from 'bluebird';

const {
  MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE,
} = process.env;

const connection = mysql.createConnection({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  Promise,
});

const db = connection.promise();

export default db;
