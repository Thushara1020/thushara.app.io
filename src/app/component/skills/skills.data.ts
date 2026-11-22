export const CORE_STACK = [
  { title: 'Frontend', icon: 'bi-window', skills: ['React', 'Next.js', 'Angular', 'TypeScript', 'Tailwind CSS'] },
  { title: 'Backend', icon: 'bi-code-slash', skills: ['Node.js', 'NestJS', 'Express', 'Spring Boot (Java)'] },
  { title: 'Database & ORM', icon: 'bi-database', skills: ['PostgreSQL', 'MySQL', 'Drizzle ORM', 'Prisma', 'TypeORM'] },
  { title: 'DevOps & Cloud', icon: 'bi-cloud', skills: ['Docker', 'Git', 'Firebase', 'AWS S3'] },
];

export const FEATURED_TECHNOLOGIES = CORE_STACK.flatMap(category =>
  category.skills.map(name => ({ name, icon: category.icon })),
);

export const SKILL_CATEGORIES = [
  {
    title: 'Programming Languages', icon: 'bi-braces',
    groups: [
      { label: 'Primary', skills: ['TypeScript', 'JavaScript (ES6+)', 'Java', 'Python', 'SQL'] },
      { label: 'Additional', skills: ['C#', 'C++', 'C', 'Dart', 'HTML5', 'CSS3'] },
    ],
  },
  {
    title: 'Frontend & Mobile Development', icon: 'bi-window',
    groups: [
      { label: 'Web Frameworks & Libraries', skills: ['React', 'Next.js', 'Angular', 'Vue.js', 'Vite', 'Electron'] },
      { label: 'Mobile Development', skills: ['Flutter'] },
      { label: 'UI & Styling', skills: ['Tailwind CSS', 'Shadcn UI', 'Base UI', 'Bootstrap'] },
      { label: 'State & Real-Time', skills: ['Zustand', 'Socket.io'] },
    ],
  },
  {
    title: 'Backend & API Architecture', icon: 'bi-hdd-network',
    groups: [
      { label: 'Frameworks', skills: ['Node.js', 'Express.js', 'NestJS', 'Spring Boot', 'FastAPI', '.NET'] },
      { label: 'API Paradigms', skills: ['RESTful APIs', 'GraphQL', 'oRPC'] },
      { label: 'Security & Auth', skills: ['Spring Security', 'JWT Authentication', 'Role-Based Access Control (RBAC)', 'CORS Configuration'] },
    ],
  },
  {
    title: 'Databases & Data Access', icon: 'bi-database',
    groups: [
      { label: 'Relational Databases', skills: ['PostgreSQL', 'MySQL', 'SQLite'] },
      { label: 'NoSQL & BaaS', skills: ['MongoDB', 'Firebase', 'Supabase'] },
      { label: 'ORMs & Data Access', skills: ['Drizzle ORM', 'Prisma', 'TypeORM', 'Spring Data JPA'] },
    ],
  },
  {
    title: 'Cloud, DevOps & IoT', icon: 'bi-cloud',
    groups: [
      { label: 'Containerization & Orchestration', skills: ['Docker', 'Kubernetes'] },
      { label: 'Cloud & Hosting', skills: ['AWS (S3)', 'Firebase Hosting', 'cPanel'] },
      { label: 'IoT & Messaging', skills: ['ESP32', 'MQTT (HiveMQ)'] },
    ],
  },
  {
    title: 'Developer Tools, Testing & Design', icon: 'bi-tools',
    groups: [
      { label: 'IDEs & AI Tooling', skills: ['VS Code', 'Claude Code', 'IntelliJ IDEA', 'Xcode', 'Android Studio'] },
      { label: 'API & DB Clients', skills: ['Postman', 'Swagger UI (SpringDoc)', 'DBeaver', 'TablePlus'] },
      { label: 'Version Control & Build', skills: ['Git', 'GitHub', 'GitHub Desktop', 'Maven', 'pnpm', 'ngrok'] },
      { label: 'UI/UX & Security', skills: ['Figma', 'Nmap (Network Scanning & Security Testing)'] },
    ],
  },
];
