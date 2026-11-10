const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const DB = {
  projects: 'cheatset_projects_v1',
  questions: 'cheatset_questions_v1',
  profile: 'cheatset_profile_v1',
  users: 'cheatset_users_v1',
  session: 'cheatset_session_v1',
  community: 'cheatset_community_posts_v2',
  contact: 'cheatset_contact_messages_v1'
};

const GUEST_PROFILE = {
  name: 'Visitante',
  username: 'visitante',
  bio: 'Faça login ou crie uma conta para personalizar seu perfil.',
  skills: '',
  github: '',
  website: ''
};

const starterProjects = [
  { id: 'p1', title: 'Portfolio Builder', description: 'Uma base para criar portfólios profissionais com foco em clareza visual e presença digital.', language: 'HTML/CSS', category: 'Frontend', author: 'Ana Silva', url: 'https://github.com/example/portfolio-builder', createdAt: '2026-10-28', likes: 18 },
  { id: 'p2', title: 'Nova Dashboard', description: 'Interface para acompanhar métricas com gráficos claros, filtros e alto contraste para decisões rápidas.', language: 'TypeScript', category: 'Dashboard', author: 'Lucas Dev', url: 'https://github.com/example/nova-dashboard', createdAt: '2026-10-27', likes: 12 },
  { id: 'p3', title: 'API de tarefas', description: 'API REST de exemplo para organizar tarefas, rotas e validações de entrada.', language: 'Python', category: 'Backend', author: 'Marina Costa', url: 'https://github.com/example/api-tarefas', createdAt: '2026-10-25', likes: 9 }
];

const starterQuestions = [
  { id: 'q1', title: 'Como organizar uma arquitetura limpa em React?', description: 'Estou montando uma aplicação com vários módulos. Como vocês dividem componentes, rotas e estado?', language: 'React', author: 'Dev iniciante', createdAt: '2026-10-29', answers: 4, votes: 18 },
  { id: 'q2', title: 'Qual a melhor forma de validar dados em uma API Node.js?', description: 'Quero validar os dados recebidos antes de gravar no banco. Quais padrões vocês recomendam?', language: 'Node.js', author: 'Rafa Code', createdAt: '2026-10-28', answers: 7, votes: 12 }
];

/* ---------- storage ---------- */
function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function projects() { return read(DB.projects, starterProjects); }
function questions() { return read(DB.questions, starterQuestions); }

/* ---------- auth ---------- */
function getUsers() { return read(DB.users, []); }
function getSession() { return read(DB.session, null); }
function setSession(user) {
  if (user) {
    write(DB.session, { id: user.id, name: user.name, username: user.username, email: user.email });
  } else {
    localStorage.removeItem(DB.session);
  }
}
function isLoggedIn() { return !!getSession(); }
function currentAuthor() {
  const s = getSession();
  if (s) return { name: s.name, username: s.username, initials: initialsFrom(s.name) };
  return { name: 'Visitante', username: 'visitante', initials: 'VI' };
}
function initialsFrom(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'CS';
  return parts.slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('') || 'CS';
}

/* ---------- ui helpers ---------- */
function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const u = new URL(trimmed);
    if (!['http:', 'https:'].includes(u.protocol)) return '';
    // bloquear só a home do github (link inútil que "abre página aleatória")
    if (u.hostname === 'github.com' && (u.pathname === '/' || u.pathname === '')) return '';
    return u.href;
  } catch {
    return '';
  }
}
function isUsefulRepoUrl(url) {
  return !!safeUrl(url);
}


/* ---------- guia de linguagens (tags = filtro + aprendizado) ---------- */
const LANG_GUIDE = {
  'JavaScript': {
    level: 'Iniciante → Intermediário',
    summary: 'Linguagem da web: roda no navegador e também no servidor (Node.js). Ideal para interfaces e APIs.',
    basics: [
      'Variáveis: let, const e var',
      'Funções e arrow functions () => {}',
      'Arrays e objetos',
      'DOM: document.querySelector',
      'Promessas e async/await'
    ],
    topics: ['Frontend', 'DOM', 'Fetch API', 'ES6+', 'Node.js'],
    tip: 'Comece por console.log, depois funções e arrays. Depois DOM e fetch.'
  },
  'TypeScript': {
    level: 'Intermediário',
    summary: 'JavaScript com tipos estáticos. Ajuda a evitar erros e escala melhor em projetos grandes.',
    basics: [
      'Tipos: string, number, boolean, any',
      'Interfaces e type aliases',
      'Generics básicos',
      'Compilação para JavaScript (tsc)',
      'Strict mode'
    ],
    topics: ['Tipagem', 'Interfaces', 'Generics', 'Frontend', 'Backend'],
    tip: 'Se já sabe JS, adicione tipos aos parâmetros e retornos das funções.'
  },
  'Python': {
    level: 'Iniciante → Avançado',
    summary: 'Sintaxe limpa, ótima para iniciantes, dados, automação, IA e backend.',
    basics: [
      'Indentação define blocos',
      'list, dict, tuple, set',
      'def para funções e class para classes',
      'if / for / while',
      'pip e ambientes virtuais'
    ],
    topics: ['Backend', 'Dados', 'Automação', 'IA', 'Scripts'],
    tip: 'Pratique listas e dicionários; depois funções e leitura de arquivos.'
  },
  'Java': {
    level: 'Intermediário',
    summary: 'Orientada a objetos, forte em backend empresarial, Android e sistemas robustos.',
    basics: [
      'Tudo parte de classes',
      'public static void main',
      'Tipos primitivos vs objetos',
      'Herança e interfaces',
      'JVM e bytecode'
    ],
    topics: ['OOP', 'Backend', 'Spring', 'Android', 'Estruturas de dados'],
    tip: 'Foque em classes, objetos e o fluxo do main antes de frameworks.'
  },
  'C++': {
    level: 'Intermediário → Avançado',
    summary: 'Alto desempenho, controle de memória, jogos, sistemas e competições.',
    basics: [
      '#include e namespace std',
      'Tipos, ponteiros e referências',
      'classes e structs',
      'new / delete (memória)',
      'STL: vector, map, string'
    ],
    topics: ['Performance', 'Memória', 'Jogos', 'Sistemas', 'Algoritmos'],
    tip: 'Domine variáveis e fluxos antes de ponteiros; depois vector e classes.'
  },
  'HTML/CSS': {
    level: 'Iniciante',
    summary: 'Base de toda página web: HTML estrutura o conteúdo; CSS define o visual.',
    basics: [
      'Tags: div, section, header, p, a',
      'Semântica HTML5',
      'Seletores CSS e classes',
      'Flexbox e Grid',
      'Responsividade (media queries)'
    ],
    topics: ['Layout', 'Responsivo', 'Acessibilidade', 'UI', 'Design'],
    tip: 'Monte uma página simples e estilize com Flexbox antes de frameworks.'
  },
  'PHP': {
    level: 'Iniciante → Intermediário',
    summary: 'Clássica do backend web: sites dinâmicos, formulários e integração com banco.',
    basics: [
      'Arquivos .php e <?php ?>',
      'Variáveis com $',
      'Arrays e foreach',
      'Formulários $_GET / $_POST',
      'Conexão com MySQL'
    ],
    topics: ['Backend', 'Forms', 'MySQL', 'Laravel', 'APIs'],
    tip: 'Crie um form que grava em arquivo ou banco; depois organize em funções.'
  },
  'Rust': {
    level: 'Avançado',
    summary: 'Segurança de memória sem garbage collector. Ideal para sistemas e performance.',
    basics: [
      'ownership e borrowing',
      'let e mutabilidade',
      'Result e Option',
      'cargo new / build / run',
      'traits'
    ],
    topics: ['Sistemas', 'Segurança', 'Performance', 'CLI', 'WebAssembly'],
    tip: 'Leia ownership com calma; compile exemplos pequenos até o erro sumir.'
  },
  'Go': {
    level: 'Intermediário',
    summary: 'Simples e rápida, excelente para APIs, concorrência e infraestrutura.',
    basics: [
      'package main e func main',
      ':= para declarar variáveis',
      'structs e métodos',
      'goroutines e channels',
      'go mod'
    ],
    topics: ['APIs', 'Concorrência', 'CLI', 'Cloud', 'Microserviços'],
    tip: 'Faça um HTTP server com net/http e depois explore goroutines.'
  },
  'React': {
    level: 'Intermediário',
    summary: 'Biblioteca para interfaces com componentes e estado reativo.',
    basics: [
      'Componentes função',
      'JSX',
      'props e useState',
      'useEffect',
      'Listas e keys'
    ],
    topics: ['Frontend', 'Componentes', 'Hooks', 'SPA', 'UI'],
    tip: 'Crie componentes pequenos; pratique useState antes de roteamento.'
  },
  'Node.js': {
    level: 'Intermediário',
    summary: 'JavaScript no servidor: APIs, ferramentas CLI e backends em tempo real.',
    basics: [
      'npm init e package.json',
      'require / import',
      'http ou Express',
      'async/await em I/O',
      'middleware'
    ],
    topics: ['Backend', 'APIs', 'Express', 'JSON', 'Auth'],
    tip: 'Monte uma API REST simples com rotas GET/POST em Express.'
  },
  'Comunidade': {
    level: 'Todos os níveis',
    summary: 'Espaço para trocar ideias, dúvidas e progresso — independente da stack.',
    basics: [
      'Pergunte com contexto',
      'Compartilhe o que funcionou',
      'Respeite outros níveis',
      'Documente seu aprendizado',
      'Ajude quando puder'
    ],
    topics: ['Soft skills', 'Networking', 'Carreira', 'Estudos', 'Open source'],
    tip: 'Publique uma dúvida pequena ou uma dica que você aprendeu esta semana.'
  },
  'Boas práticas': {
    level: 'Todos os níveis',
    summary: 'Hábitos que deixam código legível, seguro e fácil de manter.',
    basics: [
      'Nomes claros de variáveis',
      'Funções pequenas',
      'README do projeto',
      'Não commitar segredos',
      'Versionar com Git'
    ],
    topics: ['Git', 'Clean code', 'README', 'Testes', 'Revisão'],
    tip: 'Antes de cada commit, releia o diff e renomeie o que estiver confuso.'
  },
  'Geral': {
    level: 'Iniciante',
    summary: 'Conteúdo geral de programação, sem foco em uma linguagem só.',
    basics: [
      'Lógica: if, loops, funções',
      'Algoritmos simples',
      'Depuração (debug)',
      'Git básico',
      'Como pesquisar erros'
    ],
    topics: ['Lógica', 'Algoritmos', 'Git', 'Debug', 'Carreira'],
    tip: 'Pratique lógica todo dia com um exercício curto.'
  }
};

function getLangGuide(name) {
  return LANG_GUIDE[name] || LANG_GUIDE['Geral'];
}


/* Conteúdo completo das páginas de linguagem */
const LANG_PAGES = {
  'Python': {
    level: 'Iniciante → Avançado',
    tagline: 'Legível, poderosa e usada em tudo: web, dados, automação e IA.',
    about: 'Python é uma linguagem de alto nível criada por Guido van Rossum. Sua sintaxe limpa reduz ruído e permite focar na lógica. Roda em interpretador, tem ecossistema enorme (pip) e comunidade ativa.',
    usedFor: ['Backend (Django, Flask, FastAPI)', 'Ciência de dados e IA', 'Automação e scripts', 'APIs e bots', 'Ensino de programação'],
    basics: [
      'Instale pelo python.org e rode python no terminal',
      'print(), variáveis e tipos (int, float, str, bool)',
      'if / elif / else e loops for / while',
      'list, dict, tuple e set',
      'Funções com def e return',
      'Módulos: import math, from x import y'
    ],
    topics: [
      { t: 'Sintaxe e tipos', d: 'Indentação obriga blocos claros. Tudo é objeto.' },
      { t: 'Estruturas de dados', d: 'list para sequências, dict para mapas chave→valor.' },
      { t: 'Funções e módulos', d: 'Organize código em arquivos .py reutilizáveis.' },
      { t: 'Arquivos e I/O', d: 'with open(...) as f garante fechamento seguro.' },
      { t: 'Virtualenv e pip', d: 'Isole dependências por projeto.' },
      { t: 'OOP em Python', d: 'class, __init__, métodos e herança simples.' }
    ],
    example: '# lista de tarefas simples\ntarefas = []\n\ndef adicionar(t):\n    tarefas.append(t)\n\nadicionar("Estudar Python")\nfor i, t in enumerate(tarefas, 1):\n    print(i, t)',
    path: [
      '1. Sintaxe, variáveis e print',
      '2. Condicionais e loops',
      '3. Listas e dicionários',
      '4. Funções e arquivos',
      '5. Um projetinho CLI (to-do ou calculadora)',
      '6. Escolha um caminho: web, dados ou automação'
    ],
    tip: 'Pratique todo dia 20–30 min. Leia erros do terminal com calma — eles costumam dizer a linha e o tipo do problema.'
  },
  'JavaScript': {
    level: 'Iniciante → Intermediário',
    tagline: 'A linguagem da web: interface, interatividade e também backend com Node.js.',
    about: 'JavaScript nasceu nos navegadores e hoje é onipresente. Controla o DOM, responde a eventos e, com Node.js, sobe para o servidor. É dinâmica, orientada a protótipos e evolui rápido (ES6+).',
    usedFor: ['Páginas e SPAs', 'Frontend (React, Vue, Svelte)', 'Backend com Node.js', 'Mobile (React Native)', 'Ferramentas de build e CLI'],
    basics: [
      'Console do navegador (F12) para testar',
      'let / const, strings, numbers e boolean',
      'Funções e arrow functions',
      'Arrays: map, filter, find',
      'Objetos e JSON',
      'DOM: querySelector e addEventListener'
    ],
    topics: [
      { t: 'DOM e eventos', d: 'Como a página reage a cliques, teclado e formulários.' },
      { t: 'ES6+', d: 'Destructuring, spread, modules, template strings.' },
      { t: 'Assíncrono', d: 'Promises, async/await e fetch para APIs.' },
      { t: 'Node.js', d: 'Mesma linguagem no servidor e em ferramentas.' },
      { t: 'Boas práticas', d: 'Evite var, prefira const, quebre funções grandes.' },
      { t: 'Debug', d: 'breakpoints no DevTools valem ouro.' }
    ],
    example: 'const btn = document.querySelector("#ok");\nlet n = 0;\nbtn.addEventListener("click", () => {\n  n += 1;\n  btn.textContent = `Cliques: ${n}`;\n});',
    path: [
      '1. Console, variáveis e operadores',
      '2. Funções e arrays',
      '3. DOM e eventos',
      '4. fetch + JSON',
      '5. Pequeno app (contador, to-do, clima)',
      '6. Depois: TypeScript ou React'
    ],
    tip: 'Não pule o DOM puro. Frameworks ficam bem mais fáceis quando você entende o que eles automatizam.'
  },
  'TypeScript': {
    level: 'Intermediário',
    tagline: 'JavaScript com tipos — menos bugs, melhor autocomplete e projetos maiores sob controle.',
    about: 'TypeScript (TS) adiciona tipagem estática opcional ao JavaScript. O compilador (tsc) verifica o código e gera JS. É padrão em muitos times frontend e Node.',
    usedFor: ['Apps React/Next em escala', 'APIs Node', 'Bibliotecas compartilhadas', 'Código com contratos claros entre módulos'],
    basics: [
      'Tipos: string, number, boolean, any, unknown',
      'Anotar parâmetros e retorno de funções',
      'interface e type',
      'Arrays: number[] ou Array<number>',
      'Propriedades opcionais com ?',
      'tsconfig.json e tsc'
    ],
    topics: [
      { t: 'Tipagem básica', d: 'O compilador é seu primeiro revisor de código.' },
      { t: 'Interfaces', d: 'Descrevem formato de objetos e props de componentes.' },
      { t: 'Unions e literais', d: "status: 'on' | 'off' evita valores inválidos." },
      { t: 'Generics', d: 'Funções reutilizáveis que preservam o tipo.' },
      { t: 'Strict mode', d: 'Ative strict no tsconfig para aprender de verdade.' },
      { t: 'Migração', d: 'Renomeie .js → .ts e corrija erros aos poucos.' }
    ],
    example: 'interface User {\n  id: number;\n  name: string;\n  email?: string;\n}\n\nfunction label(u: User): string {\n  return `${u.id} — ${u.name}`;\n}',
    path: [
      '1. Domine JavaScript moderno',
      '2. Tipos em funções e variáveis',
      '3. Interfaces de objetos',
      '4. Strict + um projeto pequeno em TS',
      '5. TS + React (props tipadas)',
      '6. Generics quando sentir necessidade'
    ],
    tip: 'Se o TS reclamar, ele quase sempre está certo. Leia a mensagem — é parte do aprendizado.'
  },
  'React': {
    level: 'Intermediário',
    tagline: 'UI em componentes: declare o que a tela deve mostrar e o React atualiza o DOM.',
    about: 'React é uma biblioteca para construir interfaces com componentes reutilizáveis e estado. Usa JSX (HTML dentro de JS) e um fluxo de dados previsível (props para baixo, eventos para cima).',
    usedFor: ['SPAs e dashboards', 'Sites com Next.js', 'Apps mobile (React Native)', 'Design systems'],
    basics: [
      'Componentes função que retornam JSX',
      'props para configurar o componente',
      'useState para memória local',
      'useEffect para efeitos (fetch, título, timers)',
      'Listas com .map e key estável',
      'Eventos: onClick, onChange'
    ],
    topics: [
      { t: 'JSX', d: 'Sintaxe que mistura markup e expressões JS.' },
      { t: 'Estado', d: 'useState dispara re-render quando muda.' },
      { t: 'Efeitos', d: 'useEffect separa “pintar tela” de “falar com o mundo”.' },
      { t: 'Composition', d: 'Componentes pequenos combinados > monólitos.' },
      { t: 'Forms', d: 'Inputs controlados: value + onChange.' },
      { t: 'Ecossistema', d: 'Router, query de dados, UI kits.' }
    ],
    example: 'function Counter() {\n  const [n, setN] = useState(0);\n  return (\n    <button onClick={() => setN(n + 1)}>\n      Cliques: {n}\n    </button>\n  );\n}',
    path: [
      '1. JavaScript + DOM sólido',
      '2. Componentes e props',
      '3. useState e formulários',
      '4. useEffect + fetch',
      '5. To-do ou lista de posts',
      '6. React Router e um app maior'
    ],
    tip: 'Copiar tutorial não basta: quebre o app, mude layout e adicione um campo novo para fixar o conceito.'
  },
  'C++': {
    level: 'Intermediário → Avançado',
    tagline: 'Desempenho e controle: jogos, sistemas, embarcados e programação competitiva.',
    about: 'C++ estende C com classes, templates e a STL. Oferece controle fino de memória e alta performance. A curva é mais íngreme, mas o domínio abre portas em áreas exigentes.',
    usedFor: ['Games e engines', 'Sistemas e drivers', 'Finanças de baixa latência', 'Embarcados', 'Competições de algoritmos'],
    basics: [
      '#include <iostream> e int main()',
      'Tipos: int, double, char, bool, std::string',
      'cin / cout',
      'if, for, while',
      'std::vector e std::string',
      'Compilar: g++ app.cpp -o app'
    ],
    topics: [
      { t: 'Memória', d: 'Stack vs heap; ponteiros e referências com cuidado.' },
      { t: 'STL', d: 'vector, map, set, algorithm — não reinvente a roda.' },
      { t: 'Classes', d: 'Encapsulamento, construtores, métodos.' },
      { t: 'Headers', d: 'Separe declaração (.h) e implementação (.cpp).' },
      { t: 'Build', d: 'Makefiles ou CMake em projetos reais.' },
      { t: 'Segurança', d: 'Evite buffer overflow; prefira RAII e smart pointers depois.' }
    ],
    example: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<int> v = {3, 1, 2};\n  for (int x : v) cout << x << " ";\n  return 0;\n}',
    path: [
      '1. main, tipos e I/O',
      '2. Controle de fluxo',
      '3. vector e string',
      '4. Funções e headers',
      '5. Classes simples',
      '6. Ponteiros + um projeto CLI'
    ],
    tip: 'Não comece por ponteiros e templates. Construa base sólida com STL e programas pequenos que compilam.'
  },
  'Java': {
    level: 'Intermediário',
    tagline: 'Orientação a objetos, portabilidade (JVM) e ecossistema maduro para backend e Android.',
    about: 'Java compila para bytecode executado na JVM — “escreva uma vez, rode em qualquer lugar”. É fortemente tipada, orientada a objetos e padrão em empresas, bancos e Android (ainda relevante).',
    usedFor: ['APIs e microserviços (Spring)', 'Android', 'Sistemas corporativos', 'Big data (parte do ecossistema)', 'Desktop (menos comum hoje)'],
    basics: [
      'Classe com public static void main',
      'Tipos primitivos e String',
      'Scanner para entrada',
      'if / for / while',
      'ArrayList e for-each',
      'new para criar objetos'
    ],
    topics: [
      { t: 'OOP', d: 'Classes, objetos, encapsulamento, herança, interfaces.' },
      { t: 'Coleções', d: 'List, Map, Set — o dia a dia do backend.' },
      { t: 'Pacotes', d: 'Organize por domínio: model, service, api.' },
      { t: 'Exceções', d: 'try/catch e tratamento explícito de erros.' },
      { t: 'JVM', d: 'Garbage collector e portabilidade.' },
      { t: 'Spring (depois)', d: 'Framework dominante para APIs Java.' }
    ],
    example: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    List<String> nomes = new ArrayList<>();\n    nomes.add("Ana");\n    for (String n : nomes) System.out.println(n);\n  }\n}',
    path: [
      '1. main, tipos e Scanner',
      '2. Controle de fluxo',
      '3. Classes e objetos',
      '4. ArrayList e mapas',
      '5. Pacotes + projeto de console',
      '6. Intro a Spring ou Android'
    ],
    tip: 'Pense em objetos do mundo real (Aluno, Pedido, Conta) e modele classes — OOP gruda mais rápido assim.'
  },
  'HTML/CSS': {
    level: 'Iniciante',
    tagline: 'A base de toda página: HTML estrutura, CSS visual e layout.',
    about: 'HTML define o significado e a estrutura do conteúdo. CSS define cores, tipografia, espaçamento e layout (Flexbox/Grid). Sem os dois, não existe front-end.',
    usedFor: ['Sites e landing pages', 'Emails (HTML restrito)', 'Estrutura de apps web', 'Protótipos de UI', 'Acessibilidade e SEO básico'],
    basics: [
      'Estrutura: html, head, body',
      'Títulos, parágrafos, links e imagens',
      'Listas, tabelas e formulários',
      'Classes e seletores CSS',
      'Box model: margin, border, padding',
      'Flexbox para alinhar elementos'
    ],
    topics: [
      { t: 'Semântica', d: 'header, main, section, article — melhor acessibilidade.' },
      { t: 'Box model', d: 'Tudo é caixa; border-box simplifica contas.' },
      { t: 'Flexbox', d: 'Filas e alinhamento em uma dimensão.' },
      { t: 'Grid', d: 'Layouts em duas dimensões.' },
      { t: 'Responsivo', d: 'media queries e unidades flexíveis.' },
      { t: 'Especificidade', d: 'Entenda por que um estilo “não aplica”.' }
    ],
    example: '<section class="card">\n  <h1>Olá</h1>\n  <p class="muted">Meu primeiro layout</p>\n</section>\n\n/* CSS */\n.card {\n  display: flex;\n  gap: 12px;\n  padding: 16px;\n}',
    path: [
      '1. Tags básicas e uma página estática',
      '2. CSS de cores e tipografia',
      '3. Box model e espaçamento',
      '4. Flexbox',
      '5. Página responsiva',
      '6. Depois: JavaScript no DOM'
    ],
    tip: 'Copie layouts que você gosta e recrie só com HTML/CSS. É o melhor exercício de olho e estrutura.'
  }
};


function ensureLangPanel() {
  let panel = document.getElementById('langGuidePanel');
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'langGuidePanel';
  panel.className = 'lang-guide-panel hidden';
  panel.innerHTML = `
    <div class="lang-guide-card">
      <div class="lang-guide-head">
        <div>
          <span class="eyebrow" id="langGuideLevel">—</span>
          <h3 id="langGuideTitle">Linguagem</h3>
        </div>
        <button type="button" class="close-button" id="langGuideClose" aria-label="Fechar">✕</button>
      </div>
      <p class="lang-guide-summary" id="langGuideSummary"></p>
      <div class="lang-guide-cols">
        <div>
          <h4>Básico para começar</h4>
          <ul id="langGuideBasics"></ul>
        </div>
        <div>
          <h4>Tópicos</h4>
          <div class="tag-row" id="langGuideTopics"></div>
        </div>
      </div>
      <p class="lang-guide-tip" id="langGuideTip"></p>
      <p class="muted" style="font-size:.78rem;margin:10px 0 0">Clique na tag de novo para filtrar projetos (quando estiver na galeria).</p>
    </div>`;
  document.body.appendChild(panel);
  panel.querySelector('#langGuideClose').addEventListener('click', () => panel.classList.add('hidden'));
  panel.addEventListener('click', e => { if (e.target === panel) panel.classList.add('hidden'); });
  return panel;
}

function openLangGuide(lang) {
  const g = getLangGuide(lang);
  const panel = ensureLangPanel();
  $('#langGuideLevel').textContent = g.level;
  $('#langGuideTitle').textContent = lang;
  $('#langGuideSummary').textContent = g.summary;
  $('#langGuideBasics').innerHTML = g.basics.map(b => `<li>${escapeHtml(b)}</li>`).join('');
  $('#langGuideTopics').innerHTML = g.topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  $('#langGuideTip').innerHTML = `<strong>Dica:</strong> ${escapeHtml(g.tip)}`;
  panel.classList.remove('hidden');
}

function languageChip(language = 'Geral', active = false) {
  const key = ({
    Python: 'python', JavaScript: 'javascript', TypeScript: 'typescript', React: 'react',
    Java: 'java', 'C++': 'cpp', 'HTML/CSS': 'htmlcss', PHP: 'php', Rust: 'rust', Go: 'go',
    'Node.js': 'javascript', Comunidade: '', 'Boas práticas': ''
  })[language] || '';
  const icon = ({
    Python: 'Py', JavaScript: 'JS', TypeScript: 'TS', React: '⚛', Java: 'Ja', 'C++': 'C+',
    'HTML/CSS': '5', PHP: 'php', Rust: 'Rs', Go: 'Go', 'Node.js': 'JS', Comunidade: 'CS', 'Boas práticas': '✓'
  })[language] || '{}';
  const g = getLangGuide(language);
  // title = comentário rápido ao passar o mouse (filtro + resumo da linguagem)
  const tip = `${language} — ${g.summary} (clique: ver guia · filtrar projetos)`;
  return `<span class="language-chip${active ? ' is-active' : ''}" data-tag-filter="${escapeHtml(language)}" title="${escapeHtml(tip)}" role="button" tabindex="0"><span class="language-icon ${key}">${icon}</span>${escapeHtml(language)}</span>`;
}
function tags(list) {
  return `<div class="tag-row">${list.map(x => languageChip(x)).join('')}</div>`;
}

function projectCard(p) {
  const covers = {
    Python: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    JavaScript: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    TypeScript: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
    'HTML/CSS': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
  };
  const cover = covers[p.language] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80';
  const repo = safeUrl(p.url);
  const repoBtn = repo
    ? `<a class="text-button" href="${repo}" target="_blank" rel="noopener noreferrer">Abrir repositório ↗</a>`
    : `<span class="muted" style="font-size:.8rem">Sem repositório</span>`;
  return `<article class="project-card">
    <div class="project-cover"><img src="${cover}" alt="Imagem ilustrativa de programação" loading="lazy"></div>
    <div class="meta-row"><span class="badge">${escapeHtml(p.category || 'Projeto')}</span><span>${escapeHtml(p.createdAt || '')}</span></div>
    <h3>${escapeHtml(p.title)}</h3>
    <p>${escapeHtml(p.description)}</p>
    ${tags([p.language || 'Geral'])}
    <div class="card-footer">
      <span>Por ${escapeHtml(p.author || 'Usuário')}</span>
      <span>♥ ${Number(p.likes) || 0}</span>
      <span class="spacer"></span>
      ${repoBtn}
    </div>
  </article>`;
}

function questionCard(q) {
  return `<article class="question-card">
    <div class="meta-row"><span class="badge ${q.answers ? '' : 'yellow'}">${q.answers ? 'Discussão' : 'Sem respostas'}</span><span>${escapeHtml(q.createdAt || '')}</span></div>
    <h3>${escapeHtml(q.title)}</h3>
    <p>${escapeHtml(q.description)}</p>
    ${tags([q.language || 'Geral'])}
    <div class="card-footer">
      <span>Por ${escapeHtml(q.author || 'Usuário')}</span>
      <span>▲ ${Number(q.votes) || 0}</span>
      <span>💬 ${Number(q.answers) || 0} respostas</span>
      <button type="button" class="text-button vote-question" data-id="${escapeHtml(q.id)}">Apoiar</button>
    </div>
  </article>`;
}

/* ---------- nav user pill ---------- */
function updateNavUser() {
  const session = getSession();
  const btn = $('#userMenuBtn') || $('.user-pill');
  const head = $('#userDropdownHead');
  const dd = $('#userDropdown');

  if (btn) {
    if (session) {
      btn.textContent = initialsFrom(session.name);
      btn.title = `${session.name} (@${session.username})`;
      btn.setAttribute('aria-label', `Menu de ${session.name}`);
      btn.classList.add('is-logged');
      btn.classList.remove('user-pill-guest');
    } else {
      btn.textContent = 'Entrar';
      btn.title = 'Entrar ou criar conta';
      btn.setAttribute('aria-label', 'Menu da conta');
      btn.classList.remove('is-logged');
      btn.classList.add('user-pill-guest');
    }
  }

  if (head) {
    head.textContent = session
      ? `${session.name} · @${session.username}`
      : 'Você não está logado';
  }

  // itens do dropdown conforme sessão
  $$('[data-user-action]').forEach(el => {
    const action = el.getAttribute('data-user-action');
    const guestOnly = action === 'login' || action === 'register';
    const authOnly = action === 'profile' || action === 'account' || action === 'logout';
    if (session) {
      if (guestOnly) el.classList.add('hidden');
      if (authOnly) el.classList.remove('hidden');
    } else {
      if (guestOnly) el.classList.remove('hidden');
      if (authOnly) el.classList.add('hidden');
    }
  });

  // Conta permanece no menu (Entrar / criar conta)
  $$('.menu a[data-page="conta"]').forEach(a => {
    a.classList.remove('hidden');
    a.style.display = '';
    a.textContent = session ? 'Conta' : 'Entrar';
  });
  // Perfil só no menu se logado (opcional); senão só bolinha/conta
  $$('.menu a[data-page="perfil"]').forEach(a => {
    if (session) {
      a.classList.remove('hidden');
      a.style.display = '';
    } else {
      a.classList.add('hidden');
      a.style.display = 'none';
    }
  });

  // Na tela de login (sem sessão), esconde atalhos do app (mantém Conta/brand)
  const onAuthPage = document.body.dataset.page === 'conta';
  if (onAuthPage && !session) {
    $$('.menu a').forEach(el => {
      if (el.dataset.page === 'conta') return;
      el.style.display = 'none';
    });
    $$('[data-create-project], [data-open-search]').forEach(el => { el.style.display = 'none'; });
  } else if (!onAuthPage) {
    $$('.menu a').forEach(el => {
      if (el.dataset.page === 'perfil' && !session) return;
      el.style.display = '';
      el.classList.remove('hidden');
    });
    $$('[data-create-project], [data-open-search]').forEach(el => { el.style.display = ''; });
  }
}

function setupUserMenu() {
  const menu = $('#userMenu');
  const btn = $('#userMenuBtn');
  const dd = $('#userDropdown');
  if (!btn || !dd) return;

  const close = () => {
    dd.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    dd.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  };
  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dd.classList.contains('hidden')) open();
    else close();
  };

  btn.addEventListener('click', toggle);

  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // ações do menu
  dd.addEventListener('click', e => {
    const item = e.target.closest('[data-user-action]');
    if (!item) return;
    const action = item.getAttribute('data-user-action');
    if (action === 'logout') {
      e.preventDefault();
      setSession(null);
      write(DB.profile, { ...GUEST_PROFILE });
      updateNavUser();
      close();
      toast('Você saiu da conta.');
      setTimeout(() => { location.href = 'conta.html'; }, 400);
      return;
    }
    if (action === 'register') {
      // conta.html abre na aba criar conta via hash
      close();
      return;
    }
    close();
  });
}


function renderProjects() {
  const target = $('#projectsGrid');
  if (!target) return;
  const query = ($('#projectSearch')?.value || '').toLowerCase();
  const lang = $('#languageFilter')?.value || 'all';
  const sort = $('#projectSort')?.value || 'recent';
  let data = projects().filter(p =>
    (`${p.title} ${p.description} ${p.language} ${p.category} ${p.author}`).toLowerCase().includes(query) &&
    (lang === 'all' || p.language === lang)
  );
  if (sort === 'popular') data.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  else data.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  target.innerHTML = data.length
    ? data.map(p => projectCard(p)).join('')
    : '<div class="empty">Nenhum projeto encontrado. Tente outra busca ou publique o primeiro.</div>';
}

function renderQuestions() {
  const target = $('#questionsGrid');
  if (!target) return;
  const query = ($('#questionSearch')?.value || '').toLowerCase();
  const data = questions().filter(q =>
    `${q.title} ${q.description} ${q.language} ${q.author}`.toLowerCase().includes(query)
  );
  target.innerHTML = data.length
    ? data.map(questionCard).join('')
    : '<div class="empty">Nenhuma discussão encontrada. Que tal iniciar uma?</div>';
}

function renderHome() {
  const pg = $('#homeProjects');
  if (pg) pg.innerHTML = projects().slice(0, 3).map(projectCard).join('');
  const qg = $('#homeQuestions');
  if (qg) qg.innerHTML = questions().slice(0, 3).map(questionCard).join('');
  const p = $('#projectCount');
  if (p) p.textContent = projects().length;
  const q = $('#questionCount');
  if (q) q.textContent = questions().length;
}

/* ---------- modals ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('hidden');
  m.setAttribute('aria-hidden', 'false');
  const input = $('input,textarea,select', m);
  if (input) setTimeout(() => input.focus(), 30);
}
function closeModal(m) {
  if (!m) return;
  m.classList.add('hidden');
  m.setAttribute('aria-hidden', 'true');
}

function setupSearch() {
  const modal = $('#searchModal');
  if (!modal) return;
  const open = () => openModal('searchModal');
  $$('[data-open-search]').forEach(b => b.addEventListener('click', open));
  $$('[data-close-modal]').forEach(b => b.addEventListener('click', () => closeModal(b.closest('.modal'))));
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape') $$('.modal:not(.hidden)').forEach(closeModal);
  });
  $('#globalSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    const results = $('#searchResults');
    if (!q) {
      results.innerHTML = '<p class="muted">Digite para pesquisar projetos e dúvidas.</p>';
      return;
    }
    const matches = [
      ...projects().filter(p => (p.title + ' ' + p.description + ' ' + p.language).toLowerCase().includes(q))
        .map(p => ({ title: p.title, desc: 'Projeto', href: 'projetos.html' })),
      ...questions().filter(x => (x.title + ' ' + x.description + ' ' + x.language).toLowerCase().includes(q))
        .map(x => ({ title: x.title, desc: 'Discussão', href: 'duvidas.html' }))
    ];
    results.innerHTML = matches.length
      ? matches.map(x => `<a class="search-result" href="${x.href}"><strong>${escapeHtml(x.title)}</strong><br><span class="muted">${x.desc}</span></a>`).join('')
      : '<p class="muted">Nenhum resultado encontrado.</p>';
  });
}

function setupCreate() {
  const projectForm = $('#projectForm');
  projectForm?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(projectForm);
    const author = currentAuthor();
    const rawUrl = (f.get('url') || '').toString().trim();
    const url = isUsefulRepoUrl(rawUrl) ? safeUrl(rawUrl) : '';
    const data = projects();
    data.unshift({
      id: 'p' + Date.now(),
      title: f.get('title').toString().trim(),
      description: f.get('description').toString().trim(),
      language: f.get('language'),
      category: f.get('category'),
      author: author.name,
      url,
      createdAt: new Date().toISOString().slice(0, 10),
      likes: 0
    });
    write(DB.projects, data);
    projectForm.reset();
    closeModal($('#projectModal'));
    renderProjects();
    renderHome();
    toast('Projeto salvo neste navegador.');
  });

  const questionForm = $('#questionForm');
  questionForm?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(questionForm);
    const author = currentAuthor();
    const data = questions();
    data.unshift({
      id: 'q' + Date.now(),
      title: f.get('title').toString().trim(),
      description: f.get('description').toString().trim(),
      language: f.get('language'),
      author: author.name,
      createdAt: new Date().toISOString().slice(0, 10),
      answers: 0,
      votes: 0
    });
    write(DB.questions, data);
    questionForm.reset();
    closeModal($('#questionModal'));
    renderQuestions();
    renderHome();
    toast('Discussão salva neste navegador.');
  });

  $$('[data-create-project]').forEach(b => b.addEventListener('click', () => openModal('projectModal')));
  $$('[data-create-question]').forEach(b => b.addEventListener('click', () => openModal('questionModal')));
}

/* ---------- profile ---------- */
function setupProfile() {
  const form = $('#profileForm');
  if (!form) return;

  const session = getSession();

  // Visitante não tem página de perfil — manda para Conta
  if (!session) {
    toast('Faça login ou crie uma conta para acessar o perfil.');
    location.replace('conta.html');
    return;
  }

  const notice = form.querySelector('.notice');

  const p = read(DB.profile, {
    name: session.name,
    username: session.username,
    bio: '',
    skills: '',
    github: '',
    website: ''
  });
  p.name = session.name;
  p.username = session.username;

  for (const key of ['name', 'username', 'bio', 'skills', 'github', 'website']) {
    if (form.elements[key]) form.elements[key].value = p[key] || '';
  }

  const update = () => {
    const name = form.elements.name.value || session.name;
    const username = form.elements.username.value || session.username;
    $('#profileName').textContent = name;
    $('#profileHandle').textContent = '@' + username.replace(/^@/, '');
    $('#profileInitials').textContent = initialsFrom(name);
    $('#profileBio').textContent = form.elements.bio.value || 'Adicione uma biografia para contar sua história.';
    $('#profileSkills').innerHTML = (form.elements.skills.value || '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => `<span class="tag">${escapeHtml(x)}</span>`)
      .join('');
    const links = [];
    const gh = safeUrl(form.elements.github.value);
    const site = safeUrl(form.elements.website.value);
    if (gh) links.push(`<a href="${gh}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (site) links.push(`<a href="${site}" target="_blank" rel="noopener noreferrer">Portfólio ↗</a>`);
    $('#profileLinks').innerHTML = links.join('');
    const count = projects().filter(x => (x.author || '').toLowerCase() === name.toLowerCase()).length;
    $('#profileProjectCount').textContent = count;
  };
  update();

  form.addEventListener('input', update);
  form.addEventListener('submit', e => {
      e.preventDefault();
      const next = {
        name: form.elements.name.value.trim(),
        username: form.elements.username.value.trim().replace(/^@/, ''),
        bio: form.elements.bio.value.trim(),
        skills: form.elements.skills.value.trim(),
        github: form.elements.github.value.trim(),
        website: form.elements.website.value.trim()
      };
      write(DB.profile, next);
      // mantém sessão alinhada com nome/username
      const s = getSession();
      if (s) {
        s.name = next.name;
        s.username = next.username;
        setSession(s);
        // atualiza também no cadastro de usuários
        const users = getUsers();
        const idx = users.findIndex(u => u.id === s.id);
        if (idx >= 0) {
          users[idx].name = next.name;
          users[idx].username = next.username;
          write(DB.users, users);
        }
      }
      updateNavUser();
      toast('Perfil salvo neste navegador.');
  });

  const mine = $('#myProjects');
  if (mine) {
    const myName = (session && session.name) || '';
    const mineList = myName
      ? projects().filter(x => (x.author || '').toLowerCase() === myName.toLowerCase()).slice(0, 6)
      : [];
    mine.innerHTML = mineList.length
      ? mineList.map(projectCard).join('')
      : '<div class="empty">Nenhum projeto seu ainda. Publique em Projetos.</div>';
  }
}

/* ---------- contact ---------- */
function setupContact() {
  const form = $('#contactForm');
  if (!form) return;
  const history = $('#contactHistory');
  const render = () => {
    const messages = read(DB.contact, []);
    if (!messages.length) {
      history.innerHTML = '<p class="muted">Você ainda não enviou mensagens por este navegador.</p>';
      return;
    }
    history.innerHTML = messages.map(m =>
      `<article class="contact-message">
        <div class="meta-row"><strong>${escapeHtml(m.subject)}</strong><span>${escapeHtml(m.date)}</span></div>
        <p>${escapeHtml(m.message)}</p>
        <small class="muted">Enviado por ${escapeHtml(m.name)} (${escapeHtml(m.email)})</small>
      </article>`
    ).join('');
  };
  render();
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const messages = read(DB.contact, []);
    messages.unshift({
      id: 'm' + Date.now(),
      name: f.get('name').toString().trim(),
      email: f.get('email').toString().trim(),
      subject: f.get('subject'),
      message: f.get('message').toString().trim(),
      date: new Date().toLocaleString('pt-BR')
    });
    write(DB.contact, messages.slice(0, 20));
    form.reset();
    const fb = $('#contactFeedback');
    if (fb) fb.textContent = 'Mensagem registrada neste navegador. O envio real será conectado quando o backend estiver configurado.';
    toast('Mensagem registrada localmente.');
    render();
  });
  $('#clearContactMessages')?.addEventListener('click', () => {
    write(DB.contact, []);
    render();
    toast('Histórico local limpo.');
  });
}

/* ---------- editor ---------- */
function setupEditor() {
  const code = $('#codeInput');
  const out = $('#editorOutput');
  if (!code || !out) return;
  $('#runCode')?.addEventListener('click', () => {
    out.textContent = 'Este editor é apenas para escrever e guardar trechos localmente. A execução de código ainda não está habilitada por segurança.';
    toast('Trecho preparado. Execução não habilitada.');
  });
  $('#saveCode')?.addEventListener('click', () => {
    localStorage.setItem('cheatset_editor_code', code.value);
    toast('Trecho salvo neste navegador.');
  });
  code.value = localStorage.getItem('cheatset_editor_code') ||
    '// Escreva seu código aqui\nfunction hello() {\n  return "Olá, Cheat Set!";\n}\n';
}

/* ---------- votes ---------- */
document.addEventListener('click', e => {
  const vote = e.target.closest('.vote-question');
  if (!vote) return;
  const data = questions();
  const q = data.find(x => x.id === vote.dataset.id);
  if (q) {
    q.votes = (q.votes || 0) + 1;
    write(DB.questions, data);
    renderQuestions();
    renderHome();
    toast('Voto registrado neste navegador.');
  }
});

/* ---------- splash ---------- */
function setupSplash() {
  const splash = $('#splashScreen');
  if (!splash) return;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    splash.classList.add('is-leaving');
    setTimeout(() => splash.remove(), 500);
  };
  $('#skipSplash')?.addEventListener('click', finish);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') finish(); });
  splash.addEventListener('click', e => { if (e.target === splash) finish(); });
  window.setTimeout(finish, 1900);
}

/* ---------- community ---------- */
function setupCommunity() {
  const form = $('#communityPostForm');
  const feed = $('#communityFeed');
  if (!feed) return;

  const seed = [
    {
      id: 'c1',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Hoje',
      title: 'Qual projeto vocês estão construindo esta semana?',
      body: 'Quero conhecer ideias da comunidade! Vale projeto de faculdade, ferramenta pessoal ou algo que vocês estejam aprendendo.',
      language: 'Comunidade',
      likes: 8,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
      comments: []
    },
    {
      id: 'c2',
      name: 'Lucas Dev',
      initials: 'LD',
      time: 'Ontem',
      title: 'Pequena dica: documente enquanto desenvolve',
      body: 'Um README claro com objetivo, tecnologias e como executar o projeto facilita muito a vida de quem vai testar ou contribuir.',
      language: 'Boas práticas',
      likes: 12,
      image: '',
      comments: []
    },
    {
      id: 'c10',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Hoje',
      title: 'O que é Python e por onde começar?',
      body: 'Python é uma linguagem legível e versátil. Comece pelo interpretador: print, variáveis, if/else e for. Use o site oficial e o tutorial "Python para iniciantes".',
      language: 'Python',
      likes: 13,
      image: '',
      comments: []
    },
    {
      id: 'c11',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Ontem',
      title: 'list, dict e tuple — a base dos dados',
      body: 'list é mutável e ordenada, dict guarda pares chave→valor, tuple é imutável. Quase todo programa em Python usa esses três no dia a dia.',
      language: 'Python',
      likes: 14,
      image: '',
      comments: []
    },
    {
      id: 'c12',
      name: 'Julia Front',
      initials: 'JF',
      time: '2 dias',
      title: 'Funções com def e return',
      body: 'Agrupe lógica em funções. Ex.: def soma(a, b): return a + b. Passe argumentos e reutilize o código em vários lugares.',
      language: 'Python',
      likes: 15,
      image: '',
      comments: []
    },
    {
      id: 'c13',
      name: 'Ana Silva',
      initials: 'AS',
      time: '3 dias',
      title: 'Como instalar pacotes com pip',
      body: 'pip install nome-do-pacote baixa bibliotecas. Use python -m venv .venv para isolar o projeto e não misturar dependências do sistema.',
      language: 'Python',
      likes: 16,
      image: '',
      comments: []
    },
    {
      id: 'c14',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Esta semana',
      title: 'Ler e escrever arquivos',
      body: 'with open("dados.txt") as f: texto = f.read() fecha o arquivo sozinho. Para gravar: open(..., "w"). Ideal para logs e CSV simples.',
      language: 'Python',
      likes: 17,
      image: '',
      comments: []
    },
    {
      id: 'c15',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Há 1 semana',
      title: 'Mini projeto: lista de tarefas no terminal',
      body: 'Crie um menu com input(): adicionar, listar e remover itens de uma list. É um ótimo exercício de loops e funções.',
      language: 'Python',
      likes: 3,
      image: '',
      comments: []
    },
    {
      id: 'c16',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Hoje',
      title: 'JavaScript no navegador em 5 minutos',
      body: 'Abra o DevTools (F12) → Console e digite console.log("oi"). JS controla a página: cliques, formulários e animações.',
      language: 'JavaScript',
      likes: 4,
      image: '',
      comments: []
    },
    {
      id: 'c17',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Ontem',
      title: 'let, const e tipos simples',
      body: 'const não reatribui a variável; let pode. Tipos comuns: string, number, boolean, null, undefined. Prefira const por padrão.',
      language: 'JavaScript',
      likes: 5,
      image: '',
      comments: []
    },
    {
      id: 'c18',
      name: 'Dev iniciante',
      initials: 'DI',
      time: '2 dias',
      title: 'Arrays e métodos úteis',
      body: 'const nums = [1,2,3]; nums.map(n => n*2), filter, find e forEach aparecem em todo frontend moderno.',
      language: 'JavaScript',
      likes: 6,
      image: '',
      comments: []
    },
    {
      id: 'c19',
      name: 'Julia Front',
      initials: 'JF',
      time: '3 dias',
      title: 'DOM: selecionar e mudar a página',
      body: 'document.querySelector(".btn") pega um elemento. Depois você altera textContent, classList ou adiciona addEventListener("click", ...).',
      language: 'JavaScript',
      likes: 7,
      image: '',
      comments: []
    },
    {
      id: 'c20',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Esta semana',
      title: 'fetch e async/await',
      body: 'async function load(){ const r = await fetch(url); const data = await r.json(); } busca dados de APIs sem travar a interface.',
      language: 'JavaScript',
      likes: 8,
      image: '',
      comments: []
    },
    {
      id: 'c21',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Há 1 semana',
      title: 'Mini projeto: contador de cliques',
      body: 'Um botão, um span com o número e um listener que soma +1. Simples e ensina DOM + estado na memória.',
      language: 'JavaScript',
      likes: 9,
      image: '',
      comments: []
    },
    {
      id: 'c22',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Hoje',
      title: 'Por que TypeScript existe?',
      body: 'É JavaScript com tipos. O compilador aponta erros antes de rodar: tipar parâmetros evita bugs bobos em projetos maiores.',
      language: 'TypeScript',
      likes: 10,
      image: '',
      comments: []
    },
    {
      id: 'c23',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Ontem',
      title: 'Tipos básicos: string, number, boolean',
      body: 'function greet(name: string): string { return "Oi " + name }. Se passar número, o TS reclama na hora.',
      language: 'TypeScript',
      likes: 11,
      image: '',
      comments: []
    },
    {
      id: 'c24',
      name: 'Marina Costa',
      initials: 'MC',
      time: '2 dias',
      title: 'interface vs type',
      body: 'interface User { id: number; name: string } descreve objetos. type também une tipos (union). Use interface para shapes de dados.',
      language: 'TypeScript',
      likes: 12,
      image: '',
      comments: []
    },
    {
      id: 'c25',
      name: 'Dev iniciante',
      initials: 'DI',
      time: '3 dias',
      title: 'Arrays tipados e opcionais',
      body: 'const ids: number[] = [1,2]; name?: string significa propriedade opcional. Ajuda a documentar o que a API realmente devolve.',
      language: 'TypeScript',
      likes: 13,
      image: '',
      comments: []
    },
    {
      id: 'c26',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Esta semana',
      title: 'Compilar com tsc',
      body: 'npm i -D typescript && npx tsc --init. O arquivo .ts vira .js. No dia a dia, Vite/Next já fazem isso por você.',
      language: 'TypeScript',
      likes: 14,
      image: '',
      comments: []
    },
    {
      id: 'c27',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Há 1 semana',
      title: 'Migrar um arquivo JS para TS',
      body: 'Renomeie para .ts, rode o compilador e corrija os erros um a um. É o melhor jeito de aprender na prática.',
      language: 'TypeScript',
      likes: 15,
      image: '',
      comments: []
    },
    {
      id: 'c28',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Hoje',
      title: 'O que é um componente?',
      body: 'Uma função que retorna JSX (HTML com JS). function Button(){ return <button>Ok</button> }. A UI vira peças reutilizáveis.',
      language: 'React',
      likes: 16,
      image: '',
      comments: []
    },
    {
      id: 'c29',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Ontem',
      title: 'props: passar dados para o filho',
      body: 'function Hello({ name }){ return <p>Oi {name}</p> }. O pai decide o valor; o filho só exibe.',
      language: 'React',
      likes: 17,
      image: '',
      comments: []
    },
    {
      id: 'c30',
      name: 'Ana Silva',
      initials: 'AS',
      time: '2 dias',
      title: 'useState: memória do componente',
      body: 'const [n, setN] = useState(0). Ao chamar setN(n+1), o React redesenha a tela com o novo valor.',
      language: 'React',
      likes: 3,
      image: '',
      comments: []
    },
    {
      id: 'c31',
      name: 'Marina Costa',
      initials: 'MC',
      time: '3 dias',
      title: 'useEffect: efeitos colaterais',
      body: 'useEffect(() => { document.title = "App" }, []). Roda depois do render — ideal para fetch e timers.',
      language: 'React',
      likes: 4,
      image: '',
      comments: []
    },
    {
      id: 'c32',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Esta semana',
      title: 'Listas e a prop key',
      body: 'items.map(i => <li key={i.id}>{i.name}</li>). A key estável ajuda o React a atualizar só o que mudou.',
      language: 'React',
      likes: 5,
      image: '',
      comments: []
    },
    {
      id: 'c33',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Há 1 semana',
      title: 'Mini projeto: to-do em React',
      body: 'Input controlado + lista em useState. Adicionar e remover itens ensina props, estado e eventos de uma vez.',
      language: 'React',
      likes: 6,
      image: '',
      comments: []
    },
    {
      id: 'c34',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Hoje',
      title: 'Hello World e a estrutura básica',
      body: '#include <iostream> e int main(){ std::cout << "Oi"; return 0; }. Todo programa C++ começa no main.',
      language: 'C++',
      likes: 7,
      image: '',
      comments: []
    },
    {
      id: 'c35',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Ontem',
      title: 'Tipos e variáveis',
      body: 'int, double, char, bool. std::string para textos. Compile com g++ arquivo.cpp -o app e rode ./app.',
      language: 'C++',
      likes: 8,
      image: '',
      comments: []
    },
    {
      id: 'c36',
      name: 'Julia Front',
      initials: 'JF',
      time: '2 dias',
      title: 'if, for e while',
      body: 'Controle de fluxo clássico. Prefira for(int i=0;i<n;i++) no início. Cuidado com condições de parada infinitas.',
      language: 'C++',
      likes: 9,
      image: '',
      comments: []
    },
    {
      id: 'c37',
      name: 'Ana Silva',
      initials: 'AS',
      time: '3 dias',
      title: 'vector da STL',
      body: '#include <vector>. std::vector<int> v; v.push_back(3). Cresce sozinho e substitui arrays manuais na maioria dos casos.',
      language: 'C++',
      likes: 10,
      image: '',
      comments: []
    },
    {
      id: 'c38',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Esta semana',
      title: 'Ponteiros sem drama',
      body: 'int x=10; int* p=&x; *p é o valor. Comece só entendendo endereço (&) e valor (*); deixe new/delete para depois.',
      language: 'C++',
      likes: 11,
      image: '',
      comments: []
    },
    {
      id: 'c39',
      name: 'Dev iniciante',
      initials: 'DI',
      time: 'Há 1 semana',
      title: 'Mini projeto: calculadora no terminal',
      body: 'Leia dois números e um operador com cin. Treina input, if/else e saída formatada com cout.',
      language: 'C++',
      likes: 12,
      image: '',
      comments: []
    },
    {
      id: 'c40',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Hoje',
      title: 'Classe e método main',
      body: 'public class App { public static void main(String[] args){ System.out.println("Oi"); } }. O JVM procura o main para iniciar.',
      language: 'Java',
      likes: 13,
      image: '',
      comments: []
    },
    {
      id: 'c41',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Ontem',
      title: 'Tipos e Scanner',
      body: 'int, double, boolean, String. Scanner sc = new Scanner(System.in) lê o teclado. Feche o Scanner quando terminar.',
      language: 'Java',
      likes: 14,
      image: '',
      comments: []
    },
    {
      id: 'c42',
      name: 'Dev iniciante',
      initials: 'DI',
      time: '2 dias',
      title: 'Orientação a objetos em 1 ideia',
      body: 'Classe = molde; objeto = instância. new Pessoa("Ana") cria um objeto com os dados daquele molde.',
      language: 'Java',
      likes: 15,
      image: '',
      comments: []
    },
    {
      id: 'c43',
      name: 'Julia Front',
      initials: 'JF',
      time: '3 dias',
      title: 'ArrayList e loops',
      body: 'List<String> nomes = new ArrayList<>(); nomes.add("A"); for(String n: nomes){ ... } é o dia a dia em Java.',
      language: 'Java',
      likes: 16,
      image: '',
      comments: []
    },
    {
      id: 'c44',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Esta semana',
      title: 'Pacotes e organização',
      body: 'package com.meuapp; importa com import. Separe modelo, serviço e interface desde projetos pequenos.',
      language: 'Java',
      likes: 17,
      image: '',
      comments: []
    },
    {
      id: 'c45',
      name: 'Marina Costa',
      initials: 'MC',
      time: 'Há 1 semana',
      title: 'Mini projeto: cadastro de alunos',
      body: 'Classe Aluno com nome e nota + ArrayList. Liste a média da turma. Ensina OOP e coleções juntos.',
      language: 'Java',
      likes: 3,
      image: '',
      comments: []
    },
    {
      id: 'c46',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Hoje',
      title: 'HTML: esqueleto da página',
      body: 'html, head, body, h1–h6, p, a, img, section. Semântica boa ajuda SEO e acessibilidade.',
      language: 'HTML/CSS',
      likes: 4,
      image: '',
      comments: []
    },
    {
      id: 'c47',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Ontem',
      title: 'CSS: seletores e cores',
      body: '.card { color: #fff; background: #111 }. Classes reutilizam estilo. Evite estilizar só por tag em sites grandes.',
      language: 'HTML/CSS',
      likes: 5,
      image: '',
      comments: []
    },
    {
      id: 'c48',
      name: 'Marina Costa',
      initials: 'MC',
      time: '2 dias',
      title: 'Box model: margin, border, padding',
      body: 'Tudo na web é caixa. padding é dentro, margin é fora. border-box no * facilita calcular larguras.',
      language: 'HTML/CSS',
      likes: 6,
      image: '',
      comments: []
    },
    {
      id: 'c49',
      name: 'Dev iniciante',
      initials: 'DI',
      time: '3 dias',
      title: 'Flexbox para alinhar',
      body: 'display:flex; gap:12px; align-items:center. Centralizar e distribuir itens ficou simples com Flex.',
      language: 'HTML/CSS',
      likes: 7,
      image: '',
      comments: []
    },
    {
      id: 'c50',
      name: 'Julia Front',
      initials: 'JF',
      time: 'Esta semana',
      title: 'Grid para layouts',
      body: 'display:grid; grid-template-columns:1fr 1fr. Ótimo para páginas com áreas (header, main, aside).',
      language: 'HTML/CSS',
      likes: 8,
      image: '',
      comments: []
    },
    {
      id: 'c51',
      name: 'Ana Silva',
      initials: 'AS',
      time: 'Há 1 semana',
      title: 'Mini projeto: card de perfil',
      body: 'Foto, nome, bio e botão. Só HTML+CSS. Depois deixe responsivo com @media (max-width: 600px).',
      language: 'HTML/CSS',
      likes: 9,
      image: '',
      comments: []
    },
  ];

  let stored = read(DB.community, seed);
  // se seed antigo/vazio vs novo volume, hidrata com conteúdo educativo
  if (!Array.isArray(stored) || stored.length < 20) {
    stored = seed;
    write(DB.community, stored);
  }
  let communityLangFilter = 'all';

  const render = () => {
    const list = communityLangFilter === 'all'
      ? stored
      : stored.filter(p => p.language === communityLangFilter);
    const data = list.length ? list : [];
    if (!data.length) {
      feed.innerHTML = '<div class="empty">Nenhuma publicação nesta linguagem ainda.</div>';
      return;
    }
    feed.innerHTML = data.map(p => {
      const img = safeUrl(p.image);
      // só renderiza <img> se URL for útil (evita src="#" ou github.com)
      const imgHtml = img
        ? `<img class="community-photo" src="${img}" alt="Imagem da publicação" loading="lazy">`
        : '';
      const commentCount = (p.comments && p.comments.length) || 0;
      return `<article class="community-post" data-post-id="${escapeHtml(p.id)}">
        <div class="community-avatar">${escapeHtml(p.initials || 'CS')}</div>
        <div>
          <div class="meta-row"><strong>${escapeHtml(p.name || 'Membro')}</strong><span>${escapeHtml(p.time || 'Agora')}</span></div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.body)}</p>
          ${imgHtml}
          <div class="tag-row" style="margin-top:12px">${languageChip(p.language || 'Comunidade')}</div>
          <div class="post-actions">
            <button type="button" data-community-like="${escapeHtml(p.id)}">♥ ${Number(p.likes) || 0} Curtidas</button>
            <button type="button" data-community-comment="${escapeHtml(p.id)}">💬 ${commentCount} Comentar</button>
          </div>
          <div class="comment-box hidden" data-comment-box="${escapeHtml(p.id)}" style="margin-top:10px">
            <input class="field" type="text" maxlength="280" placeholder="Escreva um comentário..." data-comment-input="${escapeHtml(p.id)}">
            <button type="button" class="button button-secondary" style="margin-top:8px" data-comment-send="${escapeHtml(p.id)}">Enviar</button>
            <div class="comment-list" data-comment-list="${escapeHtml(p.id)}" style="margin-top:10px"></div>
          </div>
        </div>
      </article>`;
    }).join('');

    // preenche listas de comentários
    stored.forEach(p => {
      const list = $(`[data-comment-list="${p.id}"]`);
      if (!list) return;
      const comments = p.comments || [];
      list.innerHTML = comments.length
        ? comments.map(c => `<div class="comment-item" style="padding:8px 0;border-top:1px solid var(--line);font-size:.86rem"><strong>${escapeHtml(c.name)}</strong> · <span class="muted">${escapeHtml(c.time)}</span><br>${escapeHtml(c.text)}</div>`).join('')
        : '';
    });
  };

  render();

  feed.addEventListener('click', e => {
    const likeBtn = e.target.closest('[data-community-like]');
    if (likeBtn) {
      const p = stored.find(x => x.id === likeBtn.dataset.communityLike);
      if (p) {
        p.likes = (p.likes || 0) + 1;
        write(DB.community, stored);
        render();
      }
      return;
    }

    const commentBtn = e.target.closest('[data-community-comment]');
    if (commentBtn) {
      const id = commentBtn.dataset.communityComment;
      const box = $(`[data-comment-box="${id}"]`);
      if (box) box.classList.toggle('hidden');
      return;
    }

    const sendBtn = e.target.closest('[data-comment-send]');
    if (sendBtn) {
      const id = sendBtn.dataset.commentSend;
      const input = $(`[data-comment-input="${id}"]`);
      const text = (input?.value || '').trim();
      if (!text) {
        toast('Escreva um comentário.');
        return;
      }
      const author = currentAuthor();
      const p = stored.find(x => x.id === id);
      if (p) {
        if (!p.comments) p.comments = [];
        p.comments.push({
          name: author.name,
          time: 'Agora',
          text
        });
        write(DB.community, stored);
        render();
        toast('Comentário publicado.');
      }
    }
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const author = currentAuthor();
    const rawImage = (f.get('image') || '').toString().trim();
    const image = safeUrl(rawImage); // rejeita github.com/ e urls inválidas
    stored.unshift({
      id: 'c' + Date.now(),
      name: author.name,
      initials: author.initials,
      time: 'Agora',
      title: f.get('title').toString().trim(),
      body: f.get('body').toString().trim(),
      language: f.get('language'),
      likes: 0,
      image,
      comments: []
    });
    write(DB.community, stored);
    render();
    form.reset();
    toast(isLoggedIn() ? 'Publicação salva neste navegador.' : 'Publicado como Visitante. Crie uma conta para aparecer com seu nome.');
  });

  window.__setCommunityLangFilter = (lang) => {
    if (communityLangFilter === lang) {
      communityLangFilter = 'all';
      toast('Mostrando todas as publicações');
    } else {
      communityLangFilter = lang;
      toast(`Comunidade filtrada: ${lang}`);
    }
    render();
  };

  const popular = $('#popularLangTags');
  if (popular) {
    const langs = ['Python', 'JavaScript', 'TypeScript', 'React', 'C++', 'Java', 'HTML/CSS'];
    popular.innerHTML = langs.map(l =>
      `<a class="lang-chip-link" href="linguagem.html?lang=${encodeURIComponent(l)}" title="Abrir guia de ${l}">${languageChip(l)}</a>`
    ).join('');
  }
}

/* ---------- tag filters (projetos) ---------- */
function setupTagFilters() {
  document.addEventListener('click', e => {
    const chip = e.target.closest('[data-tag-filter]');
    if (!chip) return;
    // tags do menu "Linguagens populares" (e páginas) navegam para o guia completo
    if (chip.closest('a.lang-chip-link')) return;
    const lang = chip.getAttribute('data-tag-filter');
    if (!lang) return;

    // guia rápido (modal) em outros contextos
    openLangGuide(lang);

    // filtra feed da comunidade se existir
    if (typeof window.__setCommunityLangFilter === 'function' && $('#communityFeed')) {
      window.__setCommunityLangFilter(lang);
    }

    // se estiver na galeria de projetos, também filtra
    const filter = $('#languageFilter');
    const grid = $('#projectsGrid');
    if (filter && grid) {
      if (filter.value === lang) {
        filter.value = 'all';
        toast('Filtro removido');
      } else {
        let opt = [...filter.options].find(o => o.value === lang);
        if (!opt) {
          opt = document.createElement('option');
          opt.value = lang;
          opt.textContent = lang;
          filter.appendChild(opt);
        }
        filter.value = lang;
        toast(`Filtrado por ${lang}`);
      }
      renderProjects();
    }
  });

  // teclado: Enter/Espaço no chip
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const chip = e.target.closest?.('[data-tag-filter]');
    if (!chip) return;
    e.preventDefault();
    chip.click();
  });
}

function setupAuth() {
  updateNavUser();
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  const verificationForm = $('#verificationForm');
  const statusText = $('#authStatusText');
  const loggedActions = $('#authLoggedActions');
  const logoutBtn = $('#logoutBtn');
  const verificationPanel = $('#verificationPanel');
  let pendingEmail = '';
  let pendingPurpose = '';
  let pendingTab = 'register';

  $$('[data-auth-tab]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-auth-tab]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    const tab = btn.dataset.authTab;
    $('#loginPanel')?.classList.toggle('hidden', tab !== 'login');
    $('#registerPanel')?.classList.toggle('hidden', tab !== 'register');
    verificationPanel?.classList.add('hidden');
  }));

  const refreshStatus = () => {
    const s = getSession();
    if (!statusText) return;
    if (s) {
      statusText.innerHTML = `Logado como <strong>${escapeHtml(s.name)}</strong> (@${escapeHtml(s.username)})`;
      loggedActions?.classList.remove('hidden');
      if (loggedActions) loggedActions.style.display = 'grid';
    } else {
      statusText.textContent = 'Você não está logado.';
      loggedActions?.classList.add('hidden');
    }
    updateNavUser();
  };
  refreshStatus();

  async function requestCode(payload, purpose) {
    const response = await fetch('/api/auth/' + purpose, {
      method: 'POST', headers: {'Content-Type':'application/json'}, credentials:'same-origin', body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o código.');
    pendingEmail = payload.email;
    pendingPurpose = purpose;
    pendingTab = purpose === 'register' ? 'register' : 'login';
    $('#loginPanel')?.classList.add('hidden');
    $('#registerPanel')?.classList.add('hidden');
    verificationPanel?.classList.remove('hidden');
    const msg = $('#verificationMessage');
    if (msg) msg.textContent = `Enviamos um código de 6 dígitos para ${payload.email}. Ele expira em 10 minutos.`;
    toast('Código enviado para seu e-mail.');
  }

  registerForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(registerForm);
    const name = String(f.get('name') || '').trim();
    const username = String(f.get('username') || '').trim().replace(/^@/, '').toLowerCase();
    const email = String(f.get('email') || '').trim().toLowerCase();
    const password = String(f.get('password') || '');
    const password2 = String(f.get('password2') || '');
    if (password !== password2) return toast('As senhas não coincidem.');
    if (password.length < 8) return toast('Use uma senha com pelo menos 8 caracteres.');
    if (!/^[a-z0-9_]{3,30}$/.test(username)) return toast('Usuário inválido (use 3–30 letras, números ou _).');
    try {
      await requestCode({name, username, email, password}, 'register');
      registerForm.reset();
    } catch (err) { toast(err.message); }
  });

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(loginForm);
    const identifier = String(f.get('identifier') || '').trim().replace(/^@/, '').toLowerCase();
    const password = String(f.get('password') || '');
    try {
      const response = await fetch('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({identifier,password})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Credenciais inválidas.');
      pendingEmail = data.email;
      pendingPurpose = 'login';
      pendingTab = 'login';
      $('#loginPanel')?.classList.add('hidden');
      verificationPanel?.classList.remove('hidden');
      const msg = $('#verificationMessage');
      if (msg) msg.textContent = `Enviamos um código de acesso para ${data.email}. Ele expira em 10 minutos.`;
      toast('Código de acesso enviado.');
      loginForm.reset();
    } catch (err) { toast(err.message); }
  });

  verificationForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const code = String(new FormData(verificationForm).get('code') || '').trim();
    try {
      const response = await fetch('/api/auth/verify', {method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({email:pendingEmail,code,purpose:pendingPurpose})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Código inválido ou expirado.');
      setSession(data.user);
      write(DB.profile, {name:data.user.name, username:data.user.username, bio:'', skills:'', github:'', website:''});
      verificationForm.reset();
      refreshStatus();
      toast(pendingPurpose === 'register' ? 'Conta verificada e criada!' : `Bem-vindo(a), ${data.user.name}!`);
      setTimeout(() => { location.href = 'home.html'; }, 600);
    } catch (err) { toast(err.message); }
  });

  $('#resendCodeBtn')?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/resend', {method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({email:pendingEmail,purpose:pendingPurpose})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível reenviar o código.');
      toast('Novo código enviado para seu e-mail.');
    } catch (err) { toast(err.message); }
  });
  $('#cancelVerificationBtn')?.addEventListener('click', () => {
    verificationPanel?.classList.add('hidden');
    $$(`[data-auth-tab="${pendingTab}"]`).forEach(b => b.click());
  });

  logoutBtn?.addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', {method:'POST',credentials:'same-origin'}); } catch {}
    setSession(null); write(DB.profile, {...GUEST_PROFILE}); refreshStatus();
    toast('Você saiu da conta.'); setTimeout(() => { location.href = 'conta.html'; }, 400);
  });
}

/** Bloqueia o site sem login — só a página Conta fica liberada */
function requireAuth() {
  const page = document.body.dataset.page;
  if (page === 'conta') return true;
  if (isLoggedIn()) return true;
  location.replace('conta.html');
  return false;
}


function setupCodeRain() {
  const canvas = document.getElementById('codeRain') || document.querySelector('.site-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, cols, drops, speeds;
  // caracteres de código — visual de terminal
  const chars = (
    '01アイウエオカキクケコ<>[]{}/=;#$%&*+-' +
    'const let var func async await return class import export' +
    '=>{}();.map.filter.reduce.if else for while true false null'
  ).split('');
  const font = 17;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.ceil(w / font) + 2;
    drops = Array.from({ length: cols }, () => Math.random() * (h / font));
    speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.45);
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = () => {
    // trail mais longo = código “passa” de forma legível
    ctx.fillStyle = 'rgba(6, 8, 15, 0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 ${font}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < drops.length; i++) {
      const x = i * font;
      const y = drops[i] * font;
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const head = Math.random() > 0.82;

      if (head) {
        // cabeça da coluna — laranja neon bem forte
        ctx.shadowColor = '#ff6a1a';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffe0c0';
      } else if (Math.random() > 0.7) {
        ctx.shadowColor = '#ff3d00';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff9a3c';
      } else {
        ctx.shadowColor = '#ff6a1a';
        ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(255, 106, 26, 0.75)';
      }
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = 0;

      if (y > h + 40) {
        drops[i] = Math.random() * -12;
        speeds[i] = 0.35 + Math.random() * 0.45;
      } else {
        drops[i] += speeds[i];
      }
    }
    requestAnimationFrame(draw);
  };
  draw();

  document.querySelectorAll('.site-bg-video').forEach(vid => {
    vid.muted = true;
    vid.playbackRate = 0.45; // bem mais calmo
    const p = vid.play();
    if (p && p.catch) p.catch(() => {});
  });
}



function setupLanguagePage() {
  const root = $('#langPageRoot');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') || params.get('l') || 'Python';
  // normalize
  const aliases = { 'html': 'HTML/CSS', 'css': 'HTML/CSS', 'html/css': 'HTML/CSS', 'cpp': 'C++', 'c++': 'C++', 'js': 'JavaScript', 'ts': 'TypeScript' };
  const key = aliases[lang.toLowerCase()] || lang;
  const page = LANG_PAGES[key];
  document.title = `${key} | Cheat Set`;

  if (!page) {
    root.innerHTML = `<div class="empty">Linguagem não encontrada. <a href="comunidade.html">Voltar</a></div>`;
    return;
  }

  root.innerHTML = `
    <span class="eyebrow">${escapeHtml(page.level)}</span>
    <h1 class="page-title" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      ${languageChip(key)}
      <span>${escapeHtml(key)}</span>
    </h1>
    <p class="page-intro">${escapeHtml(page.tagline)}</p>

    <section class="card lang-section">
      <h2>O que é</h2>
      <p>${escapeHtml(page.about)}</p>
    </section>

    <div class="lang-grid">
      <section class="card lang-section">
        <h2>Para que serve</h2>
        <ul class="lang-list">${page.usedFor.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      </section>
      <section class="card lang-section">
        <h2>Básico para começar</h2>
        <ul class="lang-list">${page.basics.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      </section>
    </div>

    <section class="card lang-section">
      <h2>Tópicos importantes</h2>
      <div class="lang-topics">
        ${page.topics.map(x => `
          <article class="lang-topic">
            <strong>${escapeHtml(x.t)}</strong>
            <p>${escapeHtml(x.d)}</p>
          </article>`).join('')}
      </div>
    </section>

    <section class="card lang-section">
      <h2>Exemplo de código</h2>
      <pre class="lang-code"><code>${escapeHtml(page.example)}</code></pre>
    </section>

    <section class="card lang-section">
      <h2>Caminho de estudo sugerido</h2>
      <ol class="lang-list">${page.path.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ol>
    </section>

    <section class="card lang-section lang-tip-card">
      <h2>Dica prática</h2>
      <p>${escapeHtml(page.tip)}</p>
      <div class="form-actions" style="margin-top:14px">
        <a class="button button-primary" href="comunidade.html">Ver posts de ${escapeHtml(key)} na comunidade</a>
        <a class="button button-secondary" href="projetos.html">Explorar projetos</a>
      </div>
    </section>
  `;

  const other = $('#langPageOtherTags');
  if (other) {
    other.innerHTML = Object.keys(LANG_PAGES)
      .map(l => `<a class="lang-chip-link" href="linguagem.html?lang=${encodeURIComponent(l)}">${languageChip(l, l === key)}</a>`)
      .join('');
  }
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  // A sessão é validada pelo servidor; localStorage sozinho não concede acesso.
  try {
    const response = await fetch('/api/auth/me', {credentials:'same-origin'});
    const data = await response.json();
    if (response.ok && data.user) setSession(data.user);
    else setSession(null);
  } catch { setSession(null); }
  // Sem sessão validada → só a página Conta é liberada.
  if (!requireAuth()) return;
  setupCodeRain();

  setupSplash();
  setupUserMenu();
  setupAuth();
  updateNavUser();

  const page = document.body.dataset.page;
  $$('.menu a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });

  // Conta: hash #register abre aba Criar conta
  if (page === 'conta' && /register/i.test(location.hash || '')) {
    $$('[data-auth-tab="register"]').forEach(b => b.click());
  }

  // Já logado na página de conta → atalho para o app
  if (page === 'conta' && isLoggedIn()) {
    const status = $('#authStatusText');
    if (status) {
      status.innerHTML = status.innerHTML + ' <a href="home.html">Ir para o início →</a>';
    }
  }

  setupTagFilters();
  setupSearch();
  setupCreate();
  setupCommunity();
  setupProfile();
  setupContact();
  setupEditor();
  setupLanguagePage();

  renderProjects();
  renderQuestions();
  renderHome();

  document.getElementById('profileLogoutBtn')?.addEventListener('click', async () => {
    try { await fetch('/api/auth/logout', {method:'POST',credentials:'same-origin'}); } catch {}
    setSession(null);
    write(DB.profile, { ...GUEST_PROFILE });
    updateNavUser();
    toast('Você saiu da conta.');
    setTimeout(() => { location.href = 'conta.html'; }, 400);
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
