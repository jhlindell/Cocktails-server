const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'barcode.log' }),
  ],
});

const StockItem = mongoose.model('StockItem');

describe('Stock Item controller', () => {
  it('POST to /api/stock_items should create a stock item', (done) => {
    StockItem.count().then((count) => {
      request(app)
        .post('/api/stock_items')
        .send({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' })
        .end(() => {
          StockItem.count().then((newCount) => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  it('POST to /api/stock_items with incomplete object should return error message', (done) => {
    request(app)
      .post('/api/stock_items')
      .send({ name: 'rum' })
      .expect(400)
      .then((response) => {
        const obj = JSON.parse(response.text);
        assert(obj.message === 'stock item name or description cannot be empty');
        done();
      });
  });

  it('GET to /api/stock_items should get all stock items', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' });
    const stockItem2 = new StockItem({ name: 'Campari', description: 'makes other things better' });
    const stockItem3 = new StockItem({ name: 'Cocchi di Torrino', description: 'The third ingredient' });
    Promise.all([stockItem.save(), stockItem2.save(), stockItem3.save()])
      .then(() => {
        request(app)
          .get('/api/stock_items')
          .end(() => {
            StockItem.count().then((count) => {
              assert(count === 3);
              done();
            });
          });
      });
  });

  it('GET to /api/stock_items/:id should get a single stock item', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' });
    stockItem.save().then(() => {
      request(app)
        .get(`/api/stock_items/${stockItem._id}`)
        .expect(200)
        .then((response) => {
          assert(response.body._id.toString() === stockItem._id.toString());
          done();
        });
    });
  });

  it('GET to /api/stock_items/:id with a bad id should return an error message', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' });
    stockItem.save().then(() => {
      request(app)
        .get('/api/stock_items/sd98yqw4nasdgkh')
        .expect(404)
        .then((response) => {
          const obj = JSON.parse(response.error.text);
          assert(obj.message === 'Item not found with id sd98yqw4nasdgkh');
          done();
        });
    });
  });

  it('PUT to /api/stock_items/:id can update a record', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' });
    stockItem.save().then(() => {
      request(app)
        .put(`/api/stock_items/${stockItem._id}`)
        .send({ name: 'Smith & Cross Rum', description: "Jamaica's Finest" })
        .end(() => {
          StockItem.findOne({ name: 'Smith & Cross Rum' })
            .then((item) => {
              assert(item.description === "Jamaica's Finest");
              done();
            })
            .catch((err) => {
              logger.info('ERROR: ', err);
            });
        });
    });
  });

  it('PUT to /api/stock_items/:id with a bad id will return a 404', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: 'Da Funk Bomb' });
    stockItem.save().then(() => {
      request(app)
        .put('/api/stock_items/sd98yqw4nasdgkh')
        .send({ name: 'Smith & Cross Rum', description: "Jamaica's Finest" })
        .expect(404)
        .then((response) => {
          const obj = JSON.parse(response.error.text);
          assert(obj.message === 'Item not found with id sd98yqw4nasdgkh');
          done();
        });
    });
  });

  it('DELETE to /api/drivers/:id can delete a record', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: "Jamaica's Finest" });
    stockItem.save().then(() => {
      request(app)
        .delete(`/api/stock_items/${stockItem._id}`)
        .end(() => {
          StockItem.findOne({ name: 'Smith & Cross Rum' })
            .then((item) => {
              assert(item === null);
              done();
            });
        });
    });
  });

  it('DELETE to /api/drivers/:id with a bad id will return a 404', (done) => {
    const stockItem = new StockItem({ name: 'Smith & Cross Rum', description: "Jamaica's Finest" });
    stockItem.save().then(() => {
      request(app)
        .delete('/api/stock_items/sd98yqw4nasdgkh')
        .expect(404)
        .then((response) => {
          const obj = JSON.parse(response.error.text);
          assert(obj.message === 'Item not found with id sd98yqw4nasdgkh');
          done();
        });
    });
  });
});