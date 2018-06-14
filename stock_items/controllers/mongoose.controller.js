const StockItem = require('../models/stock_item.model.js');

// save a single stock item to the database
exports.create = (req, res) => {
  const item = new StockItem({
    name: req.body.name,
    description: req.body.description,
  });

  item.validate((err) => {
    if (err) {
      res.status(400).send({
        message: 'stock item name or description cannot be empty',
      });
    } else {
      item.save()
        .then(data => res.send(data))
        .catch((error) => {
          res.status(500).send({
            message: error.message || 'Some error occurred while creating the Item.',
          });
        });
    }
  });
};

// Retrieve and return all stock items from the database.
exports.findAll = (req, res) => {
  StockItem.find()
    .then((items) => {
      res.send(items);
    }).catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving items.',
      });
    });
};

// Find a single stock item with a id
exports.findOne = (req, res) => {
  StockItem.findById(req.params.siId)
    .then((item) => {
      if (!item) {
        res.status(404).send({
          message: `Item not found with id ${req.params.siId}`,
        });
      } else {
        res.send(item);
      }
    }).catch((err) => {
      if (err.kind === 'ObjectId') {
        res.status(404).send({
          message: `Item not found with id ${req.params.siId}`,
        });
      } else {
        res.status(500).send({
          message: err.message || `Error retrieving item with id ${req.params.siId}`,
        });
      }
    });
};

// Update a stock item identified by the siId in the request
exports.update = (req, res) => {
  const item = new StockItem({
    name: req.body.name,
    description: req.body.description,
  });
  item.validate((err) => {
    if (err) {
      res.status(400).send({
        message: 'stock item name or description cannot be empty',
      });
    } else {
      StockItem.findByIdAndUpdate(req.params.siId, {
        name: req.body.name,
        description: req.body.description,
      }, { new: true })
        .then((stockitem) => {
          if (!stockitem) {
            res.status(404).send({
              message: `Item not found with id ${req.params.siId}`,
            });
          } else {
            res.send(stockitem);
          }
        }).catch((error) => {
          if (error.kind === 'ObjectId') {
            res.status(404).send({
              message: `Item not found with id ${req.params.siId}`,
            });
          } else {
            res.status(500).send({
              message: `Error updating item with id ${req.params.siId}`,
            });
          }
        });
    }
  });
};

// Delete a note with the specified siId in the request
exports.delete = (req, res) => {
  StockItem.findByIdAndRemove(req.params.siId)
    .then((item) => {
      if (!item) {
        res.status(404).send({
          message: `Item not found with id ${req.params.siId}`,
        });
      } else {
        res.send({ message: 'Item deleted successfully!' });
      }
    })
    .catch((err) => {
      if (err.kind === 'ObjectId' || err.name === 'NotFound') {
        res.status(404).send({
          message: `Item not found with id ${req.params.siId}`,
        });
      } else {
        res.status(500).send({
          message: `Could not delete item with id ${req.params.siId}`,
        });
      }
    });
};