'use strict';

var express = require('express');
var http = require('http').Server();
var md5 = require('md5');
var path = require('path');

var app = express();

app.get('/', function (req, res) {
  res.sendfile(path.resolve(__dirname + '/build/index.html'));
});

app.use('/js', express.static(path.resolve(__dirname + '/build/js')));

app.listen(80, () => {
  console.log('client on *:80');
});
