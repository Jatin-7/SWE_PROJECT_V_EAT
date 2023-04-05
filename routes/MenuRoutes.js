const express = require("express");
const MenuItem = require("../models/MenuItem");
const Owner = require("../models/Owner");
const Restaurant = require("../models/Restaurant");
const validate = require("../utils/validate");
const router = express.Router();

router.get("/add-new-item", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  req.session.token = req.session.token;
  res.render("add_menu_item.ejs", {
    msg: "",
    restaurant,
    owner,
    menuItem: null,
  });
});

// Get all menuItems
router.get("/", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (err) {
    console.log("Error in getting menuItems", err);
    res.sendStatus(500);
  }
});

// Get menuItem for a specific restaurant
router.get("/:restaurantId", async (req, res) => {
  try {
    // find many items in the menuItem collection
    const menuItem = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    });
    res.json(menuItem);
  } catch (err) {
    console.log("Error in getting menuItem", err);
    res.sendStatus(500);
  }
});

// Create a new menuItem item
router.post("/", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  req.body.restaurantId = restaurant._id;
  const menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
  });
  req.session.token = req.session.token;
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    menuItems.push(menuItem);
    res.render("owner_update_menu.ejs", {
      msg: "Menu Item added successfully!",
      restaurant,
      owner,
      menuItems,
    });
  } catch (err) {
    console.log("Error in creating menuItem", err);
    res.render("owner_update_menu.ejs", {
      msg: "Menu Item added successfully!",
      restaurant,
      owner,
      menuItems,
    });
  }
});

router.post("/update/:menuItemId", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  req.session.token = req.session.token;

  try {
    const menuItem = await MenuItem.findById(req.params.menuItemId);

    if (menuItem) {
      res.render("add_menu_item.ejs", {
        msg: "",
        restaurant,
        owner,
        menuItem,
      });
    }
  } catch (err) {
    const menuItems = await MenuItem.find({
      restaurantId: restaurant._id,
    });
    console.log("Error in updating menuItem", err);
    res.render("owner_update_menu.ejs", {
      msg: "Error in updating menuItem",
      restaurant,
      owner,
      menuItems,
    });
  }
});

// Update a menuItem item
router.post("/:menuItemId", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  let menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
  });
  req.session.token = req.session.token;

  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.menuItemId,
      req.body,
      {
        new: true,
      }
    );
    menuItems = await MenuItem.find({
      restaurantId: restaurant._id,
    });
    res.render("owner_update_menu.ejs", {
      msg: "Menu Item updated successfully!",
      restaurant,
      owner,
      menuItems,
    });
  } catch (err) {
    console.log("Error in updating menuItem", err);
    res.render("owner_update_menu.ejs", {
      msg: "Error in updating menuItem",
      restaurant,
      owner,
      menuItems,
    });
  }
});

// Delete a menuItem item
router.post("/delete/:menuItemId", validate, async (req, res) => {
  req.session.token = req.session.token;
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  let menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
  });
  try {
    await MenuItem.findByIdAndDelete(req.params.menuItemId);
    menuItems = await MenuItem.find({
      restaurantId: restaurant._id,
    });
    res.render("owner_update_menu.ejs", {
      msg: "Menu Item deleted successfully!",
      restaurant,
      owner,
      menuItems,
    });
  } catch (err) {
    console.log("Error in deleting menuItem", err);
    res.render("owner_update_menu.ejs", {
      msg: "Error in deleting menuItem",
      restaurant,
      owner,
      menuItems,
    });
  }
});

module.exports = router;
