const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "ok" : "VAZIO");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendPasswordResetEmail(toEmail, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Sistema de Login" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Recuperação de senha",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Recuperação de senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block; padding: 12px 24px; background:#4f46e5;
                    color:#fff; text-decoration:none; border-radius:6px; margin:16px 0;">
            Redefinir senha
          </a>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
          <hr/>
          <small>Link direto: ${resetLink}</small>
        </div>
      `,
    });
    console.log("✅ E-mail enviado para:", toEmail);
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err.message);
  }
}

module.exports = { sendPasswordResetEmail };