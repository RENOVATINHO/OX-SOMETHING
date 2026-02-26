// server.js — API principal
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: verifica token JWT
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

// POST /api/cadastro
app.post('/api/cadastro', async (req, res) => {
  const { nome, nomePropriedade, endereco, referencia, documento, cep, email, password } = req.body;
  if (!nome || !nomePropriedade || !endereco || !documento || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }
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
  } catch {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Informe email e senha.' });
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(401).json({ error: 'Email ou senha incorretos.' });
    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(password, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ error: 'Email ou senha incorretos.' });
    const token = jwt.sign({ id: usuario.id, nome: usuario.nome, nomePropriedade: usuario.nome_propriedade }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, nome: usuario.nome, nomePropriedade: usuario.nome_propriedade });
  });
});

// GET /api/usuario
app.get('/api/usuario', autenticar, (req, res) => {
  db.query('SELECT nome, nome_propriedade, endereco, referencia, documento, cep, email FROM usuarios WHERE id = ?', [req.usuarioId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(results[0]);
  });
});

// PUT /api/usuario
app.put('/api/usuario', autenticar, async (req, res) => {
  const { nome, nomePropriedade, endereco, referencia, documento, cep, email, passwordAtual, passwordNova } = req.body;
  if (!nome || !nomePropriedade || !endereco || !documento || !email) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }
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
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cadastro.' });
  }
});

// ==============================
// ROTAS DE INSUMOS
// ==============================

// GET /api/insumos — Lista todos os insumos
app.get('/api/insumos', autenticar, (req, res) => {
  db.query('SELECT * FROM insumos ORDER BY categoria, nome', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar insumos.' });
    res.json(results);
  });
});

// GET /api/insumos/dashboard — Dados agrupados por categoria para os gráficos
app.get('/api/insumos/dashboard', autenticar, (req, res) => {
  db.query(
    `SELECT 
      categoria,
      nome,
      unidade,
      quantidade_estoque,
      valor_unitario,
      (quantidade_estoque * valor_unitario) AS valor_total
    FROM insumos 
    ORDER BY categoria, nome`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar dados.' });

      // Agrupa por categoria
      const agrupado = {
        alimentacao: [],
        saude: [],
        solo_pasto: [],
      };

      results.forEach((item) => {
        agrupado[item.categoria].push({
          nome: item.nome,
          unidade: item.unidade,
          quantidade: parseFloat(item.quantidade_estoque),
          valorUnitario: parseFloat(item.valor_unitario),
          valorTotal: parseFloat(item.valor_total),
        });
      });

      res.json(agrupado);
    }
  );
});

// POST /api/insumos — Cadastra novo insumo
app.post('/api/insumos', autenticar, (req, res) => {
  const { nome, categoria, unidade, valor_unitario, quantidade_inicial } = req.body;

  if (!nome || !categoria || !unidade) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  const quantidade = quantidade_inicial || 0;
  const valor = valor_unitario || 0;

  db.query(
    'INSERT INTO insumos (nome, categoria, unidade, valor_unitario, quantidade_estoque) VALUES (?, ?, ?, ?, ?)',
    [nome, categoria, unidade, valor, quantidade],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar insumo.' });

      // Se veio com quantidade inicial, registra como entrada
      if (quantidade > 0) {
        db.query(
          'INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, 'entrada', quantidade, valor, 'Estoque inicial']
        );
      }

      res.status(201).json({ id: result.insertId, message: 'Insumo cadastrado com sucesso.' });
    }
  );
});

// PUT /api/insumos/:id — Editar insumo
app.put('/api/insumos/:id', autenticar, (req, res) => {
  const { nome, categoria, unidade, valor_unitario } = req.body;
  const id = req.params.id;

  if (!nome || !categoria || !unidade) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  db.query(
    'UPDATE insumos SET nome=?, categoria=?, unidade=?, valor_unitario=? WHERE id=?',
    [nome, categoria, unidade, valor_unitario || 0, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao editar insumo.' });
      res.json({ success: true });
    }
  );
});

// POST /api/insumos/:id/entrada — Registra entrada (compra)
app.post('/api/insumos/:id/entrada', autenticar, (req, res) => {
  const { quantidade, valor_unitario, observacao } = req.body;
  const insumoId = req.params.id;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  }

  db.query(
    'INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
    [insumoId, 'entrada', quantidade, valor_unitario || 0, observacao || null],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar entrada.' });

      // Atualiza estoque
      db.query(
        'UPDATE insumos SET quantidade_estoque = quantidade_estoque + ?, valor_unitario = ? WHERE id = ?',
        [quantidade, valor_unitario || 0, insumoId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao atualizar estoque.' });
          res.json({ message: 'Entrada registrada com sucesso.' });
        }
      );
    }
  );
});

// POST /api/insumos/:id/saida — Registra saída (uso)
app.post('/api/insumos/:id/saida', autenticar, (req, res) => {
  const { quantidade, observacao } = req.body;
  const insumoId = req.params.id;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  }

  // Verifica se tem estoque suficiente
  db.query('SELECT quantidade_estoque FROM insumos WHERE id = ?', [insumoId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Insumo não encontrado.' });
    if (results[0].quantidade_estoque < quantidade) {
      return res.status(400).json({ error: 'Estoque insuficiente.' });
    }

    db.query(
      'INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, observacao) VALUES (?, ?, ?, ?)',
      [insumoId, 'saida', quantidade, observacao || null],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao registrar saída.' });

        db.query(
          'UPDATE insumos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
          [quantidade, insumoId],
          (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar estoque.' });
            res.json({ message: 'Saída registrada com sucesso.' });
          }
        );
      }
    );
  });
});

// DELETE /api/insumos/:id — Excluir insumo
app.delete('/api/insumos/:id', autenticar, (req, res) => {
  const id = req.params.id;

  // Primeiro exclui as movimentações relacionadas
  db.query('DELETE FROM movimentacoes_insumos WHERE insumo_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir movimentações.' });

    // Depois exclui o insumo
    db.query('DELETE FROM insumos WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir insumo.' });
      res.json({ success: true });
    });
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
