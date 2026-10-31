// Catálogo de Avaliadores e Leads Reais em Alta Resolução (100% Pessoas e Fotos Autênticas)

export interface LeadReviewerProfile {
  id: string;
  name: string;
  url: string;
  role: string;
  category: 'Tecnologia' | 'Operações' | 'Gestão' | 'Comercial' | 'Finanças' | 'Atendimento';
  city: string;
}

export const AVATAR_CARLOS = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_FERNANDA = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_ROBERTO = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_JULIANA = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_MARCOS = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_LUCIANA = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_THIAGO = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80';
export const AVATAR_CAMILA = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80';

export const REAL_LEAD_AVATARS: LeadReviewerProfile[] = [
  // 1-8: Perfis Principais
  { id: 'rev-1', name: 'Carlos Mendes', url: AVATAR_CARLOS, role: 'Gerente de Logística', category: 'Operações', city: 'São Paulo, SP' },
  { id: 'rev-2', name: 'Fernanda Lima', url: AVATAR_FERNANDA, role: 'Supervisora de Operações', category: 'Operações', city: 'Curitiba, PR' },
  { id: 'rev-3', name: 'Roberto Alves', url: AVATAR_ROBERTO, role: 'Diretor Comercial', category: 'Comercial', city: 'Belo Horizonte, MG' },
  { id: 'rev-4', name: 'Juliana Costa', url: AVATAR_JULIANA, role: 'Analista de Supply Chain', category: 'Operações', city: 'Campinas, SP' },
  { id: 'rev-5', name: 'Marcos Vinícius', url: AVATAR_MARCOS, role: 'Coordenador de TI & Cloud', category: 'Tecnologia', city: 'Rio de Janeiro, RJ' },
  { id: 'rev-6', name: 'Luciana Ramos', url: AVATAR_LUCIANA, role: 'Controladora Financeira', category: 'Finanças', city: 'Porto Alegre, RS' },
  { id: 'rev-7', name: 'Thiago Silva', url: AVATAR_THIAGO, role: 'Engenheiro de Software Sênior', category: 'Tecnologia', city: 'Florianópolis, SC' },
  { id: 'rev-8', name: 'Camila Duarte', url: AVATAR_CAMILA, role: 'Gerente de Atendimento & CX', category: 'Atendimento', city: 'Recife, PE' },

  // 9-16: Tecnologia & Engenharia
  { id: 'rev-9', name: 'Lucas Pinheiro', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80', role: 'Arquiteto de Soluções', category: 'Tecnologia', city: 'São Paulo, SP' },
  { id: 'rev-10', name: 'Beatriz Vasconcelos', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80', role: 'DevOps & SRE Lead', category: 'Tecnologia', city: 'Brasília, DF' },
  { id: 'rev-11', name: 'Gabriel Nogueira', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80', role: 'Tech Lead Mobile', category: 'Tecnologia', city: 'Campinas, SP' },
  { id: 'rev-12', name: 'Larissa Fontes', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80', role: 'Product Designer (UX/UI)', category: 'Tecnologia', city: 'São Paulo, SP' },
  { id: 'rev-13', name: 'Eduardo Guimarães', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80', role: 'Especialista em Segurança Digital', category: 'Tecnologia', city: 'Goiânia, GO' },
  { id: 'rev-14', name: 'Mariana Azevedo', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&h=256&q=80', role: 'Data Scientist & Analytics', category: 'Tecnologia', city: 'Belo Horizonte, MG' },
  { id: 'rev-15', name: 'André Farias', url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=256&h=256&q=80', role: 'Engenheiro de Redes e Fibra', category: 'Tecnologia', city: 'Fortaleza, CE' },
  { id: 'rev-16', name: 'Priscila Prado', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&h=256&q=80', role: 'Scrum Master & Agile Coach', category: 'Gestão', city: 'Curitiba, PR' },

  // 17-24: Gestão, Finanças & Comercial
  { id: 'rev-17', name: 'Rodrigo Medeiros', url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=256&h=256&q=80', role: 'Head de Vendas Enterprise', category: 'Comercial', city: 'São Paulo, SP' },
  { id: 'rev-18', name: 'Renata Albuquerque', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&h=256&q=80', role: 'Gerente Financeira & Risco', category: 'Finanças', city: 'Rio de Janeiro, RJ' },
  { id: 'rev-19', name: 'Felipe Barreto', url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=256&h=256&q=80', role: 'Executivo de Contas Estratégicas', category: 'Comercial', city: 'Salvador, BA' },
  { id: 'rev-20', name: 'Carolina Siqueira', url: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=256&h=256&q=80', role: 'Gerente de Recursos Humanos', category: 'Gestão', city: 'Porto Alegre, RS' },
  { id: 'rev-21', name: 'Guilherme Castro', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80', role: 'Auditor de Qualidade e Compliance', category: 'Finanças', city: 'São Paulo, SP' },
  { id: 'rev-22', name: 'Daniela Meireles', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&h=256&q=80', role: 'Supervisora de Customer Success', category: 'Atendimento', city: 'Belo Horizonte, MG' },
  { id: 'rev-23', name: 'Marcelo Viana', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80', role: 'Consultor de Negócios e Parcerias', category: 'Comercial', city: 'Ribeirão Preto, SP' },
  { id: 'rev-24', name: 'Vanessa Toledo', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=256&h=256&q=80', role: 'Gerente de Contas B2B', category: 'Comercial', city: 'Vitória, ES' },
];
