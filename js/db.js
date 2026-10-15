const mysql = require("mysql2");
const mysqlPromise = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// In-memory data store for fallback when MySQL server is not reachable
const initialServices = [
  {
    id: 1,
    nome: "Progressiva sem Formol",
    valor: 180.0,
    descricao: "Alisamento seguro e duradouro, proporcionando brilho intenso e redução de volume sem agredir os fios.",
    imagem: "IMG_3367.jpg",
    categoria: "cabelo"
  },
  {
    id: 2,
    nome: "Corte e Hidratação Profunda",
    valor: 120.0,
    descricao: "Corte personalizado aliado a uma reposição lipídica e hídrica de alta performance.",
    imagem: "IMG_6558.jpg",
    categoria: "cabelo"
  },
  {
    id: 3,
    nome: "Alisamento Térmico",
    valor: 220.0,
    descricao: "Realinhamento capilar térmico com selagem das cutículas para fios sedosos e alinhados.",
    imagem: "nica.jpg",
    categoria: "cabelo"
  },
  {
    id: 4,
    nome: "Extensão de Cílios Fio a Fio",
    valor: 140.0,
    descricao: "Aplicação delicada e natural, realçando o olhar com fios leves e confortáveis.",
    imagem: "FOTO DUDA 1.png",
    categoria: "cilios"
  },
  {
    id: 5,
    nome: "Volume Russo",
    valor: 170.0,
    descricao: "Técnica que cria leques de fios ultra-finos proporcionando volume marcante e sofisticado.",
    imagem: "Curly hair-pana.png",
    categoria: "cilios"
  },
  {
    id: 6,
    nome: "Lash Lifting",
    valor: 110.0,
    descricao: "Curvatura e hidratação dos cílios naturais para um olhar desperto e destacado.",
    imagem: "nica com splash.png",
    categoria: "cilios"
  }
];

const mockStore = {
  services: [...initialServices],
  nextServiceId: 7,
  users: [
    {
      id: 1,
      name: "Amanda Ferraz",
      email: "amanda@ferraz.com",
      password: bcrypt.hashSync("12345678", 10)
    },
    {
      id: 2,
      name: "Administrador",
      email: "admin@studio.com",
      password: bcrypt.hashSync("admin123", 10)
    }
  ],
  nextUserId: 3,
  tokens: [],
  nextTokenId: 1
};

// Mock Query Handler
function executeMockQuery(sql, params = []) {
  const cleanSql = sql.trim();
  const lowerSql = cleanSql.toLowerCase();

  // SELECT * FROM tbservico WHERE id = ...
  if (lowerSql.startsWith("select * from tbservico where id =")) {
    const match = cleanSql.match(/where\s+id\s*=\s*['"]?(\d+)['"]?/i);
    const id = match ? parseInt(match[1], 10) : (params[0] ? parseInt(params[0], 10) : null);
    const item = mockStore.services.find(s => s.id === id);
    return item ? [item] : [];
  }

  // SELECT * FROM tbservico
  if (lowerSql.startsWith("select * from tbservico")) {
    return [...mockStore.services];
  }

  // SELECT COUNT(*) as total FROM tbservico WHERE imagem IS NOT NULL AND imagem != "" AND id >= ...
  if (lowerSql.includes("count(*)") && lowerSql.includes("imagem is not null") && lowerSql.includes("max(id)")) {
    const maxId = mockStore.services.reduce((max, s) => Math.max(max, s.id), 0);
    const minId = Math.max(0, maxId - 7);
    const count = mockStore.services.filter(s => s.imagem && s.id >= minId).length;
    return [{ total: count }];
  }

  // SELECT COUNT(*) as total FROM tbservico WHERE imagem IS NOT NULL AND imagem != ""
  if (lowerSql.includes("count(*)") && lowerSql.includes("imagem is not null")) {
    const count = mockStore.services.filter(s => !!s.imagem).length;
    return [{ total: count }];
  }

  // SELECT COUNT(*) as total FROM tbservico
  if (lowerSql.includes("count(*)") && lowerSql.includes("from tbservico")) {
    return [{ total: mockStore.services.length }];
  }

  // INSERT INTO tbservico (nome, valor, descricao, imagem, categoria) VALUES ('...', ..., '...', '...', '...')
  if (lowerSql.startsWith("insert into tbservico")) {
    let nome = "", valor = 0, descricao = "", imagem = "", categoria = "cabelo";
    if (params && params.length >= 5) {
      [nome, valor, descricao, imagem, categoria] = params;
    } else {
      const valMatch = cleanSql.match(/values\s*\((.*)\)/i);
      if (valMatch) {
        const parts = valMatch[1].split(",").map(p => p.trim().replace(/^['"]|['"]$/g, ""));
        nome = parts[0] || "Serviço";
        valor = parseFloat(parts[1]) || 0;
        descricao = parts[2] || "";
        imagem = parts[3] || "";
        categoria = parts[4] || "cabelo";
      }
    }
    const newService = {
      id: mockStore.nextServiceId++,
      nome,
      valor: parseFloat(valor) || 0,
      descricao,
      imagem,
      categoria
    };
    mockStore.services.push(newService);
    return { insertId: newService.id, affectedRows: 1 };
  }

  // UPDATE tbservico SET ... WHERE id = ...
  if (lowerSql.startsWith("update tbservico")) {
    const idMatch = cleanSql.match(/where\s+id\s*=\s*['"]?(\d+)['"]?/i);
    const id = idMatch ? parseInt(idMatch[1], 10) : (params.length ? parseInt(params[params.length - 1], 10) : null);
    const service = mockStore.services.find(s => s.id === id);
    if (service) {
      const nomeMatch = cleanSql.match(/nome\s*=\s*'([^']*)'/i);
      const valorMatch = cleanSql.match(/valor\s*=\s*([0-9.]+)/i);
      const descMatch = cleanSql.match(/descricao\s*=\s*'([^']*)'/i);
      const imgMatch = cleanSql.match(/imagem\s*=\s*'([^']*)'/i);

      if (nomeMatch) service.nome = nomeMatch[1];
      if (valorMatch) service.valor = parseFloat(valorMatch[1]);
      if (descMatch) service.descricao = descMatch[1];
      if (imgMatch) service.imagem = imgMatch[1];
    }
    return { affectedRows: service ? 1 : 0 };
  }

  // DELETE FROM tbservico WHERE id = ...
  if (lowerSql.startsWith("delete from tbservico")) {
    const idMatch = cleanSql.match(/where\s+id\s*=\s*['"]?(\d+)['"]?/i);
    const id = idMatch ? parseInt(idMatch[1], 10) : (params[0] ? parseInt(params[0], 10) : null);
    const index = mockStore.services.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStore.services.splice(index, 1);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // USERS: SELECT * FROM users WHERE email = ?
  if (lowerSql.includes("from users where email")) {
    const email = params[0] || (cleanSql.match(/email\s*=\s*'([^']+)'/i) || [])[1];
    const user = mockStore.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
    return user ? [user] : [];
  }

  // USERS: SELECT id FROM users WHERE email = ?
  if (lowerSql.includes("from users") && lowerSql.includes("email")) {
    const email = params[0] || (cleanSql.match(/email\s*=\s*'([^']+)'/i) || [])[1];
    const user = mockStore.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
    return user ? [{ id: user.id }] : [];
  }

  // UPDATE users SET password = ? WHERE id = ?
  if (lowerSql.startsWith("update users set password")) {
    const [password, userId] = params;
    const user = mockStore.users.find(u => u.id === parseInt(userId, 10));
    if (user) user.password = password;
    return { affectedRows: user ? 1 : 0 };
  }

  // PASSWORD RESET TOKENS
  if (lowerSql.startsWith("update password_reset_tokens set used = 1 where user_id = ?")) {
    const userId = parseInt(params[0], 10);
    mockStore.tokens.filter(t => t.user_id === userId).forEach(t => t.used = 1);
    return { affectedRows: 1 };
  }

  if (lowerSql.startsWith("insert into password_reset_tokens")) {
    const [user_id, token, expires_at] = params;
    const newToken = {
      id: mockStore.nextTokenId++,
      user_id: parseInt(user_id, 10),
      token,
      expires_at: new Date(expires_at),
      used: 0
    };
    mockStore.tokens.push(newToken);
    return { insertId: newToken.id, affectedRows: 1 };
  }

  if (lowerSql.includes("from password_reset_tokens where token =")) {
    const token = params[0] || (cleanSql.match(/token\s*=\s*'([^']+)'/i) || [])[1];
    const match = mockStore.tokens.find(t => t.token === token && t.used === 0 && new Date(t.expires_at) > new Date());
    return match ? [match] : [];
  }

  if (lowerSql.startsWith("update password_reset_tokens set used = 1 where id = ?")) {
    const tokenId = parseInt(params[0], 10);
    const token = mockStore.tokens.find(t => t.id === tokenId);
    if (token) token.used = 1;
    return { affectedRows: token ? 1 : 0 };
  }

  return [];
}

// Check if real MySQL can be reached
let useMock = true;
let realPool = null;
let realConexao = null;

if (process.env.DB_HOST && process.env.DB_HOST !== "localhost") {
  try {
    realPool = mysqlPromise.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    useMock = false;
  } catch (err) {
    console.warn("[DB] MySQL connection init failed, using mock data layer:", err.message);
    useMock = true;
  }
}

// Hybrid Promise Pool export
const pool = {
  async query(sql, params) {
    if (!useMock && realPool) {
      try {
        return await realPool.query(sql, params);
      } catch (err) {
        console.warn("[DB] Query to real MySQL failed, falling back to mock:", err.message);
      }
    }
    const res = executeMockQuery(sql, params);
    return [res, []];
  }
};

// Hybrid Callback Conexao export
const conexao = {
  connect(cb) {
    if (!useMock && realConexao) {
      return realConexao.connect(cb);
    }
    console.log("[DB] Conexão com banco de dados inicializada (mock/in-memory ativo).");
    if (cb) cb(null);
  },
  query(sql, paramsOrCb, maybeCb) {
    let params = [];
    let cb = maybeCb;
    if (typeof paramsOrCb === "function") {
      cb = paramsOrCb;
      params = [];
    } else if (Array.isArray(paramsOrCb)) {
      params = paramsOrCb;
    }

    if (!useMock && realConexao) {
      return realConexao.query(sql, params, (err, results, fields) => {
        if (err) {
          console.warn("[DB] Callback query failed on real MySQL, falling back to mock:", err.message);
          const res = executeMockQuery(sql, params);
          if (cb) return cb(null, res);
        }
        if (cb) cb(err, results, fields);
      });
    }

    try {
      const res = executeMockQuery(sql, params);
      if (cb) cb(null, res);
    } catch (err) {
      if (cb) cb(err);
    }
  }
};

module.exports = pool;
module.exports.conexao = conexao;
module.exports.mockStore = mockStore;