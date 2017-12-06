var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var dbRouter = require('./dbRouter');
const options = require('../data/dbInfo.js').options;
/*
  options={
    useMongoClient: true,
    "user": Username,
    "password": dbpassword,
    "database": collection,
    "address" : dbIP,
    "port" : port
  }
*/
mongoose.connect('mongodb://localhost/explorerdb', options)

var db = mongoose.connection;
db.on('error', (callback) => {
  console.log("MongoDB连接失败！","通过web3获取数据");
})
//
db.on('open', (callback) => {
  console.log('MongoDB连接成功！！');
});

router.use('/',dbRouter);

exports.db=db;
exports.router= router;
