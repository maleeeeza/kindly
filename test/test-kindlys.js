const chai = require('chai');
const chaiHttp = require('chai-http');

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




});
