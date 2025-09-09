class AcademicManager {
  constructor() {
    this.baseUrl = "http://localhost:3000/api";
    this.init();
  }

  async init() {
    await this.loadStudents();
    await this.loadCourses();
    await this.loadEnrollments();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document
      .getElementById("studentForm")
      .addEventListener("submit", (e) => this.handleStudentSubmit(e));
    document
      .getElementById("courseForm")
      .addEventListener("submit", (e) => this.handleCourseSubmit(e));
    document
      .getElementById("enrollmentForm")
      .addEventListener("submit", (e) => this.handleEnrollmentSubmit(e));
  }

  async handleStudentSubmit(e) {
    e.preventDefault();
    const student = {
      name: document.getElementById("studentName").value,
      email: document.getElementById("studentEmail").value,
      ra: document.getElementById("studentRA").value,
    };

    try {
      const response = await fetch(`${this.baseUrl}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      });

      if (response.ok) {
        this.loadStudents();
        document.getElementById("studentForm").reset();
      }
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
    }
  }

  async handleCourseSubmit(e) {
    e.preventDefault();
    const course = {
      name: document.getElementById("courseName").value,
      code: document.getElementById("courseCode").value,
      credits: parseInt(document.getElementById("courseCredits").value),
    };

    try {
      const response = await fetch(`${this.baseUrl}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        this.loadCourses();
        document.getElementById("courseForm").reset();
      }
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
    }
  }

  async handleEnrollmentSubmit(e) {
    e.preventDefault();
    const enrollment = {
      studentId: document.getElementById("enrollmentStudent").value,
      courseId: document.getElementById("enrollmentCourse").value,
    };

    try {
      const response = await fetch(`${this.baseUrl}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enrollment),
      });

      if (response.ok) {
        this.loadEnrollments();
        document.getElementById("enrollmentForm").reset();
      }
    } catch (error) {
      console.error("Erro ao realizar matrícula:", error);
    }
  }

  async loadStudents() {
    try {
      const response = await fetch(`${this.baseUrl}/students`);
      const students = await response.json();
      this.renderStudents(students);
      this.updateStudentDropdown(students);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  }

  async loadCourses() {
    try {
      const response = await fetch(`${this.baseUrl}/courses`);
      const courses = await response.json();
      this.renderCourses(courses);
      this.updateCourseDropdown(courses);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
    }
  }

  async loadEnrollments() {
    try {
      const response = await fetch(`${this.baseUrl}/enrollments`);
      const enrollments = await response.json();

      // Carregar dados complementares
      const students = await (await fetch(`${this.baseUrl}/students`)).json();
      const courses = await (await fetch(`${this.baseUrl}/courses`)).json();

      this.renderEnrollments(enrollments, students, courses);
    } catch (error) {
      console.error("Erro ao carregar matrículas:", error);
    }
  }

  renderStudents(students) {
    const container = document.getElementById("studentsList");
    container.innerHTML = students
      .map(
        (student) => `
            <div class="item-card">
                <h4>${student.name}</h4>
                <p>Email: ${student.email}</p>
                <p>RA: ${student.ra}</p>
                <p>Cadastro: ${new Date(student.createdAt).toLocaleDateString()}</p>
            </div>
        `,
      )
      .join("");
  }

  renderCourses(courses) {
    const container = document.getElementById("coursesList");
    container.innerHTML = courses
      .map(
        (course) => `
            <div class="item-card course-card">
                <h4>${course.name}</h4>
                <p>Código: ${course.code}</p>
                <p>Créditos: ${course.credits}</p>
                <p>Criado em: ${new Date(course.createdAt).toLocaleDateString()}</p>
            </div>
        `,
      )
      .join("");
  }

  renderEnrollments(enrollments, students, courses) {
    const container = document.getElementById("enrollmentsList");
    container.innerHTML = enrollments
      .map((enrollment) => {
        const student = students.find((s) => s.id === enrollment.studentId);
        const course = courses.find((c) => c.id === enrollment.courseId);

        return `
                <div class="item-card enrollment-card">
                    <h4>Matrícula #${enrollment.id.slice(0, 8)}</h4>
                    <p>Aluno: ${student?.name || "N/A"}</p>
                    <p>Curso: ${course?.name || "N/A"}</p>
                    <p>Data: ${new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                    <p>Status: ${enrollment.status}</p>
                </div>
            `;
      })
      .join("");
  }

  updateStudentDropdown(students) {
    const dropdown = document.getElementById("enrollmentStudent");
    dropdown.innerHTML =
      '<option value="">Selecione o aluno</option>' +
      students
        .map(
          (student) =>
            `<option value="${student.id}">${student.name} (${student.ra})</option>`,
        )
        .join("");
  }

  updateCourseDropdown(courses) {
    const dropdown = document.getElementById("enrollmentCourse");
    dropdown.innerHTML =
      '<option value="">Selecione o curso</option>' +
      courses
        .map(
          (course) =>
            `<option value="${course.id}">${course.name} (${course.code})</option>`,
        )
        .join("");
  }
}

// Funções de navegação
function showSection(sectionName) {
  // Esconder todas as seções
  document.querySelectorAll(".section").forEach((section) => {
    section.style.display = "none";
  });

  // Mostrar a seção selecionada
  document.getElementById(`${sectionName}-section`).style.display = "block";
}

// Cache local
class LocalCache {
  static set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static clear(key) {
    localStorage.removeItem(key);
  }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  new AcademicManager();

  // Mostrar a seção de alunos por padrão
  showSection("students");
});
