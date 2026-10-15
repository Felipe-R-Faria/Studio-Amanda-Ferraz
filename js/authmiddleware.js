const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_jwt_key_studio_amanda_ferraz";

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Token não fornecido." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

module.exports = authMiddleware;