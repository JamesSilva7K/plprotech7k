# APK Studio Enterprise 🛡️
> Sistema Avançado de Distribuição, Métricas Reais, QR Code Customizável e Links Criptografados com Blindagem Anti-Invasão.

---

## 🚀 Destaques e Funcionalidades

- **100% Real e Limpo**: Zero elementos artificiais ou dependências de IA externa. Código limpo, rápido e autônomo.
- **Blindagem Anti-Invasão**:
  - Proteção contra quebra de portas e enumeração de rotas
  - Defesa contra Path Traversal e injeção de parâmetros
  - Headers HTTP com padrão OWASP (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
  - Rate Limiting integrado por IP
  - Ocultação total de cabeçalhos de servidor (`X-Powered-By`)
- **Links Criptografados e Exclusivos**:
  - Tokens determinísticos gerados com HMAC-SHA256
  - Slugs de acesso opacos para blindagem contra sniffing
  - Assinatura criptográfica SHA-256 calculada em tempo real sobre arquivos anexados
- **Gerador de QR Code Avançado e Personalizável**:
  - Geração local pura via Canvas/SVG (sem APIs externas)
  - Customização de cor primária (Dark) e fundo (Light)
  - Inclusão inteligente do logotipo oficial do APK no centro
  - Molduras personalizadas com texto CTA ("ESCANEAR PARA BAIXAR")
  - Níveis de correção de erros configuráveis (L, M, Q, H)
  - Formato de módulos quadrado, cantos suaves ou arredondados
  - Download imediato em PNG Alta Definição e SVG Vetorial
- **Página Exclusiva de Download do QR Code**:
  - Estética oficial da Google Play Store com selo Google Play Protect
  - Download real do APK anexado pelo admin
  - Logs de verificação de integridade e SHA-256
  - Mini QR Code integrado para repasse entre aparelhos
- **Deploy no Vercel (Host Free)**:
  - Arquivo `vercel.json` pré-configurado com rewrites SPA e regras de cabeçalhos de segurança.

---

## 🛠️ Comandos

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Iniciar servidor em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar build de produção
npm start
```

---

## ☁️ Deploy no Vercel (Host Free)

1. Faça push do repositório para o seu GitHub/GitLab.
2. Acesse [vercel.com](https://vercel.com) e importe o repositório.
3. As configurações do `vercel.json` já definem automaticamente o framework Vite, comando de build `vite build` e diretório de saída `dist`.
4. Defina a variável `APP_SECRET` nas Environment Variables do projeto na Vercel.
5. Pronto! O sistema estará online no seu subdomínio `.vercel.app`.
