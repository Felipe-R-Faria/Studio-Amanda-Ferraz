async function redefinir() {
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");
  const confirmacao = document.getElementById("confirmacao");

  erro.style.display = "none";

  if (!senha || senha.length < 8) {
    erro.textContent = "A senha deve ter pelo menos 8 caracteres.";
    erro.style.display = "block";
    return;
  }

  // Pega o token da URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    erro.textContent = "Token inválido. Solicite a recuperação novamente.";
    erro.style.display = "block";
    return;
  }

  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: senha }),
    });

    const data = await response.json();

    if (response.ok) {
      confirmacao.style.display = "block";
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      erro.textContent = data.error || "Erro ao redefinir senha.";
      erro.style.display = "block";
    }
  } catch (err) {
    erro.textContent = "Não foi possível conectar ao servidor.";
    erro.style.display = "block";
  }
}