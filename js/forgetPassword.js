async function sendEmail() {
  const email = document.getElementById("email").value.trim();
  const erro = document.getElementById("erro");

  erro.style.display = "none";

  if (!email) {
    erro.textContent = "Digite seu e-mail.";
    erro.style.display = "block";
    return;
  }

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      window.location.href = "/verify-email";
    } else {
      erro.textContent = data.error || "Erro ao enviar e-mail.";
      erro.style.display = "block";
    }
  } catch (err) {
    erro.textContent = "Não foi possível conectar ao servidor.";
    erro.style.display = "block";
  }
}