require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');

const app = express();
const {DATABASE_URL} = require('./config');
const {router: kindlyRouter} = require('./kindly');
const {router: usersRouter} = require('./users');
const {router: authRouter, basicStrategy, jwtStrategy} = require('./auth');

mongoose.Promise = global.Promise;
app.use(morgan('common'));

app.use(passport.initialize());
passport.use(basicStrategy);
passport.use(jwtStrategy);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods: POST');
  next();
});



app.use('/api', kindlyRouter);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);




// Serve the built client
app.use(express.static(path.resolve(__dirname, '../client/public')));



// Unhandled requests which aren't for the API should serve index.html so
// client-side routing using browserHistory can function
app.get('*', (req, res) => {
    res.send({message: 'Oopsies! Not Found'});
});

let server;
function runServer(port=3001) {
    return new Promise((resolve, reject) => {

      mongoose.connect(DATABASE_URL, function(err) {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
            resolve();
        }).on('error', reject);
      });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer();
}

module.exports = {
    app, runServer, closeServer
};
