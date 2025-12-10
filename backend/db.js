const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // اگر دیتابیس رمز دارد، اینجا ننویسید، در .env بنویسید
  database: process.env.DB_NAME || 'wallex_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database!');
});

module.exports = connection;