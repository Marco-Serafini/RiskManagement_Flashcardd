// RMP Flashcard App - Main JavaScript

// Global App State
const appState = {
  currentUser: null,
  currentScreen: 'login-screen',
  studySession: {
    selectedAreas: [],
    currentCards: [],
    currentCardIndex: 0,
    startTime: null,
    elapsedTime: 0,
    timerInterval: null
  },
  areas: [],
  userProfiles: [],
  isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
};

// Constants for SuperMemo 2 algorithm
const SM2 = {
  RATING: {
    AGAIN: 0,
    HARD: 1,
    GOOD: 2,
    EASY: 3
  },
  INTERVALS: {
    AGAIN: 0.007, // 10 minutes in days
    HARD: 1,       // 1 day
    GOOD: 3,       // 3 days
    EASY: 7        // 7 days
  },
  STATES: {
    NEW: 'new',
    LEARNING: 'learning',
    REVIEW: 'review'
  },
  DEFAULT_EF: 2.5, // Default easiness factor
  MIN_EF: 1.3      // Minimum easiness factor
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  initializeApp();
  setupEventListeners();
});

// Initialize application state and data
function initializeApp() {
  console.log('Loading app data...');
  
  // Load data
  loadAreasData();
  loadUserProfiles();
  
  // Apply theme
  applyTheme();
  
  // Check for existing session
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      appState.currentUser = JSON.parse(savedUser);
      console.log('Restored user session:', appState.currentUser);
      
      if (appState.currentUser.role === 'Amministratore') {
        showScreen('admin-dashboard');
        updateAdminDashboard();
      } else {
        showScreen('student-dashboard');
        updateDashboard();
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      localStorage.removeItem('currentUser');
    }
  }
  
  console.log('App initialized successfully');
}

// Load areas data from the predefined content
function loadAreasData() {
  appState.areas = [
    {
      id: "basi-pm",
      name: "Basi di PM (CAPM)",
      description: "Contenuti fondamentali project management secondo PMBOK",
      flashcards: [
        {question: "Cos'è un progetto secondo PMI?", answer: "Un progetto è uno sforzo temporaneo intrapreso per creare un prodotto, servizio o risultato unico. Ha un inizio e una fine definiti."},
        {question: "Quali sono le 5 fasi del ciclo di vita del progetto?", answer: "Iniziazione, Pianificazione, Esecuzione, Monitoraggio e Controllo, Chiusura."},
        {question: "Cos'è il triple constraint?", answer: "Il triple constraint è costituito da ambito, tempo e costo. Questi tre vincoli sono interconnessi e influenzano la qualità del progetto."},
        {question: "Chi è il Project Manager?", answer: "La persona responsabile per guidare il team nella realizzazione degli obiettivi del progetto e degli obiettivi di business."},
        {question: "Cos'è un deliverable?", answer: "Un prodotto, risultato o capacità unica e verificabile che deve essere prodotta per completare un processo, fase o progetto."},
        {question: "Cos'è un programma?", answer: "Un gruppo di progetti correlati, sottoprogrammi e attività di programma gestiti in modo coordinato per ottenere benefici non disponibili se gestiti individualmente."},
        {question: "Cosa sono i fattori ambientali aziendali?", answer: "Condizioni, non sotto il controllo del team di progetto, che influenzano, vincolano o dirigono il progetto."},
        {question: "Cosa sono gli asset dei processi organizzativi?", answer: "Piani, processi, politiche, procedure e basi di conoscenza specifici dell'organizzazione esecutrice e utilizzati da essa."},
        {question: "Cos'è la WBS?", answer: "Work Breakdown Structure - Una decomposizione gerarchica orientata ai deliverable del lavoro da eseguire dal team di progetto."},
        {question: "Cosa significa Progressive Elaboration?", answer: "La caratteristica iterativa di pianificazione che permette di sviluppare progressivamente maggiori livelli di dettaglio."}
      ]
    },
    {
      id: "principi-pm",
      name: "Principi di PM",
      description: "12 principi del PMBOK Guide 7th Edition",
      flashcards: [
        {question: "Qual è il principio di Stewardship?", answer: "Condotta responsabile e affidabile nelle attività di progetto con impatti finanziari, sociali e ambientali."},
        {question: "Cosa significa Team Leadership?", answer: "Leadership del team attraverso comunicazione efficace, coinvolgimento e supporto ai membri del team."},
        {question: "Cos'è lo Stakeholder Engagement?", answer: "Coinvolgimento proattivo degli stakeholder per comprendere le loro esigenze e gestire le aspettative."},
        {question: "Come si definisce il principio di Value?", answer: "Focus sulla creazione di valore per l'organizzazione e gli stakeholder attraverso i deliverable del progetto."},
        {question: "Cos'è il Systems Thinking?", answer: "Approccio olistico che riconosce le interconnessioni tra i componenti del sistema progetto."},
        {question: "Cosa significa Adaptability and Resilience?", answer: "Capacità di adattarsi ai cambiamenti e di recuperare dalle avversità per garantire il successo del progetto."},
        {question: "Qual è il principio di Quality?", answer: "Focus sulla soddisfazione degli stakeholder attraverso il soddisfacimento dei requisiti di qualità."},
        {question: "Cosa significa Complexity?", answer: "Riconoscimento e gestione della complessità intrinseca dei progetti e degli ambienti di progetto."},
        {question: "Cos'è il principio di Change?", answer: "Preparazione proattiva per il cambiamento e gestione efficace delle transizioni."},
        {question: "Cosa significa Navigate Complexity?", answer: "Navigare efficacemente attraverso la complessità per raggiungere i risultati desiderati del progetto."}
      ]
    },
    {
      id: "principi-risk",
      name: "Principi di Risk Management",
      description: "Fondamenti della gestione dei rischi nei progetti",
      flashcards: [
        {question: "Cos'è un rischio secondo PMI?", answer: "Un evento o condizione incerta che, se si verifica, ha un effetto positivo o negativo su uno o più obiettivi del progetto."},
        {question: "Quali sono i tipi di rischio?", answer: "Rischi negativi (minacce) che possono danneggiare il progetto e rischi positivi (opportunità) che possono beneficiarlo."},
        {question: "Cos'è la Risk Tolerance?", answer: "Il grado, quantità o volume di rischio che un'organizzazione o individuo sopporterà."},
        {question: "Cosa significa Risk Appetite?", answer: "Il livello di rischio che un'organizzazione è disposta ad accettare per raggiungere i suoi obiettivi strategici."},
        {question: "Cos'è un Risk Owner?", answer: "La persona o entità responsabile per monitorare il rischio e implementare le strategie di risposta."},
        {question: "Cosa significa Risk Threshold?", answer: "Il livello di impatto al quale uno stakeholder può avere un interesse specifico."},
        {question: "Cos'è la Risk Governance?", answer: "Il sistema di principi, politiche e processi per guidare la gestione del rischio."},
        {question: "Cosa sono i Risk Criteria?", answer: "I termini di riferimento rispetto ai quali viene valutata la significatività di un rischio."},
        {question: "Cos'è il Risk Culture?", answer: "La cultura organizzativa che supporta e incoraggia comportamenti appropriati di gestione del rischio."},
        {question: "Cosa significa Risk Communication?", answer: "Lo scambio continuo e iterativo di informazioni sui rischi tra decisori e stakeholder."}
      ]
    },
    {
      id: "contesto-risk",
      name: "Contesto e concetti fondamentali di Risk Management",
      description: "Contesto organizzativo e concetti base della gestione rischi",
      flashcards: [
        {question: "Cos'è il Risk Management Framework?", answer: "La struttura che stabilisce i principi, le pratiche e i criteri per la gestione del rischio in un'organizzazione."},
        {question: "Cosa sono i Risk Categories?", answer: "Gruppi di potenziali cause di rischio organizzati per facilitare l'identificazione sistematica dei rischi."},
        {question: "Cos'è un Risk Breakdown Structure (RBS)?", answer: "Una rappresentazione gerarchica dei rischi organizzata per categoria e sottocategoria di rischio."},
        {question: "Cosa significa Enterprise Risk Management?", answer: "Un approccio integrato alla gestione dei rischi a livello di intera organizzazione."},
        {question: "Cos'è il Risk Context?", answer: "L'ambiente interno ed esterno in cui l'organizzazione opera e che influenza la gestione del rischio."},
        {question: "Cosa sono i Risk Drivers?", answer: "I fattori che influenzano la probabilità o l'impatto di un rischio."},
        {question: "Cos'è il Risk Profile?", answer: "Una descrizione di un insieme di rischi che un'organizzazione o progetto affronta."},
        {question: "Cosa significa Risk Maturity?", answer: "Il livello di capacità di un'organizzazione nella gestione efficace dei rischi."},
        {question: "Cos'è l'Uncertainty?", answer: "Lo stato di parziale carenza di informazioni che impedisce la conoscenza esatta di eventi futuri."},
        {question: "Cosa sono le Assumptions?", answer: "Fattori considerati veri, reali o certi senza prova o dimostrazione per scopi di pianificazione."}
      ]
    },
    {
      id: "risk-strategy",
      name: "Risk Strategy and Planning",
      description: "Strategia e pianificazione della gestione rischi (22% esame RMP)",
      flashcards: [
        {question: "Cos'è un Risk Management Plan?", answer: "Il documento che descrive come saranno condotte le attività di gestione del rischio durante il progetto."},
        {question: "Quali sono i componenti del Risk Management Plan?", answer: "Metodologia, ruoli e responsabilità, budget, tempistiche, categorie di rischio, definizioni di probabilità e impatto, matrice P&I, soglie di rischio, formati di reporting."},
        {question: "Cos'è la Risk Appetite?", answer: "Il livello generale di rischio che un'organizzazione è disposta ad accettare per perseguire la sua missione."},
        {question: "Cosa sono i Risk Thresholds?", answer: "I livelli specifici di rischio che, se superati, richiedono un'azione da parte del management."},
        {question: "Cos'è il Risk Register?", answer: "Il documento che contiene i dettagli dei rischi identificati e le informazioni sulle loro caratteristiche e gestione."},
        {question: "Cosa significa Risk Methodology?", answer: "L'approccio sistematico utilizzato per condurre la gestione del rischio."},
        {question: "Cos'è il Risk Budget?", answer: "Le risorse finanziarie allocate per le attività di gestione del rischio."},
        {question: "Cosa sono i Risk Roles and Responsibilities?", answer: "Le definizioni di chi farà cosa nelle attività di gestione del rischio e quando lo farà."},
        {question: "Cos'è il Risk Reporting Format?", answer: "Il formato standardizzato per documentare e comunicare le informazioni sui rischi."},
        {question: "Cosa significa Risk Review Frequency?", answer: "La frequenza con cui vengono condotte le revisioni dei rischi durante il ciclo di vita del progetto."}
      ]
    },
    {
      id: "risk-identification",
      name: "Risk Identification",
      description: "Identificazione dei rischi di progetto (23% esame RMP)",
      flashcards: [
        {question: "Cos'è il processo di Risk Identification?", answer: "Il processo di determinazione di quali rischi possono influenzare il progetto e di documentazione delle loro caratteristiche."},
        {question: "Quali sono le tecniche principali per identificare i rischi?", answer: "Brainstorming, Delphi technique, interviste, analisi delle cause radice, checklist, analisi degli assumptions."},
        {question: "Cos'è la Delphi Technique?", answer: "Una tecnica per ottenere consenso da esperti senza che si influenzino a vicenda, utilizzando questionari anonimi."},
        {question: "Cosa sono i Risk Triggers?", answer: "Eventi o condizioni che indicano che un rischio sta per verificarsi o si è verificato."},
        {question: "Cos'è la SWOT Analysis nel contesto dei rischi?", answer: "Analisi di Forze, Debolezze, Opportunità e Minacce per identificare rischi relativi al progetto."},
        {question: "Cos'è l'Assumptions Analysis?", answer: "Una tecnica che esplora la validità delle assumptions e identifica i rischi basati sull'inaccuratezza."},
        {question: "Cosa sono le Risk Checklists?", answer: "Liste di rischi potenziali basate su informazioni storiche e conoscenza di progetti simili."},
        {question: "Cos'è la Documentation Reviews?", answer: "Revisione strutturata della documentazione di progetto per identificare rischi."},
        {question: "Cosa significa Root Cause Analysis?", answer: "Tecnica analitica utilizzata per determinare la causa radice alla base di problemi o rischi."},
        {question: "Cos'è l'Information Gathering?", answer: "Processo sistematico di raccolta di informazioni sui rischi da varie fonti e stakeholder."}
      ]
    },
    {
      id: "risk-analysis",
      name: "Risk Analysis",
      description: "Analisi qualitativa e quantitativa dei rischi (18% esame RMP)",
      flashcards: [
        {question: "Cos'è l'analisi qualitativa dei rischi?", answer: "Il processo di prioritizzazione dei rischi tramite valutazione della loro probabilità di accadimento e impatto sui progetti."},
        {question: "Cos'è la Probability and Impact Matrix?", answer: "Una griglia per mappare la probabilità di ogni rischio e il suo impatto sugli obiettivi di progetto."},
        {question: "Cos'è l'analisi quantitativa dei rischi?", answer: "Il processo di analisi numerica dell'effetto dei rischi identificati sugli obiettivi generali del progetto."},
        {question: "Cos'è la Monte Carlo Simulation?", answer: "Una tecnica che utilizza modelli computerizzati per analizzare l'incertezza nei progetti attraverso simulazioni multiple."},
        {question: "Cos'è l'Expected Monetary Value (EMV)?", answer: "Una tecnica statistica che calcola il risultato medio quando il futuro include scenari incerti."},
        {question: "Cos'è la Sensitivity Analysis?", answer: "Una tecnica quantitativa per determinare quali rischi hanno il maggiore impatto potenziale sul progetto."},
        {question: "Cos'è la Decision Tree Analysis?", answer: "Una tecnica di diagramma che descrive una decisione in esame e le implicazioni di scelta."},
        {question: "Cosa sono le Three-Point Estimates?", answer: "Stime che utilizzano valori ottimistici, pessimistici e più probabili per determinare range di valori."},
        {question: "Cos'è la Tornado Diagram?", answer: "Un diagramma a barre che mostra l'impatto relativo di variabili che hanno un alto grado di incertezza."},
        {question: "Cos'è il Risk Score?", answer: "Un valore numerico assegnato a un rischio basato sulla sua probabilità e impatto."}
      ]
    },
    {
      id: "risk-response",
      name: "Risk Response",
      description: "Strategie di risposta ai rischi (15% esame RMP)",
      flashcards: [
        {question: "Quali sono le strategie per i rischi negativi?", answer: "Avoid (Evitare), Transfer (Trasferire), Mitigate (Mitigare), Accept (Accettare)."},
        {question: "Quali sono le strategie per i rischi positivi?", answer: "Exploit (Sfruttare), Share (Condividere), Enhance (Potenziare), Accept (Accettare)."},
        {question: "Cos'è la strategia Mitigate?", answer: "Ridurre la probabilità e/o l'impatto di un rischio negativo a un livello accettabile."},
        {question: "Cos'è la strategia Transfer?", answer: "Spostare l'impatto di un rischio negativo insieme alla responsabilità di risposta a una terza parte."},
        {question: "Cos'è un Contingency Plan?", answer: "Un piano predefinito che viene attivato quando un rischio specifico si verifica."},
        {question: "Cos'è la strategia Avoid?", answer: "Eliminare la minaccia o proteggere il progetto dal suo impatto."},
        {question: "Cos'è la strategia Accept?", answer: "Riconoscere l'esistenza di un rischio e non intraprendere alcuna azione a meno che il rischio non si verifichi."},
        {question: "Cos'è la strategia Exploit?", answer: "Assicurarsi che un'opportunità si realizzi aumentandone la probabilità al 100%."},
        {question: "Cos'è la strategia Share?", answer: "Allocare la proprietà di un'opportunità a una terza parte meglio attrezzata per catturarla."},
        {question: "Cos'è la strategia Enhance?", answer: "Aumentare la probabilità e/o l'impatto positivo di un'opportunità."}
      ]
    },
    {
      id: "monitor-close",
      name: "Monitor and Close Risks",
      description: "Monitoraggio e chiusura dei rischi (22% esame RMP)",
      flashcards: [
        {question: "Cos'è il processo Monitor Risks?", answer: "Il processo di implementazione dei piani di risposta ai rischi, tracciamento dei rischi identificati, monitoraggio dei rischi residui e identificazione di nuovi rischi."},
        {question: "Cos'è un Risk Audit?", answer: "Una revisione sistematica dell'efficacia delle risposte ai rischi nell'affrontare i rischi identificati."},
        {question: "Cosa sono i Residual Risks?", answer: "I rischi che rimangono dopo che le strategie di risposta sono state implementate."},
        {question: "Cosa sono i Secondary Risks?", answer: "Nuovi rischi che emergono come risultato diretto dell'implementazione di una risposta al rischio."},
        {question: "Cos'è il Risk Review?", answer: "Una riunione periodica per valutare lo stato attuale dei rischi e l'efficacia delle strategie di risposta implementate."},
        {question: "Cos'è il Risk Status Report?", answer: "Un documento che comunica lo stato corrente dei rischi del progetto agli stakeholder."},
        {question: "Cosa significa Risk Closure?", answer: "Il processo formale di chiusura dei rischi che non sono più applicabili o relevanti."},
        {question: "Cos'è l'Earned Value Analysis nel risk monitoring?", answer: "Una tecnica per misurare le performance del progetto e identificare variazioni che possono indicare nuovi rischi."},
        {question: "Cosa sono i Risk Indicators?", answer: "Metriche che forniscono insight sulla potenziale presenza di rischi nel progetto."},
        {question: "Cos'è il Lessons Learned nel risk management?", answer: "Conoscenza acquisita durante il progetto su come gestire efficacemente i rischi in progetti futuri."}
      ]
    }
  ];
  
  console.log(`Loaded ${appState.areas.length} areas with flashcards`);
}

// Load user profiles
function loadUserProfiles() {
  appState.userProfiles = [
    {id: "marco", name: "Marco", role: "Studente", code: "MC2501"},
    {id: "massimo", name: "Massimo", role: "Studente", code: "MS2501"},
    {id: "valentina", name: "Valentina", role: "Studente", code: "VL2501"},
    {id: "luca", name: "Luca", role: "Studente", code: "LC2501"},
    {id: "admin", name: "Admin", role: "Amministratore", code: "ADM2501"}
  ];
  
  console.log(`Loaded ${appState.userProfiles.length} user profiles`);
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Login form - Use addEventListener properly
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      console.log('Login form submitted');
      e.preventDefault();
      e.stopPropagation();
      handleLogin(e);
      return false;
    });
  } else {
    console.error('Login form not found');
  }
  
  // Student Dashboard
  const logoutBtn = document.getElementById('logout-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme-btn');
  const startStudyBtn = document.getElementById('start-study-btn');
  const viewStatsBtn = document.getElementById('view-stats-btn');
  
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (toggleThemeBtn) toggleThemeBtn.addEventListener('click', toggleTheme);
  if (startStudyBtn) startStudyBtn.addEventListener('click', () => showScreen('area-selection'));
  if (viewStatsBtn) viewStatsBtn.addEventListener('click', showStatsModal);
  
  // Admin Dashboard
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const adminToggleThemeBtn = document.getElementById('admin-toggle-theme-btn');
  
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout);
  if (adminToggleThemeBtn) adminToggleThemeBtn.addEventListener('click', toggleTheme);
  
  // Area Selection
  const areaSelectionBackBtn = document.getElementById('area-selection-back-btn');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');
  const startSelectedBtn = document.getElementById('start-selected-btn');
  
  if (areaSelectionBackBtn) {
    areaSelectionBackBtn.addEventListener('click', () => {
      if (appState.currentUser && appState.currentUser.role === 'Amministratore') {
        showScreen('admin-dashboard');
      } else {
        showScreen('student-dashboard');
      }
    });
  }
  if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllAreas);
  if (deselectAllBtn) deselectAllBtn.addEventListener('click', deselectAllAreas);
  if (startSelectedBtn) startSelectedBtn.addEventListener('click', startStudySession);
  
  // Study Screen
  const studyEndBtn = document.getElementById('study-end-btn');
  const flipBtn = document.getElementById('flip-btn');
  const currentFlashcard = document.getElementById('current-flashcard');
  
  if (studyEndBtn) studyEndBtn.addEventListener('click', endStudySession);
  if (flipBtn) flipBtn.addEventListener('click', flipCurrentCard);
  if (currentFlashcard) currentFlashcard.addEventListener('click', flipCurrentCard);
  
  // Rating buttons event delegation
  const ratingButtons = document.getElementById('rating-buttons');
  if (ratingButtons) {
    ratingButtons.addEventListener('click', (e) => {
      const ratingBtn = e.target.closest('.rating-btn');
      if (ratingBtn) {
        const rating = ratingBtn.dataset.rating;
        rateCard(rating);
      }
    });
  }
  
  // Stats Modal
  const closeStatsModal = document.getElementById('close-stats-modal');
  const exportStatsBtn = document.getElementById('export-stats-btn');
  
  if (closeStatsModal) closeStatsModal.addEventListener('click', hideStatsModal);
  if (exportStatsBtn) exportStatsBtn.addEventListener('click', exportStats);
  
  console.log('Event listeners setup complete');
}

// Handle login form submission
function handleLogin(e) {
  console.log('handleLogin called');
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const userSelect = document.getElementById('user-select');
  const accessCodeInput = document.getElementById('access-code');
  const errorEl = document.getElementById('login-error');
  
  if (!userSelect || !accessCodeInput || !errorEl) {
    console.error('Login form elements not found');
    return false;
  }
  
  const userId = userSelect.value;
  const code = accessCodeInput.value;
  
  console.log('Login attempt:', { userId, code: code ? '***' : 'empty' });
  
  // Validate input
  if (!userId || !code) {
    console.log('Validation failed: missing userId or code');
    errorEl.textContent = 'Per favore, seleziona un utente e inserisci il codice di accesso.';
    errorEl.classList.remove('hidden');
    return false;
  }
  
  // Find user
  const user = appState.userProfiles.find(u => u.id === userId);
  console.log('Found user:', user);
  
  // Validate credentials
  if (!user || user.code !== code) {
    console.log('Invalid credentials');
    errorEl.textContent = 'Codice di accesso non valido. Riprova.';
    errorEl.classList.remove('hidden');
    return false;
  }
  
  // Login successful
  console.log('Login successful for user:', user.name);
  appState.currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  errorEl.classList.add('hidden');
  
  // Initialize user data if first login
  initializeUserData(user.id);
  
  // Show appropriate dashboard
  if (user.role === 'Amministratore') {
    console.log('Showing admin dashboard');
    showScreen('admin-dashboard');
    updateAdminDashboard();
  } else {
    console.log('Showing student dashboard');
    showScreen('student-dashboard');
    updateDashboard();
  }
  
  return false;
}

// Initialize user data if not exists
function initializeUserData(userId) {
  const userDataKey = `rmp_data_${userId}`;
  if (!localStorage.getItem(userDataKey)) {
    console.log('Initializing user data for:', userId);
    
    const initialData = {
      userId: userId,
      sessions: [],
      lastSession: null,
      areaProgress: {},
      cardStates: {}
    };
    
    // Initialize progress for each area
    appState.areas.forEach(area => {
      initialData.areaProgress[area.id] = {
        totalCards: area.flashcards.length,
        studied: 0,
        learning: 0,
        review: 0,
        completed: 0,
        lastStudied: null
      };
      
      // Initialize card states
      area.flashcards.forEach((card, index) => {
        const cardId = `${area.id}_${index}`;
        initialData.cardStates[cardId] = {
          ef: SM2.DEFAULT_EF,
          interval: 0,
          repetitions: 0,
          state: SM2.STATES.NEW,
          lastReview: null,
          nextReview: new Date(),
          areaId: area.id
        };
      });
    });
    
    localStorage.setItem(userDataKey, JSON.stringify(initialData));
    console.log('User data initialized');
  }
}

// Handle logout
function handleLogout() {
  console.log('Logging out user:', appState.currentUser?.name);
  
  appState.currentUser = null;
  localStorage.removeItem('currentUser');
  showScreen('login-screen');
  
  // Reset form
  const loginForm = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  
  if (loginForm) loginForm.reset();
  if (errorEl) errorEl.classList.add('hidden');
}

// Toggle between light and dark mode
function toggleTheme() {
  appState.isDarkMode = !appState.isDarkMode;
  applyTheme();
}

// Apply current theme to document
function applyTheme() {
  if (appState.isDarkMode) {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
  } else {
    document.documentElement.setAttribute('data-color-scheme', 'light');
  }
}

// Show a specific screen
function showScreen(screenId) {
  console.log('Showing screen:', screenId);
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show requested screen
  const screenElement = document.getElementById(screenId);
  if (screenElement) {
    screenElement.classList.add('active');
    appState.currentScreen = screenId;
    console.log('Screen shown successfully:', screenId);
  } else {
    console.error(`Screen with ID "${screenId}" not found`);
    return;
  }
  
  // Handle screen-specific initialization
  if (screenId === 'student-dashboard') {
    updateDashboard();
    updateWelcomeMessage();
  } else if (screenId === 'admin-dashboard') {
    updateAdminDashboard();
  } else if (screenId === 'area-selection') {
    populateAreaSelection();
    updateWelcomeMessage('area-selection-welcome');
  }
}

// Update welcome message with user name
function updateWelcomeMessage(elementId = 'user-welcome') {
  if (appState.currentUser) {
    const welcomeElement = document.getElementById(elementId);
    if (welcomeElement) {
      welcomeElement.textContent = `Benvenuto, ${appState.currentUser.name}`;
    }
  }
}

// Update student dashboard with latest data
function updateDashboard() {
  if (!appState.currentUser) return;
  
  console.log('Updating dashboard for:', appState.currentUser.name);
  
  const userData = getUserData();
  updateWelcomeMessage();
  
  // Update statistics
  let totalCards = 0;
  let studiedCards = 0;
  let learningCards = 0;
  let reviewCards = 0;
  
  // Process area progress
  Object.values(userData.areaProgress).forEach(area => {
    totalCards += area.totalCards;
    studiedCards += area.studied;
    learningCards += area.learning;
    reviewCards += area.review;
  });
  
  // Update summary statistics
  const totalCardsEl = document.getElementById('total-cards');
  const studiedCardsEl = document.getElementById('studied-cards');
  const learningCardsEl = document.getElementById('learning-cards');
  const reviewCardsEl = document.getElementById('review-cards');
  
  if (totalCardsEl) totalCardsEl.textContent = totalCards;
  if (studiedCardsEl) studiedCardsEl.textContent = studiedCards;
  if (learningCardsEl) learningCardsEl.textContent = learningCards;
  if (reviewCardsEl) reviewCardsEl.textContent = reviewCards;
  
  // Update area progress
  updateAreaProgress(userData);
  
  // Update due today cards
  updateDueToday(userData);
  
  // Create progress chart
  createProgressChart(userData);
}

// Update area progress bars
function updateAreaProgress(userData) {
  const container = document.getElementById('areas-progress-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  appState.areas.forEach(area => {
    const areaProgress = userData.areaProgress[area.id];
    const percentage = areaProgress 
      ? Math.round((areaProgress.studied / areaProgress.totalCards) * 100) 
      : 0;
    
    const card = document.createElement('div');
    card.className = 'area-progress-card';
    card.innerHTML = `
      <h4>${area.name}</h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-text">
        <span>${percentage}% completato</span>
        <span>${areaProgress ? areaProgress.studied : 0}/${areaProgress ? areaProgress.totalCards : 0} carte</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Update due today section
function updateDueToday(userData) {
  const dueToday = document.getElementById('due-today');
  if (!dueToday) return;
  
  dueToday.innerHTML = '';
  
  const today = new Date();
  let dueCards = [];
  
  // Find cards due today
  Object.entries(userData.cardStates).forEach(([cardId, card]) => {
    if (card.nextReview && new Date(card.nextReview) <= today) {
      const [areaId, cardIndex] = cardId.split('_');
      const area = appState.areas.find(a => a.id === areaId);
      if (area && area.flashcards[cardIndex]) {
        dueCards.push({
          id: cardId,
          question: area.flashcards[cardIndex].question,
          areaName: area.name,
          areaId: areaId
        });
      }
    }
  });
  
  // Display due cards or message
  if (dueCards.length === 0) {
    dueToday.innerHTML = '<p class="no-cards-message">Nessuna flashcard da ripassare oggi</p>';
  } else {
    dueCards.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'due-card';
      cardEl.innerHTML = `
        <div class="due-card__content">
          <p>${card.question}</p>
          <span class="due-card__area">${card.areaName}</span>
        </div>
      `;
      dueToday.appendChild(cardEl);
    });
  }
}

// Create progress chart
function createProgressChart(userData) {
  const chartCanvas = document.getElementById('progress-chart');
  if (!chartCanvas) {
    console.error('Progress chart canvas not found');
    return;
  }
  
  const ctx = chartCanvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for progress chart');
    return;
  }
  
  // Generate dates for the last 7 days
  const dates = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }));
  }
  
  // Count cards studied per day
  const cardsStudied = new Array(7).fill(0);
  if (userData.sessions) {
    userData.sessions.forEach(session => {
      if (!session.date) return;
      
      const sessionDate = new Date(session.date);
      const dayDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        cardsStudied[6 - dayDiff] += session.cardsStudied || 0;
      }
    });
  }
  
  // Destroy previous chart if exists
  if (window.progressChart) {
    window.progressChart.destroy();
  }
  
  // Create new chart
  window.progressChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Flashcard studiate',
        data: cardsStudied,
        backgroundColor: '#1FB8CD',
        borderColor: '#0891b2',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Update admin dashboard
function updateAdminDashboard() {
  console.log('Updating admin dashboard');
  
  // Get data for all students
  const studentIds = appState.userProfiles
    .filter(profile => profile.role === 'Studente')
    .map(profile => profile.id);
  
  const studentsData = studentIds.map(id => {
    const data = getSpecificUserData(id);
    const profile = appState.userProfiles.find(p => p.id === id);
    return {
      id: id,
      name: profile ? profile.name : id,
      data: data
    };
  });
  
  // Calculate overview statistics
  let totalCardsStudied = 0;
  let avgCompletion = 0;
  const areaCompletionRates = {};
  
  // Initialize area completion rates
  appState.areas.forEach(area => {
    areaCompletionRates[area.id] = {
      name: area.name,
      totalCompletion: 0,
      studentCount: 0
    };
  });
  
  // Process student data
  studentsData.forEach(student => {
    if (!student.data || !student.data.areaProgress) return;
    
    let studentTotalStudied = 0;
    let studentTotalCards = 0;
    
    Object.entries(student.data.areaProgress).forEach(([areaId, progress]) => {
      studentTotalStudied += progress.studied || 0;
      studentTotalCards += progress.totalCards || 0;
      
      // Update area completion
      if (areaCompletionRates[areaId]) {
        const completionPercentage = progress.totalCards > 0 ? 
          (progress.studied / progress.totalCards) * 100 : 0;
        areaCompletionRates[areaId].totalCompletion += completionPercentage;
        areaCompletionRates[areaId].studentCount++;
      }
    });
    
    totalCardsStudied += studentTotalStudied;
    
    // Calculate student average completion
    if (studentTotalCards > 0) {
      avgCompletion += (studentTotalStudied / studentTotalCards) * 100;
    }
  });
  
  avgCompletion = studentsData.length > 0 ? Math.round(avgCompletion / studentsData.length) : 0;
  
  // Find problem areas
  const problemAreas = Object.values(areaCompletionRates)
    .filter(area => area.studentCount > 0)
    .map(area => ({
      name: area.name,
      avgCompletion: Math.round(area.totalCompletion / area.studentCount)
    }))
    .sort((a, b) => a.avgCompletion - b.avgCompletion);
  
  // Update overview cards
  const avgCompletionEl = document.getElementById('avg-completion');
  const totalCardsStudiedEl = document.getElementById('total-cards-studied');
  const problemAreasEl = document.getElementById('problem-areas');
  
  if (avgCompletionEl) avgCompletionEl.textContent = `${avgCompletion}%`;
  if (totalCardsStudiedEl) totalCardsStudiedEl.textContent = totalCardsStudied;
  
  if (problemAreasEl) {
    if (problemAreas.length > 0 && problemAreas[0].avgCompletion < 50) {
      problemAreasEl.textContent = problemAreas[0].name;
    } else {
      problemAreasEl.textContent = 'Nessuna';
    }
  }
  
  // Create student comparison chart
  createStudentComparisonChart(studentsData);
  
  // Update student cards
  updateStudentCards(studentsData);
  
  // Update insights
  updateInsights(studentsData, problemAreas);
}

// Create student comparison chart
function createStudentComparisonChart(studentsData) {
  const chartCanvas = document.getElementById('students-comparison-chart');
  if (!chartCanvas) {
    console.error('Students comparison chart canvas not found');
    return;
  }
  
  const ctx = chartCanvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context for students comparison chart');
    return;
  }
  
  const labels = studentsData.map(student => student.name);
  const data = studentsData.map(student => {
    if (!student.data || !student.data.areaProgress) return 0;
    
    let totalStudied = 0;
    let totalCards = 0;
    
    Object.values(student.data.areaProgress).forEach(progress => {
      totalStudied += progress.studied || 0;
      totalCards += progress.totalCards || 0;
    });
    
    return totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0;
  });
  
  // Destroy previous chart if exists
  if (window.studentsChart) {
    window.studentsChart.destroy();
  }
  
  // Create new chart
  window.studentsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Completamento (%)',
        data: data,
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
        borderColor: ['#0891b2', '#f97316', '#991b1b', '#d4d4d4'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// Update student cards in admin dashboard
function updateStudentCards(studentsData) {
  const container = document.getElementById('student-cards-container');
  if (!container) {
    console.error('Student cards container not found');
    return;
  }
  
  container.innerHTML = '';
  
  studentsData.forEach(student => {
    if (!student.data || !student.data.areaProgress) return;
    
    const card = document.createElement('div');
    card.className = 'student-card';
    
    // Calculate statistics
    let totalStudied = 0;
    let totalCards = 0;
    let lastStudyDate = null;
    
    Object.values(student.data.areaProgress).forEach(progress => {
      totalStudied += progress.studied || 0;
      totalCards += progress.totalCards || 0;
      
      if (progress.lastStudied && (!lastStudyDate || new Date(progress.lastStudied) > new Date(lastStudyDate))) {
        lastStudyDate = progress.lastStudied;
      }
    });
    
    const completionPercentage = totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0;
    const lastStudyFormatted = lastStudyDate 
      ? new Date(lastStudyDate).toLocaleDateString('it-IT') 
      : 'Mai';
    
    // Create card content
    card.innerHTML = `
      <h4>${student.name}</h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${completionPercentage}%"></div>
      </div>
      <div class="progress-text">
        <span>${completionPercentage}% completato</span>
      </div>
      <div class="student-stats">
        <p>Carte studiate: ${totalStudied}/${totalCards}</p>
        <p>Ultimo studio: ${lastStudyFormatted}</p>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Update insights in admin dashboard
function updateInsights(studentsData, problemAreas) {
  // Problem areas insights
  const problemAreasInsights = document.getElementById('problem-areas-insights');
  if (problemAreasInsights) {
    if (problemAreas.length > 0 && problemAreas[0].avgCompletion < 50) {
      problemAreasInsights.textContent = `Gli studenti stanno avendo difficoltà con "${problemAreas[0].name}" (${problemAreas[0].avgCompletion}% completamento medio). Considera di fornire materiale supplementare su questo argomento.`;
    } else {
      problemAreasInsights.textContent = 'Gli studenti stanno procedendo bene in tutte le aree. Non ci sono criticità significative da segnalare.';
    }
  }
  
  // Learning trends
  const learningTrends = document.getElementById('learning-trends');
  if (!learningTrends) {
    console.error('Learning trends element not found');
    return;
  }
  
  // Calculate overall trend
  const totalSessionsByDay = {};
  const totalCardsByDay = {};
  let hasSessionData = false;
  
  studentsData.forEach(student => {
    if (!student.data || !student.data.sessions) return;
    
    student.data.sessions.forEach(session => {
      if (!session.date) return;
      
      const day = new Date(session.date).toISOString().split('T')[0];
      hasSessionData = true;
      
      if (!totalSessionsByDay[day]) {
        totalSessionsByDay[day] = 0;
        totalCardsByDay[day] = 0;
      }
      
      totalSessionsByDay[day]++;
      totalCardsByDay[day] += session.cardsStudied || 0;
    });
  });
  
  if (hasSessionData) {
    const days = Object.keys(totalSessionsByDay).sort();
    if (days.length >= 2) {
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const firstDayCards = totalCardsByDay[firstDay] / totalSessionsByDay[firstDay];
      const lastDayCards = totalCardsByDay[lastDay] / totalSessionsByDay[lastDay];
      
      if (lastDayCards > firstDayCards) {
        learningTrends.textContent = 'La velocità di apprendimento è in aumento. Gli studenti stanno progressivamente studiando più carte per sessione.';
      } else if (lastDayCards < firstDayCards) {
        learningTrends.textContent = 'La velocità di apprendimento è in diminuzione. Gli studenti potrebbero avere bisogno di ulteriori stimoli.';
      } else {
        learningTrends.textContent = 'La velocità di apprendimento è stabile.';
      }
    } else {
      learningTrends.textContent = 'Dati insufficienti per valutare il trend di apprendimento.';
    }
  } else {
    learningTrends.textContent = 'Non ci sono ancora dati sulle sessioni di studio.';
  }
  
  // Suggestions
  const suggestions = document.getElementById('suggestions');
  if (suggestions) {
    if (problemAreas.length > 0 && problemAreas[0].avgCompletion < 50) {
      suggestions.textContent = `Si consiglia di focalizzarsi su "${problemAreas[0].name}" nella prossima lezione e fornire esempi pratici per aiutare la comprensione.`;
    } else if (problemAreas.length > 1 && problemAreas[1].avgCompletion < 70) {
      suggestions.textContent = `Mentre "${problemAreas[0].name}" richiede attenzione, anche "${problemAreas[1].name}" potrebbe beneficiare di ulteriori spiegazioni (${problemAreas[1].avgCompletion}% completamento).`;
    } else {
      suggestions.textContent = 'La classe sta procedendo bene. Si consiglia di introdurre concetti più avanzati o esercitazioni pratiche per consolidare l'apprendimento.';
    }
  }
}

// Populate area selection screen
function populateAreaSelection() {
  const container = document.getElementById('areas-grid');
  if (!container) {
    console.error('Areas grid container not found');
    return;
  }
  
  container.innerHTML = '';
  
  const userData = getUserData();
  if (!userData) return;
  
  appState.areas.forEach(area => {
    const areaProgress = userData.areaProgress[area.id] || { 
      studied: 0, 
      totalCards: area.flashcards.length 
    };
    
    const percentage = Math.round((areaProgress.studied / areaProgress.totalCards) * 100);
    const dueCards = countDueCards(userData, area.id);
    
    const card = document.createElement('div');
    card.className = 'area-card';
    card.dataset.areaId = area.id;
    card.innerHTML = `
      <div class="selection-badge"><i class="fas fa-check"></i></div>
      <h4>${area.name}</h4>
      <p>${area.description}</p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="area-card-stats">
        <span>${percentage}% completato</span>
        <span>${dueCards} da rivedere</span>
      </div>
    `;
    
    card.addEventListener('click', () => toggleAreaSelection(card));
    
    container.appendChild(card);
  });
}

// Count due cards for an area
function countDueCards(userData, areaId) {
  if (!userData || !userData.cardStates) return 0;
  
  const today = new Date();
  let count = 0;
  
  Object.entries(userData.cardStates).forEach(([cardId, card]) => {
    if (card.areaId === areaId && card.nextReview && new Date(card.nextReview) <= today) {
      count++;
    }
  });
  
  return count;
}

// Toggle area selection
function toggleAreaSelection(cardElement) {
  cardElement.classList.toggle('selected');
  
  // Update start button state
  const selectedAreas = document.querySelectorAll('.area-card.selected');
  const startButton = document.getElementById('start-selected-btn');
  if (startButton) {
    startButton.disabled = selectedAreas.length === 0;
  }
}

// Select all areas
function selectAllAreas() {
  document.querySelectorAll('.area-card').forEach(card => {
    card.classList.add('selected');
  });
  
  const startButton = document.getElementById('start-selected-btn');
  if (startButton) {
    startButton.disabled = false;
  }
}

// Deselect all areas
function deselectAllAreas() {
  document.querySelectorAll('.area-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  const startButton = document.getElementById('start-selected-btn');
  if (startButton) {
    startButton.disabled = true;
  }
}

// Start study session with selected areas
function startStudySession() {
  const selectedAreaElements = document.querySelectorAll('.area-card.selected');
  if (selectedAreaElements.length === 0) return;
  
  console.log('Starting study session');
  
  // Get selected area IDs
  const selectedAreaIds = Array.from(selectedAreaElements).map(el => el.dataset.areaId);
  
  // Reset study session state
  appState.studySession = {
    selectedAreas: selectedAreaIds,
    currentCards: [],
    currentCardIndex: 0,
    startTime: new Date(),
    elapsedTime: 0,
    timerInterval: null
  };
  
  // Prepare cards for study
  prepareCardsForStudy();
  
  // Start the study timer
  startStudyTimer();
  
  // Show the study screen
  showScreen('study-screen');
  
  // Show first card
  showCurrentCard();
}

// Prepare cards for study session
function prepareCardsForStudy() {
  const userData = getUserData();
  if (!userData) return;
  
  const today = new Date();
  const allCards = [];
  
  // Get cards from selected areas
  appState.studySession.selectedAreas.forEach(areaId => {
    const area = appState.areas.find(a => a.id === areaId);
    if (!area) return;
    
    area.flashcards.forEach((card, index) => {
      const cardId = `${areaId}_${index}`;
      const cardState = userData.cardStates[cardId] || {
        ef: SM2.DEFAULT_EF,
        interval: 0,
        repetitions: 0,
        state: SM2.STATES.NEW,
        lastReview: null,
        nextReview: new Date(),
        areaId: areaId
      };
      
      // Check if card is due
      const nextReview = cardState.nextReview ? new Date(cardState.nextReview) : today;
      
      // Add card with its state
      allCards.push({
        id: cardId,
        question: card.question,
        answer: card.answer,
        areaId: areaId,
        state: cardState.state,
        ef: cardState.ef,
        interval: cardState.interval,
        repetitions: cardState.repetitions,
        lastReview: cardState.lastReview,
        nextReview: nextReview,
        isDue: nextReview <= today
      });
    });
  });
  
  // Sort cards: due cards first, then new cards, then learning cards
  allCards.sort((a, b) => {
    // First priority: due cards
    if (a.isDue && !b.isDue) return -1;
    if (!a.isDue && b.isDue) return 1;
    
    // Second priority: card state (new > learning > review)
    const stateOrder = {
      [SM2.STATES.NEW]: 0,
      [SM2.STATES.LEARNING]: 1,
      [SM2.STATES.REVIEW]: 2
    };
    
    return stateOrder[a.state] - stateOrder[b.state];
  });
  
  appState.studySession.currentCards = allCards;
  console.log(`Prepared ${allCards.length} cards for study`);
}

// Start the study timer
function startStudyTimer() {
  const timerElement = document.getElementById('study-timer');
  if (!timerElement) return;
  
  const startTime = new Date();
  
  appState.studySession.timerInterval = setInterval(() => {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    appState.studySession.elapsedTime = elapsedTime;
    
    // Format time as HH:MM:SS
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Show current flashcard
function showCurrentCard() {
  const cards = appState.studySession.currentCards;
  const index = appState.studySession.currentCardIndex;
  
  if (index >= cards.length) {
    // No more cards to study
    endStudySession();
    return;
  }
  
  const card = cards[index];
  const flashcardElement = document.getElementById('current-flashcard');
  const questionElement = document.getElementById('question-text');
  const answerElement = document.getElementById('answer-text');
  const progressElement = document.getElementById('cards-progress');
  const currentAreaElement = document.getElementById('current-area');
  const ratingButtons = document.getElementById('rating-buttons');
  const flipButton = document.getElementById('flip-btn');
  
  if (!flashcardElement || !questionElement || !answerElement || 
      !progressElement || !currentAreaElement || !ratingButtons || !flipButton) {
    console.error('Required elements for flashcard not found');
    return;
  }
  
  // Reset flashcard state
  flashcardElement.classList.remove('flipped');
  ratingButtons.classList.add('hidden');
  flipButton.classList.remove('hidden');
  
  // Update card content
  questionElement.textContent = card.question;
  answerElement.textContent = card.answer;
  
  // Update progress indicator
  progressElement.textContent = `Carta ${index + 1} di ${cards.length}`;
  
  // Update current area
  const area = appState.areas.find(a => a.id === card.areaId);
  currentAreaElement.textContent = `Area: ${area ? area.name : 'Sconosciuta'}`;
}

// Flip the current flashcard
function flipCurrentCard() {
  const flashcardElement = document.getElementById('current-flashcard');
  const ratingButtons = document.getElementById('rating-buttons');
  const flipButton = document.getElementById('flip-btn');
  
  if (!flashcardElement || !ratingButtons || !flipButton) {
    console.error('Required elements for flipping card not found');
    return;
  }
  
  flashcardElement.classList.toggle('flipped');
  
  // Show rating buttons after flip
  if (flashcardElement.classList.contains('flipped')) {
    ratingButtons.classList.remove('hidden');
    flipButton.classList.add('hidden');
  } else {
    ratingButtons.classList.add('hidden');
    flipButton.classList.remove('hidden');
  }
}

// Rate the current card and move to next
function rateCard(rating) {
  const cards = appState.studySession.currentCards;
  const index = appState.studySession.currentCardIndex;
  
  if (index >= cards.length) return;
  
  const card = cards[index];
  
  console.log('Rating card:', rating);
  
  // Map rating to SM2 values
  let ratingValue;
  switch(rating) {
    case 'again': ratingValue = SM2.RATING.AGAIN; break;
    case 'hard': ratingValue = SM2.RATING.HARD; break;
    case 'good': ratingValue = SM2.RATING.GOOD; break;
    case 'easy': ratingValue = SM2.RATING.EASY; break;
    default: ratingValue = SM2.RATING.AGAIN;
  }
  
  // Apply SM2 algorithm
  const updatedCard = applySM2Algorithm(card, ratingValue);
  
  // Update card in user data
  updateCardInUserData(updatedCard);
  
  // Move to next card
  appState.studySession.currentCardIndex++;
  showCurrentCard();
}

// Apply SuperMemo 2 algorithm
function applySM2Algorithm(card, rating) {
  let { ef, interval, repetitions, state } = card;
  
  // Calculate new easiness factor
  ef = Math.max(
    SM2.MIN_EF, 
    ef + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );
  
  // Calculate new interval
  let newInterval;
  
  if (rating < SM2.RATING.GOOD) {
    // If rating is "again" or "hard"
    repetitions = 0;
    newInterval = rating === SM2.RATING.AGAIN ? SM2.INTERVALS.AGAIN : SM2.INTERVALS.HARD;
    state = SM2.STATES.LEARNING;
  } else {
    // If rating is "good" or "easy"
    repetitions++;
    
    if (repetitions === 1) {
      newInterval = rating === SM2.RATING.EASY ? SM2.INTERVALS.EASY : SM2.INTERVALS.GOOD;
    } else if (repetitions === 2) {
      newInterval = rating === SM2.RATING.EASY ? SM2.INTERVALS.EASY : SM2.INTERVALS.GOOD * 2;
    } else {
      newInterval = interval * ef;
      if (rating === SM2.RATING.EASY) {
        newInterval *= 1.3;
      }
    }
    
    state = SM2.STATES.REVIEW;
  }
  
  // Calculate next review date
  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + Math.round(newInterval));
  
  return {
    ...card,
    ef,
    interval: newInterval,
    repetitions,
    state,
    lastReview: now,
    nextReview
  };
}

// Update card in user data
function updateCardInUserData(card) {
  const userData = getUserData();
  if (!userData) return;
  
  const area = appState.areas.find(a => a.id === card.areaId);
  if (!area) return;
  
  // Update card state
  userData.cardStates[card.id] = {
    ef: card.ef,
    interval: card.interval,
    repetitions: card.repetitions,
    state: card.state,
    lastReview: card.lastReview,
    nextReview: card.nextReview,
    areaId: card.areaId
  };
  
  // Update area progress
  if (!userData.areaProgress[card.areaId]) {
    userData.areaProgress[card.areaId] = {
      totalCards: area.flashcards.length,
      studied: 0,
      learning: 0,
      review: 0,
      completed: 0,
      lastStudied: new Date()
    };
  }
  
  // Count cards by state
  let studied = 0;
  let learning = 0;
  let review = 0;
  
  Object.entries(userData.cardStates).forEach(([cardId, state]) => {
    if (state.areaId === card.areaId) {
      if (state.lastReview) {
        studied++;
        
        if (state.state === SM2.STATES.LEARNING) {
          learning++;
        } else if (state.state === SM2.STATES.REVIEW) {
          review++;
        }
      }
    }
  });
  
  // Update area progress
  userData.areaProgress[card.areaId] = {
    ...userData.areaProgress[card.areaId],
    studied,
    learning,
    review,
    lastStudied: new Date()
  };
  
  // Update user data
  saveUserData(userData);
}

// End study session
function endStudySession() {
  console.log('Ending study session');
  
  // Clear timer
  if (appState.studySession.timerInterval) {
    clearInterval(appState.studySession.timerInterval);
  }
  
  // Save session data
  const userData = getUserData();
  if (userData) {
    const sessionData = {
      date: new Date(),
      duration: appState.studySession.elapsedTime,
      cardsStudied: appState.studySession.currentCardIndex,
      areas: appState.studySession.selectedAreas
    };
    
    userData.sessions.push(sessionData);
    userData.lastSession = sessionData;
    
    saveUserData(userData);
  }
  
  // Return to dashboard
  if (appState.currentUser && appState.currentUser.role === 'Amministratore') {
    showScreen('admin-dashboard');
  } else {
    showScreen('student-dashboard');
  }
}

// Show statistics modal
function showStatsModal() {
  const modal = document.getElementById('stats-modal');
  if (!modal) return;
  
  modal.classList.add('active');
  
  // Update modal statistics
  updateModalStats();
}

// Hide statistics modal
function hideStatsModal() {
  const modal = document.getElementById('stats-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Update modal statistics
function updateModalStats() {
  const userData = getUserData();
  if (!userData) return;
  
  // Update general stats
  let totalCards = 0;
  let studiedCards = 0;
  let totalSessions = userData.sessions ? userData.sessions.length : 0;
  let totalTime = 0;
  
  // Calculate totals
  Object.values(userData.areaProgress).forEach(area => {
    totalCards += area.totalCards || 0;
    studiedCards += area.studied || 0;
  });
  
  // Calculate total study time
  if (userData.sessions) {
    userData.sessions.forEach(session => {
      totalTime += session.duration || 0;
    });
  }
  
  // Format time
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);
  
  // Update modal elements
  const totalCardsEl = document.getElementById('modal-total-cards');
  const studiedCardsEl = document.getElementById('modal-studied-cards');
  const sessionsEl = document.getElementById('modal-sessions');
  const totalTimeEl = document.getElementById('modal-total-time');
  
  if (totalCardsEl) totalCardsEl.textContent = totalCards;
  if (studiedCardsEl) studiedCardsEl.textContent = studiedCards;
  if (sessionsEl) sessionsEl.textContent = totalSessions;
  if (totalTimeEl) totalTimeEl.textContent = `${hours}h ${minutes}m`;
  
  // Update area stats
  const areaStatsContainer = document.getElementById('modal-area-stats');
  if (!areaStatsContainer) return;
  
  areaStatsContainer.innerHTML = '';
  
  appState.areas.forEach(area => {
    const areaProgress = userData.areaProgress[area.id];
    if (!areaProgress) return;
    
    const percentage = Math.round((areaProgress.studied / areaProgress.totalCards) * 100);
    
    const areaStatEl = document.createElement('div');
    areaStatEl.className = 'area-stat-item';
    areaStatEl.innerHTML = `
      <span>${area.name}</span>
      <span>${percentage}% (${areaProgress.studied}/${areaProgress.totalCards})</span>
    `;
    
    areaStatsContainer.appendChild(areaStatEl);
  });
}

// Export stats as CSV
function exportStats() {
  const userData = getUserData();
  if (!userData) return;
  
  // Prepare CSV data
  let csvContent = 'Area,Totale Carte,Studiate,In Apprendimento,In Ripasso,Completamento(%)\n';
  
  appState.areas.forEach(area => {
    const areaProgress = userData.areaProgress[area.id];
    if (!areaProgress) return;
    
    const percentage = Math.round((areaProgress.studied / areaProgress.totalCards) * 100);
    
    csvContent += `${area.name},${areaProgress.totalCards},${areaProgress.studied},${areaProgress.learning},${areaProgress.review},${percentage}\n`;
  });
  
  // Add session data
  csvContent += '\nData,Durata,Carte Studiate\n';
  
  if (userData.sessions) {
    userData.sessions.forEach(session => {
      if (!session.date) return;
      
      const date = new Date(session.date).toLocaleDateString('it-IT');
      const duration = session.duration || 0;
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      
      csvContent += `${date},${minutes}m ${seconds}s,${session.cardsStudied}\n`;
    });
  }
  
  // Create download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `statistiche_${appState.currentUser.name}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}

// Get user data from localStorage
function getUserData() {
  if (!appState.currentUser) return null;
  
  const userDataKey = `rmp_data_${appState.currentUser.id}`;
  const dataStr = localStorage.getItem(userDataKey);
  
  if (!dataStr) {
    // Initialize new user data
    return {
      userId: appState.currentUser.id,
      sessions: [],
      lastSession: null,
      areaProgress: {},
      cardStates: {}
    };
  }
  
  try {
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {
      userId: appState.currentUser.id,
      sessions: [],
      lastSession: null,
      areaProgress: {},
      cardStates: {}
    };
  }
}

// Get specific user data (for admin)
function getSpecificUserData(userId) {
  const userDataKey = `rmp_data_${userId}`;
  const dataStr = localStorage.getItem(userDataKey);
  
  if (!dataStr) {
    return {
      userId: userId,
      sessions: [],
      lastSession: null,
      areaProgress: {},
      cardStates: {}
    };
  }
  
  try {
    return JSON.parse(dataStr);
  } catch (error) {
    console.error(`Error parsing data for user ${userId}:`, error);
    return {
      userId: userId,
      sessions: [],
      lastSession: null,
      areaProgress: {},
      cardStates: {}
    };
  }
}

// Save user data to localStorage
function saveUserData(userData) {
  if (!appState.currentUser) return;
  
  const userDataKey = `rmp_data_${appState.currentUser.id}`;
  localStorage.setItem(userDataKey, JSON.stringify(userData));
}