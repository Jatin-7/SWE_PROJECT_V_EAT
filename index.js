const express = require("express");
const connectDB = require("./utils/connectDB");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
connectDB();

app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(__dirname + "/assets"));

// View Engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/restaurant", require("./routes/RestaurantRoutes"));
app.use("/menu", require("./routes/MenuRoutes"));
app.use("/customer", require("./routes/CustomerRoutes"));
app.use("/owner", require("./routes/OwnerRoutes"));
app.use("/order", require("./routes/OrderRoutes"));

app.get("/", (req, res) => {
  res.render("index.ejs", { msg: "" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
