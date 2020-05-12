const express = require("express");
const router = express.Router();
const Product = require("../models/product-model");
const mongoose = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${new Date().toISOString().replace(/:|\./g, "")}.${file.originalname}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg") return cb(null, true);
  if (file.mimetype === "image/png") return cb(null, true);
  return cb(null, false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

router.get(`/get-all`, (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: `http://localhost:3000/products/get-one/${doc._id}`,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err });
    });
});

router.get(`/get-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  Product.findById(_id)
    .select("name price _id productImage")
    .exec()
    .then((doc) => {
      console.log(doc);
      if (!doc) res.status(404).json({ message: "Product not found" });
      res.status(200).json({
        product: doc,
        request: {
          type: "GET",
          description: "Get all products.",
          url: `http://localhost:3000/products/get-all`,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch(`/update-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  const { body } = req;
  Product.update({ _id }, { $set: body })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: `Product updated.`,
        request: {
          type: "GET",
          url: `http://localhost:3000/products/get-one/${_id}`,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete(`/delete-one/:_id`, (req, res, next) => {
  const { _id } = req.params;
  Product.remove({ _id })
    .exec()
    .then((result) =>
      res.status(200).json({
        message: `Product deleted.`,
        request: {
          type: `POST`,
          description: `Create new product`,
          url: `http://localhost:3000/products/create-one`,
          body: { name: "String", price: "Number" },
        },
      })
    )
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post(`/create-one`, upload.single(`productImage`), (req, res, next) => {
  const { name, price } = req.body;
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name,
    price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: `Created product successfully.`,
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: `http://localhost:3000/products/get-one/${result._id}`,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
