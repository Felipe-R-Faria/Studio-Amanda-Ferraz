# ✨ Studio Amanda Ferraz — Website & Painel Administrativo

<p align="center">
  <img src="/img/Studio%20Logo.png" alt="Studio Amanda Ferraz Logo" width="220" />
</p>

<p align="center">
  <strong>Plataforma completa de apresentação de serviços e gestão para salão de beleza e estética.</strong><br>
  Especializado em cuidados capilares, alisamentos e extensão de cílios.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22.x-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Handlebars-8.x-orange?style=for-the-badge&logo=handlebars.js" alt="Handlebars" />
  <img src="https://img.shields.io/badge/MySQL-Supported-blue?style=for-the-badge&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-Authentication-yellow?style=for-the-badge&logo=json-web-tokens" alt="JWT" />
</p>

---

## 📖 Sobre o Projeto

O **Studio Amanda Ferraz** é um sistema web full-stack desenvolvido para atender às necessidades do salão de beleza gerido pelas irmãs **Amanda Ferraz** (especialista em alisamento e tratamentos capilares) e **Eduarda Ferraz** (especialista em extensão de cílios).

O sistema é dividido em duas partes principais:
1. **Portal Público**: Apresentação visual elegante, catálogo de serviços dinâmico, depoimentos de clientes, mapa de localização e integração de agendamento direto via WhatsApp.
2. **Painel Administrativo (Dashboard)**: Área restrita protegida por autenticação para gerenciar o catálogo de serviços, cadastrar novas fotos, alterar preços e monitorar métricas.

---

## 🚀 Principais Funcionalidades

### 🌐 Área Pública
- **Página Inicial (Home)**:
  - Hero banner rotativo com carrossel responsivo.
  - Apresentação sobre o salão e biografia das profissionais Amanda e Eduarda.
  - Carrossel dinâmico de serviços segmentado por categorias (**Cabelos** e **Cílios**).
  - Seção de depoimentos e avaliações de clientes com renderização dinâmica de estrelas.
  - Mapa interativo via Leaflet / OpenStreetMap com marcador exato do estúdio em São Paulo.
  - Links para redes sociais e rodapé institucional com horários e formas de pagamento aceitas (Pix, Cartão, Dinheiro).
- **Agendamento Direto (`/agendar`)**:
  - Cards dedicados para Amanda Ferraz e Eduarda Ferraz com botão direto para WhatsApp com mensagem personalizada.
- **Fluxo de Recuperação de Senha**:
  - Solicitação de redefinição via e-mail (`/forgot-password`).
  - Envio seguro de token de uso único com expiração de 1 hora (`/verify-email`).
  - Formulário para cadastro de nova senha com hash criptografado (`/reset-password`).

### 🔒 Área Administrativa (Dashboard)
- **Autenticação Segura**:
  - Login via API REST (`/api/auth/login`) com validação de senha por `bcryptjs`.
  - Sessão mantida via cookie HTTP-Only com token JWT (JSON Web Token).
  - Middleware de proteção de rotas (`pageAuthMiddleware`) com redirecionamento automático para usuários não autenticados.
- **Painel Geral (`/dashboardhome`)**:
  - Cards com estatísticas em tempo real: total de serviços e imagens cadastradas.
  - Atalhos rápidos para adicionar novos itens ou visualizar a lista.
- **Gerenciamento de Serviços (`/gerenciar`)**:
  - Cadastro de novos serviços informando título, valor em reais, categoria e descrição.
  - Upload de imagens diretamente pelo formulário com salvamento automático no servidor.
  - Notificações de sucesso através de SweetAlert2.
- **Visualização e Edição (`/visualizar`)**:
  - Carrossel interativo com todos os serviços cadastrados.
  - Edição in-place através de modal (alterar nome, preço, descrição ou substituir foto).
  - Exclusão com confirmação e remoção do arquivo de imagem do servidor.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Ambiente de Execução** | Node.js (v22+) | Runtime JavaScript de alta performance no backend |
| **Framework Web** | Express.js | Criação de rotas, middlewares, APIs REST e servidor HTTP |
| **Template Engine** | Express-Handlebars | Renderização do HTML no servidor (Server-Side Rendering) |
| **Banco de Dados** | MySQL2 / Fallback In-Memory | Armazenamento de serviços, usuários e tokens de senha |
| **Segurança & Criptografia** | Bcryptjs & JWT | Hashing de senhas seguro e autenticação baseada em tokens |
| **Upload de Arquivos** | Express-FileUpload | Gerenciamento de arquivos enviados via formulários multipart |
| **E-mails** | Nodemailer | Envio transacional de e-mails para recuperação de acesso |
| **Interface & Estilo** | CSS3 & Bootstrap 5 | Layout responsivo, tipografia personalizada (Urbanist / Prata) |
| **Componentes Visuais** | SweetAlert2, FontAwesome, Leaflet | Alertas dinâmicos, ícones vetoriais e mapa geográfico |

---

## 📁 Estrutura de Diretórios

```text
Studio-Amanda-Ferraz/
├── css/
│   ├── dashboard.css          # Estilos do painel administrativo
│   ├── ForgetPassword.css     # Estilos da tela de recuperação de senha
│   ├── login.css              # Estilos da tela de login
│   ├── RefindPassword.css     # Estilos da tela de redefinição de senha
│   ├── styles.css             # Folha de estilo principal da home e agendamento
│   └── verify.css             # Estilos da tela de confirmação de e-mail
├── imagem/                    # Uploads e imagens dos serviços cadastrados
├── img/                       # Identidade visual, logos, ícones e ilustrações
├── js/
│   ├── authmiddleware.js      # Middleware de proteção para rotas de API (Bearer)
│   ├── authroutes.js          # Rotas de login, logout e recuperação de senha
│   ├── db.js                  # Conexão híbrida MySQL com camada in-memory fallback
│   ├── emailService.js        # Serviço de envio de e-mails (Nodemailer)
│   ├── forgetPassword.js      # Script cliente para envio de e-mail de recuperação
│   ├── login.js               # Script cliente para autenticação no painel
│   ├── pageAuthMiddleware.js  # Middleware de proteção para páginas do dashboard
│   ├── refindPassword.js      # Script cliente para salvar nova senha
│   └── script.js              # Script cliente da home (carrossel, mapa, reviews)
├── views/
│   ├── agendar.handlebars     # Página para agendamento com profissionais
│   ├── dashboardhome.handlebars # Página inicial da dashboard administrativa
│   ├── ForgetPassword.handlebars# Formulário de 'Esqueci minha senha'
│   ├── formularioAlterar.handlebars # Página alternativa para edição de serviço
│   ├── gerenciar.handlebars   # Formulário para cadastrar novos serviços
│   ├── home.handlebars        # Landing page institucional do salão
│   ├── login.handlebars       # Tela de acesso administrativo
│   ├── RefindPassword.handlebars# Formulário para digitação da nova senha
│   ├── verifyEmail.handlebars # Tela de aviso de e-mail enviado
│   └── visualizar.handlebars  # Galeria e carrossel de serviços para edição/exclusão
├── .env.example               # Exemplo das variáveis de ambiente
├── index.js                   # Ponto de entrada da aplicação Express
├── metadata.json              # Configurações do applet no AI Studio
├── package.json               # Dependências e scripts de execução
└── README.md                  # Documentação completa do projeto
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
# Porta do servidor HTTP
PORT=3000

# Conexão com o Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=StudioAmandaFerraz

# Chave Secreta para Assinatura de Tokens JWT
JWT_SECRET=super_secret_jwt_key_studio_amanda_ferraz

# Configurações de Envio de E-mail (Opcional para Recuperação de Senha)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
FRONTEND_URL=http://localhost:3000
```

> **Nota sobre o Banco de Dados:** A aplicação possui uma camada inteligente de fallback in-memory em `js/db.js`. Caso você execute a aplicação sem uma instância ativa do MySQL, ela continuará funcionando normalmente com dados demonstrativos pré-carregados!

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalada
- Gerenciador de pacotes `npm`

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Felipe-R-Faria/Studio-Amanda-Ferraz.git
   cd Studio-Amanda-Ferraz
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação no seu navegador:**
   - Site Público: [http://localhost:3000](http://localhost:3000)
   - Painel Administrativo: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Credenciais Padrão para Testes

Caso utilize o mock em memória ou queira testar imediatamente:

| Usuário | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@studio.com` | `admin123` |
| **Amanda Ferraz** | `amanda@ferraz.com` | `12345678` |

---

## 🗄️ Estrutura do Banco de Dados (SQL)

Caso queira conectar a um servidor MySQL local ou na nuvem, utilize o script DDL abaixo:

```sql
CREATE DATABASE IF NOT EXISTS StudioAmandaFerraz DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE StudioAmandaFerraz;

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS tbservico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  descricao TEXT,
  imagem VARCHAR(255),
  categoria ENUM('cabelo', 'cilios') NOT NULL DEFAULT 'cabelo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários Administrativos
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tokens para Recuperação de Senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dados Iniciais (Exemplo)
INSERT INTO users (name, email, password) VALUES
('Amanda Ferraz', 'amanda@ferraz.com', '$2a$10$wTqK1kLGBG9y519V3690d.cM1dJ8p1jYt5W5h1o5iL1K1e9Q4r2kG'),
('Administrador', 'admin@studio.com', '$2a$10$7Z2vA92y4B2uA5O2P1bM8eQyNqA.l6w6X2l.1yqL5J4K3M2N1O0Pq');

INSERT INTO tbservico (nome, valor, descricao, imagem, categoria) VALUES
('Progressiva sem Formol', 180.00, 'Alisamento duradouro e com brilho espelhado.', 'IMG_3367.jpg', 'cabelo'),
('Corte e Hidratação Profunda', 120.00, 'Corte personalizado aliado a nutrição intensiva.', 'IMG_6558.jpg', 'cabelo'),
('Extensão de Cílios Fio a Fio', 140.00, 'Aplicação delicada e super natural.', 'FOTO DUDA 1.png', 'cilios'),
('Volume Russo', 170.00, 'Efeito volumoso com fios ultrafinos e leves.', 'Curly hair-pana.png', 'cilios');
```

---

## 🗺️ Mapa de Rotas do Sistema

### Páginas Públicas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Página principal com serviços, avaliações e localização |
| `GET` | `/agendar` | Seleção de especialista e agendamento via WhatsApp |
| `GET` | `/login` | Página de login com e-mail e senha |
| `GET` | `/forgot-password` | Solicitação de e-mail de recuperação de senha |
| `GET` | `/verify-email` | Confirmação visual de envio do link de recuperação |
| `GET` | `/reset-password` | Formulário para digitação da nova senha com token |

### Painel Administrativo (Requer Autenticação)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/dashboardhome` | Resumo estatístico do salão e atalhos de navegação |
| `GET` | `/gerenciar` | Formulário de inclusão de novos serviços com upload de foto |
| `GET` | `/visualizar` | Carrossel e gerenciador de serviços cadastrados |
| `POST` | `/cadastrar` | Processa o envio e salva novo serviço |
| `POST` | `/editar` | Atualiza dados e/ou imagem de serviço existente |
| `GET` | `/remover/:id/:imagem`| Exclui o serviço e apaga o arquivo físico da imagem |

### Endpoints da API REST
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Autentica o usuário e grava cookie HTTP-Only |
| `POST` | `/api/auth/logout` | Remove o cookie e invalida a sessão |
| `POST` | `/api/auth/forgot-password` | Gera token de recuperação e despacha e-mail |
| `POST` | `/api/auth/reset-password` | Valida token e atualiza a senha criptografada |
| `GET` | `/api/stats` | Retorna métricas de serviços e fotos para o dashboard |

---

## 👥 Integrantes do Projeto

Agradecimentos especiais a todos os desenvolvedores e colaboradores que participaram da concepção, design e desenvolvimento desta aplicação:

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/niczonha">
          <img src="https://github.com/niczonha.png" width="100px;" style="border-radius:50%;" alt="Nicoly Santos"/><br>
          <sub><b>Nicoly Santos</b></sub><br>
          <sub><code>@niczonha</code></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Nicollas-ls">
          <img src="https://github.com/Nicollas-ls.png" width="100px;" style="border-radius:50%;" alt="Nicollas"/><br>
          <sub><b>Nicollas</b></sub><br>
          <sub><code>@Nicollas-ls</code></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Fabinh0ne">
          <img src="https://github.com/Fabinh0ne.png" width="100px;" style="border-radius:50%;" alt="Fabinho"/><br>
          <sub><b>Fabinho</b></sub><br>
          <sub><code>@Fabinh0ne</code></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Felipe-R-Faria">
          <img src="https://github.com/Felipe-R-Faria.png" width="100px;" style="border-radius:50%;" alt="Felipe R."/><br>
          <sub><b>Felipe R.</b></sub><br>
          <sub><code>@Felipe-R-Faria</code></sub>
        </a>
      </td>
    </tr>
  </table>
</div>

<br>

| Integrante | Usuário GitHub | Link de Acesso |
|---|---|---|
| **Nicoly Santos** | `@niczonha` | [github.com/niczonha](https://github.com/niczonha) |
| **Nicollas** | `@Nicollas-ls` | [github.com/Nicollas-ls](https://github.com/Nicollas-ls) |
| **Fabinho** | `@Fabinh0ne` | [github.com/Fabinh0ne](https://github.com/Fabinh0ne) |
| **Felipe R. Faria** | `@Felipe-R-Faria` | [github.com/Felipe-R-Faria](https://github.com/Felipe-R-Faria) |

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE).

<p align="center">
  Desenvolvido com carinho para o <strong>Studio Amanda Ferraz</strong> 💇‍♀️✨
</p>