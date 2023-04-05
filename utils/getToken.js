require("dotenv").config();
const { sign } = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (info, expiresIn) => {
  return sign(info, JWT_SECRET, {
    expiresIn: expiresIn,
  });
};
