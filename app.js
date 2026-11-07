document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const expCards = document.querySelectorAll('.exp-card');
  const courseCards = document.querySelectorAll('.course-card');
  const searchInput = document.getElementById('course-search-input');
  const printBtn = document.getElementById('btn-print-pdf');
  const customPrintBtn = document.getElementById('btn-custom-pdf');
  const pdfDialog = document.getElementById('pdf-dialog');
  const pdfProfile = document.getElementById('pdf-profile');
  const pdfExperienceList = document.getElementById('pdf-experience-list');
  const pdfGenerateBtn = document.getElementById('pdf-generate');
  const profileDescText = document.getElementById('profile-desc-text');
  const filterContainer = document.getElementById('filters-container');

  // Professional profile texts optimized by target career paths
  const PROFILE_TEXTS = {
    all: `Administrador de Empresas de la Universidad Nacional de Colombia con una trayectoria técnica y gerencial de más de 10 años en la dirección de operaciones administrativas, estructuración de proyectos productivos, auditoría de inventarios físicos y control presupuestal. Cuenta con amplia experiencia internacional como Gerente General liderando la planificación de personal, y en el sector público como Supervisor de Proyectos de impacto municipal. Especializado en educación para el trabajo como Instructor del SENA y docente de educación secundaria mediante metodologías STEAM y ambientes virtuales Blackboard. Competente en la optimización de procesos de negocio y flujos de trabajo mediante la integración de herramientas de Inteligencia Artificial (IA) generativa y Prompt Engineering para la co-creación técnica de soluciones digitales.`,
    
    admin: `Administrador de Empresas de la Universidad Nacional de Colombia con experiencia directiva y técnica internacional de más de 10 años. Especialista en la supervisión de proyectos productivos, auditoría de inventarios físicos, gestión de compras y control presupuestal. Cuenta con trayectoria como Gerente General y Contratista del sector público, liderando la organización de archivos de gestión institucional mediante sistemas ERP y la implementación de manuales de bioseguridad y SG-SST. Competente en la aplicación de tecnologías emergentes, incluyendo el manejo de herramientas de Inteligencia Artificial (IA) y optimización de datos para la toma de decisiones estratégicas y comerciales.`,
    
    edu: `Administrador de Empresas de la Universidad Nacional de Colombia con sólida especialización técnica y pedagógica en la formación para el trabajo. Con más de 30 meses de experiencia como Instructor del SENA y Docente de educación secundaria en ciencias económicas y emprendimiento. Experto en diseño y desarrollo curricular, planeación pedagógica basada en el enfoque STEAM, evaluación de competencias laborales y tutoría avanzada en ambientes virtuales Blackboard. Capacitado en el uso y manejo técnico de Inteligencia Artificial (IA) aplicada a la educación para el diseño de instrumentos evaluativos automatizados y la creación de guías didácticas interactivas.`
  };

  let activeProfile = 'all';

  const visibleCount = document.createElement('span');
  visibleCount.className = 'visible-count';
  visibleCount.setAttribute('aria-live', 'polite');
  if (filterContainer) {
    filterContainer.appendChild(visibleCount);
  }

  function updateVisibleCount() {
    const visibleExperience = Array.from(expCards).filter(card => !card.classList.contains('hidden')).length;
    const visibleCourses = Array.from(courseCards).filter(card => !card.classList.contains('hidden')).length;
    visibleCount.textContent = `${visibleExperience} experiencias · ${visibleCourses} cursos visibles`;
  }

  // Function to filter courses based on active profile and search query
  function filterCourses() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    
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

    updateVisibleCount();
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

      // 3. Filter experience cards with a stable, immediate state
      expCards.forEach(card => {
        const cardProfile = card.getAttribute('data-profile');
        const matchesProfile = activeProfile === 'all' || cardProfile === activeProfile;

        if (matchesProfile) {
          card.classList.remove('hidden');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.classList.add('hidden');
          card.style.opacity = '';
          card.style.transform = '';
        }
      });

      // 4. Update the courses list according to the profile
      filterCourses();
      updateVisibleCount();
    });
  });

  // Handle Search Input keyup/input events
  if (searchInput) {
    searchInput.addEventListener('input', filterCourses);
  }

  const pdfButtons = [printBtn, customPrintBtn].filter(Boolean);
  const pdfOriginalTitle = document.title;
  let printRestore = null;

  function profileMatches(profile, cardProfile) {
    if (profile === 'all') return true;
    if (profile === 'admin') return cardProfile === 'admin' || cardProfile === 'other';
    return cardProfile === 'edu' || cardProfile === 'other';
  }

  function renderPdfExperienceOptions() {
    if (!pdfExperienceList) return;
    const profile = pdfProfile.value;
    pdfExperienceList.replaceChildren();
    expCards.forEach((card, index) => {
      const matches = profileMatches(profile, card.getAttribute('data-profile'));
      const label = document.createElement('label');
      label.className = 'pdf-experience-option';
      label.hidden = !matches;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = String(index);
      checkbox.checked = matches;
      const description = document.createElement('span');
      description.textContent = `${card.querySelector('.job-title').textContent} — ${card.querySelector('.company-name').textContent}`;
      label.append(checkbox, description);
      pdfExperienceList.append(label);
    });
  }

  function openPdfOptions() {
    if (!pdfDialog) return;
    pdfProfile.value = activeProfile;
    renderPdfExperienceOptions();
    pdfDialog.showModal();
  }

  pdfButtons.forEach(button => button.addEventListener('click', openPdfOptions));
  pdfProfile?.addEventListener('change', renderPdfExperienceOptions);
  document.getElementById('pdf-select-visible')?.addEventListener('click', () => {
    pdfExperienceList?.querySelectorAll('label:not([hidden]) input').forEach(input => { input.checked = true; });
  });
  document.getElementById('pdf-cancel')?.addEventListener('click', () => pdfDialog?.close());
  document.getElementById('pdf-dialog-close')?.addEventListener('click', () => pdfDialog?.close());

  pdfGenerateBtn?.addEventListener('click', () => {
    const selected = new Set(Array.from(pdfExperienceList.querySelectorAll('input:checked'), input => Number(input.value)));
    if (selected.size === 0) {
      window.alert('Selecciona al menos una experiencia laboral para el PDF.');
      return;
    }

    const profile = pdfProfile.value;
    const previous = {
      title: document.title,
      description: profileDescText?.textContent,
      exp: Array.from(expCards, card => ({ excluded: card.classList.contains('pdf-card-excluded'), hidden: card.classList.contains('hidden') })),
      courses: Array.from(courseCards, card => ({ excluded: card.classList.contains('pdf-card-excluded'), hidden: card.classList.contains('hidden') })),
    };
    expCards.forEach((card, index) => {
      card.classList.toggle('pdf-card-excluded', !selected.has(index));
      card.classList.remove('hidden');
    });
    courseCards.forEach(card => {
      const included = profileMatches(profile, card.getAttribute('data-profile'));
      card.classList.toggle('pdf-card-excluded', !included);
      if (included) card.classList.remove('hidden');
    });
    if (profileDescText) profileDescText.textContent = PROFILE_TEXTS[profile];
    document.title = `Hoja_de_Vida_Juan_Sebastian_Macias_Duque_${profile}`;
    pdfDialog.close();

    printRestore = () => {
      expCards.forEach((card, index) => {
        card.classList.toggle('pdf-card-excluded', previous.exp[index].excluded);
        card.classList.toggle('hidden', previous.exp[index].hidden);
      });
      courseCards.forEach((card, index) => {
        card.classList.toggle('pdf-card-excluded', previous.courses[index].excluded);
        card.classList.toggle('hidden', previous.courses[index].hidden);
      });
      if (profileDescText && previous.description !== undefined) profileDescText.textContent = previous.description;
      document.title = previous.title || pdfOriginalTitle;
      printRestore = null;
    };
    window.setTimeout(() => window.print(), 150);
  });

  window.addEventListener('afterprint', () => printRestore?.());

  document.querySelectorAll('.quick-nav a').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  updateVisibleCount();
});
