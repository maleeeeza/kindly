const express = require("express");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const Kindly = require('../models/kindly');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');

router.use(jsonParser);
// sent results of query to UI for "my Kindlys"
// user should only be able to edit/delete if logged in (auth on routes) similary get by ID route
// create user in UI


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

//GET kindly by ID
router.get('/kindlys/:id',passport.authenticate('jwt', { session: false }), (req, res) => {
  Kindly
    .find({creator: req.params.id})
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

// POST a new kindly
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
      kindly: req.body.kindly,
      creator: req.body.creator})
    .then(
      kindly => {
        User.findOneAndUpdate({_id: req.body.creator}, {$push: {kindlys: kindly._id}}).exec().then(function(){
          res.status(201).json({message: 'Kindly Created'});
        });

      })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

// DELETE kindly by ID
router.delete('/kindlys/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Kindly
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(kindlys => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


module.exports = {router};
