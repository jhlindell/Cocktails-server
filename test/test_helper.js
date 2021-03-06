const mongoose = require('mongoose');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'barcode.log' }),
  ],
});

before((done) => {
  mongoose.connect('mongodb://localhost/bar-code_test');
  mongoose.connection
    .once('open', () => done())
    .on('error', (err) => {
      logger.info('Warning: ', err);
    });
});

beforeEach((done) => {
  const { stockitems, recipes, users } = mongoose.connection.collections;
  stockitems.drop(() => {
    recipes.drop(() => {
      users.drop(() => {
        done();
      });
    });
  });
});
