const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_jwt_key_studio_amanda_ferraz";

function pageAuthMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Erro no token:", err.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

module.exports = pageAuthMiddleware;