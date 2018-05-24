'use strict';

// SQLite Database for message-store
const sqlite3 = require('sqlite3').verbose();
const formatDate = require('endpointz').formatDate;

class db {
  
  constructor(url, logger = console.log) {
    this.url = url;
    this.logger = logger;
    this.sqlite = this.createConn();
  }

  createConn() { 
    return new sqlite3.Database((this.url || ':memory:'), sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        this.logger(err.message);
      } else {
        this.logger('Connected to the message database.');
      }
    });
  }
  
  closeConn() {
    this.sqlite.close((err) => {
      if (err) {
        this.logger(err.message);
      } else {
        this.logger('Close the database connection.');
      }
    });
  }

  query(onReady, onError) {
    this.sqlite.all('select * from messages', [], (err, rows) => {
      if (err) {
        onError(err);
      } else {
        onReady(rows);
      }
    });
  }

  newMessage(msgObj, onReady, onError) {
    this.sqlite.run(`INSERT INTO messages(datetime, nickname, avatar, socketid, message) VALUES(?, ?, ?, ?, ?)`, [
      formatDate(), msgObj.nickname, msgObj.avatar, msgObj.id, msgObj.message], function(err) {
      if (err) {
        onError(err.message);
      } else {
        onReady(`A row has been inserted with rowid ${this.lastID}`);
      }
    });  
  } 

}

module.exports = {
  db
};