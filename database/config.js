require("dotenv").config();

let config = {
    "development": {
        "username": process.env['MYSQL_USER'],
        "password": process.env['MYSQL_PASS'],
        "database": 'mysql',
        "host": process.env['MYSQL_HOST'],
        "dialect": "mysql",
        "multipleStatements": true
    },
    "test": {
        "username": process.env['MYSQL_USER'],
        "password": process.env['MYSQL_PASS'],
        "database": 'mysql',
        "host": process.env['MYSQL_HOST'],
        "dialect": "mysql",
        "multipleStatements": true
    },
    "production": {
        "username": process.env['MYSQL_USER'],
        "password": process.env['MYSQL_PASS'],
        "database": 'mysql',
        "host": process.env['MYSQL_HOST'],
        "dialect": "mysql",
        "multipleStatements": true
    }
}

module.exports = config;