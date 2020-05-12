require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");

router.post("/create-one", (req, res, next) => {
  const { username, password } = req.body;
  User.find({ username })
    .exec()
    .then((user) => {
      if (user.length >= 1)
        return res.status(409).json({
          message: "Email address already exists.",
        });
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: err });
        const user = new User({
          _id: new mongoose.Types.ObjectId(),
          username,
          password: hash,
        });
        user
          .save()
          .then((result) => {
            console.log(result);
            res.status(201).json({
              message: `User created.`,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/delete-one/:_id", (req, res, next) => {
  const { _id } = req.params;
  User.remove({ _id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: `User deleted.`,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .exec()
    .then((user) => {
      if (!user) return res.status(401).json({ message: `Auth failed` });
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: `Auth failed`,
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: user.username,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          return res.status(200).json({
            message: `Auth successful`,
            token,
          });
        }
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
