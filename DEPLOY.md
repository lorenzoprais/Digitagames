# 🚀 Deploy no Netlify - Passo a Passo

## Pré-requisitos
- ✅ Conta no GitHub
- ✅ Conta no Netlify
- ✅ Chave da API OpenRouter

## 1. Preparar o Repositório

### Criar repositório no GitHub:
1. Acesse [github.com](https://github.com) e faça login
2. Clique em "New repository"
3. Nome: `digitagames-spelling-bee`
4. Marque "Public" ou "Private" conforme preferir
5. Não adicione README (já existe no projeto)
6. Clique em "Create repository"

### Subir o código:
```bash
# No diretório do projeto, execute:
git init
git add .
git commit -m "🎮 Jogo Spelling Bee com função serverless"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/digitagames-spelling-bee.git
git push -u origin main
```

## 2. Deploy no Netlify

### Conectar repositório:
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"New site from Git"**
3. Escolha **"GitHub"**
4. Autorize o acesso ao GitHub
5. Selecione o repositório `digitagames-spelling-bee`

### Configurar build:
- **Branch to deploy:** `main`
- **Build command:** `npm install` (opcional)
- **Publish directory:** `.` (raiz)
- **Functions directory:** `netlify/functions`

### Finalizar deploy:
- Clique em **"Deploy site"**
- Aguarde o build terminar (pode demorar alguns minutos)

## 3. Configurar Variáveis de Ambiente

### Obter chave da OpenRouter:
1. Acesse [openrouter.ai](https://openrouter.ai)
2. Crie uma conta ou faça login
3. Vá em **"Keys"** no menu
4. Clique em **"Create Key"**
5. **Copie a chave gerada** (guarde em local seguro)

### Configurar banco Neon (PostgreSQL):
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Clique em **"Create Project"**
4. **Nome:** `digitagames-db`
5. **Região:** escolha a mais próxima
6. Após criar, copie a **Connection String**

### Configurar no Netlify:
1. No painel do seu site, vá em **Site settings**
2. Clique em **Environment variables** (no menu lateral)
3. Adicione as seguintes variáveis:

**Variável 1:**
- **Key:** `OPENROUTER_API_KEY`
- **Value:** cole sua chave da OpenRouter aqui

**Variável 2:**
- **Key:** `NETLIFY_DATABASE_URL`
- **Value:** cole a connection string do Neon aqui

4. Clique em **"Create variable"** para cada uma

## 4. Redeploy (Importante!)

Após adicionar a variável de ambiente:
1. Vá em **Deploys** no menu principal
2. Clique em **"Trigger deploy"**
3. Selecione **"Deploy site"**
4. Aguarde o novo build terminar

## 5. Testar o Site

### Verificar se funcionou:
1. **Acesse seu site** (URL fornecida pelo Netlify)
2. **Marque a opção** "Usar IA para gerar palavras"
3. **Clique em "Iniciar Jogo"**
4. **Verifique o status:** deve mostrar "🤖 IA ATIVA"

### URLs importantes:
- **Site:** `https://SEU_SITE.netlify.app`
- **Função:** `https://SEU_SITE.netlify.app/.netlify/functions/generate-words`
- **Admin:** `https://app.netlify.com/sites/SEU_SITE`

## 6. Personalizar Domínio (Opcional)

### Usar domínio personalizado:
1. Em **Site settings > Domain management**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `meujogo.com`)
4. Configure os DNS conforme instruções
5. Habilite **HTTPS automático**

## 7. Solução de Problemas

### ❌ Erro: "Função não encontrada"
- **Causa:** Variável de ambiente não configurada
- **Solução:** Verifique se `OPENROUTER_API_KEY` está definida

### ❌ Erro: "API Key inválida"  
- **Causa:** Chave da OpenRouter incorreta ou sem créditos
- **Solução:** Verifique a chave e créditos na OpenRouter

### ❌ Erro: "Build failed"
- **Causa:** Erro no código ou dependências
- **Solução:** Verifique os logs de build no Netlify

### ❌ Função retorna "fallback"
- **Causa:** API temporariamente indisponível
- **Solução:** Normal, o jogo funciona com palavras locais

## 8. Monitoramento

### Analytics (opcional):
- Em **Site settings > Analytics**
- Habilite **Netlify Analytics** para métricas

### Logs da função:
- Em **Functions > generate-words**
- Clique em **"View logs"** para debug

### Alertas:
- Configure alertas por email em **Notifications**
- Receba avisos sobre deploys e erros

## 9. Atualizações

### Para atualizar o jogo:
```bash
# Faça suas modificações no código
git add .
git commit -m "✨ Nova funcionalidade"
git push

# O Netlify fará deploy automático!
```

### Deploy manual:
- Arraste e solte a pasta do projeto em **Deploys**
- Útil para testes rápidos

## 🎉 Pronto!

Seu jogo está no ar com:
- ✅ **Chave da API protegida** no servidor
- ✅ **HTTPS automático** 
- ✅ **Deploy automático** a cada commit
- ✅ **Função serverless** funcionando
- ✅ **CDN global** para velocidade
- ✅ **Fallback robusto** se a API falhar

**URL do seu jogo:** https://SEU_SITE.netlify.app

Compartilhe com os amigos e divirta-se! 🎮⌨️
