const express = require("express");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Kindly = require('../models/kindly');
const router = express.Router();
const passport = require('passport');

router.use(jsonParser);



// GET all kindlys
router.get('/kindlys', (req, res) => {
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
router.post("/kindlys", passport.authenticate('jwt', { session: false }), (req, res) => {
  const requiredFields = ['lat', 'long', 'kindly'];
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
      kindly: req.body.kindly})
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
