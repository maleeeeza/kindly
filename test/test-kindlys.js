const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

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

  it('should list all kindlys on GET', function() {

    return chai.request(app)
      .get('/api/kindlys')
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


  it('should list one kindly on GET by ID', function() {

    return chai.request(app)
      id = res.body.kindlys[0]._id

      .get(`/api/kindlys/${id}`)
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

  





  });
