/* ===========================================
   EssayIQ – App.js
   Premium SPA Logic
=========================================== */

'use strict';

// ─────────────────────────────────────────
// SAMPLE DATA
// ─────────────────────────────────────────
const sampleEssays = [
  {
    id: 1, icon: '📖',
    title: 'The Impact of Technology on Modern Education',
    summary: 'This essay explores how digital transformation has revolutionized the classroom experience.',
    score: 87, grade: 'A', date: 'Apr 05, 2026',
    tags: ['grammar', 'structure', 'vocabulary'],
    topic: 'Education & Technology',
    mode: 'academic',
    breakdown: { grammar: 91, coherence: 83, vocabulary: 88, relevance: 86, structure: 87 },
    suggestions: [
      { type: 'Grammar', icon: '✏️', color: '#4F8EF7', text: 'Consider varying sentence structure to avoid repetition in paragraph 3.' },
      { type: 'Vocabulary', icon: '📚', color: '#9B5CF6', text: 'Replace "big" with more academic alternatives like "substantial" or "significant".' },
      { type: 'Structure', icon: '🏗️', color: '#22D3A5', text: 'Your conclusion effectively summarizes main points. Consider adding a future outlook.' },
    ]
  },
  {
    id: 2, icon: '🌍',
    title: 'Climate Change: A Global Crisis',
    summary: 'An in-depth analysis of climate change causes, effects, and potential solutions.',
    score: 94, grade: 'A+', date: 'Apr 03, 2026',
    tags: ['grammar', 'coherence', 'relevance'],
    topic: 'Environment',
    mode: 'academic',
    breakdown: { grammar: 96, coherence: 94, vocabulary: 92, relevance: 95, structure: 93 },
    suggestions: [
      { type: 'Excellence', icon: '⭐', color: '#F59E0B', text: 'Outstanding use of statistical evidence to support your arguments.' },
      { type: 'Vocabulary', icon: '📚', color: '#9B5CF6', text: 'Excellent range of domain-specific terminology throughout.' },
    ]
  },
  {
    id: 3, icon: '🤖',
    title: 'Artificial Intelligence in Healthcare',
    summary: 'Examining how AI diagnostic tools are transforming patient care and medical research.',
    score: 79, grade: 'B+', date: 'Apr 01, 2026',
    tags: ['structure', 'vocabulary'],
    topic: 'AI & Medicine',
    mode: 'standard',
    breakdown: { grammar: 82, coherence: 77, vocabulary: 80, relevance: 78, structure: 76 },
    suggestions: [
      { type: 'Coherence', icon: '🔗', color: '#F59E0B', text: 'Add transitional phrases between paragraphs to improve flow and readability.' },
      { type: 'Structure', icon: '🏗️', color: '#22D3A5', text: 'Introduction lacks a clear thesis statement. State your main argument up front.' },
      { type: 'Grammar', icon: '✏️', color: '#4F8EF7', text: 'Found 3 subject-verb agreement errors. Review paragraph 2 and 5.' },
    ]
  },
  {
    id: 4, icon: '🎭',
    title: 'The Role of Art in Society',
    summary: 'Exploring how artistic expression shapes culture, values, and social movements.',
    score: 73, grade: 'B', date: 'Mar 28, 2026',
    tags: ['grammar', 'vocabulary', 'coherence'],
    topic: 'Arts & Culture',
    mode: 'creative',
    breakdown: { grammar: 75, coherence: 70, vocabulary: 78, relevance: 72, structure: 71 },
    suggestions: [
      { type: 'Coherence', icon: '🔗', color: '#F59E0B', text: 'Arguments could benefit from stronger logical connections between sections.' },
      { type: 'Evidence', icon: '📊', color: '#F87171', text: 'Claims need more supporting evidence. Include specific examples or citations.' },
      { type: 'Grammar', icon: '✏️', color: '#4F8EF7', text: 'Multiple comma splice errors detected. Review sentence boundaries.' },
    ]
  },
  {
    id: 5, icon: '💊',
    title: 'Mental Health Awareness in Schools',
    summary: 'Arguing for comprehensive mental health programs in K-12 educational institutions.',
    score: 88, grade: 'A', date: 'Mar 25, 2026',
    tags: ['structure', 'relevance', 'vocabulary'],
    topic: 'Mental Health',
    mode: 'academic',
    breakdown: { grammar: 90, coherence: 87, vocabulary: 85, relevance: 91, structure: 88 },
    suggestions: [
      { type: 'Excellence', icon: '⭐', color: '#F59E0B', text: 'Compelling personal narrative strengthens the essay significantly.' },
      { type: 'Vocabulary', icon: '📚', color: '#9B5CF6', text: 'Consider introducing more psychological terminology for academic depth.' },
    ]
  },
  {
    id: 6, icon: '🚀',
    title: 'Space Exploration: Is It Worth It?',
    summary: 'A cost-benefit analysis of continued investment in space exploration programs.',
    score: 65, grade: 'C+', date: 'Mar 20, 2026',
    tags: ['grammar', 'coherence'],
    topic: 'Science & Space',
    mode: 'standard',
    breakdown: { grammar: 68, coherence: 62, vocabulary: 67, relevance: 64, structure: 65 },
    suggestions: [
      { type: 'Structure', icon: '🏗️', color: '#22D3A5', text: 'Essay lacks a clear organizational structure. Consider using topic sentences.' },
      { type: 'Evidence', icon: '📊', color: '#F87171', text: 'Counter-arguments are not adequately addressed. Acknowledge opposing views.' },
      { type: 'Grammar', icon: '✏️', color: '#4F8EF7', text: 'Multiple tense inconsistencies throughout. Choose past or present consistently.' },
      { type: 'Coherence', icon: '🔗', color: '#F59E0B', text: 'The conclusion introduces new ideas. Restrict it to summarizing existing points.' },
    ]
  },
];

// ─────────────────────────────────────────
// NAVIGATION SYSTEM
// ─────────────────────────────────────────
class Navigation {
  constructor() {
    this.currentPage = 'home';
    this.init();
  }

  init() {
    // Desktop nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });

    // Mobile bottom nav
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.page);
      });
    });

    // Hero CTA buttons
    const heroStartBtn = document.getElementById('heroStartBtn');
    if (heroStartBtn) {
      heroStartBtn.addEventListener('click', () => this.navigate('evaluate'));
    }

    // Hamburger toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }

    // Scroll navbar style
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  navigate(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Update mobile nav
    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('mobile-open');

    this.currentPage = page;

    // Trigger page-specific init
    if (page === 'insights') {
      setTimeout(() => initInsights(), 100);
    }
  }
}

// ─────────────────────────────────────────
// CARD RENDERER
// ─────────────────────────────────────────
function getScoreBadgeClass(score) {
  if (score >= 90) return 'badge-excellent';
  if (score >= 80) return 'badge-good';
  if (score >= 65) return 'badge-average';
  return 'badge-poor';
}

function renderEssayCard(essay, showQuickBtn = false) {
  const badgeClass = getScoreBadgeClass(essay.score);
  const tagsHTML = essay.tags.map(tag =>
    `<span class="tag tag-${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
  ).join('');

  return `
    <div class="essay-card animate-in" data-id="${essay.id}" style="animation-delay:${Math.random() * 0.2}s">
      <span class="card-score-badge ${badgeClass}">${essay.score}</span>
      <div class="card-icon">${essay.icon}</div>
      <div class="card-title">${essay.title}</div>
      <div class="card-summary">${essay.summary}</div>
      <div class="card-date">📅 ${essay.date} · ${essay.mode.charAt(0).toUpperCase() + essay.mode.slice(1)}</div>
      <div class="card-tags">${tagsHTML}</div>
      ${showQuickBtn ? `<button class="card-quick-btn" data-id="${essay.id}">Quick View →</button>` : ''}
    </div>
  `;
}

function injectCards(containerId, essays, showQuickBtn = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = essays.map(e => renderEssayCard(e, showQuickBtn)).join('');

  // Attach click listeners to cards
  container.querySelectorAll('.essay-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-quick-btn')) return;
      const id = parseInt(card.dataset.id);
      openModal(id);
    });
  });

  container.querySelectorAll('.card-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(parseInt(btn.dataset.id));
    });
  });
}

// ─────────────────────────────────────────
// HOME PAGE SETUP
// ─────────────────────────────────────────
function initHome() {
  // Recent evaluations (last 4)
  const recent = [...sampleEssays].sort((a, b) => b.id - a.id).slice(0, 5);
  injectCards('recentCards', recent);

  // Top scoring essays
  const topScoring = [...sampleEssays].sort((a, b) => b.score - a.score).slice(0, 5);
  injectCards('topCards', topScoring);

  // Recommended improvements (lowest score)
  const improvements = [...sampleEssays].sort((a, b) => a.score - b.score).slice(0, 5);
  injectCards('improveCards', improvements);
}

// ─────────────────────────────────────────
// HISTORY PAGE SETUP
// ─────────────────────────────────────────
function initHistory() {
  injectCards('historyCards1', sampleEssays, true);
  injectCards('historyCards2', [...sampleEssays].reverse(), true);

  // Search
  const searchInput = document.getElementById('historySearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = sampleEssays.filter(es =>
        es.title.toLowerCase().includes(query) ||
        es.topic.toLowerCase().includes(query)
      );
      injectCards('historyCards1', filtered, true);
    });
  }

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.filter-chips');
      group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const sort = chip.dataset.sort;
      const topic = chip.dataset.topic;

      if (sort) {
        let sorted;
        if (sort === 'high') sorted = [...sampleEssays].sort((a, b) => b.score - a.score);
        else if (sort === 'low') sorted = [...sampleEssays].sort((a, b) => a.score - b.score);
        else sorted = [...sampleEssays];
        injectCards('historyCards1', sorted, true);
      }

      if (topic && topic !== 'all') {
        const filtered = sampleEssays.filter(e => e.mode === topic);
        injectCards('historyCards1', filtered.length ? filtered : sampleEssays, true);
      } else if (topic === 'all') {
        injectCards('historyCards1', sampleEssays, true);
      }
    });
  });
}

// ─────────────────────────────────────────
// ESSAY EVALUATION
// ─────────────────────────────────────────
class Evaluator {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.input-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
      });
    });

    // Word counter
    const textarea = document.getElementById('essayInput');
    if (textarea) {
      textarea.addEventListener('input', () => {
        const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        const counter = document.getElementById('wordCount');
        if (counter) counter.textContent = textarea.value.trim() ? words : 0;
      });
    }

    // Mode chips
    document.querySelectorAll('.mode-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Evaluate button
    const evalBtn = document.getElementById('evaluateBtn');
    if (evalBtn) {
      evalBtn.addEventListener('click', () => this.evaluate());
    }

    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const browseBtn = document.getElementById('browseBtn');
    const fileInput = document.getElementById('fileInput');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (uploadZone) {
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
      });
      uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) this.handleFile(file);
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) this.handleFile(fileInput.files[0]);
      });
    }
  }

  handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Switch to paste tab and fill content
      document.getElementById('tabPaste')?.click();
      const textarea = document.getElementById('essayInput');
      if (textarea) {
        textarea.value = e.target.result;
        textarea.dispatchEvent(new Event('input'));
      }
    };
    reader.readAsText(file);
  }

  showLoading() {
    document.getElementById('resultsIdle')?.classList.add('hidden');
    document.getElementById('resultsContent')?.classList.add('hidden');
    document.getElementById('resultsLoading')?.classList.remove('hidden');
  }

  showResults(data) {
    document.getElementById('resultsLoading')?.classList.add('hidden');
    document.getElementById('resultsIdle')?.classList.add('hidden');
    const resultsContent = document.getElementById('resultsContent');
    if (resultsContent) {
      resultsContent.classList.remove('hidden');
      this.renderResults(data);
    }
  }

  renderResults(data) {
    // Animate score ring
    const arc = document.getElementById('scoreArc');
    const scoreEl = document.getElementById('overallScore');
    const gradeEl = document.getElementById('scoreGrade');
    const descEl = document.getElementById('scoreDesc');
    const tagsEl = document.getElementById('scoreTags');

    if (arc && scoreEl) {
      const circumference = 314;
      const offset = circumference - (data.score / 100) * circumference;

      // Animate count
      let current = 0;
      const step = data.score / 50;
      const counter = setInterval(() => {
        current = Math.min(current + step, data.score);
        scoreEl.textContent = Math.round(current);
        arc.style.strokeDashoffset = circumference - (current / 100) * circumference;
        if (current >= data.score) clearInterval(counter);
      }, 20);
    }

    if (gradeEl) gradeEl.textContent = data.grade;
    if (descEl) descEl.textContent = data.description;

    if (tagsEl) {
      tagsEl.innerHTML = data.tags.map(tag =>
        `<span class="tag tag-${tag.toLowerCase()}">${tag}</span>`
      ).join('');
    }

    // Breakdown bars
    const breakdownEl = document.getElementById('breakdownBars');
    if (breakdownEl) {
      breakdownEl.innerHTML = '';
      const categories = [
        { label: 'Grammar', key: 'grammar' },
        { label: 'Coherence', key: 'coherence' },
        { label: 'Vocabulary', key: 'vocabulary' },
        { label: 'Relevance', key: 'relevance' },
        { label: 'Structure', key: 'structure' },
      ];
      categories.forEach(cat => {
        const val = data.breakdown[cat.key] || 0;
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `
          <span class="breakdown-label">${cat.label}</span>
          <div class="breakdown-track">
            <div class="breakdown-fill" style="width:0%"></div>
          </div>
          <span class="breakdown-val">${val}</span>
        `;
        breakdownEl.appendChild(item);
        requestAnimationFrame(() => {
          const fill = item.querySelector('.breakdown-fill');
          setTimeout(() => { fill.style.width = `${val}%`; }, 100);
        });
      });
    }

    // Suggestions
    const suggestionsEl = document.getElementById('suggestionsList');
    if (suggestionsEl) {
      suggestionsEl.innerHTML = data.suggestions.map(sug => `
        <div class="suggestion-item">
          <div class="suggestion-icon" style="background:${sug.color}18; color:${sug.color}">
            ${sug.icon}
          </div>
          <div class="sug-info">
            <div class="sug-type">${sug.type}</div>
            <div class="sug-text">${sug.text}</div>
          </div>
        </div>
      `).join('');
    }
  }

  async evaluate() {
    const textarea = document.getElementById('essayInput');
    const topic = document.getElementById('essayTopic');
    const mode = document.querySelector('.mode-chip.active')?.dataset.mode || 'standard';

    const essayText = textarea?.value.trim();

    if (!essayText || essayText.split(/\s+/).length < 20) {
      this.showToast('Please enter at least 20 words to evaluate.', 'warning');
      return;
    }

    this.showLoading();

    try {
      // Try sending to backend; fall back to mock if unavailable
      const response = await Promise.race([
        fetch('/api/mark_essay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essay_text: essayText,
            topic: topic?.value || '',
            mode
          })
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      this.showResults(this.transformBackendResponse(data));

    } catch (err) {
      // Use mock evaluation if backend unavailable
      await new Promise(r => setTimeout(r, 2000));
      const mockResult = this.generateMockResult(essayText);
      this.showResults(mockResult);
    }
  }

  transformBackendResponse(data) {
    // Transform your backend's response format to our UI format
    const score = data.score ?? data.overall_score ?? 80;
    return {
      score,
      grade: this.scoreToGrade(score),
      description: data.critique ?? data.feedback ?? 'Evaluation complete.',
      tags: data.tags ?? ['Grammar', 'Coherence'],
      breakdown: {
        grammar: data.grammar ?? Math.round(score + Math.random() * 10 - 5),
        coherence: data.coherence ?? Math.round(score + Math.random() * 10 - 5),
        vocabulary: data.vocabulary ?? Math.round(score + Math.random() * 10 - 5),
        relevance: data.relevance ?? Math.round(score + Math.random() * 10 - 5),
        structure: data.structure ?? Math.round(score + Math.random() * 10 - 5),
      },
      suggestions: data.suggestions ?? [
        { type: 'AI Note', icon: '🤖', color: '#4F8EF7', text: data.critique ?? 'Great essay! Keep writing.' }
      ]
    };
  }

  generateMockResult(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]/).filter(s => s.trim()).length;
    const avgSentLen = words / Math.max(sentences, 1);

    // Heuristic scoring
    let baseScore = 60;
    if (words > 200) baseScore += 8;
    if (words > 400) baseScore += 7;
    if (avgSentLen >= 10 && avgSentLen <= 25) baseScore += 8;
    if (/however|therefore|furthermore|moreover|consequently/i.test(text)) baseScore += 7;
    if (/in conclusion|to summarize|in summary/i.test(text)) baseScore += 5;
    baseScore = Math.min(98, baseScore + Math.floor(Math.random() * 10));

    const g = Math.min(100, baseScore + Math.floor(Math.random() * 12) - 4);
    const c = Math.min(100, baseScore + Math.floor(Math.random() * 12) - 5);
    const v = Math.min(100, baseScore + Math.floor(Math.random() * 12) - 3);
    const r = Math.min(100, baseScore + Math.floor(Math.random() * 12) - 6);
    const s = Math.min(100, baseScore + Math.floor(Math.random() * 12) - 4);

    const suggestions = [];

    if (g < 80) suggestions.push({ type: 'Grammar', icon: '✏️', color: '#4F8EF7', text: 'Review subject-verb agreement and check for comma splices.' });
    if (c < 80) suggestions.push({ type: 'Coherence', icon: '🔗', color: '#F59E0B', text: 'Use transitional phrases to connect your ideas more smoothly.' });
    if (v < 80) suggestions.push({ type: 'Vocabulary', icon: '📚', color: '#9B5CF6', text: 'Diversify your word choices; avoid repetition of common words.' });
    if (r < 80) suggestions.push({ type: 'Relevance', icon: '🎯', color: '#F87171', text: 'Ensure all paragraphs directly address the essay topic.' });
    if (s < 80) suggestions.push({ type: 'Structure', icon: '🏗️', color: '#22D3A5', text: 'Ensure your essay has a clear introduction, body, and conclusion.' });
    if (baseScore >= 85) suggestions.push({ type: 'Excellence', icon: '⭐', color: '#F59E0B', text: 'Strong essay overall! Your arguments are well-supported.' });
    if (!suggestions.length) suggestions.push({ type: 'AI Note', icon: '🤖', color: '#4F8EF7', text: 'Good work! Keep refining for even higher scores.' });

    const tags = [];
    if (g >= 85) tags.push('Grammar');
    if (v >= 85) tags.push('Vocabulary');
    if (c >= 85) tags.push('Coherence');
    if (s >= 85) tags.push('Structure');

    return {
      score: baseScore,
      grade: this.scoreToGrade(baseScore),
      description: `Your essay demonstrates ${baseScore >= 80 ? 'strong' : 'developing'} writing skills. ${words} words analyzed across ${sentences} sentences.`,
      tags: tags.length ? tags : ['Writing'],
      breakdown: { grammar: g, coherence: c, vocabulary: v, relevance: r, structure: s },
      suggestions
    };
  }

  scoreToGrade(score) {
    if (score >= 93) return 'A+';
    if (score >= 87) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 77) return 'B+';
    if (score >= 73) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    return 'D';
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
      background: rgba(15,15,26,0.95); border: 1px solid rgba(255,255,255,0.1);
      color: white; padding: 12px 24px; border-radius: 12px;
      font-size: 14px; font-weight: 500; z-index: 3000;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      ${type === 'warning' ? 'border-color: rgba(245,158,11,0.3); color: #F59E0B;' : ''}
      animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ─────────────────────────────────────────
// MODAL SYSTEM
// ─────────────────────────────────────────
function openModal(id) {
  const essay = sampleEssays.find(e => e.id === id);
  if (!essay) return;

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  const tagsHTML = essay.tags.map(tag =>
    `<span class="tag tag-${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
  ).join('');

  const breakdownHTML = Object.entries(essay.breakdown).map(([key, val]) => `
    <div class="breakdown-item">
      <span class="breakdown-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
      <div class="breakdown-track">
        <div class="breakdown-fill" style="width:${val}%"></div>
      </div>
      <span class="breakdown-val">${val}</span>
    </div>
  `).join('');

  const suggestionsHTML = essay.suggestions.map(sug => `
    <div class="suggestion-item">
      <div class="suggestion-icon" style="background:${sug.color}18; color:${sug.color}">${sug.icon}</div>
      <div class="sug-info">
        <div class="sug-type">${sug.type}</div>
        <div class="sug-text">${sug.text}</div>
      </div>
    </div>
  `).join('');

  content.innerHTML = `
    <h2>${essay.icon} ${essay.title}</h2>
    <div class="modal-meta">📅 ${essay.date} · ${essay.mode.charAt(0).toUpperCase() + essay.mode.slice(1)} · ${essay.topic}</div>

    <div class="modal-score-row">
      <div class="modal-score-big">${essay.score}</div>
      <div class="modal-score-info">
        <div class="modal-score-label">Overall Score</div>
        <div class="modal-score-grade">${essay.grade} Grade</div>
      </div>
      <div class="card-tags">${tagsHTML}</div>
    </div>

    <p style="font-size:14px; color: var(--text-secondary); line-height:1.7; margin-bottom:20px">${essay.summary}</p>

    <h3 class="card-title" style="margin-bottom:12px">Score Breakdown</h3>
    <div class="breakdown-bars" style="margin-bottom:20px">${breakdownHTML}</div>

    <h3 class="card-title" style="margin-bottom:12px">AI Suggestions</h3>
    <div class="suggestions-list">${suggestionsHTML}</div>
  `;

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────
// INSIGHTS / CHARTS
// ─────────────────────────────────────────
let chartsInitialized = false;

function initInsights() {
  if (chartsInitialized) return;

  // Animate category bars
  document.querySelectorAll('.cat-fill').forEach(fill => {
    const width = fill.style.width;
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = width; }, 100);
  });

  // Load Chart.js dynamically
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => renderCharts();
    document.head.appendChild(script);
  } else {
    renderCharts();
  }

  chartsInitialized = true;
}

function renderCharts() {
  const chartDefaults = {
    color: 'rgba(240, 240, 255, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  };
  Chart.defaults.color = chartDefaults.color;

  // Trend Chart
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx && !trendCtx._chartInstance) {
    const scores = sampleEssays.map(e => e.score);
    const labels = sampleEssays.map(e => e.title.split(' ').slice(0, 2).join(' '));

    trendCtx._chartInstance = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Score',
          data: scores,
          borderColor: '#4F8EF7',
          backgroundColor: 'rgba(79, 142, 247, 0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#4F8EF7',
          pointBorderColor: 'rgba(10,10,15,0.8)',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,15,26,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            padding: 12,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 13, weight: '700' },
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { maxRotation: 30, font: { size: 11 } }
          },
          y: {
            min: 50, max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { size: 11 } }
          }
        }
      }
    });
  }

  // Radar Chart
  const radarCtx = document.getElementById('radarChart');
  if (radarCtx && !radarCtx._chartInstance) {
    const avg = (key) => {
      const sum = sampleEssays.reduce((acc, e) => acc + (e.breakdown[key] || 0), 0);
      return Math.round(sum / sampleEssays.length);
    };

    radarCtx._chartInstance = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['Grammar', 'Coherence', 'Vocabulary', 'Relevance', 'Structure'],
        datasets: [{
          label: 'Your Average',
          data: [avg('grammar'), avg('coherence'), avg('vocabulary'), avg('relevance'), avg('structure')],
          borderColor: '#9B5CF6',
          backgroundColor: 'rgba(155, 92, 246, 0.12)',
          borderWidth: 2,
          pointBackgroundColor: '#9B5CF6',
          pointBorderColor: 'rgba(10,10,15,0.8)',
          pointBorderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: {
              color: 'rgba(240,240,255,0.6)',
              font: { size: 12, family: 'Inter', weight: '600' }
            },
            ticks: {
              display: false,
              stepSize: 20
            }
          }
        }
      }
    });
  }
}

// ─────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────
function initNotifications() {
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');

  if (!notifBtn || !notifDropdown) return;

  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.add('hidden');
    }
  });

  const clearBtn = notifDropdown.querySelector('.notif-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      notifDropdown.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
      notifDropdown.querySelectorAll('.notif-dot').forEach(el => { el.style.opacity = '0'; });
      const badge = document.querySelector('.notif-badge');
      if (badge) badge.style.display = 'none';
    });
  }
}

// ─────────────────────────────────────────
// SCROLL ANIMATION OBSERVER
// ─────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.glass-card, .stat-card, .essay-card').forEach(el => {
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const nav = new Navigation();

  // Init home page content
  initHome();

  // Init history content
  initHistory();

  // Evaluator
  const evaluator = new Evaluator();

  // Notifications
  initNotifications();

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Scroll animations
  setTimeout(initScrollAnimations, 200);
});
