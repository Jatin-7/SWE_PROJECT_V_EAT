const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    },
    restaurantName: {
      type: String,
      required: true,
    },
    restaurantAddress: {
      type: String,
      required: true,
    },
    restaurantZip: {
      type: String,
      required: true,
    },
    restaurantPhone: {
      type: String,
      required: true,
    },
    restaurantImage: {
      type: String,
    },
    restaurantDescription: {
      type: String,
    },
    restaurantCuisine: {
      type: String,
    },
    restaurantDelivery: {
      type: Boolean,
      default: false,
    },
    restaurantTakeout: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
