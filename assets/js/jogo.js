// Configuração da API (agora usa função serverless)
let OPENROUTER_API_KEY = "CONFIGURED_ON_SERVER"; // Chave configurada no servidor
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:8888/.netlify/functions" 
    : "/.netlify/functions";

// Lista de palavras para fallback (caso a API não funcione)
const palavrasFallback = [
    "computador",
    "internet",
    "javascript",
    "teclado",
    "programa",
    "desenvolvedor",
    "digitação",
    "código",
    "aplicativo",
    "sintaxe",
    "navegador",
    "algoritmo",
    "variável",
    "função",
    "biblioteca",
    "framework",
    "debugging",
    "compilador",
    "servidor",
    "cliente",
    "database",
    "interface",
    "usuário",
    "sistema",
    "memória",
    "processador",
    "hardware",
    "software",
    "tecnologia",
    "programação"
];

let palavraAtual = "";
let tempoInicio = 0;
let pontuacao = 0;
let rodadasJogadas = 0;
let usandoAPI = false;
let nivel = 1;
let palavrasNoNivel = 0;
let jogatimer = null;
let tempoRestante = 5;
let jogoEmAndamento = false;
let melhorPontuacao = 0;
let recordeAtual = 0;

// Variáveis do ranking global
let rankingGlobal = [];
let mostrandoRankingGlobal = false;

function falarPalavra(palavra) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(palavra);
    utter.lang = "pt-BR";
    synth.speak(utter);
}

async function iniciarJogo() {
    // Evitar múltiplas execuções simultâneas
    if (jogoEmAndamento) {
        return;
    }
    
    logEstadoJogo("INICIANDO JOGO");
    jogoEmAndamento = true;
    pararTimer();
    
    document.getElementById('resultado').textContent = "🎲 Gerando nova palavra...";
    document.getElementById('resultado').style.color = "#FFD700";
    
    // Desabilitar controles temporariamente
    document.getElementById('startButton').disabled = true;
    document.getElementById('inputPalavra').disabled = true;
    document.getElementById('verificarButton').disabled = true;
    document.getElementById('ouvirButton').disabled = true;
    
    try {
        palavraAtual = await obterPalavra();
        
        // Salvar palavra para evitar repetições
        salvarPalavraUsada(palavraAtual);
        
        // Habilitar controles do jogo
        document.getElementById('ouvirButton').disabled = false;
        document.getElementById('inputPalavra').disabled = false;
        document.getElementById('verificarButton').disabled = false;
        document.getElementById('startButton').disabled = false;
        
        const nivelInfo = `Nível ${nivel} (${palavrasNoNivel}/10)`;
        document.getElementById('resultado').textContent = `🎧 Ouça e digite! ${nivelInfo}`;
        document.getElementById('resultado').style.color = "white";
        
        falarPalavra(palavraAtual);
        document.getElementById('inputPalavra').value = "";
        document.getElementById('inputPalavra').focus();
        tempoInicio = Date.now();
        
        // Iniciar timer
        iniciarTimer();
        
    } catch (error) {
        console.error("Erro ao iniciar jogo:", error);
        document.getElementById('resultado').textContent = "❌ Erro ao gerar palavra. Tente novamente.";
        document.getElementById('resultado').style.color = "red";
        document.getElementById('startButton').disabled = false;
        jogoEmAndamento = false;
    }
}

function verificarPalavra() {
    // Evitar múltiplas verificações
    if (!jogoEmAndamento) {
        return;
    }
    
    logEstadoJogo("VERIFICANDO PALAVRA");
    const resposta = document.getElementById('inputPalavra').value.trim().toLowerCase();
    rodadasJogadas++;
    
    pararTimer(); // Parar timer ao verificar palavra
    jogoEmAndamento = false; // Liberar para próxima palavra
    
    if (resposta === palavraAtual.toLowerCase()) {
        const tempo = ((Date.now() - tempoInicio) / 1000).toFixed(2);
        pontuacao++;
        recordeAtual = pontuacao; // Atualizar recorde atual
        verificarNivel();
        
        document.getElementById('resultado').textContent = `🎉 Correto! Tempo: ${tempo}s | Pontuação: ${pontuacao} | Nível ${nivel} | Recorde: ${melhorPontuacao}`;
        document.getElementById('resultado').style.color = "green";
        
        // Aguardar 2 segundos e iniciar próxima palavra automaticamente
        setTimeout(() => {
            if (!jogoEmAndamento) { // Verificar se não há outra palavra sendo processada
                iniciarProximaPalavra();
            }
        }, 2000);
        
    } else {
        // ERROU = PERDEU TUDO! Resetar para nível 1
        const pontuacaoFinal = pontuacao;
        salvarPontuacao(pontuacaoFinal);
        
        // Resetar tudo
        nivel = 1;
        palavrasNoNivel = 0;
        pontuacao = 0;
        rodadasJogadas = 0;
        
        document.getElementById('resultado').textContent = `💀 GAME OVER! Pontuação Final: ${pontuacaoFinal} | A palavra era: "${palavraAtual}" | Recorde: ${melhorPontuacao}`;
        document.getElementById('resultado').style.color = "red";
        
        // Aguardar 4 segundos e permitir reiniciar
        setTimeout(() => {
            document.getElementById('resultado').textContent = `🎮 Clique em "Iniciar Jogo" para tentar novamente! Recorde a bater: ${melhorPontuacao}`;
            document.getElementById('resultado').style.color = "white";
            updateRanking(); // Atualizar ranking
        }, 4000);
    }
    
    // Desabilitar controles até próxima ação
    document.getElementById('ouvirButton').disabled = true;
    document.getElementById('inputPalavra').disabled = true;
    document.getElementById('verificarButton').disabled = true;
}

// Função para gerar palavra usando a função serverless
async function gerarPalavraComAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-words`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: nivel,
                quantity: 1
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na função serverless: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.words && data.words.length > 0) {
            return data.words[0];
        } else {
            throw new Error("Nenhuma palavra retornada pela função serverless");
        }
        
    } catch (error) {
        return null;
    }
}

// Função para obter uma palavra (função serverless ou fallback)
async function obterPalavra() {
    if (usandoAPI) {
        const palavraAPI = await gerarPalavraComAPI();
        if (palavraAPI) {
            return palavraAPI;
        }
    }
    
    // Fallback para lista local por nível
    return obterPalavrasPorNivel(nivel);
}

// Funções para gerenciar configurações
function carregarConfiguracoes() {
    // Sempre usar IA (forçar ativação)
    const useAPI = true;
    
    document.getElementById('apiToggle').checked = useAPI;
    usandoAPI = useAPI;
    
    // Salvar configuração para manter consistência
    localStorage.setItem('use_api', 'true');
    
    // Carregar melhor pontuação
    melhorPontuacao = parseInt(localStorage.getItem('spelling_bee_melhor') || '0');
    
    toggleApiKeySection();
    updateStatusIndicator();
    updateRanking();
}

function salvarChaveAPI() {
    // Esta função não é mais necessária, mas mantida para compatibilidade
    alert('✅ A chave da API já está configurada no servidor para segurança!');
}

function toggleApiKeySection() {
    const checkbox = document.getElementById('apiToggle');
    const section = document.getElementById('apiKeySection');
    
    // Sempre forçar IA ativada
    checkbox.checked = true;
    const useAPI = true;
    
    section.style.display = 'none'; // Sempre ocultar seção da chave
    localStorage.setItem('use_api', 'true');
    usandoAPI = useAPI;
    updateStatusIndicator();
}

function updateStatusIndicator() {
    // Remover indicador existente
    const existingIndicator = document.querySelector('.status-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Adicionar novo indicador
    const title = document.querySelector('h1');
    const indicator = document.createElement('span');
    indicator.className = usandoAPI 
        ? 'status-indicator status-api' 
        : 'status-indicator status-local';
    indicator.textContent = usandoAPI 
        ? '🤖 IA ATIVA' 
        : '📝 LISTA LOCAL';
    title.appendChild(indicator);
}

// Função para obter prompt baseado no nível
function getNivelPrompt() {
    // Adicionar palavras usadas recentemente para evitar repetição
    const palavrasUsadas = JSON.parse(localStorage.getItem('palavras_usadas') || '[]');
    const palavrasRecentes = palavrasUsadas.slice(-10).join(', ');
    
    const niveis = {
        1: `Gere uma palavra simples em português brasileiro com 4-6 letras, adequada para iniciantes. ${palavrasRecentes ? `Evite estas palavras recentes: ${palavrasRecentes}.` : ''} Exemplos de palavras boas: casa, mesa, flor, livro, gato, água, pão, sol, lua, peixe. Responda APENAS com UMA palavra, sem explicações.`,
        2: `Gere uma palavra comum em português brasileiro com 6-8 letras, de dificuldade intermediária. ${palavrasRecentes ? `Evite estas palavras recentes: ${palavrasRecentes}.` : ''} Exemplos: cidade, escola, animal, pessoa, família, estrada, jardim, música. Responda APENAS com UMA palavra.`,
        3: `Gere uma palavra mais complexa em português brasileiro com 8-11 letras, de dificuldade moderada. ${palavrasRecentes ? `Evite estas palavras recentes: ${palavrasRecentes}.` : ''} Exemplos: computador, biblioteca, professor, estudante, hospital, televisão, bicicleta. Responda APENAS com UMA palavra.`,
        4: `Gere uma palavra técnica ou especializada em português brasileiro com 11-14 letras, de dificuldade avançada. ${palavrasRecentes ? `Evite estas palavras recentes: ${palavrasRecentes}.` : ''} Deve ser palavra técnica/científica/profissional como: desenvolvimento, programação, biotecnologia, telecomunicações, neurocirurgia, oftalmologia. Responda APENAS com UMA palavra.`,
        5: `Gere uma palavra muito complexa em português brasileiro com 14-20 letras, de dificuldade expert. ${palavrasRecentes ? `Evite estas palavras recentes: ${palavrasRecentes}.` : ''} Deve ser palavra científica/médica/técnica extremamente complexa como: otorrinolaringologista, pneumoultramicroscopicossilicovulcanoconiótico, anticonstitucionalissimamente, neuroendocrinologia, psicofarmacologia. Responda APENAS com UMA palavra.`
    };
    
    const nivelAtual = Math.min(nivel, 5);
    return niveis[nivelAtual];
}

// Função para obter palavras por nível (fallback)
function obterPalavrasPorNivel(nivel) {
    const palavrasPorNivel = {
        1: ["casa", "gato", "livro", "mesa", "porta", "janela", "carro", "árvore", "flor", "sol", "lua", "água", "pão", "peixe", "mão", "pé", "olho", "boca", "rua", "dia"],
        2: ["cidade", "escola", "animal", "pessoa", "família", "amigo", "estrada", "montanha", "oceano", "jardim", "música", "dança", "cinema", "teatro", "parque", "praia", "campo", "floresta", "ponte", "igreja"],
        3: ["computador", "biblioteca", "professor", "estudante", "hospital", "restaurante", "televisão", "bicicleta", "documento", "telefone", "medicina", "história", "geografia", "química", "biologia", "matemática", "literatura", "filosofia", "psicologia", "sociologia"],
        4: ["desenvolvimento", "programação", "engenharia", "arquitetura", "administração", "contabilidade", "fisioterapia", "enfermagem", "veterinária", "jornalismo", "publicidade", "marketing", "estatística", "biotecnologia", "nanotecnologia", "telecomunicações", "neurocirurgia", "dermatologia", "oftalmologia", "cardiologia"],
        5: ["microcomputador", "responsabilidade", "extraordinário", "internacionalização", "multidisciplinar", "inconstitucionalidade", "desresponsabilização", "transversalidade", "incompreensibilidade", "supercalifragilistico", "otorrinolaringologista", "pneumoultramicroscopicossilicovulcanoconiótico", "hipopotomonstrosesquipedaliofobia", "anticonstitucionalissimamente", "paralelepípedo", "psicofarmacologia", "neuroendocrinologia", "gastroenterologia", "otorrinolaringologia", "pneumoencefalografia"]
    };
    
    const nivelAtual = Math.min(nivel, 5);
    const palavrasNivel = palavrasPorNivel[nivelAtual];
    
    // Evitar palavras usadas recentemente
    const palavrasUsadas = JSON.parse(localStorage.getItem('palavras_usadas') || '[]');
    const palavrasDisponiveis = palavrasNivel.filter(palavra => !palavrasUsadas.includes(palavra));
    
    // Se todas as palavras foram usadas, usar qualquer uma do nível
    const palavrasParaEscolher = palavrasDisponiveis.length > 0 ? palavrasDisponiveis : palavrasNivel;
    
    return palavrasParaEscolher[Math.floor(Math.random() * palavrasParaEscolher.length)];
}

// Função para verificar se deve aumentar o nível
function verificarNivel() {
    palavrasNoNivel++;
    if (palavrasNoNivel >= 10) {
        nivel++;
        palavrasNoNivel = 0;
        mostrarNovoNivel();
    }
}

// Função para mostrar novo nível
function mostrarNovoNivel() {
    const nivelTexto = {
        2: "🟢 NÍVEL 2: Palavras Intermediárias",
        3: "🟡 NÍVEL 3: Palavras Complexas", 
        4: "🟠 NÍVEL 4: Palavras Técnicas",
        5: "🔴 NÍVEL 5: Palavras Expert"
    };
    
    if (nivelTexto[nivel]) {
        document.getElementById('resultado').textContent = `🎉 ${nivelTexto[nivel]}! 🎉`;
        document.getElementById('resultado').style.color = "#FFD700";
        
        // Não iniciar próxima palavra aqui - deixar o setTimeout da verificarPalavra fazer isso
    }
}

// Função para iniciar timer de 5 segundos
function iniciarTimer() {
    tempoRestante = 5;
    updateTimerDisplay();
    
    jogatimer = setInterval(() => {
        tempoRestante--;
        updateTimerDisplay();
        
        if (tempoRestante <= 0) {
            clearInterval(jogatimer);
            verificarPalavra();
        }
    }, 1000);
}

// Função para atualizar display do timer
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `⏰ ${tempoRestante}s`;
        
        if (tempoRestante <= 2) {
            timerElement.style.color = "#FF6B6B";
            timerElement.classList.add('warning');
        } else {
            timerElement.style.color = "#4ECDC4";
            timerElement.classList.remove('warning');
        }
    }
}

// Função para parar timer
function pararTimer() {
    if (jogatimer) {
        clearInterval(jogatimer);
        jogatimer = null;
    }
}

// Função para resetar o jogo
function resetarJogo() {
    pararTimer();
    jogoEmAndamento = false;
    nivel = 1;
    palavrasNoNivel = 0;
    pontuacao = 0;
    rodadasJogadas = 0;
    palavraAtual = "";
    recordeAtual = 0;
    
    // Limpar histórico de palavras usadas
    localStorage.removeItem('palavras_usadas');
    
    document.getElementById('resultado').textContent = `🎮 Jogo resetado! Clique em 'Iniciar Jogo' para começar. Recorde: ${melhorPontuacao}`;
    document.getElementById('resultado').style.color = "white";
    
    // Desabilitar controles
    document.getElementById('ouvirButton').disabled = true;
    document.getElementById('inputPalavra').disabled = true;
    document.getElementById('verificarButton').disabled = true;
    document.getElementById('inputPalavra').value = "";
    
    // Resetar timer display
    document.getElementById('timer').textContent = "⏰ 5s";
    document.getElementById('timer').style.color = "#4ECDC4";
    document.getElementById('timer').classList.remove('warning');
    
    updateStatusIndicator();
}

// Função para obter nome da dificuldade
function getNivelDificuldade() {
    const dificuldades = {
        1: "Iniciante",
        2: "Intermediário", 
        3: "Avançado",
        4: "Expert",
        5: "Master"
    };
    
    const nivelAtual = Math.min(nivel, 5);
    return dificuldades[nivelAtual];
}

// Função para iniciar próxima palavra automaticamente
async function iniciarProximaPalavra() {
    await iniciarJogo();
}

// Função para salvar palavra usada (evitar repetições)
function salvarPalavraUsada(palavra) {
    let palavrasUsadas = JSON.parse(localStorage.getItem('palavras_usadas') || '[]');
    palavrasUsadas.push(palavra);
    
    // Manter apenas as últimas 20 palavras
    if (palavrasUsadas.length > 20) {
        palavrasUsadas = palavrasUsadas.slice(-20);
    }
    
    localStorage.setItem('palavras_usadas', JSON.stringify(palavrasUsadas));
}

// Sistema de Ranking
function salvarPontuacao(pontuacao) {
    if (pontuacao === 0) return; // Não salvar pontuação 0
    
    // Salvar no ranking local
    const ranking = JSON.parse(localStorage.getItem('spelling_bee_ranking') || '[]');
    const agora = new Date();
    
    const novaPontuacao = {
        pontos: pontuacao,
        nivel_max: nivel,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        timestamp: agora.getTime()
    };
    
    ranking.push(novaPontuacao);
    
    // Ordenar por pontuação (maior primeiro)
    ranking.sort((a, b) => b.pontos - a.pontos);
    
    // Manter apenas top 10
    ranking.splice(10);
    
    localStorage.setItem('spelling_bee_ranking', JSON.stringify(ranking));
    
    // Atualizar melhor pontuação
    melhorPontuacao = ranking.length > 0 ? ranking[0].pontos : 0;
    localStorage.setItem('spelling_bee_melhor', melhorPontuacao.toString());
    
    // Se a pontuação for boa (5+ pontos), oferecer ranking global
    if (pontuacao >= 5) {
        setTimeout(() => {
            const salvarGlobal = confirm(
                `🌟 Excelente! Você fez ${pontuacao} pontos!\n\n` +
                `Deseja salvar no ranking global e competir com jogadores do mundo todo?`
            );
            
            if (salvarGlobal) {
                salvarNoRankingGlobal(pontuacao, nivel);
            }
        }, 2000);
    }
}

function carregarRanking() {
    const ranking = JSON.parse(localStorage.getItem('spelling_bee_ranking') || '[]');
    melhorPontuacao = parseInt(localStorage.getItem('spelling_bee_melhor') || '0');
    return ranking;
}

function updateRanking() {
    const ranking = carregarRanking();
    const rankingElement = document.getElementById('ranking-list');
    const titleElement = document.querySelector('#ranking-section h3');
    
    if (!rankingElement) return;
    
    titleElement.textContent = '🏆 Top 10 Local - Hall da Fama';
    
    if (ranking.length === 0) {
        rankingElement.innerHTML = '<div class="ranking-empty">🏆 Seja o primeiro no ranking!</div>';
        return;
    }
    
    let html = '';
    ranking.forEach((record, index) => {
        const posicao = index + 1;
        const emoji = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`;
        const destaque = posicao <= 3 ? 'ranking-destaque' : '';
        
        html += `
            <div class="ranking-item ${destaque}">
                <span class="ranking-posicao">${emoji}</span>
                <span class="ranking-pontos">${record.pontos} pts</span>
                <span class="ranking-nivel">Nv.${record.nivel_max}</span>
                <span class="ranking-data">${record.data} ${record.hora}</span>
            </div>
        `;
    });
    
    rankingElement.innerHTML = html;
}

function toggleRanking() {
    const rankingSection = document.getElementById('ranking-section');
    const button = document.getElementById('ranking-toggle');
    
    if (rankingSection.style.display === 'none') {
        rankingSection.style.display = 'block';
        if (mostrandoRankingGlobal) {
            button.textContent = '📊 Ver Ranking Local';
            carregarRankingGlobal();
            updateRankingGlobalDisplay();
        } else {
            button.textContent = '🌍 Ver Ranking Global';
            updateRanking();
        }
    } else {
        rankingSection.style.display = 'none';
        button.textContent = '📊 Ver Ranking';
    }
}

// Função para carregar ranking global
async function carregarRankingGlobal() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                rankingGlobal = data.rankings;
                if (mostrandoRankingGlobal) {
                    updateRankingGlobalDisplay();
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar ranking global:', error);
    }
}

// Função para salvar pontuação no ranking global
async function salvarNoRankingGlobal(pontuacao, nivelMax) {
    const nick = prompt('🌟 Parabéns! Digite seu nick para o ranking global (3-20 caracteres):');
    
    if (!nick || nick.trim().length < 3) {
        return false;
    }

    if (nick.trim().length > 20) {
        alert('❌ Nick muito longo! Máximo 20 caracteres.');
        return false;
    }

    // Validar caracteres permitidos
    if (!/^[a-zA-Z0-9\s]+$/.test(nick.trim())) {
        alert('❌ Nick deve conter apenas letras, números e espaços.');
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ranking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nick: nick.trim(),
                pontos: pontuacao,
                nivel_max: nivelMax,
                pais: 'BR'
            })
        });

        const data = await response.json();
        
        if (data.success) {
            alert(`🎉 Pontuação salva! Você está na posição #${data.posicao} do ranking global!`);
            carregarRankingGlobal(); // Recarregar ranking
            return true;
        } else {
            alert(`❌ Erro: ${data.error}`);
            return false;
        }
    } catch (error) {
        console.error('Erro ao salvar no ranking global:', error);
        alert('❌ Erro ao conectar com o servidor. Tente novamente.');
        return false;
    }
}

// Função para alternar entre ranking local e global
function toggleRankingGlobal() {
    mostrandoRankingGlobal = !mostrandoRankingGlobal;
    const button = document.getElementById('ranking-toggle');
    const rankingSection = document.getElementById('ranking-section');
    
    if (mostrandoRankingGlobal) {
        button.textContent = '📊 Ver Ranking Local';
        rankingSection.style.display = 'block';
        carregarRankingGlobal();
        updateRankingGlobalDisplay();
    } else {
        button.textContent = '📊 Ver Ranking Global';
        rankingSection.style.display = 'block';
        updateRanking(); // Mostrar ranking local
    }
}

// Função para atualizar display do ranking global
function updateRankingGlobalDisplay() {
    const rankingElement = document.getElementById('ranking-list');
    const titleElement = document.querySelector('#ranking-section h3');
    
    if (!rankingElement) return;
    
    titleElement.textContent = '🌍 Ranking Global - Top 50';
    
    if (rankingGlobal.length === 0) {
        rankingElement.innerHTML = '<div class="ranking-empty">🌟 Seja o primeiro no ranking global!</div>';
        return;
    }
    
    let html = '';
    rankingGlobal.forEach((record, index) => {
        const posicao = index + 1;
        const emoji = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`;
        const destaque = posicao <= 3 ? 'ranking-destaque' : '';
        const flag = record.pais === 'BR' ? '🇧🇷' : '🌍';
        
        // Formatar data
        const data = new Date(record.data_jogo);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="ranking-item ${destaque}">
                <span class="ranking-posicao">${emoji}</span>
                <span class="ranking-nick">${flag} ${record.nick}</span>
                <span class="ranking-pontos">${record.pontos} pts</span>
                <span class="ranking-nivel">Nv.${record.nivel_max}</span>
                <span class="ranking-data">${dataFormatada}</span>
            </div>
        `;
    });
    
    rankingElement.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', function() {
    // Carregar configurações salvas
    carregarConfiguracoes();
    
    // Event listeners do jogo
    document.getElementById('startButton').addEventListener('click', iniciarJogo);
    document.getElementById('ouvirButton').addEventListener('click', function() {
        if (palavraAtual) falarPalavra(palavraAtual);
    });
    document.getElementById('inputPalavra').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') verificarPalavra();
    });
    document.getElementById('verificarButton').addEventListener('click', verificarPalavra);
    document.getElementById('resetButton').addEventListener('click', resetarJogo);
    
    // Event listeners do ranking
    document.getElementById('ranking-toggle').addEventListener('click', toggleRanking);
    document.getElementById('ranking-switch').addEventListener('click', toggleRankingGlobal);
    document.getElementById('limpar-ranking').addEventListener('click', limparRanking);
    
    // Event listeners da configuração
    document.getElementById('apiToggle').addEventListener('change', toggleApiKeySection);
});

// Função para limpar ranking local
function limparRanking() {
    if (confirm('Tem certeza que deseja limpar todo o ranking local?')) {
        localStorage.removeItem('spelling_bee_ranking');
        localStorage.removeItem('spelling_bee_melhor');
        melhorPontuacao = 0;
        updateRanking();
        alert('Ranking local limpo com sucesso!');
    }
}

// Função para log de estado do jogo (debug - desativada)
function logEstadoJogo(contexto = '') {
    // console.log('=== Estado do Jogo ===');
}
