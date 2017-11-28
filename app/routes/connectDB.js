var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var web3Router = require('./web3Router');
var dbRouter = require('./dbRouter');
const Wanblock = require('../models/wanblock');
const options = {
  useMongoClient: true,
  "user": "Jason",
  "password": 123456,
  "database": "explorerdb",
  "address" : "localhost",
  "port" : 27017
};
//创建一个连接到数据库
mongoose.connect('mongodb://localhost/explorerdb', options)
// 实例化连接对象
var db = mongoose.connection;

db.on('error', (callback) => {
  console.log("MongoDB连接失败！");
})
//
db.on('open', (callback) => {
  console.log('MongoDB连接成功！！');
});

router.use('/',dbRouter);

module.exports = router;
