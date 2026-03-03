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
// INIT — Cria tabelas que podem não existir ainda
// ==============================
db.promise().query(`
  CREATE TABLE IF NOT EXISTS compras_insumos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendedor_id INT,
    produto VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    nota_fiscal VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL
  )
`).catch(err => console.error('Erro ao criar tabela compras_insumos:', err.message));

// ==============================
// DEV — LIMPAR BANCO
// ==============================
app.delete('/api/dev/limpar-tudo', autenticar, async (req, res) => {
  try {
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    await db.promise().query('TRUNCATE TABLE animais');
    await db.promise().query('TRUNCATE TABLE compras_animais');
    await db.promise().query('TRUNCATE TABLE movimentacoes_insumos');
    await db.promise().query('TRUNCATE TABLE insumos');
    await db.promise().query('TRUNCATE TABLE vendedores');
    await db.promise().query('TRUNCATE TABLE categorias_insumos');
    await db.promise().query(`INSERT INTO categorias_insumos (nome, slug) VALUES 
      ('Alimentação', 'alimentacao'),
      ('Saúde', 'saude'),
      ('Solo/Pasto', 'solo_pasto')`);
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao limpar banco:', err);
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    res.status(500).json({ error: 'Erro ao limpar banco.' });
  }
});

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
// CATEGORIAS DE INSUMOS
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
     (quantidade_estoque * valor_unitario) AS valor_total FROM insumos ORDER BY categoria, nome`,
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
  db.query('SELECT * FROM insumos ORDER BY categoria, nome', (err, results) => {
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
    'INSERT INTO insumos (nome, categoria, unidade, valor_unitario, quantidade_estoque) VALUES (?, ?, ?, ?, ?)',
    [nome, categoria, unidade, valor, quantidade],
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
  db.query('UPDATE insumos SET nome=?, categoria=?, unidade=?, valor_unitario=? WHERE id=?',
    [nome, categoria, unidade, valor_unitario || 0, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao editar insumo.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/insumos/:id', autenticar, (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM movimentacoes_insumos WHERE insumo_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir movimentações.' });
    db.query('DELETE FROM insumos WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao excluir insumo.' });
      res.json({ success: true });
    });
  });
});

app.post('/api/insumos/:id/entrada', autenticar, (req, res) => {
  const { quantidade, valor_unitario, observacao } = req.body;
  const insumoId = req.params.id;
  if (!quantidade || quantidade <= 0)
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  db.query('INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, valor_unitario, observacao) VALUES (?, ?, ?, ?, ?)',
    [insumoId, 'entrada', quantidade, valor_unitario || 0, observacao || null],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar entrada.' });
      db.query('UPDATE insumos SET quantidade_estoque = quantidade_estoque + ?, valor_unitario = ? WHERE id = ?',
        [quantidade, valor_unitario || 0, insumoId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Erro ao atualizar estoque.' });
          res.json({ message: 'Entrada registrada com sucesso.' });
        }
      );
    }
  );
});

app.post('/api/insumos/:id/saida', autenticar, (req, res) => {
  const { quantidade, observacao } = req.body;
  const insumoId = req.params.id;
  if (!quantidade || quantidade <= 0)
    return res.status(400).json({ error: 'Informe uma quantidade válida.' });
  db.query('SELECT quantidade_estoque FROM insumos WHERE id = ?', [insumoId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor.' });
    if (results.length === 0) return res.status(404).json({ error: 'Insumo não encontrado.' });
    if (results[0].quantidade_estoque < quantidade)
      return res.status(400).json({ error: 'Estoque insuficiente.' });
    db.query('INSERT INTO movimentacoes_insumos (insumo_id, tipo, quantidade, observacao) VALUES (?, ?, ?, ?)',
      [insumoId, 'saida', quantidade, observacao || null],
      (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao registrar saída.' });
        db.query('UPDATE insumos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
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

// ==============================
// VENDEDORES
// ==============================
app.get('/api/vendedores', autenticar, (req, res) => {
  db.query('SELECT * FROM vendedores ORDER BY nome', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar vendedores.' });
    res.json(results);
  });
});

app.post('/api/vendedores', autenticar, (req, res) => {
  const { nome, documento, telefone, cidade } = req.body;
  if (!nome) return res.status(400).json({ error: 'Informe o nome do vendedor.' });
  db.query('INSERT INTO vendedores (nome, documento, telefone, cidade) VALUES (?, ?, ?, ?)',
    [nome, documento || null, telefone || null, cidade || null],
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
  db.query('UPDATE vendedores SET nome=?, documento=?, telefone=?, cidade=? WHERE id=?',
    [nome, documento || null, telefone || null, cidade || null, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao editar vendedor.' });
      res.json({ success: true });
    }
  );
});

app.delete('/api/vendedores/:id', autenticar, (req, res) => {
  db.query('DELETE FROM vendedores WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao excluir vendedor.' });
    res.json({ success: true });
  });
});

// ==============================
// COMPRAS DE ANIMAIS
// ==============================

// Gera próximo número de compra sem salvar
const getProximoNumero = (callback) => {
  db.query('SELECT numero_compra FROM compras_animais ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err || results.length === 0) return callback('001');
    const ultimo = parseInt(results[0].numero_compra || '0', 10);
    callback(String(ultimo + 1).padStart(3, '0'));
  });
};

// GET /api/compras-animais/proximo-numero — preview sem incrementar
app.get('/api/compras-animais/proximo-numero', autenticar, (req, res) => {
  getProximoNumero((numero) => res.json({ numero }));
});

// GET /api/compras-animais
app.get('/api/compras-animais', autenticar, (req, res) => {
  db.query(
    `SELECT ca.*, v.nome as vendedor_nome 
     FROM compras_animais ca 
     LEFT JOIN vendedores v ON ca.vendedor_id = v.id 
     ORDER BY ca.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar compras.' });
      res.json(results);
    }
  );
});

// POST /api/compras-animais — compra normal com vendedor
app.post('/api/compras-animais', autenticar, (req, res) => {
  const { vendedor_id, numero_gta, sexo, faixa_etaria, quantidade, valor_kg, data, observacao } = req.body;
  if (!vendedor_id || !sexo || !faixa_etaria || !quantidade || !data)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

  getProximoNumero(async (numeroCompra) => {
    try {
      const [result] = await db.promise().query(
        'INSERT INTO compras_animais (vendedor_id, numero_gta, numero_compra, sexo, faixa_etaria, quantidade, valor_kg, data, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [vendedor_id, numero_gta || null, numeroCompra, sexo, faixa_etaria, Number(quantidade), valor_kg || 0, data, observacao || null]
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

  getProximoNumero(async (numeroCompra) => {
    try {
      const [result] = await db.promise().query(
        'INSERT INTO compras_animais (numero_compra, sexo, faixa_etaria, quantidade, data, observacao) VALUES (?, ?, ?, ?, ?, ?)',
        [numeroCompra, sexo, faixa_etaria, Number(quantidade), data, observacao || null]
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
            v.nome as vendedor_nome
     FROM animais a
     LEFT JOIN compras_animais ca ON a.compra_id = ca.id
     LEFT JOIN vendedores v ON ca.vendedor_id = v.id
     ORDER BY a.criado_em DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar animais.' });
      res.json(results);
    }
  );
});

app.put('/api/animais/:id', autenticar, (req, res) => {
  const { brinco, peso_entrada, observacao, status } = req.body;
  const id = req.params.id;
  db.query('UPDATE animais SET brinco=?, peso_entrada=?, observacao=?, status=? WHERE id=?',
    [brinco || null, peso_entrada || null, observacao || null, status || 'ativo', id],
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
      SUM(CASE WHEN ca.sexo = 'femea' AND a.status = 'ativo' THEN 1 ELSE 0 END) as matrizes,
      SUM(CASE WHEN ca.sexo = 'macho_inteiro' AND a.status = 'ativo' THEN 1 ELSE 0 END) as reprodutores,
      SUM(CASE WHEN ca.faixa_etaria = 'bezerro' AND a.status = 'ativo' THEN 1 ELSE 0 END) as bezerros
     FROM animais a
     LEFT JOIN compras_animais ca ON a.compra_id = ca.id
     WHERE a.status = 'ativo'`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
      res.json(results[0]);
    }
  );
});

app.put('/api/animais/:id/venda', autenticar, (req, res) => {
  const { valor_venda, data_saida } = req.body;
  const id = req.params.id;
  if (!valor_venda) return res.status(400).json({ error: 'Informe o valor da venda.' });
  db.query('UPDATE animais SET status=?, valor_venda=?, data_saida=? WHERE id=?',
    ['vendido', valor_venda, data_saida || new Date(), id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar venda.' });
      res.json({ success: true });
    }
  );
});

app.put('/api/animais/:id/morte', autenticar, (req, res) => {
  const { causa_morte, data_saida } = req.body;
  const id = req.params.id;
  db.query('UPDATE animais SET status=?, causa_morte=?, data_saida=? WHERE id=?',
    ['morto', causa_morte || null, data_saida || new Date(), id],
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
app.get('/api/compras-insumos', autenticar, (_req, res) => {
  db.query(
    `SELECT ci.*, v.nome as vendedor_nome
     FROM compras_insumos ci
     LEFT JOIN vendedores v ON ci.vendedor_id = v.id
     ORDER BY ci.id DESC`,
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
    'INSERT INTO compras_insumos (vendedor_id, produto, quantidade, valor, nota_fiscal) VALUES (?, ?, ?, ?, ?)',
    [vendedor_id || null, produto, Number(quantidade), Number(valor), nota_fiscal || null],
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