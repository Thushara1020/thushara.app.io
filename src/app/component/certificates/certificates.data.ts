export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  kind: 'Certificate' | 'Badge';
  topic: string;
  date?: string;
  dateLabel?: string;
  thumbnail: string;
  image: string;
  original: string;
  credentialUrl?: string;
  transcript?: string;
}

// Titles, issuers and dates are transcribed from the supplied certificates.
// Workshop participation certificates and Kaggle badges retain their original titles.
const entries: Omit<Certificate, 'thumbnail' | 'image' | 'original'>[] = [
  {
    id: 'level-3-it-diploma',
    title: 'Level 3 Diploma in Information Technology',
    issuer: 'Skills & Education Group Awards / UK Awards',
    kind: 'Certificate', topic: 'Information Technology',
    date: '2025-08-18', dateLabel: 'Aug 2025',
    transcript: 'certificates/level-3-it-transcript.pdf',
  },
  {
    id: 'meta-front-end', title: 'Introduction to Front-End Development',
    issuer: 'Meta · Coursera', kind: 'Certificate', topic: 'Web Development',
    date: '2026-06-30', dateLabel: 'Jun 2026',
    credentialUrl: 'https://coursera.org/verify/N1SQ0K41MHTT',
  },
  {
    id: 'agentic-ai', title: 'Agentic AI Development Workshop',
    issuer: 'iCET · Professional Development Unit', kind: 'Certificate', topic: 'Artificial Intelligence',
    date: '2026-08-16', dateLabel: 'Aug 2026',
  },
  {
    id: 'devops-cloudops', title: 'DevOps & CloudOps Workshop',
    issuer: 'iCET · Professional Development Unit', kind: 'Certificate', topic: 'DevOps & Cloud',
    date: '2026-07-11', dateLabel: 'Jul 2026',
  },
  {
    id: 'ethical-hacker', title: 'Ethical Hacker',
    issuer: 'Cisco Networking Academy', kind: 'Certificate', topic: 'Cybersecurity',
    date: '2026-03-24', dateLabel: 'Mar 2026',
  },
  {
    id: 'prepare-data', title: 'Prepare Data for Exploration',
    issuer: 'Google · Coursera', kind: 'Certificate', topic: 'Data Analytics',
    date: '2025-12-20', dateLabel: 'Dec 2025',
    credentialUrl: 'https://coursera.org/verify/FILB9BUL990L',
  },
  {
    id: 'sql-data-science', title: 'Databases and SQL for Data Science with Python',
    issuer: 'IBM · Coursera', kind: 'Certificate', topic: 'SQL & Python',
    date: '2025-12-14', dateLabel: 'Dec 2025',
    credentialUrl: 'https://coursera.org/verify/DR34XKB3325I',
  },
  {
    id: 'data-driven-decisions', title: 'Ask Questions to Make Data-Driven Decisions',
    issuer: 'Google · Coursera', kind: 'Certificate', topic: 'Data Analytics',
    date: '2025-12-13', dateLabel: 'Dec 2025',
    credentialUrl: 'https://coursera.org/verify/83K7I0104DEM',
  },
  {
    id: 'intro-cybersecurity', title: 'Introduction to Cybersecurity',
    issuer: 'Cisco Networking Academy', kind: 'Certificate', topic: 'Cybersecurity',
    date: '2026-01-10', dateLabel: 'Jan 2026',
  },
  {
    id: 'arcadia-game-design', title: 'Arcadia — The Ultimate Game Design Workshop',
    issuer: 'IEEE Student Branch of NIBM', kind: 'Certificate', topic: 'Game Design',
  },
  {
    id: 'python-coder', title: 'Python Coder',
    issuer: 'Kaggle', kind: 'Badge', topic: 'Python',
    date: '2026-10-11', dateLabel: 'Oct 2026',
  },
  {
    id: 'code-forker', title: 'Code Forker',
    issuer: 'Kaggle', kind: 'Badge', topic: 'Code Exploration',
    date: '2026-10-11', dateLabel: 'Oct 2026',
  },
  {
    id: 'kaggle-community', title: 'Kaggle Community Member',
    issuer: 'Kaggle', kind: 'Badge', topic: 'Community',
    date: '2026-10-11', dateLabel: 'Oct 2026',
  },
];

const imageOriginals = new Set(['intro-cybersecurity', 'python-coder', 'code-forker', 'kaggle-community']);

export const CERTIFICATES: Certificate[] = entries.map(entry => ({
  ...entry,
  thumbnail: `certificates/${entry.id}-thumb.webp`,
  image: `certificates/${entry.id}.webp`,
  original: `certificates/${entry.id}.${imageOriginals.has(entry.id) ? 'png' : 'pdf'}`,
}));
