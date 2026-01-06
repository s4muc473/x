// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://numbe_drop:lelouchvi@bejs-01.j03tx.mongodb.net/?retryWrites=true&w=majority&appName=BEJS-01";

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- Schemas ---
const TeamMemberSchema = new mongoose.Schema({
  id: String,
  name: String,
  role: String,
  monthlyCost: [Number]
});

const ProjectSchema = new mongoose.Schema({
  id: Number,
  name: String,
  objective: String,
  startMonth: Number,
  durationMonths: Number,
  teamIds: [String],
  allocations: { type: Map, of: Number } // Map for Record<string, number>
});

// Use existing models if they exist to prevent OverwriteModelError in dev environments
const TeamMemberModel = mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// --- Seed Data (Fallback if DB is empty) ---
const INITIAL_TEAM_SEED = [
  {
    id: 'laio',
    name: 'Laio',
    role: 'PJ / Analista',
    monthlyCost: [2100, 2100, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750]
  },
  {
    id: 'luiz',
    name: 'Luiz Nelson',
    role: 'PJ / Analista',
    monthlyCost: [2250, 2250, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750, 8750]
  },
  {
    id: 'samuel',
    name: 'Samuel',
    role: 'CLT / Analista',
    monthlyCost: Array(12).fill(4500)
  },
  {
    id: 'rodrigo',
    name: 'Rodrigo',
    role: 'Consultor',
    monthlyCost: Array(12).fill(10000)
  },
  {
    id: 'aprendiz',
    name: 'Jovem Aprendiz',
    role: 'Aprendiz',
    monthlyCost: Array(12).fill(981.78) // 962.53 * 1.02
  }
];

const INITIAL_PROJECTS_SEED = [
  {
    id: 1,
    name: "Auditoria Automatizada",
    objective: "Garantir que a empresa não perca receita",
    startMonth: 1,
    durationMonths: 6,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map([['luiz', 60], ['laio', 40], ['samuel', 30], ['rodrigo', 5]])
  },
  {
    id: 2,
    name: "Chat Data (Consulta Rápida)",
    objective: "Acelerar decisões da liderança",
    startMonth: 7,
    durationMonths: 6,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map([['luiz', 60], ['laio', 30], ['samuel', 30], ['rodrigo', 5]])
  },
  {
    id: 3,
    name: "Fábrica de Processos Padronizados",
    objective: "Reduzir tempo de implantação",
    startMonth: 1,
    durationMonths: 7,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map([['luiz', 30], ['laio', 30], ['rodrigo', 10]])
  },
  {
    id: 4,
    name: "Prog. Desenv. Lideranças em IA",
    objective: "Melhorar qualidade da gestão",
    startMonth: 6,
    durationMonths: 5,
    teamIds: ['luiz', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 5,
    name: "Automatização Operacional Central",
    objective: "Aumentar eficiência operacional",
    startMonth: 4,
    durationMonths: 9,
    teamIds: ['samuel', 'laio', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 6,
    name: "Eficiência Operacional Atendimento",
    objective: "Garantir qualidade com crescimento",
    startMonth: 1,
    durationMonths: 3,
    teamIds: [],
    allocations: new Map()
  },
  {
    id: 7,
    name: "Análise de Dados de RH",
    objective: "Apoiar decisões de pessoas",
    startMonth: 4,
    durationMonths: 8,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 8,
    name: "Gestão de Brindes no Marketing",
    objective: "Trazer maior controle patrimonial",
    startMonth: 1,
    durationMonths: 1,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 9,
    name: "Revisão Geral sobre Processos",
    objective: "Revisão de processos e indicadores",
    startMonth: 1,
    durationMonths: 10,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 10,
    name: "Wiki para os Clientes",
    objective: "Clientes tirarem dúvidas",
    startMonth: 1,
    durationMonths: 5,
    teamIds: ['samuel', 'rodrigo', 'laio'],
    allocations: new Map()
  },
  {
    id: 11,
    name: "IA treinada base Wiki Clientes",
    objective: "IA treinada com base de conhecimento",
    startMonth: 7,
    durationMonths: 5,
    teamIds: ['luiz', 'laio', 'samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 12,
    name: "Gestão de Sprint e Atividades",
    objective: "Sistema para gestão de atividades",
    startMonth: 1,
    durationMonths: 3,
    teamIds: ['samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 13,
    name: "Ferramenta Padronizar Solicitações",
    objective: "Padronizar preenchimento",
    startMonth: 3,
    durationMonths: 3,
    teamIds: ['samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 14,
    name: "Abertura Vinculadas Automáticas",
    objective: "Execução integrada e rastreável",
    startMonth: 3,
    durationMonths: 3,
    teamIds: ['luiz', 'samuel', 'rodrigo'],
    allocations: new Map()
  },
  {
    id: 15,
    name: "Manutenção e Melhoria Contínua",
    objective: "20% do tempo",
    startMonth: 1,
    durationMonths: 12,
    teamIds: ['aprendiz', 'samuel', 'laio'],
    allocations: new Map([['aprendiz', 100], ['samuel', 20], ['laio', 20]])
  }
];

// Helper function to convert Map to Object for JSON response
const mapToObject = (map) => {
  const obj = {};
  if (map && map instanceof Map) {
    map.forEach((value, key) => {
      obj[key] = value;
    });
  }
  return obj;
};

// --- API Routes ---

// GET Data
app.get('/api/data', async (req, res) => {
  try {
    let projects = await ProjectModel.find({}, { _id: 0, __v: 0 }).lean();
    let team = await TeamMemberModel.find({}, { _id: 0, __v: 0 }).lean();

    // If DB is empty, seed it
    if (projects.length === 0 && team.length === 0) {
      console.log("Database empty. Seeding initial data...");
      await ProjectModel.insertMany(INITIAL_PROJECTS_SEED);
      await TeamMemberModel.insertMany(INITIAL_TEAM_SEED);
      projects = await ProjectModel.find({}, { _id: 0, __v: 0 }).lean();
      team = await TeamMemberModel.find({}, { _id: 0, __v: 0 }).lean();
    }

    // Convert Map to Object for JSON response
    const processedProjects = projects.map(project => ({
      ...project,
      allocations: mapToObject(project.allocations)
    }));

    res.json({ projects: processedProjects, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// SAVE Data (Full Sync for simplicity of this app structure)
app.post('/api/data', async (req, res) => {
  const { projects, team } = req.body;
  
  if (!projects || !team) {
    return res.status(400).json({ msg: "Missing data" });
  }

  try {
    // Convert allocations object back to Map for MongoDB
    const projectsWithMaps = projects.map(project => ({
      ...project,
      allocations: new Map(Object.entries(project.allocations || {}))
    }));

    // Clear and Replace Strategy (Safe for single user session)
    await ProjectModel.deleteMany({});
    await TeamMemberModel.deleteMany({});
    
    await ProjectModel.insertMany(projectsWithMaps);
    await TeamMemberModel.insertMany(team);
    
    res.json({ msg: "Data Saved Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// --- Static Files and React App Serving ---

// Servir arquivos estáticos da pasta dist (se existir)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`✅ Servindo arquivos estáticos de: ${distPath}`);
}

// Verifica se existe index.html na raiz
const rootIndexPath = path.join(__dirname, "index.html");
const rootIndexExists = fs.existsSync(rootIndexPath);

// Rota para servir index.html da raiz se existir
if (rootIndexExists) {
  app.get("/", (req, res) => {
    res.sendFile(rootIndexPath);
  });
  console.log(`✅ index.html na raiz será servido: ${rootIndexPath}`);
}

// Serve frontend for all other routes
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Diretório raiz: ${__dirname}`);
  console.log(`📁 Diretório dist: ${distPath}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api/data`);
});