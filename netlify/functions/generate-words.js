const fetch = require('node-fetch');

// Palavras fallback organizadas por nível
const palavrasPorNivel = {
  1: ["casa", "lápis", "mesa", "água", "papel", "música", "verde", "coração", "ponte", "ação", "forma", "maçã", "tempo", "açúcar", "mundo", "pássaro", "lugar", "café", "vida", "pão"],
  2: ["janela", "família", "pessoa", "história", "viagem", "criança", "sistema", "educação", "caminho", "diversão", "cinema", "tradição", "parque", "situação", "teatro", "construção", "jardim", "informação", "montanha", "organização"],
  3: ["computador", "tecnologia", "sociedade", "educação", "natureza", "construção", "liberdade", "organização", "biblioteca", "comunicação", "professor", "informação", "medicina", "geografia", "biologia", "psicologia", "literatura", "filosofia", "democracia", "república"],
  4: ["desenvolvimento", "administração", "telecomunicações", "biotecnologia", "programação", "engenharia", "arqueologia", "antropologia", "sociologia", "neurologia", "cardiologia", "dermatologia", "oftalmologia", "veterinária", "arquitetura", "contabilidade", "fisioterapia", "enfermagem", "jornalismo", "publicidade"],
  5: ["otorrinolaringologia", "neuropsicofarmacologia", "gastroenterologia", "pneumoencefalografia", "eletroencefalografia", "anticonstitucionalíssimamente", "responsabilidade", "inconstitucionalidade", "internacionalização", "multidisciplinar", "espectrofotometria", "cromatografia", "imunoeletroforese", "psicofarmacologia", "neuroendocrinologia", "paralelepípedo", "supercalifragilístico", "desresponsabilização", "transversalidade", "incompreensibilidade"]
};

function getRandomModel() {
  const models = [
    'openai/gpt-4o-mini',
    'deepseek/deepseek-chat'
  ];
  
  const randomIndex = Math.floor(Math.random() * models.length);
  return models[randomIndex];
}

function getFallbackWords(level, quantity) {
  const nivelAtual = Math.min(Math.max(level, 1), 5);
  const palavrasNivel = palavrasPorNivel[nivelAtual];
  
  // Embaralhar e pegar a quantidade solicitada
  const shuffled = [...palavrasNivel].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, quantity);
}

function getPromptForLevel(level) {
  // Gerar timestamp para adicionar aleatoriedade
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000);
  
  const prompts = {
    1: `Gere UMA palavra em português brasileiro com 4-6 letras para um jogo de digitação. 
Varie entre palavras COM e SEM acentos naturalmente.
Exemplos variados: casa, lápis, mesa, água, papel, música, verde, coração, ponte, ação, forma, maçã.
NUNCA repita: bolo, gato, carro, livro.
Timestamp: ${timestamp}${randomSeed}
Responda APENAS com UMA palavra sem explicações.`,
    
    2: `Gere UMA palavra em português brasileiro com 6-8 letras para um jogo de digitação.
Misture palavras COM e SEM acentos de forma natural.
Exemplos: janela, família, pessoa, história, viagem, criança, sistema, educação, caminho, diversão.
Timestamp: ${timestamp}${randomSeed}
Responda APENAS com UMA palavra sem explicações.`,
    
    3: `Gere UMA palavra em português brasileiro com 8-11 letras.
Balance palavras COM e SEM acentos conforme o português natural.
Exemplos: computador, tecnologia, sociedade, educação, natureza, construção, liberdade, organização.
Timestamp: ${timestamp}${randomSeed}
Responda APENAS com UMA palavra sem explicações.`,
    
    4: `Gere UMA palavra técnica em português brasileiro com 11-14 letras.
Use acentos apenas quando necessário na grafia correta.
Áreas: medicina, engenharia, psicologia, biotecnologia, administração, telecomunicações, arqueologia.
Timestamp: ${timestamp}${randomSeed}
Responda APENAS com UMA palavra sem explicações.`,
    
    5: `Gere UMA palavra muito complexa em português brasileiro com 14-20 letras.
Mantenha a grafia correta do português, com ou sem acentos conforme apropriado.
Áreas especializadas: otorrinolaringologia, neuropsicofarmacologia, gastroenterologia, telecomunicações.
Timestamp: ${timestamp}${randomSeed}
Responda APENAS com UMA palavra sem explicações.`
  };
  
  return prompts[Math.min(level, 5)] || prompts[1];
}

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Apenas aceitar método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  let level = 1;
  let quantity = 1;

  try {
    // Parse do body da requisição
    const requestBody = JSON.parse(event.body || '{}');
    level = requestBody.level || 1;
    quantity = requestBody.quantity || 1;

    // Validar parâmetros
    if (level < 1 || level > 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nível deve estar entre 1 e 10' })
      };
    }

    if (quantity < 1 || quantity > 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Quantidade deve estar entre 1 e 20' })
      };
    }

    // Pegar a chave da API das variáveis de ambiente
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log('Chave da API não configurada, usando fallback');
      const fallbackWords = getFallbackWords(level, quantity);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          words: fallbackWords,
          level: level,
          source: 'fallback-no-key'
        })
      };
    }

    // Tentar usar a API
    const prompt = getPromptForLevel(level);
    const selectedModel = getRandomModel();
    
    console.log(`Usando modelo: ${selectedModel} para nível ${level}`);

    // Fazer a requisição para a OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://digitagames.netlify.app',
        'X-Title': 'Digitagames - Spelling Bee',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1.2,
        max_tokens: 30,
        top_p: 0.9,
        frequency_penalty: 1.0,
        presence_penalty: 1.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API OpenRouter:', response.status, errorText);
      
      // Se for rate limit (429), usar fallback
      if (response.status === 429) {
        console.log('Rate limit atingido, usando fallback');
        const fallbackWords = getFallbackWords(level, quantity);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            words: fallbackWords,
            level: level,
            source: 'fallback-rate-limit'
          })
        };
      }
      
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Resposta inválida da API:', data);
      throw new Error('Resposta inválida da API');
    }

    const content = data.choices[0].message.content.trim();
    const rawWord = content.split('\n')[0].trim().toLowerCase();
    
    // Remover apenas caracteres não-alfabéticos, preservando acentos e ç
    const cleanWord = rawWord.replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi, '');
    
    // Validar palavra
    if (cleanWord.length >= 3 && cleanWord.length <= 20) {
      console.log(`Nível ${level}: palavra "${cleanWord}" gerada pela API (${selectedModel})`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          words: [cleanWord],
          level: level,
          source: 'openrouter-api',
          model: selectedModel
        })
      };
    } else {
      console.log(`Palavra inválida da API: "${cleanWord}", usando fallback`);
      throw new Error('Palavra inválida gerada pela API');
    }

  } catch (error) {
    console.error('Erro na função serverless:', error);
    
    // Fallback com palavras locais em caso de erro
    const fallbackWords = getFallbackWords(level, quantity);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        words: fallbackWords,
        level: level,
        source: 'fallback-local',
        error: 'API temporariamente indisponível'
      })
    };
  }
};
