const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, defualt: 1, required: true },
  },
  {
    collections: "orders",
  }
);

module.exports = mongoose.model("Order", orderSchema);
