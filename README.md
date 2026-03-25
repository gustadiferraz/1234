# 🚀 CarreiraPro — Gestão de Carreira & Polivalência

Plataforma web **mobile-first** completa para gestão de plano de carreira, promoção e polivalência de funcionários. Funciona perfeitamente no celular dos supervisores como um aplicativo web.

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação
- Tela de login elegante com dois perfis: **Administrador (RH)** e **Supervisor**
- Sessão persistida via `sessionStorage`
- Dados demo pré-configurados

### 👔 Painel do Administrador (RH)
- **Dashboard** com 4 KPIs: Total de Funcionários, Aptos para Avaliação, Avaliações Pendentes, Promoções Aprovadas
- **Gráfico de barras** com distribuição de funcionários por status (Chart.js)
- **Lista dos recém elegíveis** para avaliação
- **Gestão completa de funcionários** (CRUD): adicionar, editar, excluir, visualizar detalhes
- **Barra de progresso** do tempo de casa para cada funcionário
- **Status automático** calculado com base na data de admissão
- **Trilha de Carreira** visual e interativa (Auxiliar → Operador → Técnico → Líder → Supervisor)
- **Gestão de cargos** com competências obrigatórias configuráveis
- **Histórico de avaliações** com todos os detalhes
- **Relatórios** com gráficos de pizza e tabela completa
- **Botão de impressão/PDF** do relatório
- **Matriz de Polivalência** completa e interativa

### 🧑‍💼 Painel do Supervisor (Mobile-First)
- **Dashboard pessoal** com equipe, alerta de funcionários aptos
- **Lista da equipe** com cards detalhados e status visual
- **Formulário de Avaliação de Polivalência** completo em 4 seções:
  - 📋 Competências Técnicas (5 perguntas)
  - 🤝 Comportamento e Atitude (5 perguntas)
  - 🔒 Segurança e Qualidade (4 perguntas)
  - 📈 Potencial de Crescimento (3 perguntas)
- **Avaliação geral** com sistema de estrelas (1-5) e campos de texto
- **Resultado automático em tempo real**: % critérios, badge colorido
- **Lógica de resultado**:
  - ≥ 75%: ✅ Recomendado para Promoção
  - 50-74%: ⚠️ Requer Desenvolvimento  
  - < 50%: ❌ Não Recomendado
- **Modal de confirmação animado** após envio

### 🗂️ Matriz de Polivalência
- Tabela visual estilo heat-map com emojis
- 4 níveis: 🔴 Não Treinado | 🟡 Em Treinamento | 🟢 Competente | ⭐ Referência
- **Clique em qualquer célula** para ciclar entre os níveis
- Filtro por setor/área
- Legenda visual clara

---

## 🔑 Acesso Demo

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador (RH) | admin@empresa.com | 123456 |
| Supervisor | supervisor@empresa.com | 123456 |

---

## 📁 Estrutura de Arquivos

```
index.html          — Página principal (SPA)
css/
  style.css         — Estilos completos (mobile-first)
js/
  data.js           — Dados demo e constantes
  app.js            — Lógica principal da aplicação
README.md           — Esta documentação
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — Semântico e acessível
- **CSS3** — Mobile-first, variáveis CSS, animações
- **JavaScript Vanilla** — SPA sem frameworks
- **Chart.js** (CDN) — Gráficos de barras e pizza
- **Font Awesome** (CDN) — Ícones
- **Google Fonts — Inter** — Tipografia
- **localStorage** — Persistência de dados no navegador

---

## 👥 Dados Demo (pré-carregados)

| Funcionário | Cargo Atual | Cargo Desejado | Status |
|-------------|-------------|----------------|--------|
| Carlos Silva | Auxiliar de Produção | Operador de Máquinas | 🟡 Apto para Avaliação |
| Ana Souza | Operador de Máquinas | Técnico de Produção | 🔴 Em Período |
| Roberto Lima | Técnico de Produção | Líder de Turno | 🟡 Apto para Avaliação |
| Juliana Costa | Auxiliar de Logística | Operador de Logística | 🔴 Em Período |
| Marcos Oliveira | Líder de Turno | Supervisor de Produção | ⭐ Promovido |
| Fernanda Rocha | Auxiliar de Qualidade | Técnico de Qualidade | ✅ Aprovado |

---

## 🔜 Próximos Passos Sugeridos

1. **Backend real** com banco de dados (Node.js + PostgreSQL)
2. **Autenticação segura** com JWT e controle de sessão
3. **Notificações por e-mail** quando funcionário fica apto
4. **Upload de foto** do funcionário
5. **Relatório PDF** com geração automática
6. **Dashboard de KPIs** com evolução histórica (gráfico de linhas)
7. **Múltiplos avaliadores** e média de notas
8. **Plano de desenvolvimento individual (PDI)** vinculado à avaliação
9. **Integração com sistema de RH** via API
10. **App nativo** (PWA — Progressive Web App) para instalação no celular

---

## 📱 Responsividade

- **Mobile (< 640px)**: Layout vertical, botões grandes, formulário otimizado para toque
- **Tablet (640-768px)**: Grid de 4 colunas para KPIs, sidebar deslizante
- **Desktop (> 768px)**: Sidebar fixa visível, layout duas colunas no dashboard
