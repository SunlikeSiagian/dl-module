var helper = require("../helper");
var BuyerManager = require("../../src/managers/core/buyer-manager");
var instanceManager = null;
require("should");

function getData() {
    var Buyer = require('dl-models').core.Buyer;
    var buyer = new Buyer();

    var now = new Date();
    var stamp = now / 1000 | 0;
    var code = stamp.toString(36);

    buyer.code = code;
    buyer.name = `name[${code}]`;
    buyer.description = `description for ${code}`;
    buyer.contact = `phone[${code}]`;
    buyer.address = `Solo [${code}]`;
    buyer.tempo = `tempo for ${code}`;
    buyer.local = true;

    return buyer;
}


before('#00. connect db', function (done) {
    helper.getDb()
        .then(db => {
            instanceManager = new BuyerManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        })
});

it('#01. should success when read data', function (done) {
    instanceManager.read()
        .then(documents => {
            //process documents
            documents.should.be.instanceof(Array);
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdId;
it('#02. should success when create new data', function (done) {
    var data = getData();
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done();
        })
        .catch(e => {
            done(e);
        })
});

var createdData;
it(`#03. should success when get created data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
            data.should.instanceof(Object);
            createdData = data;
            done();
        })
        .catch(e => {
            done(e);
        })
});


it(`#03. should success when update created data`, function (done) {

    createdData.code += '[updated]';
    createdData.name += '[updated]';
    createdData.address += '[updated]';
    createdData.contact += '[updated]';
    createdData.tempo += '[updated]';

    instanceManager.update(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#04. should success when get updated data with id`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            data.code.should.equal(createdData.code);
            data.name.should.equal(createdData.name);
            data.address.should.equal(createdData.address);
            // data.contact.should.equal(createdData.contact);
            done();
        })
        .catch(e => {
            done(e);
        })
});

it(`#05. should success when delete data`, function (done) {
    instanceManager.delete(createdData)
        .then(id => {
            createdId.toString().should.equal(id.toString());
            done();
        })
        .catch(e => {
            done(e);
        });
});

it(`#06. should _deleted=true`, function (done) {
    instanceManager.getSingleByQuery({ _id: createdId })
        .then(data => {
            // validate.product(data);
            data._deleted.should.be.Boolean();
            data._deleted.should.equal(true);
            done();
        })
        .catch(e => {
            done(e);
        })
});


it('#07. should error when create new data with same code', function (done) {
    var data = Object.assign({}, createdData);
    delete data._id;
    instanceManager.create(data)
        .then(id => {
            id.should.be.Object();
            createdId = id;
            done("Should not be able to create data with same code");
        })
        .catch(e => {
            e.errors.should.have.property('code');
            done();
        })
});

it('#08. should error with property code and name ', function (done) {
    instanceManager.create({})
        .then(id => {
            done("Should not be error with property code and name");
        })
        .catch(e => {
            try {
                e.errors.should.have.property('code');
                e.errors.should.have.property('name');
                done();
            } catch (ex) {
                done(ex);
            }
        })
});
