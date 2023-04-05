const express = require("express");
const Customer = require("../models/Customer");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Owner = require("../models/Owner");
const Restaurant = require("../models/Restaurant");
const validate = require("../utils/validate");
const router = express.Router();

router.get("/update-menu", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  console.log("owner", owner);
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  const menuItems = await MenuItem.find({ restaurantId: restaurant._id });
  if (req.session.owner) {
    req.session.token = req.session.token;
    res.render("owner_update_menu.ejs", {
      msg: "",
      owner,
      restaurant,
      menuItems,
    });
  } else {
    res.render("login.ejs", { user: "Owner", msg: "Login expired!" });
  }
});

router.get("/current-orders", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  const orders = await Order.find({ restaurantId: restaurant._id });
  const orderMapped = await Promise.all(
    orders.map(async (order) => {
      const orderItemsMapped = order.orderItems.map(async (orderItem) => {
        const menuItem = await MenuItem.findById(orderItem.item);
        return {
          menuItemName: menuItem.name,
          quantity: orderItem.quantity,
        };
      });

      const orderItems = await Promise.all(orderItemsMapped);
      const restaurant = await Restaurant.findById(order.restaurantId);

      return {
        orderId: order._id,
        orderItems,
        canteenName: restaurant.restaurantName,
        restaurantAddress: restaurant.restaurantAddress,
        orderStatus: order.orderStatus,
        totalPrice: order.orderTotal,
        status: order.orderStatus,
        expectedPickupTime: order.expectedPickUpTime,
        description: order.tableRequests,
        date: order.createdDate.toLocaleDateString(),
        time: order.createdDate.toLocaleTimeString(),
      };
    })
  );
  if (req.session.owner) {
    req.session.token = req.session.token;
    res.render("owner_current_orders.ejs", {
      msg: "",
      owner,
      restaurant,
      orders: orderMapped,
    });
  } else {
    res.render("login.ejs", { user: "Owner", msg: "Login expired!" });
  }
});

router.get("/completed-orders", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  const orders = await Order.find({ restaurantId: restaurant._id });
  const orderMapped = await Promise.all(
    orders.map(async (order) => {
      const orderItemsMapped = order.orderItems.map(async (orderItem) => {
        const menuItem = await MenuItem.findById(orderItem.item);
        if (!menuItem) {
          return null;
        } else {
          return {
            menuItemName: menuItem.name,
            quantity: orderItem.quantity,
          };
        }
      });
      const orderItems = await Promise.all(orderItemsMapped);
      const restaurant = await Restaurant.findById(order.restaurantId);
      // filter out null values
      const filteredOrderItems = orderItems.filter((item) => item !== null);

      return {
        orderId: order._id,
        orderItems: filteredOrderItems,
        canteenName: restaurant.restaurantName,
        restaurantAddress: restaurant.restaurantAddress,
        orderStatus: order.orderStatus,
        totalPrice: order.orderTotal,
        status: order.orderStatus,
        expectedPickupTime: order.expectedPickUpTime,
        description: order.tableRequests,
        date: order.createdDate.toLocaleDateString(),
        time: order.createdDate.toLocaleTimeString(),
      };
    })
  );
  if (req.session.owner) {
    req.session.token = req.session.token;
    res.render("owner_completed_orders.ejs", {
      msg: "",
      owner,
      restaurant,
      orders: orderMapped,
    });
  } else {
    res.render("login.ejs", { user: "Owner", msg: "Login expired!" });
  }
});

router.get("/dashboard", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const owner = await Owner.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ ownerId: owner._id });
  const orders = await Order.find({ restaurantId: restaurant._id });
  const orderMapped = await Promise.all(
    orders.map(async (order) => {
      const orderItemsMapped = order.orderItems.map(async (orderItem) => {
        const menuItem = await MenuItem.findById(orderItem.item);
        return {
          menuItemName: menuItem.name,
          quantity: orderItem.quantity,
        };
      });

      const orderItems = await Promise.all(orderItemsMapped);
      const restaurant = await Restaurant.findById(order.restaurantId);

      return {
        orderId: order._id,
        orderItems,
        canteenName: restaurant.restaurantName,
        restaurantAddress: restaurant.restaurantAddress,
        orderStatus: order.orderStatus,
        totalPrice: order.orderTotal,
        expectedPickupTime: order.expectedPickUpTime,
        description: order.tableRequests,
        status: order.orderStatus,
        date: order.createdDate.toLocaleDateString(),
        time: order.createdDate.toLocaleTimeString(),
      };
    })
  );
  if (req.session.owner) {
    req.session.token = req.session.token;
    res.render("owner_home.ejs", {
      msg: "",
      restaurant,
      owner,
      orders: orderMapped,
    });
  } else {
    res.render("login.ejs", { user: "Owner", msg: "Login expired!" });
  }
});

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.log("Error in getting restaurants", err);
    res.sendStatus(500);
  }
});

// Get a specific restaurant
router.get("/:restaurantId", validate, async (req, res) => {
  const userName = req.decodedToken.userName;
  const restaurantId = req.params.restaurantId;
  const customer = await Customer.findOne({ userName: userName });
  const restaurant = await Restaurant.findOne({ _id: restaurantId });
  const menuItems = await MenuItem.find({ restaurantId: restaurantId });
  const restaurants = await Restaurant.find();
  req.session.token = req.session.token;
  try {
    if (req.session.token) {
      res.render("restaurant.ejs", {
        msg: "",
        restaurant,
        customer,
        menuItems,
      });
    } else {
      res.render("login.ejs", { user: "Customer", msg: "Login expired!" });
    }
  } catch (err) {
    res.render("customer_home.ejs", {
      msg: "Restaurant not found!",
      customer,
      restaurants,
    });
  }
});

// Create a new restaurant
router.post("/", validate, async (req, res) => {
  const ownerId = req.body.ownerId;
  // verify owner
  const owner = await Owner.findById(ownerId);

  if (!owner) {
    res.render("add_new_restaurant.ejs", {
      ownerId,
      msg: "Owner not found",
    });
  }

  req.session.token = req.session.token;
  const {
    email,
    restaurantName,
    restaurantPhone,
    restaurantAddress,
    restaurantZip,
  } = req.body;
  if (
    !email ||
    !restaurantName ||
    !restaurantPhone ||
    !restaurantAddress ||
    !restaurantZip
  ) {
    res.render("add_new_restaurant.ejs", {
      ownerId,
      msg: "Please enter all fields",
    });
  }
  if (restaurantPhone.length < 10 || restaurantPhone.length > 10) {
    res.render("add_new_restaurant.ejs", {
      ownerId,
      msg: "Phone number must be 10 characters",
    });
  }
  if (restaurantZip.length !== 6) {
    res.render("add_new_restaurant.ejs", {
      ownerId,
      msg: "Zip code must be 6 characters",
    });
  }

  try {
    const restaurant = new Restaurant({
      email,
      restaurantName,
      restaurantPhone,
      restaurantAddress,
      restaurantZip,
      ownerId,
      ownerName: owner.name,
    });
    await restaurant.save();
    res.render("owner_home.ejs", {
      ownerId,
      restaurant,
      msg: "Restaurant already exists",
      orders: [],
      owner,
      restaurant,
    });
  } catch (err) {
    console.log("Error in creating restaurant", err);
    res.render("add_new_restaurant.ejs", {
      ownerId,
      msg: "Error in creating restaurant",
    });
  }
});

// Update a restaurant
router.put("/:restaurantId", validate, async (req, res) => {
  const ownerUserName = req.decodedToken.userName;
  // verify owner
  const owner = await Owner.findOne({ userName: ownerUserName });
  if (!owner) {
    res.status(400).json({ msg: "User does not exist" });
    return;
  }
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    res.status(404).json({ msg: "Restaurant does not exist" });
    return;
  }
  if (restaurant.ownerId == owner._id) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }

  const { restaurantPhone } = req.body;

  if (restaurantPhone && restaurantPhone.length !== 10) {
    res.status(400).json({ msg: "Phone number must be 10 characters" });
    return;
  }
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.restaurantId,
      req.body,
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    console.log("Error in updating restaurant", err);
    res.sendStatus(500);
  }
});

// Delete a restaurant
router.delete("/:restaurantId", validate, async (req, res) => {
  const ownerUserName = req.decodedToken.owner;
  // verify owner
  const owner = await Owner.findOne({ userName: ownerUserName });
  if (!owner) {
    res.status(400).json({ msg: "User does not exist" });
    return;
  }
  const restaurant = await Restaurant.findById(req.params.restaurantId);
  if (!restaurant) {
    res.status(404).json({ msg: "Restaurant does not exist" });
    return;
  }
  if (restaurant.ownerId !== owner._id) {
    res.status(401).json({ msg: "Unauthorized" });
    return;
  }

  try {
    await Restaurant.findByIdAndDelete(req.params.restaurantId);
    res.sendStatus(200);
  } catch (err) {
    console.log("Error in deleting restaurant", err);
    res.sendStatus(500);
  }
});

// Login a restaurant-owner
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  try {
    const restaurant = await Restaurant.findOne({ email: req.body.email });
    if (!restaurant) {
      res.sendStatus(404);
    } else {
      bcrypt.compare(req.body.password, restaurant.password, (err, result) => {
        if (err) {
          res.sendStatus(500);
        } else if (result) {
          req.session.restaurant = restaurant;
          res.json(restaurant);
        } else {
          res.sendStatus(401);
        }
      });
    }
  } catch (err) {
    console.log("Error in logging in restaurant", err);
    res.sendStatus(500);
  }
});

module.exports = router;
