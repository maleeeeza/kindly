const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');

const app = express();
const Kindly = require('./models/kindly');
const {DATABASE_URL} = require('./config');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());

// GET all kindlys
app.get('/kindlys', (req, res) => {
  Kindly
    .find()
    .then(kindlys => {
      res.json({
        kindlys: kindlys
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.post("/kindlys", (req, res) => {
  const requiredFields = ['lat', 'long', 'description'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Kindly
    .create({
      lat: req.body.lat,
      long: req.body.long,
      description: req.body.description})
    .then(
      kindly => {
        res.status(201).json({message: 'Kindly Created'})
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


// Serve the built client
app.use(express.static(path.resolve(__dirname, '../client/public')));



// Unhandled requests which aren't for the API should serve index.html so
// client-side routing using browserHistory can function
app.get(/^(?!\/api(\/|$))/, (req, res) => {
    const index = path.resolve(__dirname, '../client/public', 'index.html');
    res.sendFile(index);
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
