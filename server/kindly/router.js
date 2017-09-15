const express = require("express");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Kindly = require('../models/kindly');
const router = express.Router();

router.use(jsonParser);

// GET all kindlys
router.get('/', (req, res) => {
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

// Create a new kindly
router.post("/", (req, res) => {
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

module.exports = {router};
