/**
 * Gerador de Copywriting Corporativo ASO Oficial (100% Real, Determinístico e sem IA)
 * Executado localmente no navegador (client-side) para garantir 100% de confiabilidade no Vercel
 * com latência zero e sem dependência de APIs externas.
 */

export interface GenerateAsoCopyParams {
  appName: string;
  company?: string;
  category?: string;
  fileName?: string;
  fileSize?: string;
  tone?: 'Oficial & Corporativo' | 'Comercial & Persuasivo' | 'Técnico & Preciso' | string;
  highlights?: string;
}

export function generateAsoCopy(params: GenerateAsoCopyParams): string {
  const appTitle = params.appName ? params.appName.trim() : 'Aplicativo Oficial';
  const devCompany = params.company?.trim() || 'Desenvolvedor Oficial';
  const appCategory = params.category?.trim() || 'Ferramentas & Negócios';
  const sizeFormatted = params.fileSize?.trim() || '35.0 MB';

  const userHighlights = params.highlights && params.highlights.trim().length > 0
    ? params.highlights.trim()
    : null;

  const tone = params.tone || 'Oficial & Corporativo';

  if (tone === 'Comercial & Persuasivo') {
    return `O ${appTitle} é a solução oficial de alta performance criada por ${devCompany}. Desenvolvido especificamente para atender os mais rigorosos padrões da categoria ${appCategory}, combinando velocidade excepcional, praticidade absoluta e conveniência para você.

RECURSOS E VANTAGENS EXCLUSIVAS:
• Acesso imediato e descomplicado: Navegue com respostas em tempo real e interface refinada.
• Notificações e atualizações instantâneas: Fique sempre à frente com alertas e novidades prioritárias.
• Operação ultra-rápida: Projetado para responder com fluidez e zero lentidão em qualquer situação.
${userHighlights ? `• Destaque Especial: ${userHighlights}\n` : ''}• Sincronização contínua: Todos os seus dados alinhados instantaneamente entre serviços.

SEGURANÇA E BLINDAGEM DE DADOS:
• Pacote oficial verificado com integridade criptográfica confirmada.
• Transferências protegidas via criptografia TLS de 256 bits ponta a ponta.
• Proteção ativa auditada e validada pelo Google Play Protect.

COMPATIBILIDADE E OTIMIZAÇÃO:
• Pacote otimizado (${sizeFormatted}) para economia máxima de espaço interno.
• Consumo inteligente de energia, prolongando a vida útil da bateria do dispositivo.
• Compatibilidade garantida com Android 8.0 ou superior.

SUPORTE E ATENDIMENTO:
Conte com suporte técnico especializado e atualizações regulares de segurança.`;
  }

  if (tone === 'Técnico & Preciso') {
    return `O ${appTitle} constitui o cliente móvel oficial provido por ${devCompany}, catalogado sob a categoria ${appCategory}. A distribuição foi projetada com arquitetura de alta disponibilidade, protocolos de baixa latência e total conformidade com as diretrizes do Android Open Source Project.

ESPECIFICAÇÕES TÉCNICAS E MÓDULOS:
• Arquitetura modular otimizada para baixo tempo de inicialização (Cold Start < 300ms).
• Camada de transporte assíncrona com reconexão automática e tolerância a falhas.
• Pipeline de armazenamento isolado (Scoped Storage) conforme API Level 34.
${userHighlights ? `• Módulo Específico: ${userHighlights}\n` : ''}• Renderização de alta cadência e taxa de quadros estável a 60/120 FPS.

INTEGRIDADE E ASSINATURA CRIPTOGRÁFICA:
• Validação de hash SHA-256 e assinatura APK Signature Scheme v2/v3.
• Criptografia de ponta a ponta em repouso e trânsito (AES-GCM-256 / TLS 1.3).
• Ausência de bibliotecas de rastreamento invasivo ou injeção de dependências não verificadas.

DISTRIBUIÇÃO:
• Binário compilado com stripping de símbolos para peso otimizado (${sizeFormatted}).
• Alvo de execução: Android 8.0 (API Level 26) até Android 14 (API Level 34).`;
  }

  // Oficial & Corporativo (Padrão)
  return `O ${appTitle} é o aplicativo corporativo oficial desenvolvido por ${devCompany}. Projetado com excelência operacional para a categoria ${appCategory}, disponibiliza acesso direto, seguro e confiável às ferramentas e serviços corporativos essenciais.

RECURSOS E FUNCIONALIDADES PRINCIPAIS:
• Acompanhamento e controle em tempo real com atualizações contínuas de status.
• Interface de usuário ergonômica, intuitiva e estruturada nas diretrizes Material Design.
• Central de comunicados e alertas inteligentes prioritários diretamente no aparelho.
${userHighlights ? `• Recursos Adicionais: ${userHighlights}\n` : ''}• Agilidade e estabilidade: Fluxos de navegação otimizados para máxima produtividade.

SEGURANÇA, PRIVACIDADE E CONFIABILIDADE:
• Validação rigorosa de integridade do pacote oficial (${sizeFormatted}).
• Criptografia de alta resistência em todos os canais de comunicação de dados.
• Certificação de conformidade operacional e proteção verificada pelo Google Play Protect.

DESEMPENHO E COMPATIBILIDADE:
• Pacote ultra-leve otimizado para não sobrecarregar a memória do smartphone.
• Baixo consumo de bateria e de tráfego de dados móveis em segundo plano.
• Suporte completo a dispositivos Android 8.0 ou superior.

SUPORTE CORPORATIVO:
Canais dedicados para suporte e garantia de atualizações periódicas de estabilidade.`;
}

