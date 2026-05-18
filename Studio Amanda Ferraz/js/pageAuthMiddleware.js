const jwt = require("jsonwebtoken");
require("dotenv").config({ path: './js/.env' });

function pageAuthMiddleware(req, res, next) {
  const token = req.cookies?.token;

  console.log("🍪 Cookies recebidos:", req.cookies);
  console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "UNDEFINED");
  console.log("🎟️ Token:", token ? "existe" : "NÃO existe");

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token válido:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Erro no token:", err.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

module.exports = pageAuthMiddleware;