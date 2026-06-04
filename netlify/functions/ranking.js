const { neon } = require('@neondatabase/serverless');

// Cliente SQL do Neon
let sql;

function getSql() {
  if (!sql) {
    sql = neon(process.env.NETLIFY_DATABASE_URL);
  }
  return sql;
}

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Lidar com requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const sql = getSql();

  try {
    // GET - Buscar ranking
    if (event.httpMethod === 'GET') {
      const result = await sql`
        SELECT 
          nick,
          pontos,
          nivel_max,
          data_jogo,
          pais
        FROM ranking_global 
        ORDER BY pontos DESC, data_jogo ASC
        LIMIT 50
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          rankings: result || []
        })
      };
    }

    // POST - Adicionar nova pontuação
    if (event.httpMethod === 'POST') {
      const { nick, pontos, nivel_max, pais } = JSON.parse(event.body || '{}');

      // Validar dados
      if (!nick || typeof pontos !== 'number' || typeof nivel_max !== 'number') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Dados inválidos. Nick, pontos e nível são obrigatórios.'
          })
        };
      }

      // Validar nick (3-20 caracteres, apenas letras, números e espaços)
      if (nick.length < 3 || nick.length > 20 || !/^[a-zA-Z0-9\s]+$/.test(nick)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Nick deve ter 3-20 caracteres (apenas letras, números e espaços).'
          })
        };
      }

      // Validar pontuação (0-1000)
      if (pontos < 1 || pontos > 1000) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Pontuação deve estar entre 1 e 1000.'
          })
        };
      }

      // Inserir no banco
      const insertResult = await sql`
        INSERT INTO ranking_global (nick, pontos, nivel_max, pais, data_jogo)
        VALUES (${nick.trim()}, ${pontos}, ${nivel_max}, ${pais || 'BR'}, NOW())
        RETURNING id, data_jogo
      `;

      // Buscar posição no ranking
      const posicaoResult = await sql`
        SELECT COUNT(*) as posicao
        FROM ranking_global 
        WHERE pontos > ${pontos} 
           OR (pontos = ${pontos} AND data_jogo < ${insertResult[0].data_jogo})
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Pontuação salva no ranking global!',
          posicao: parseInt(posicaoResult[0].posicao) + 1,
          id: insertResult[0].id
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Método não permitido'
      })
    };

  } catch (error) {
    console.error('Erro na função ranking:', error);
    
    // Se for erro de tabela não existe, tentar criar
    if (error.message.includes('relation "ranking_global" does not exist')) {
      try {
        await criarTabela(sql);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Banco inicializado. Tente novamente.',
            rankings: []
          })
        };
      } catch (createError) {
        console.error('Erro ao criar tabela:', createError);
      }
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      })
    };
  }
};

// Função para criar a tabela se não existir
async function criarTabela(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ranking_global (
      id SERIAL PRIMARY KEY,
      nick VARCHAR(20) NOT NULL,
      pontos INTEGER NOT NULL,
      nivel_max INTEGER NOT NULL,
      pais VARCHAR(5) DEFAULT 'BR',
      data_jogo TIMESTAMP DEFAULT NOW(),
      ip_hash VARCHAR(64),
      user_agent_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Criar índices para performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_ranking_pontos ON ranking_global(pontos DESC, data_jogo ASC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_ranking_data ON ranking_global(data_jogo DESC)
  `;

  console.log('Tabela ranking_global criada com sucesso!');
}
