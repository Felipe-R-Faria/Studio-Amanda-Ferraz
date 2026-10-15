async function acessar() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.style.display = "none";

  if (!email || !senha) {
    erro.textContent = "Preencha todos os campos.";
    erro.style.display = "block";
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      erro.textContent = data.error || "Erro ao fazer login.";
      erro.style.display = "block";
      return;
    }

    // Redireciona pro dashboard (token já salvo no cookie pelo servidor)
    window.location.href = "/dashboardhome";

  } catch (err) {
    erro.textContent = "Não foi possível conectar ao servidor.";
    erro.style.display = "block";
  }
}