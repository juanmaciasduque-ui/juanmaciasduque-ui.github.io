document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const expCards = document.querySelectorAll('.exp-card');
  const courseCards = document.querySelectorAll('.course-card');
  const searchInput = document.getElementById('course-search-input');
  const printBtn = document.getElementById('btn-print-pdf');
  const profileDescText = document.getElementById('profile-desc-text');

  // Professional profile texts optimized by target career paths
  const PROFILE_TEXTS = {
    all: `Administrador de Empresas de la Universidad Nacional de Colombia con una trayectoria técnica y gerencial de más de 10 años en la dirección de operaciones administrativas, estructuración de proyectos productivos, auditoría de inventarios físicos y control presupuestal. Cuenta con amplia experiencia internacional como Gerente General liderando la planificación de personal, y en el sector público como Supervisor de Proyectos de impacto municipal. Especializado en educación para el trabajo como Instructor del SENA y docente de educación secundaria mediante metodologías STEAM y ambientes virtuales Blackboard. Competente en la optimización de procesos de negocio y flujos de trabajo mediante la integración de herramientas de Inteligencia Artificial (IA) generativa y Prompt Engineering para la co-creación técnica de soluciones digitales.`,
    
    admin: `Administrador de Empresas de la Universidad Nacional de Colombia con experiencia directiva y técnica internacional de más de 10 años. Especialista en la supervisión de proyectos productivos, auditoría de inventarios físicos, gestión de compras y control presupuestal. Cuenta con trayectoria como Gerente General y Contratista del sector público, liderando la organización de archivos de gestión institucional mediante sistemas ERP y la implementación de manuales de bioseguridad y SG-SST. Competente en la aplicación de tecnologías emergentes, incluyendo el manejo de herramientas de Inteligencia Artificial (IA) y optimización de datos para la toma de decisiones estratégicas y comerciales.`,
    
    edu: `Administrador de Empresas de la Universidad Nacional de Colombia con sólida especialización técnica y pedagógica en la formación para el trabajo. Con más de 30 meses de experiencia como Instructor del SENA y Docente de educación secundaria en ciencias políticas, económicas y emprendimiento. Experto en diseño y desarrollo curricular, planeación pedagógica basada en el enfoque STEAM, evaluación de competencias laborales y tutoría avanzada en ambientes virtuales Blackboard. Capacitado en el uso y manejo técnico de Inteligencia Artificial (IA) aplicada a la educación para el diseño de instrumentos evaluativos automatizados y la creación de guías didácticas interactivas.`
  };

  let activeProfile = 'all';

  // Function to filter courses based on active profile and search query
  function filterCourses() {
    const query = searchInput.value.toLowerCase();
    
    courseCards.forEach(card => {
      const cardProfile = card.getAttribute('data-profile');
      const cardTitle = card.querySelector('.course-title').textContent.toLowerCase();
      const cardSchool = card.querySelector('.course-school').textContent.toLowerCase();
      
      // Determine if it matches the profile filter
      let matchesProfile = false;
      if (activeProfile === 'all') {
        matchesProfile = true;
      } else if (activeProfile === 'admin') {
        matchesProfile = (cardProfile === 'admin' || cardProfile === 'other');
      } else if (activeProfile === 'edu') {
        matchesProfile = (cardProfile === 'edu' || cardProfile === 'other');
      }

      // Determine if it matches the search query
      const matchesSearch = cardTitle.includes(query) || cardSchool.includes(query);

      // Show/Hide based on both conditions
      if (matchesProfile && matchesSearch) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // Handle Profile Filter click events
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 1. Update active class on buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      activeProfile = button.getAttribute('data-target');

      // 2. Change the profile occupational text dynamically
      if (profileDescText && PROFILE_TEXTS[activeProfile]) {
        profileDescText.style.opacity = '0';
        setTimeout(() => {
          profileDescText.textContent = PROFILE_TEXTS[activeProfile];
          profileDescText.style.transition = 'opacity 0.25s ease';
          profileDescText.style.opacity = '1';
        }, 150);
      }

      // 3. Filter experience cards with animation
      expCards.forEach(card => {
        const cardProfile = card.getAttribute('data-profile');

        if (activeProfile === 'all' || cardProfile === activeProfile) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'scale(0.98)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.classList.add('hidden');
          }, 200);
        }
      });

      // 4. Update the courses list according to the profile
      filterCourses();
    });
  });

  // Handle Search Input keyup/input events
  if (searchInput) {
    searchInput.addEventListener('input', filterCourses);
  }

  // Trigger Print Dialog
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
});
