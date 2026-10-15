const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");
const { sendPasswordResetEmail } = require("./emailService");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_jwt_key_studio_amanda_ferraz";

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Preencha todos os campos." });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!rows || rows.length === 0)
      return res.status(401).json({ error: "E-mail ou senha incorretos." });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: "E-mail ou senha incorretos." });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Salva o token num cookie seguro (lido pelo servidor)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // mude pra true quando usar HTTPS em produção
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// solicitar redefinição de senha
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ error: "Informe o e-mail." });

  try {
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

    if (!rows || rows.length === 0)
      return res.json({ message: "Se o e-mail existir, você receberá um link em breve." });

    const userId = rows[0].id;

    await db.query(
      "UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?",
      [userId]
    );

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    await sendPasswordResetEmail(email, token);

    res.json({ message: "Se o e-mail existir, você receberá um link em breve." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao enviar o e-mail. Tente novamente." });
  }
});

// redefinir senha
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ error: "Token e nova senha são obrigatórios." });

  if (newPassword.length < 8)
    return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres." });

  try {
    const [rows] = await db.query(
      `SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()`,
      [token]
    );

    if (!rows || rows.length === 0)
      return res.status(400).json({ error: "Token inválido ou expirado." });

    const { id: tokenId, user_id } = rows[0];

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, user_id]);
    await db.query("UPDATE password_reset_tokens SET used = 1 WHERE id = ?", [tokenId]);

    res.json({ message: "Senha redefinida com sucesso! Faça login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

module.exports = router;