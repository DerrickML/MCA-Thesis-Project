// db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user:'derrickml_derrickml',
    password: '@mcaproject',
    database: 'derrickml_mca_project'
});

module.exports = pool.promise();
