// server.js — API principal
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ==============================
// Middleware: verifica token JWT
// ==============================
const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

// ==============================
// INIT — Cria todas as tabelas na ordem correta
// ==============================
async function initDB() {
  const conn = db.promise();
  try {
    await conn.query(`CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      nome_propriedade VARCHAR(255) NOT NULL,
      endereco VARCHAR(255) NOT NULL,
      referencia VARCHAR(255),
      documento VARCHAR(50) NOT NULL,
      cep VARCHAR(20),
      email VARCHAR(255) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS vendedores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT,
      nome VARCHAR(255) NOT NULL,
      documento VARCHAR(50),
      telefone VARCHAR(50),
      cidade VARCHAR(100),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(8) NOT NULL,
      expira DATETIME NOT NULL,
      usado TINYINT DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS categorias_insumos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS insumos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(255) NOT NULL,
      unidade VARCHAR(50) NOT NULL,
      valor_unitario DECIMAL(10,2) DEFAULT 0,
      quantidade_estoque DECIMAL(10,2) DEFAULT 0,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS movimentacoes_insumos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      insumo_id INT,
      tipo ENUM('entrada','saida') NOT NULL,
      quantidade DECIMAL(10,2) NOT NULL,
      valor_unitario DECIMAL(10,2) DEFAULT 0,
      observacao VARCHAR(255),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS compras_animais (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT,
      vendedor_id INT,
      numero_gta VARCHAR(50),
      numero_compra VARCHAR(10),
      sexo VARCHAR(50),
      faixa_etaria VARCHAR(50),
      quantidade INT NOT NULL,
      valor_kg DECIMAL(10,2) DEFAULT 0,
      data DATE NOT NULL,
      observacao TEXT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS animais (
      id INT AUTO_INCREMENT PRIMARY KEY,
      compra_id INT,
      brinco VARCHAR(100),
      peso_entrada DECIMAL(10,2),
      observacao TEXT,
      status VARCHAR(50) DEFAULT 'ativo',
      tipo_cadastro VARCHAR(50) DEFAULT 'compra',
      nome_pai VARCHAR(255),
      nome_mae VARCHAR(255),
      raca VARCHAR(100),
      data_nascimento DATE,
      valor_total DECIMAL(10,2),
      valor_venda DECIMAL(10,2),
      data_saida DATE,
      causa_morte VARCHAR(255),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (compra_id) REFERENCES compras_animais(id) ON DELETE SET NULL
    )`);

    await conn.query(`CREATE TABLE IF NOT EXISTS compras_insumos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT,
      vendedor_id INT,
      produto VARCHAR(255) NOT NULL,
      quantidade INT NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      nota_fiscal VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
    )`);

    const [rows] = await conn.query('SELECT COUNT(*) as total FROM categorias_insumos');
    if (rows[0].total === 0) {
      await conn.query(`INSERT INTO categorias_insumos (nome, slug) VALUES
        ('Alimentação', 'alimentacao'),
        ('Saúde', 'saude'),
        ('Solo/Pasto', 'solo_pasto')`);
    }

    // Migração: adicionar usuario_id em vendedores se não existir
    try {
      await conn.query(`ALTER TABLE vendedores ADD COLUMN usuario_id INT`);
      console.log('✅ Coluna usuario_id adicionada em vendedores.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('ℹ️ usuario_id já existe em vendedores.');
    }

    // Migração: adicionar usuario_id em insumos se não existir
    try {
      await conn.query(`ALTER TABLE insumos ADD COLUMN usuario_id INT`);
      console.log('✅ Coluna usuario_id adicionada em insumos.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('ℹ️ usuario_id já existe em insumos.');
    }

    // Migração: adicionar usuario_id em compras_animais se não existir
    try {
      await conn.query(`ALTER TABLE compras_animais ADD COLUMN usuario_id INT`);
      console.log('✅ Coluna usuario_id adicionada em compras_animais.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('ℹ️ usuario_id já existe em compras_animais.');
    }

    // Migração: adicionar usuario_id em compras_insumos se não existir
    try {
      await conn.query(`ALTER TABLE compras_insumos ADD COLUMN usuario_id INT`);
      console.log('✅ Coluna usuario_id adicionada em compras_insumos.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('ℹ️ usuario_id já existe em compras_insumos.');
    }

    // Migração: adicionar coluna finalidade em compras_animais se não existir
    try {
      await conn.query(`ALTER TABLE compras_animais ADD COLUMN finalidade VARCHAR(50)`);
      console.log('✅ Coluna finalidade adicionada em compras_animais.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.log('ℹ️ Coluna finalidade já existe em compras_animais.');
      }
    }

    // Migração: renomear faixa_etaria 'novilho' → 'boi' para padronização
    try {
      await conn.query(`UPDATE compras_animais SET faixa_etaria = 'boi' WHERE faixa_etaria = 'novilho'`);
    } catch (e) {
      console.log('ℹ️ Migração faixa_etaria ignorada:', e.message);
    }

    // Migração: adicionar coluna tipo em vendedores se não existir
    try {
      await conn.query(`ALTER TABLE vendedores ADD COLUMN tipo VARCHAR(20) DEFAULT 'vendedor'`);
      console.log('✅ Coluna tipo adicionada em vendedores.');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) {
        console.log('ℹ️ Coluna tipo já existe em vendedores.');
      }
    }

    console.log('✅ Tabelas verificadas/criadas com sucesso!');
  } catch (err) {
    console.error('Erro ao inicializar banco:', err.message);
  }
}
initDB();

// ==============================
// USUÁRIOS
// ==============================
app.post('/api/cadastro', async (req, res) => {
  const { nome, nomePropriedade, endereco, referencia, documento, cep, email, password } = req.body;
  if (!nome || !nomePropriedade || !endereco || !documento || !email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  try {
    db.query('SELECT id FROM usuarios WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro no servidor.' });
      if (results.length > 0) return res.status(409).json({ error: 'Email já cadastrado.' });
      const senhaHash = await bcrypt.hash(password, 10);
      db.query(
        'INSERT INTO usuarios (nome, nome_propriedade, endereco, referencia, documento, cep, email, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nome, nomePropriedade, endereco, referencia || null, documento, cep || null, email, senhaHash],
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
          const token = jwt.sign({ id: result.insertId, nome, nomePropriedade }, process.env.JWT_SECRET, { expiresIn: '7d' });
          res.status(201).json({ token, nome, nomePropriedade });
        }
      );
    });
  } catch { res.status(500).json({ error: 'Erro interno do servidor.' }); }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Informe email e senha.' });
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos.' });
    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(password, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ error: 'Email ou senha incorretos.' });
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, nomePropriedade: usuario.nome_propriedade },
      process.env.JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, nome: usuario.nome, nomePropriedade: usuario.nome_propriedade });
  });
});

// POST /api/esqueci-senha — gera código de reset de 6 dígitos (15 min de validade)
app.post('/api/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Informe o email.' });
  try {
    const [rows] = await db.promise().query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.json({ success: true });
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const expira = new Date(Date.now() + 15 * 60 * 1000);
    await db.promise().query(
      'INSERT INTO reset_tokens (email, token, expira) VALUES (?, ?, ?)',
      [email, codigo, expira]
    );
    res.json({ success: true, codigo });
  } catch (err) {
    console.error('Erro esqueci-senha:', err);
    res.status(500).json({ error: 'Erro ao gerar código de reset.' });
  }
});

// POST /api/resetar-senha — valida código e atualiza senha
app.post('/api/resetar-senha', async (req, res) => {
  const { email, codigo, novaSenha } = req.body;
  if (!email || !codigo || !novaSenha) return res.status(400).json({ error: 'Informe email, código e nova senha.' });
  if (novaSenha.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM reset_tokens WHERE email = ? AND token = ? AND usado = 0 AND expira > NOW() ORDER BY criado_em DESC LIMIT 1',
      [email, codigo]
    );
    if (rows.length === 0) return res.status(400).json({ error: 'Código inválido ou expirado.' });
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await db.promise().query('UPDATE usuarios SET senha = ? WHERE email = ?', [senhaHash, email]);
    await db.promise().query('UPDATE reset_tokens SET usado = 1 WHERE id = ?', [rows[0].id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Erro resetar-senha:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

app.get('/api/usuario', autenticar, (req, res) => {
  db.query('SELECT nome, nome_propriedade, endereco, referencia, documento, cep, email FROM usuarios WHERE id = ?',
    [req.usuarioId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro no servidor.' });
      if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
      res.json(results[0]);
    }
  );
});

app.put('/api/usuario', autenticar, async (req, res) => {
  const { nome, nomePropriedade, endereco, referencia, documento, cep, email, passwordAtual, passwordNova } = req.body;
  if (!nome || !nomePropriedade || !endereco || !documento || !email)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  try {
    if (passwordNova) {
      const [rows] = await db.promise().query('SELECT senha FROM usuarios WHERE id = ?', [req.usuarioId]);
      if (rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const senhaCorreta = await bcrypt.compare(passwordAtual, rows[0].senha);
      if (!senhaCorreta) return res.status(401).json({ error: 'Senha atual incorreta.' });
      const senhaHash = await bcrypt.hash(passwordNova, 10);
      await db.promise().query(
        'UPDATE usuarios SET nome=?, nome_propriedade=?, endereco=?, referencia=?, documento=?, cep=?, email=?, senha=? WHERE id=?',
        [nome, nomePropriedade, endereco, referencia || null, documento, cep || null, email, senhaHash, req.usuarioId]
      );
    } else {
      await db.promise().query(
        'UPDATE usuarios SET nome=?, nome_propriedade=?, endereco=?, referencia=?, documento=?, cep=?, email=? WHERE id=?',
        [nome, nomePropriedade, endereco, referencia || null, documento, cep || null, email, req.usuarioId]
      );
    }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar cadastro.' }); }
});

// ==============================
// CATEGORIAS DE INSUMOS (globais — compartilhadas entre usuários)
// ==============================
app.get('/api/categorias-insumos', autenticar, (req, res) => {
  db.query('SELECT * FROM categorias_insumos ORDER BY nome', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    res.json(results);
  });
});

app.post('/api/categorias-insumos', autenticar, (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ error: 'Informe o nome da categoria.' });
  const slug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  db.query('INSERT INTO categorias_insumos (nome, slug) VALUES (?, ?)', [nome, slug], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erro ao cadastrar categoria.' });
    res.status(201).json({ id: result.insertId, nome, slug });
  });
});

// ==============================
// INSUMOS
// ==============================
app.get('/api/insumos/dashboard', autenticar, (req, res) => {
  db.query(
    `SELECT categoria, nome, unidade, quantidade_estoque, valor_unitario,
     (quantidade_estoque * valor_unitario) AS valor_total
     FROM insumos WHERE usuario_id = ? ORDER BY categoria, nome`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar dados.' });
      const agrupado = {};
      results.forEach((item) => {
        if (!agrupado[item.categoria]) agrupado[item.categoria] = [];
        agrupado[item.categoria].push({
          nome: item.nome, unidade: item.unidade,
          quantidade: parseFloat(item.quantidade_estoque),
          valorUnitario: parseFloat(item.valor_unitario),
          valorTotal: parseFloat(item.valor_total),
        });
      });
      res.json(agrupado);
    }
  );
});

app.get('/api/insumos', autenticar, (req, res) => {
  db.query('SELECT * FROM insumos WHERE usuario_id = ? ORDER BY categoria, nome', [req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar insumos.' });
    res.json(results);
  });
});

app.post('/api/insumos', autenticar, (req, res) => {
  const { nome, categoria, unidade, valor_unitario, quantidade_inicial } = req.body;
  if (!nome || !categoria || !unidade)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  const quantidade = quantidade_inicial || 0;
  const valor = valor_unitario || 0;
  db.query(
    'INSERT INTO insumos (usuario_id, nome, categoria, unidade, valor_unitario, quantidade_estoque) VALUES (?, ?, ?, ?, ?, ?)',
    [req.usuarioId, nome, categoria, unidade, valor, quantidade],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar insumo.' });
      if (quantidade > 0) {
        db.query('INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, 'entrada', quantidade, valor, 'Estoque inicial']);
      }
      res.status(201).json({ id: result.insertId, message: 'Insumo cadastrado com sucesso.' });
    }
  );
});

app.put('/api/insumos/:id', autenticar, (req, res) => {
  const { nome, categoria, unidade, valor_unitario } = req.body;
  const id = req.params.id;
  if (!nome || !categoria || !unidade)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  db.query('UPDATE insumos SET nome=?, categoria=?, unidade=?, valor_unitario=? WHERE id=? AND usuario_id=?',
    [nome, categoria, unidade, valor_unitario || 0, id, req.usuarioId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao editar insumo.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/insumos/:id', autenticar, (req, res) => {
  const id = req.params.id;
  db.query('SELECT id FROM insumos WHERE id = ? AND usuario_id = ?', [id, req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Insumo não encontrado.' });
    db.query('DELETE FROM movimentacoes_insumos WHERE insumo_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir movimentações.' });
      db.query('DELETE FROM insumos WHERE id = ? AND usuario_id = ?', [id, req.usuarioId], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao excluir insumo.' });
        res.json({ success: true });
      });
    });
  });
});

app.post('/api/insumos/:id/entrada', autenticar, (req, res) => {
  const { quantidade, valor_unitario, observacao } = req.body;
  const insumoId = req.params.id;
  if (!quantidade || quantidade <= 0)
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  db.query('SELECT id FROM insumos WHERE id = ? AND usuario_id = ?', [insumoId, req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Insumo não encontrado.' });
    db.query('INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
      [insumoId, 'entrada', quantidade, valor_unitario || 0, observacao || null],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao registrar entrada.' });
        db.query('UPDATE insumos SET quantidade_estoque = quantidade_estoque + ?, valor_unitario = ? WHERE id = ? AND usuario_id = ?',
          [quantidade, valor_unitario || 0, insumoId, req.usuarioId],
          (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar estoque.' });
            res.json({ message: 'Entrada registrada com sucesso.' });
          }
        );
      }
    );
  });
});

app.post('/api/insumos/:id/saida', autenticar, (req, res) => {
  const { quantidade, observacao } = req.body;
  const insumoId = req.params.id;
  if (!quantidade || quantidade <= 0)
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  db.query('SELECT quantidade_estoque FROM insumos WHERE id = ? AND usuario_id = ?', [insumoId, req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Insumo não encontrado.' });
    if (results[0].quantidade_estoque < quantidade)
      return res.status(400).json({ error: 'Estoque insuficiente.' });
    db.query('INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, observacao) VALUES (?, ?, ?, ?)',
      [insumoId, 'saida', quantidade, observacao || null],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao registrar saída.' });
        db.query('UPDATE insumos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ? AND usuario_id = ?',
          [quantidade, insumoId, req.usuarioId],
          (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar estoque.' });
            res.json({ message: 'Saída registrada com sucesso.' });
          }
        );
      }
    );
  });
});

// ==============================
// VENDEDORES
// ==============================
app.get('/api/vendedores', autenticar, (req, res) => {
  const { tipo } = req.query;
  const query = tipo
    ? 'SELECT * FROM vendedores WHERE usuario_id = ? AND tipo = ? ORDER BY nome'
    : 'SELECT * FROM vendedores WHERE usuario_id = ? ORDER BY nome';
  const params = tipo ? [req.usuarioId, tipo] : [req.usuarioId];
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar.' });
    res.json(results);
  });
});

app.post('/api/vendedores', autenticar, (req, res) => {
  const { nome, documento, telefone, cidade, tipo } = req.body;
  if (!nome) return res.status(400).json({ error: 'Informe o nome.' });
  db.query('INSERT INTO vendedores (usuario_id, nome, documento, telefone, cidade, tipo) VALUES (?, ?, ?, ?, ?, ?)',
    [req.usuarioId, nome, documento || null, telefone || null, cidade || null, tipo || 'vendedor'],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar vendedor.' });
      res.status(201).json({ id: result.insertId, message: 'Vendedor cadastrado.' });
    }
  );
});

app.put('/api/vendedores/:id', autenticar, (req, res) => {
  const { nome, documento, telefone, cidade } = req.body;
  const id = req.params.id;
  if (!nome) return res.status(400).json({ error: 'Informe o nome do vendedor.' });
  db.query('UPDATE vendedores SET nome=?, documento=?, telefone=?, cidade=? WHERE id=? AND usuario_id=?',
    [nome, documento || null, telefone || null, cidade || null, id, req.usuarioId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao editar vendedor.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/vendedores/:id', autenticar, (req, res) => {
  db.query('DELETE FROM vendedores WHERE id = ? AND usuario_id = ?', [req.params.id, req.usuarioId], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir vendedor.' });
    res.json({ success: true });
  });
});

// ==============================
// COMPRAS DE ANIMAIS
// ==============================

// Gera próximo número de compra por usuário
const getProximoNumero = (usuarioId, callback) => {
  db.query('SELECT numero_compra FROM compras_animais WHERE usuario_id = ? ORDER BY id DESC LIMIT 1', [usuarioId], (err, results) => {
    if (err || results.length === 0) return callback('001');
    const ultimo = parseInt(results[0].numero_compra || '0', 10);
    callback(String(ultimo + 1).padStart(3, '0'));
  });
};

// GET /api/compras-animais/proximo-numero — preview sem incrementar
app.get('/api/compras-animais/proximo-numero', autenticar, (req, res) => {
  getProximoNumero(req.usuarioId, (numero) => res.json({ numero }));
});

// GET /api/compras-animais
app.get('/api/compras-animais', autenticar, (req, res) => {
  db.query(
    `SELECT ca.*, v.nome as vendedor_nome
     FROM compras_animais ca
     LEFT JOIN vendedores v ON ca.vendedor_id = v.id
     WHERE ca.usuario_id = ?
     ORDER BY ca.id DESC`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar compras.' });
      res.json(results);
    }
  );
});

// POST /api/compras-animais — compra normal com vendedor
app.post('/api/compras-animais', autenticar, (req, res) => {
  const { vendedor_id, numero_gta, sexo, faixa_etaria, quantidade, valor_kg, data, observacao, finalidade } = req.body;
  if (!vendedor_id || !sexo || !faixa_etaria || !quantidade || !data)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

  getProximoNumero(req.usuarioId, async (numeroCompra) => {
    try {
      const [result] = await db.promise().query(
        'INSERT INTO compras_animais (usuario_id, vendedor_id, numero_gta, numero_compra, sexo, faixa_etaria, quantidade, valor_kg, data, observacao, finalidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.usuarioId, vendedor_id, numero_gta || null, numeroCompra, sexo, faixa_etaria, Number(quantidade), valor_kg || 0, data, observacao || null, finalidade || null]
      );
      const compraId = result.insertId;
      const animais = Array.from({ length: Number(quantidade) }, () => [compraId, null, null, null, 'ativo', 'compra']);
      await db.promise().query(
        'INSERT INTO animais (compra_id, brinco, peso_entrada, observacao, status, tipo_cadastro) VALUES ?',
        [animais]
      );
      res.status(201).json({ id: compraId, numero_compra: numeroCompra, message: `Compra #${numeroCompra} registrada.` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao registrar compra.' });
    }
  });
});

// POST /api/compras-animais/especial — cadastro de Touro ou Matriz
app.post('/api/compras-animais/especial', autenticar, (req, res) => {
  const { sexo, faixa_etaria, quantidade, data, observacao, nome_pai, nome_mae, raca, valor_total, data_nascimento } = req.body;
  if (!sexo || !faixa_etaria || !quantidade || !data)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

  getProximoNumero(req.usuarioId, async (numeroCompra) => {
    try {
      const [result] = await db.promise().query(
        'INSERT INTO compras_animais (usuario_id, numero_compra, sexo, faixa_etaria, quantidade, data, observacao) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.usuarioId, numeroCompra, sexo, faixa_etaria, Number(quantidade), data, observacao || null]
      );
      const compraId = result.insertId;
      const animais = Array.from({ length: Number(quantidade) }, () => [
        compraId, null, null, observacao || null, 'ativo', 'especial',
        nome_pai || null, nome_mae || null, raca || null,
        data_nascimento || null, valor_total || null
      ]);
      await db.promise().query(
        'INSERT INTO animais (compra_id, brinco, peso_entrada, observacao, status, tipo_cadastro, nome_pai, nome_mae, raca, data_nascimento, valor_total) VALUES ?',
        [animais]
      );
      res.status(201).json({ id: compraId, numero_compra: numeroCompra, message: `Cadastro especial #${numeroCompra} registrado.` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao registrar cadastro especial.' });
    }
  });
});

// ==============================
// ANIMAIS
// ==============================
app.get('/api/animais', autenticar, (req, res) => {
  db.query(
    `SELECT a.*, ca.numero_compra, ca.sexo, ca.faixa_etaria, ca.valor_kg, ca.numero_gta,
            ca.data as data_compra, ca.finalidade,
            v.nome as vendedor_nome
     FROM animais a
     LEFT JOIN compras_animais ca ON a.compra_id = ca.id
     LEFT JOIN vendedores v ON ca.vendedor_id = v.id
     WHERE ca.usuario_id = ?
     ORDER BY a.criado_em DESC`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar animais.' });
      res.json(results);
    }
  );
});

app.put('/api/animais/:id', autenticar, (req, res) => {
  const { brinco, peso_entrada, observacao, status } = req.body;
  const id = req.params.id;
  db.query(
    `UPDATE animais a
     INNER JOIN compras_animais ca ON a.compra_id = ca.id AND ca.usuario_id = ?
     SET a.brinco=?, a.peso_entrada=?, a.observacao=?, a.status=?
     WHERE a.id=?`,
    [req.usuarioId, brinco || null, peso_entrada || null, observacao || null, status || 'ativo', id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar animal.' });
      res.json({ success: true });
    }
  );
});

app.get('/api/animais/stats', autenticar, (req, res) => {
  db.query(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN a.tipo_cadastro = 'especial' AND ca.sexo = 'macho_inteiro' AND a.status = 'ativo' THEN 1 ELSE 0 END) as reprodutores,
      SUM(CASE WHEN a.tipo_cadastro = 'especial' AND ca.sexo = 'femea' AND a.status = 'ativo' THEN 1 ELSE 0 END) as matrizes,
      SUM(CASE WHEN ca.sexo = 'macho_inteiro' AND ca.faixa_etaria = 'garrote' AND a.tipo_cadastro != 'especial' AND a.status = 'ativo' THEN 1 ELSE 0 END) as garrotes,
      SUM(CASE WHEN (ca.sexo = 'macho_capado' OR (ca.sexo = 'macho_inteiro' AND ca.faixa_etaria IN ('novilho','boi','adulto') AND a.tipo_cadastro != 'especial')) AND a.status = 'ativo' THEN 1 ELSE 0 END) as bois,
      SUM(CASE WHEN ca.sexo = 'femea' AND ca.faixa_etaria IN ('garrote','novilho','boi') AND a.tipo_cadastro != 'especial' AND a.status = 'ativo' THEN 1 ELSE 0 END) as novilhas,
      SUM(CASE WHEN ca.faixa_etaria = 'bezerro' AND a.status = 'ativo' THEN 1 ELSE 0 END) as bezerros,
      SUM(CASE
        WHEN a.tipo_cadastro = 'especial' THEN COALESCE(a.valor_total, 0)
        ELSE COALESCE(a.peso_entrada * ca.valor_kg, 0)
      END) as valor_total_rebanho
     FROM animais a
     LEFT JOIN compras_animais ca ON a.compra_id = ca.id
     WHERE a.status = 'ativo' AND ca.usuario_id = ?`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
      res.json(results[0]);
    }
  );
});

app.get('/api/animais/historico-valor', autenticar, (req, res) => {
  db.query(
    `SELECT
      DATE_FORMAT(a.criado_em, '%Y-%m') as mes_ordem,
      DATE_FORMAT(a.criado_em, '%b/%y') as mes_label,
      SUM(CASE
        WHEN a.tipo_cadastro = 'especial' THEN COALESCE(a.valor_total, 0)
        ELSE COALESCE(a.peso_entrada * ca.valor_kg, 0)
      END) as valor_periodo
    FROM animais a
    LEFT JOIN compras_animais ca ON a.compra_id = ca.id
    WHERE ca.usuario_id = ?
    GROUP BY mes_ordem, mes_label
    ORDER BY mes_ordem ASC
    LIMIT 24`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar histórico.' });
      let acumulado = 0;
      const dados = results.map(r => {
        acumulado += parseFloat(r.valor_periodo || 0);
        return { mes: r.mes_label, valor: Math.round(acumulado) };
      });
      res.json(dados);
    }
  );
});

app.put('/api/animais/:id/venda', autenticar, (req, res) => {
  const { valor_venda, data_saida, comprador_nome, numero_gta_saida, finalidade_venda } = req.body;
  const id = req.params.id;
  if (!valor_venda) return res.status(400).json({ error: 'Informe o valor da venda.' });
  db.query(
    `UPDATE animais a
     INNER JOIN compras_animais ca ON a.compra_id = ca.id AND ca.usuario_id = ?
     SET a.status='vendido', a.valor_venda=?, a.data_saida=?,
         a.observacao=CONCAT(COALESCE(a.observacao,"")," | Comprador: ",COALESCE(?,"-")," | GTA: ",COALESCE(?,"-")," | Finalidade: ",COALESCE(?,"-"))
     WHERE a.id=?`,
    [req.usuarioId, valor_venda, data_saida || new Date(), comprador_nome || null, numero_gta_saida || null, finalidade_venda || null, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar venda.' });
      res.json({ success: true });
    }
  );
});

// POST /api/vendas-animais — venda em lote por critério (sexo + faixa_etaria + quantidade)
app.post('/api/vendas-animais', autenticar, async (req, res) => {
  const { comprador_nome, numero_gta_saida, finalidade_venda, sexo, faixa_etaria, quantidade, valor_venda, data_saida } = req.body;
  if (!quantidade || Number(quantidade) < 1)
    return res.status(400).json({ error: 'Informe a quantidade.' });
  if (!valor_venda || Number(valor_venda) <= 0)
    return res.status(400).json({ error: 'Informe o valor por cabeça.' });
  try {
    let whereExtra = '';
    const params = [req.usuarioId];
    if (sexo) { whereExtra += ' AND ca.sexo = ?'; params.push(sexo); }
    if (faixa_etaria) { whereExtra += ' AND ca.faixa_etaria = ?'; params.push(faixa_etaria); }
    params.push(Number(quantidade));

    const [animais] = await db.promise().query(
      `SELECT a.id FROM animais a
       LEFT JOIN compras_animais ca ON a.compra_id = ca.id
       WHERE a.status = 'ativo' AND ca.usuario_id = ?${whereExtra}
       LIMIT ?`,
      params
    );

    if (animais.length === 0)
      return res.status(400).json({ error: 'Nenhum animal disponível com esses critérios.' });
    if (animais.length < Number(quantidade))
      return res.status(400).json({
        error: `Apenas ${animais.length} animal(is) disponível(eis) com esses critérios.`,
        disponivel: animais.length
      });

    const ids = animais.map(a => a.id);
    const partes = [
      comprador_nome ? `Comprador: ${comprador_nome}` : null,
      numero_gta_saida ? `GTA Saída: ${numero_gta_saida}` : null,
      finalidade_venda ? `Finalidade: ${finalidade_venda}` : null,
    ].filter(Boolean).join(' | ');
    const dataVenda = data_saida || new Date().toISOString().split('T')[0];

    await db.promise().query(
      `UPDATE animais SET status='vendido', valor_venda=?, data_saida=?,
       observacao=CONCAT(COALESCE(observacao,''), CASE WHEN observacao IS NOT NULL AND observacao != '' THEN ' | ' ELSE '' END, ?)
       WHERE id IN (?)`,
      [valor_venda, dataVenda, partes, ids]
    );
    res.json({ success: true, vendidos: ids.length });
  } catch (err) {
    console.error('Erro em vendas-animais:', err);
    res.status(500).json({ error: 'Erro ao registrar venda.' });
  }
});

app.put('/api/animais/:id/morte', autenticar, (req, res) => {
  const { causa_morte, data_saida } = req.body;
  const id = req.params.id;
  db.query(
    `UPDATE animais a
     INNER JOIN compras_animais ca ON a.compra_id = ca.id AND ca.usuario_id = ?
     SET a.status='morto', a.causa_morte=?, a.data_saida=?
     WHERE a.id=?`,
    [req.usuarioId, causa_morte || null, data_saida || new Date(), id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar morte.' });
      res.json({ success: true });
    }
  );
});

// ==============================
// COMPRAS DE INSUMOS
// ==============================

// GET /api/compras-insumos
app.get('/api/compras-insumos', autenticar, (req, res) => {
  db.query(
    `SELECT ci.*, v.nome as vendedor_nome
     FROM compras_insumos ci
     LEFT JOIN vendedores v ON ci.vendedor_id = v.id
     WHERE ci.usuario_id = ?
     ORDER BY ci.id DESC`,
    [req.usuarioId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar compras de insumos.' });
      res.json(results);
    }
  );
});

// POST /api/compras-insumos
app.post('/api/compras-insumos', autenticar, (req, res) => {
  const { vendedor_id, produto, quantidade, valor, nota_fiscal } = req.body;
  if (!produto || !quantidade || !valor)
    return res.status(400).json({ error: 'Produto, quantidade e valor são obrigatórios.' });
  db.query(
    'INSERT INTO compras_insumos (usuario_id, vendedor_id, produto, quantidade, valor, nota_fiscal) VALUES (?, ?, ?, ?, ?, ?)',
    [req.usuarioId, vendedor_id || null, produto, Number(quantidade), Number(valor), nota_fiscal || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar compra de insumo.' });
      res.status(201).json({ id: result.insertId, message: 'Compra de insumo registrada.' });
    }
  );
});

// ==============================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
