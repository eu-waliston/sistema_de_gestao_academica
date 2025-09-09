const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, "data", "academicData.json");

// Inicializar dados
function initializeData() {
  if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  }

  if (!fs.existsSync(dataPath)) {
    const initialData = {
      students: [],
      courses: [],
      enrollments: [],
      professors: [],
    };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
}

// Ler dados
function readData() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro ao ler dados:", error);
    return { students: [], courses: [], enrollments: [], professors: [] };
  }
}

// Salvar dados
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
    return false;
  }
}

// Rotas para Alunos
app.get("/api/students", (req, res) => {
  const data = readData();
  res.json(data.students);
});

app.post("/api/students", (req, res) => {
  const data = readData();
  const newStudent = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  data.students.push(newStudent);

  if (saveData(data)) {
    res.status(201).json(newStudent);
  } else {
    res.status(500).json({ error: "Erro ao salvar aluno" });
  }
});

// Rotas para Cursos
app.get("/api/courses", (req, res) => {
  const data = readData();
  res.json(data.courses);
});

app.post("/api/courses", (req, res) => {
  const data = readData();
  const newCourse = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  data.courses.push(newCourse);

  if (saveData(data)) {
    res.status(201).json(newCourse);
  } else {
    res.status(500).json({ error: "Erro ao salvar curso" });
  }
});

// Rotas para Matrículas
app.post("/api/enrollments", (req, res) => {
  const data = readData();
  const { studentId, courseId } = req.body;

  const enrollment = {
    id: uuidv4(),
    studentId,
    courseId,
    enrollmentDate: new Date().toISOString(),
    status: "active",
  };

  data.enrollments.push(enrollment);

  if (saveData(data)) {
    res.status(201).json(enrollment);
  } else {
    res.status(500).json({ error: "Erro ao realizar matrícula" });
  }
});

// Inicializar e iniciar servidor
initializeData();
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
