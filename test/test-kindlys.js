const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const {app, runServer, closeServer} = require('../server');

const should = chai.should();
const chaiJWT = require('chai-jwt');

chai.use(chaiJWT);

chai.use(chaiHttp);



describe('Kindlys', function() {

  before(function() {
    return runServer();
  });


  after(function() {
    return closeServer();
  });

  it('should return html', function() {

    return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.html;
      });
  });

  it('should GET all kindlys', function() {

    return chai.request(app)
      .get('/api/kindlys')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.kindlys.should.have.lengthOf.at.least(1);
        res.body.kindlys.should.be.a('array');
        const expectedKeys = ['_id', '__v', 'lat', 'long', 'kindly', 'creator', 'createdDate'];
        res.body.kindlys.forEach(function(kindly) {
        kindly.should.be.a('object');
        kindly.should.include.keys(expectedKeys);
        });
      });
  });


  it('should GET all kindlys by user ID', function() {

    return chai.request(app)

    .post('/api/auth/login')
    .auth('test9', 'test12345678')
    .then(function(res){
       return chai.request(app)
          .get('/api/kindlys/59d5ad7f9823f22b589db8a6')
          .set('Authorization', 'Bearer ' + res.body.authToken)
           })

          .then(function(res) {
             res.should.have.status(200);
             res.should.be.json;
             res.body.should.have.property('kindlys').with.length.at.least(1);
             res.body.kindlys.should.be.a('array');
             const expectedKeys = ['_id', '__v', 'lat', 'long', 'kindly', 'creator', 'createdDate'];
             res.body.kindlys.forEach(function(kindly) {
               kindly.should.be.a('object');
               kindly.should.include.keys(expectedKeys);
             });
           });
       });


  it('PUT request, should update kindly', function() {
    return chai.request(app)
    .post('/api/auth/login')
    .auth('test9', 'test12345678')
    .then(function(res){
      const updateData = {
         id: '59d7e15d30585200122190d0',
         kindly: 'Bought a guy a meal in the Mc Donalds drive through'
       };
       return chai.request(app)
       .put('/api/kindlys/59d7e15d30585200122190d0')
       .send(updateData)
       .set('Authorization', 'Bearer ' + res.body.authToken)

       })
       .then(function(res) {
         res.should.have.status(204);
       });
  });


  it('POST a new kindly', function() {
    return chai.request(app)
    .post('/api/auth/login')
    .auth('test9', 'test12345678')
    .then(function(res){
      const newKindly = {
         lat: 44.975269,
         long: -93.27998589999999,
         kindly: 'Bought a guy a meal in the Mc Donalds drive through',
         creator: '59d5ad7f9823f22b589db8a6'
       };
      return chai.request(app)
      .post('/api/kindlys')
      .send(newKindly)
      .set('Authorization', 'Bearer ' + res.body.authToken)
    })
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('message');

      })
    });


    it('DELETE a Kindly', function() {
      var id;
      var token;
      return chai.request(app)
      .post('/api/auth/login')
      .auth('test9', 'test12345678')
      .then(function(res){
        token = res.body.authToken;
        const newKindly = {
           lat: 44.975269,
           long: -93.27998589999999,
           kindly: 'Bought a guy a burger while in the Mc Donalds drive through',
           creator: '59d5ad7f9823f22b589db8a6'
         };
        return chai.request(app)
        .post('/api/kindlys')
        .send(newKindly)
        .set('Authorization', 'Bearer ' + res.body.authToken)

      })
        .then(function(res) {
          res.should.have.status(201);
          console.log(res.body);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('message');
          id = res.body.id;
          console.log(id);

        })
        .then(function(res){
          return chai.request(app)
          .delete(`/api/kindlys/${id}`)
          .set('Authorization', 'Bearer ' + token)
        })
        .then(function(res){
          res.should.have.status(204);
        })

      });

      it('POST to create a new user', function() {
        var randomUsername = faker.internet.userName();
        const newUser = {
           username: randomUsername,
           password: 'test12345678',
         };
        return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(function(res){
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            var expectedKeys = ['id', 'username', 'firstName', 'lastName', 'kindlys'];
            res.body.should.include.keys(expectedKeys);



          })
        });

        it('should return authoToken upon login', function() {

          return chai.request(app)

          .post('/api/auth/login')
          .auth('test8', 'test12345678')
          .then(function(res){
            res.should.have.status(200);
            res.should.be.json;
            generatedToken = res.body.authToken;
            const expectedKeys = ['authToken'];
            res.body.should.include.keys(expectedKeys);
            });

        });













});
