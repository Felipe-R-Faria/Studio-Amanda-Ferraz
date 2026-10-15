const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (err) {
    console.warn("Transporter init failed:", err.message);
  }
}

async function sendPasswordResetEmail(toEmail, token) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  console.log("-----------------------------------------");
  console.log("🔑 [RECUPERAÇÃO DE SENHA]");
  console.log(`Para: ${toEmail}`);
  console.log(`Link: ${resetLink}`);
  console.log("-----------------------------------------");

  if (!transporter) {
    console.log("ℹ️ SMTP não configurado. Link registrado no console acima.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Studio Amanda Ferraz" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Recuperação de senha - Studio Amanda Ferraz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2>Recuperação de senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Studio Amanda Ferraz.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block; padding: 12px 24px; background:#A7510F;
                    color:#fff; text-decoration:none; border-radius:6px; margin:16px 0;">
            Redefinir senha
          </a>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
          <hr/>
          <small>Link direto: ${resetLink}</small>
        </div>
      `,
    });
    console.log("✅ E-mail enviado com sucesso para:", toEmail);
  } catch (err) {
    console.warn("⚠️ Não foi possível enviar e-mail via SMTP:", err.message);
  }
}

module.exports = { sendPasswordResetEmail };