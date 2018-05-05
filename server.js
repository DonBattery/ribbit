'use strict';

const path = require('path');
const express = require('express');
const app = express();
const PORT = (process.argv[2] || 8080);
const serverName = (process.argv[3] || 'ribbit');
const logger = require('endpointz').reqLog;
const serverLog = require('endpointz').serverLog;
const startMessage = require('endpointz').startMessage;
const handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });
const favicon = require('serve-favicon');

app.use(logger);

app.use(express.json());

app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('home');
});

app.get('/about', function(req, res) {
  res.render('about');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/chat', function(req, res) {
  res.render('chat');
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404).render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
  serverLog(err.stack);
  res.status(500).render('500');
});

app.listen(PORT, startMessage(serverName, PORT));
