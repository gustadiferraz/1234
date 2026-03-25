/* =============================================
   DATA.JS — Dados iniciais demo
   CarreiraPro
============================================= */

const USUARIOS = [
  { email: 'samuelbandez@lumini.com',      password: '123456', role: 'admin',      name: 'Samuel Bandez',      supervisor: null },
  { email: 'danielsoares@lumini.com', password: '123456', role: 'supervisor', name: 'Daniel Soares',  supervisor: true },
  { email: 'kauelima@lumini.com',       password: '123456', role: 'supervisor', name: 'Kaue Lima',  supervisor: true },
  { email: 'helciopacheco@lumini.com',       password: '223344', role: 'supervisor', name: 'Helcio Pacheco', supervisor:true},
  { email: 'tonicarlos@lumini.com',       password: '445566', role: 'supervisor', name: 'Toni Carlos', supervisor:true},
];

const DEMO_EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Carlos Silva',
    sector: 'Produção',
    currentRole: 'Auxiliar de Produção',
    desiredRole: 'Operador de Máquinas',
    admission: '2023-01-15',
    minMonths: 12,
    supervisor: 'supervisor@empresa.com',
    status: 'ready',  // period | ready | approved | promoted
    skills: { 'Operação de Equipamentos': 2, 'Leitura de Ordens': 1, 'Segurança do Trabalho': 2, 'Controle de Qualidade': 1, 'Manutenção Básica': 0 }
  },
  {
    id: 'emp-002',
    name: 'Ana Souza',
    sector: 'Produção',
    currentRole: 'Operador de Máquinas',
    desiredRole: 'Técnico de Produção',
    admission: '2024-07-01',
    minMonths: 18,
    supervisor: 'supervisor@empresa.com',
    status: 'period',
    skills: { 'Operação de Equipamentos': 3, 'Leitura de Ordens': 2, 'Segurança do Trabalho': 2, 'Controle de Qualidade': 1, 'Manutenção Básica': 1 }
  },
  {
    id: 'emp-003',
    name: 'Roberto Lima',
    sector: 'Manutenção',
    currentRole: 'Técnico de Produção',
    desiredRole: 'Líder de Turno',
    admission: '2022-02-10',
    minMonths: 24,
    supervisor: 'supervisor@empresa.com',
    status: 'ready',
    skills: { 'Operação de Equipamentos': 3, 'Leitura de Ordens': 3, 'Segurança do Trabalho': 3, 'Controle de Qualidade': 2, 'Manutenção Básica': 3 }
  },
  {
    id: 'emp-004',
    name: 'Juliana Costa',
    sector: 'Logística',
    currentRole: 'Auxiliar de Logística',
    desiredRole: 'Operador de Logística',
    admission: '2024-09-10',
    minMonths: 12,
    supervisor: 'supervisor@empresa.com',
    status: 'period',
    skills: { 'Operação de Equipamentos': 0, 'Leitura de Ordens': 1, 'Segurança do Trabalho': 1, 'Controle de Qualidade': 0, 'Manutenção Básica': 0 }
  },
  {
    id: 'emp-005',
    name: 'Marcos Oliveira',
    sector: 'Produção',
    currentRole: 'Líder de Turno',
    desiredRole: 'Supervisor de Produção',
    admission: '2021-03-05',
    minMonths: 36,
    supervisor: 'supervisor@empresa.com',
    status: 'promoted',
    skills: { 'Operação de Equipamentos': 3, 'Leitura de Ordens': 3, 'Segurança do Trabalho': 3, 'Controle de Qualidade': 3, 'Manutenção Básica': 2 }
  },
  {
    id: 'emp-006',
    name: 'Fernanda Rocha',
    sector: 'Qualidade',
    currentRole: 'Auxiliar de Qualidade',
    desiredRole: 'Técnico de Qualidade',
    admission: '2023-11-20',
    minMonths: 12,
    supervisor: 'sup2@empresa.com',
    status: 'approved',
    skills: { 'Operação de Equipamentos': 1, 'Leitura de Ordens': 2, 'Segurança do Trabalho': 2, 'Controle de Qualidade': 3, 'Manutenção Básica': 0 }
  }
];

const DEMO_CAREERS = [
  {
    id: 'car-001',
    name: 'Auxiliar',
    level: 1,
    minMonths: 6,
    competencies: ['Conhecer regras de segurança básica', 'Realizar tarefas operacionais simples', 'Manter organização do posto de trabalho']
  },
  {
    id: 'car-002',
    name: 'Operador',
    level: 2,
    minMonths: 12,
    competencies: ['Operar equipamentos com autonomia', 'Ler e interpretar ordens de serviço', 'Cumprir metas de produtividade', 'Conhecer noções de qualidade']
  },
  {
    id: 'car-003',
    name: 'Técnico',
    level: 3,
    minMonths: 18,
    competencies: ['Executar atividades técnicas complexas', 'Realizar diagnóstico e resolução de problemas', 'Treinar operadores', 'Propor melhorias no processo']
  },
  {
    id: 'car-004',
    name: 'Líder',
    level: 4,
    minMonths: 24,
    competencies: ['Liderar equipe de 5 a 15 pessoas', 'Planejar e controlar a produção do turno', 'Gerenciar indicadores de desempenho', 'Desenvolver pessoas da equipe']
  },
  {
    id: 'car-005',
    name: 'Supervisor',
    level: 5,
    minMonths: 36,
    competencies: ['Supervisionar múltiplos turnos/setores', 'Gestão de pessoas e conflitos', 'Responsabilidade por resultados do setor', 'Interface com outras áreas e diretoria']
  }
];

const DEMO_EVALUATIONS = [
  {
    id: 'eval-001',
    employeeId: 'emp-005',
    employeeName: 'Marcos Oliveira',
    currentRole: 'Líder de Turno',
    desiredRole: 'Supervisor de Produção',
    supervisorEmail: 'supervisor@empresa.com',
    supervisorName: 'João Pereira',
    date: '2025-10-15',
    sections: {
      tecnica: [true, true, true, true, true],
      comportamento: [true, true, true, true, true],
      seguranca: [true, true, true, true],
      potencial: [true, true, true]
    },
    stars: 5,
    strengths: 'Excelente liderança, conhecimento técnico sólido e comprometimento com resultados.',
    improvements: 'Aprimorar gestão financeira do setor.',
    observations: 'Funcionário com alto potencial. Recomendado fortemente.',
    percent: 100,
    result: 'recommended'
  }
];

const DEMO_MATRIX_SKILLS = [
  'Operação de Equipamentos',
  'Leitura de Ordens',
  'Segurança do Trabalho',
  'Controle de Qualidade',
  'Manutenção Básica'
];

/* Questões do formulário de avaliação */
const EVAL_QUESTIONS = {
  tecnica: [
    'Conhece e aplica os procedimentos do cargo?',
    'Opera os equipamentos necessários com segurança?',
    'Atinge as metas de produtividade do cargo?',
    'Demonstra conhecimento técnico suficiente para o cargo desejado?',
    'Passou pelos treinamentos obrigatórios do cargo?'
  ],
  comportamento: [
    'Demonstra pontualidade e assiduidade (ausências justificadas)?',
    'Possui postura profissional adequada?',
    'Trabalha bem em equipe e colabora com colegas?',
    'Recebe e aplica feedbacks com maturidade?',
    'Demonstra iniciativa e proatividade no dia a dia?'
  ],
  seguranca: [
    'Segue todas as normas de segurança (EPI, procedimentos)?',
    'Não possui advertências disciplinares no período avaliado?',
    'Mantém organização e limpeza no posto de trabalho (5S)?',
    'Zela pela qualidade do produto/serviço entregue?'
  ],
  potencial: [
    'Demonstra interesse genuíno na promoção para o cargo desejado?',
    'Tem capacidade de treinar outros funcionários em suas atividades?',
    'Apresenta liderança natural e influência positiva na equipe?'
  ]
};

const STAR_LABELS = ['', 'Abaixo do Esperado', 'Precisa Melhorar', 'Atende ao Esperado', 'Acima do Esperado', 'Excelente'];
