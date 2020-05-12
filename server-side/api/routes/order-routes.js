const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order-model");
const Product = require("../models/product-model");

router.get(`/get-all`, (req, res, next) => {
  Order.find()
    .select("productId quantity _id")
    .populate(`productId`, `name`)
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            productId: doc.productId,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: `http://localhost:3000/orders/get-one/${doc._id}`,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get(`/get-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  Order.findById(_id)
    .select(`_id quantity productId`)
    .populate(`productId`, `_id name price`)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: `Order not found.`,
        });
      }
      res.status(200).json({
        order,
        request: {
          type: `GET`,
          description: `Get all orders.`,
          url: `http://localhost:3000/orders/get-all`,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch(`/update-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  res.status(200).json({
    message: `update-one`,
  });
});

router.delete(`/delete-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  Order.remove({ _id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: `Order deleted.`,
        request: {
          type: `POST`,
          description: `Create new order.`,
          url: `http://localhost:3000/orders/create-one`,
          body: { productId: `String`, quantity: `Number` },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post(`/create-one`, (req, res, next) => {
  const { productId, quantity } = req.body;
  Product.findById(productId)
    .then((product) => {
      if (!product)
        return res.status(404).json({ message: `Product not found` });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
  const order = new Order({
    _id: mongoose.Types.ObjectId(),
    quantity,
    productId,
  });
  order
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: `Order stored`,
        createdOrder: {
          _id: result._id,
          productId: result.productId,
          quantity: result.quantity,
        },
        request: {
          type: `GET`,
          url: `http://localhost:3000/orders/get-one/${result._id}`,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
