# 🐝 Spelling Bee - Jogo de Digitação Auditiva

Um jogo de digitação onde você deve escrever as palavras que ouve o mais rápido possível! Com níveis progressivos, ranking e integração com IA.

## ✨ Funcionalidades

- 🎧 **Síntese de voz** em português brasileiro
- 🤖 **IA para gerar palavras** usando Gemini 2.0 Flash via OpenRouter (seguro)
- 🎯 **10 níveis de dificuldade** progressivos (palavras ficam mais complexas)
- ⏱️ **Timer de 5 segundos** por palavra com animação visual
- 🔥 **Mecânica "errou, perdeu tudo"** - ao errar, volta ao nível 1
- 🏆 **Sistema de ranking** - Top 10 melhores pontuações
- 📊 **Histórico detalhado** com data, hora e nível máximo alcançado
- 🎨 **Interface moderna** com design responsivo
- � **Chave da API protegida** no backend (função serverless)

## 🎮 Como Jogar

1. **Clique em "🎮 Iniciar Jogo"**
2. **Ouça a palavra** (falada automaticamente)
3. **Digite o que ouviu** rapidamente
4. **Pressione Enter** ou clique em "✅ Verificar"
5. **Acerte 10 palavras** para subir de nível
6. **Cuidado!** Se errar, volta ao nível 1 e perde tudo

### 🎚️ Sistema de Níveis

- **Nível 1-2:** Palavras simples (3-5 letras) - casa, mesa, gato
- **Nível 3-4:** Palavras médias (4-7 letras) - escola, família, cidade  
- **Nível 5-6:** Palavras difíceis (5-9 letras) - computador, biblioteca
- **Nível 7-8:** Palavras complexas (6-11 letras) - programação, tecnologia
- **Nível 9-10:** Palavras expert (7-13 letras) - otorrinolaringologia

## 🚀 Como Usar

### Modo Básico (Lista Local)
- Marque a opção "Usar IA para gerar palavras" como **desmarcada**
- Use a lista de palavras pré-definidas no código
- Funciona offline, sem necessidade de API

### Modo Avançado (IA)
- Marque a opção "Usar IA para gerar palavras"
- Palavras são geradas dinamicamente pelo Gemini 2.0 Flash
- Maior variedade e palavras adequadas ao nível de dificuldade

## 🔒 Deploy Seguro no Netlify

### Pré-requisitos
1. **Conta no Netlify** - [netlify.com](https://netlify.com)
2. **Chave da API OpenRouter** - [openrouter.ai](https://openrouter.ai)
3. **Git/GitHub** para versionamento

### Passo a Passo

#### 1. Preparar o código
```bash
# Clone ou baixe o projeto
git init
git add .
git commit -m "Initial commit"

# Suba para o GitHub (crie um repositório primeiro)
git remote add origin https://github.com/seu-usuario/digitagames.git
git push -u origin main
```

#### 2. Deploy no Netlify
1. **Acesse o Netlify** e faça login
2. **Clique em "New site from Git"**
3. **Conecte seu repositório GitHub**
4. **Configure as opções de build:**
   - Build command: `npm install` (opcional)
   - Publish directory: `.` (raiz do projeto)
   - Functions directory: `netlify/functions`

#### 3. Configurar Variáveis de Ambiente
1. **No painel do Netlify**, vá em **Site settings > Environment variables**
2. **Adicione a variável:**
   - **Key:** `OPENROUTER_API_KEY`
   - **Value:** sua_chave_da_api_openrouter_aqui
3. **Salve as configurações**

#### 4. Redeploy
- O site será automaticamente refeito com as novas configurações
- A chave da API ficará protegida no servidor

### 🔐 Segurança
- ✅ **Chave da API protegida** - nunca expostas no frontend
- ✅ **Función serverless** - proxy seguro para a API
- ✅ **CORS configurado** - apenas origens autorizadas
- ✅ **Validação de entrada** - parâmetros verificados no backend
- ✅ **Fallback robusto** - funciona mesmo se a API falhar

## 🛠️ Arquitetura Técnica

### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização moderna com gradientes
- **JavaScript** - Lógica do jogo e integração com função serverless
- **Web Speech API** - Síntese de voz nativa do navegador

### Backend (Serverless)
- **Netlify Functions** - Função serverless em Node.js
- **OpenRouter API** - Acesso seguro ao Gemini 2.0 Flash
- **Validação rigorosa** - Filtragem de palavras inadequadas
- **Fallback automático** - Lista local em caso de erro

## � Estrutura do Projeto

```
Digitagames/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos do jogo
│   └── js/
│       └── jogo.js         # Lógica principal
├── netlify/
│   └── functions/
│       └── generate-words.js  # Função serverless
├── netlify.toml            # Configuração do Netlify
├── package.json            # Dependências do Node.js
├── .env.example            # Exemplo de variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
└── README.md               # Este arquivo
```

## 🧪 Desenvolvimento Local

### Testando Funções Serverless Localmente

1. **Instale o Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento:**
```bash
netlify dev
```

4. **Acesse:** `http://localhost:8888`

### Variáveis de Ambiente para Desenvolvimento
1. **Copie o arquivo de exemplo:**
```bash
cp .env.example .env
```

2. **Edite o `.env` e adicione sua chave:**
```
OPENROUTER_API_KEY=sua_chave_da_api_aqui
```

## � Solução de Problemas

### Erros Comuns
- **"Função serverless não encontrada"**: Verifique se está executando `netlify dev`
- **"Chave da API não configurada"**: Configure a variável `OPENROUTER_API_KEY`
- **"CORS Error"**: Use o servidor de desenvolvimento, não abra o arquivo diretamente
- **"Áudio não funciona"**: Ative o áudio no navegador e use HTTPS

### Debug
- Abra as **Ferramentas do Desenvolvedor** (F12)
- Vá na aba **Console** para ver logs detalhados
- Verifique a aba **Network** para problemas de rede

## � Custos da API

O modelo `google/gemini-2.0-flash-exp:free` é **gratuito** na OpenRouter:
- ✅ **Sem custos** para uso básico
- ✅ **Rate limits** aplicáveis
- ✅ **Ideal para desenvolvimento** e uso pessoal

Para uso em produção com maior volume, considere modelos pagos mais estáveis.

## 🔧 Personalização

### Adicionar Novos Níveis
Edite o array `palavrasPorNivel` em `jogo.js`:
```javascript
const palavrasPorNivel = {
    6: ["palavra6", "exemplo6"], // Novo nível
    // ...
};
```

### Modificar Timer
Altere a variável `tempoRestante` na função `iniciarTimer()`:
```javascript
tempoRestante = 10; // 10 segundos em vez de 5
```

### Personalizar Função Serverless
Edite `netlify/functions/generate-words.js` para:
- Usar outros modelos de IA
- Modificar prompts
- Adicionar mais validações

## 📊 Analytics e Monitoramento

### Netlify Analytics
- **Configuração**: Habilite no painel do Netlify
- **Métricas**: Visitantes, performance, erros
- **Custo**: Plano gratuito disponível

### Logs da Função Serverless
- **Visualizar**: No painel Netlify > Functions > Logs
- **Debug**: Adicione `console.log()` na função
- **Monitoramento**: Alertas por email disponíveis

## � Otimizações de Performance

### Frontend
- ✅ **CSS minificado** e inline crítico
- ✅ **JavaScript otimizado** sem bibliotecas pesadas
- ✅ **Lazy loading** de recursos não críticos
- ✅ **PWA ready** - pode ser instalado como app

### Backend
- ✅ **Cache de respostas** da API (implementável)
- ✅ **Rate limiting** nativo do Netlify
- ✅ **Edge functions** para menor latência
- ✅ **Fallback robusto** sempre disponível

## 📄 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir.

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie uma branch** para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra um Pull Request**

## 📞 Suporte

- 🐛 **Issues**: Reporte bugs no GitHub
- 💡 **Features**: Sugira melhorias via Issues
- 📧 **Contato**: Use as Issues para dúvidas

---

**Divirta-se digitando! 🎮⌨️**
#
