var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var dbRouter = require('./dbRouter');
const options = {
  useMongoClient: true,
  "user": "Jason",
  "password": 123456,
  "database": "explorerdb",
  "address" : "localhost",
  "port" : 27017
};

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

module.exports = router;
