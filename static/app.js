/* ===========================================
   EssayIQ – App.js
   Live MongoDB-powered SPA Logic
=========================================== */

'use strict';

// ─────────────────────────────────────────
// API CLIENT
// ─────────────────────────────────────────
const API = {
  async getEssays() {
    const res = await fetch('/api/essays');
    if (!res.ok) throw new Error('Failed to load essays');
    return res.json();
  },

  async getEssay(id) {
    const res = await fetch(`/api/essay/${id}`);
    if (!res.ok) throw new Error('Essay not found');
    return res.json();
  },

  async markEssay(payload) {
    const res = await fetch('/api/mark_essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Server error');
    }
    return res.json();
  },
};

// In-memory cache shared across pages so we only fetch once per session
// unless an essay is added (then we invalidate)
let essaysCache = null;

async function getEssaysCached(forceRefresh = false) {
  if (!forceRefresh && essaysCache !== null) return essaysCache;
  try {
    essaysCache = await API.getEssays();
  } catch {
    essaysCache = [];
  }
  return essaysCache;
}

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

    // Hero CTA button
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
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    document.querySelectorAll('.mob-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === page);
    });

    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('mobile-open');

    this.currentPage = page;

    if (page === 'insights') {
      setTimeout(() => initInsights(), 100);
    }
    if (page === 'history') {
      initHistory();
    }
    if (page === 'home') {
      initHome();
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
  const id = essay._id;           // always a MongoDB string id
  const icon = essay.icon || '📝';
  const mode = essay.mode || 'standard';
  const tags = (essay.tags || []);
  const tagsHTML = tags.map(tag =>
    `<span class="tag tag-${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
  ).join('');

  return `
    <div class="essay-card animate-in" data-id="${id}" style="animation-delay:${Math.random() * 0.2}s">
      <span class="card-score-badge ${badgeClass}">${essay.score}</span>
      <div class="card-icon">${icon}</div>
      <div class="card-title">${essay.title}</div>
      <div class="card-summary">${essay.summary || ''}</div>
      <div class="card-date">📅 ${essay.date} · ${mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
      <div class="card-tags">${tagsHTML}</div>
      ${showQuickBtn ? `<button class="card-quick-btn" data-id="${id}">Quick View →</button>` : ''}
    </div>
  `;
}

function injectCards(containerId, essays, showQuickBtn = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!essays || essays.length === 0) {
    container.innerHTML = `
      <div style="color:var(--text-secondary); padding: 24px; text-align:center; width:100%;">
        No essays found. Start by evaluating an essay!
      </div>`;
    return;
  }

  container.innerHTML = essays.map(e => renderEssayCard(e, showQuickBtn)).join('');

  container.querySelectorAll('.essay-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-quick-btn')) return;
      openModal(card.dataset.id);
    });
  });

  container.querySelectorAll('.card-quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    });
  });
}

// ─────────────────────────────────────────
// HOME PAGE SETUP
// ─────────────────────────────────────────
async function initHome() {
  const essays = await getEssaysCached();

  // Recent (already sorted newest-first by the API)
  const recent = essays.slice(0, 5);
  injectCards('recentCards', recent);

  // Top scoring
  const topScoring = [...essays].sort((a, b) => b.score - a.score).slice(0, 5);
  injectCards('topCards', topScoring);

  // Recommended improvements (lowest score)
  const improvements = [...essays].sort((a, b) => a.score - b.score).slice(0, 5);
  injectCards('improveCards', improvements);
}

// ─────────────────────────────────────────
// HISTORY PAGE SETUP
// ─────────────────────────────────────────
let historyEssays = [];   // local mutable copy for filtering

async function initHistory() {
  try {
    historyEssays = await getEssaysCached();
  } catch {
    historyEssays = [];
  }
  renderHistoryCards(historyEssays);

  // Also populate "Recently Evaluated" row (last 5 by date)
  injectCards('historyCards2', historyEssays.slice(0, 5), true);

  // Search
  const searchInput = document.getElementById('historySearch');
  if (searchInput) {
    // Remove old listener by replacing the node
    const newSearch = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearch, searchInput);
    newSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = historyEssays.filter(es =>
        (es.title || '').toLowerCase().includes(query) ||
        (es.topic || '').toLowerCase().includes(query)
      );
      renderHistoryCards(filtered);
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
        if (sort === 'high') sorted = [...historyEssays].sort((a, b) => b.score - a.score);
        else if (sort === 'low') sorted = [...historyEssays].sort((a, b) => a.score - b.score);
        else sorted = [...historyEssays];
        renderHistoryCards(sorted);
      }

      if (topic && topic !== 'all') {
        const filtered = historyEssays.filter(e => e.mode === topic);
        renderHistoryCards(filtered.length ? filtered : historyEssays);
      } else if (topic === 'all') {
        renderHistoryCards(historyEssays);
      }
    });
  });
}

function renderHistoryCards(essays) {
  injectCards('historyCards1', essays, true);
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
    const arc = document.getElementById('scoreArc');
    const scoreEl = document.getElementById('overallScore');
    const gradeEl = document.getElementById('scoreGrade');
    const descEl = document.getElementById('scoreDesc');
    const tagsEl = document.getElementById('scoreTags');

    if (arc && scoreEl) {
      const circumference = 314;
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
      const tags = data.tags || [];
      tagsEl.innerHTML = tags.map(tag =>
        `<span class="tag tag-${tag.toLowerCase()}">${tag}</span>`
      ).join('');
    }

    // Breakdown bars
    const breakdownEl = document.getElementById('breakdownBars');
    if (breakdownEl) {
      breakdownEl.innerHTML = '';
      const categories = [
        { label: 'Grammar',    key: 'grammar' },
        { label: 'Coherence',  key: 'coherence' },
        { label: 'Vocabulary', key: 'vocabulary' },
        { label: 'Relevance',  key: 'relevance' },
        { label: 'Structure',  key: 'structure' },
      ];
      const breakdown = data.breakdown || {};
      categories.forEach(cat => {
        const val = breakdown[cat.key] || 0;
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
      const suggestions = data.suggestions || [];
      suggestionsEl.innerHTML = suggestions.map(sug => `
        <div class="suggestion-item">
          <div class="suggestion-icon" style="background:${sug.color}18; color:${sug.color}">
            ${sug.icon || '💡'}
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
    const topicInput = document.getElementById('essayTopic');
    const mode = document.querySelector('.mode-chip.active')?.dataset.mode || 'standard';

    const content = textarea?.value.trim();
    const topic   = topicInput?.value.trim() || '';

    if (!content || content.split(/\s+/).length < 20) {
      this.showToast('Please enter at least 20 words to evaluate.', 'warning');
      return;
    }

    this.showLoading();

    try {
      const data = await API.markEssay({ topic, content, mode });

      // Normalise API response for the results panel
      const normalised = {
        score:       data.score,
        grade:       data.grade,
        description: data.description || '',
        tags:        data.tags || [],
        breakdown:   data.breakdown || {},
        suggestions: data.suggestions || [],
      };

      this.showResults(normalised);
      this.showToast('Essay evaluated & saved! ✅', 'success');

      // Invalidate cache so Home and History refresh on next visit
      essaysCache = null;

    } catch (err) {
      document.getElementById('resultsLoading')?.classList.add('hidden');
      document.getElementById('resultsIdle')?.classList.remove('hidden');
      this.showToast(`Error: ${err.message}`, 'error');
    }
  }

  showToast(message, type = 'info') {
    const colors = {
      warning: 'rgba(245,158,11,0.3)',
      error:   'rgba(248,113,113,0.3)',
      success: 'rgba(34,211,165,0.3)',
      info:    'rgba(255,255,255,0.1)',
    };
    const textColors = {
      warning: '#F59E0B',
      error:   '#F87171',
      success: '#22D3A5',
      info:    'white',
    };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
      background: rgba(15,15,26,0.95); border: 1px solid ${colors[type] || colors.info};
      color: ${textColors[type] || 'white'}; padding: 12px 24px; border-radius: 12px;
      font-size: 14px; font-weight: 500; z-index: 3000;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: fadeIn 0.3s ease;
      white-space: nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// ─────────────────────────────────────────
// MODAL SYSTEM
// ─────────────────────────────────────────
async function openModal(id) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  // Show a loading skeleton in the modal while we fetch
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  content.innerHTML = `
    <div style="text-align:center; padding:40px; color:var(--text-secondary);">
      <div class="loading-ring" style="margin:0 auto 16px;"></div>
      <p>Loading essay details…</p>
    </div>`;

  try {
    const essay = await API.getEssay(id);
    renderModal(essay, content);
  } catch (err) {
    content.innerHTML = `
      <div style="text-align:center; padding:40px; color:#F87171;">
        <p>⚠️ Could not load essay: ${err.message}</p>
      </div>`;
  }
}

function renderModal(essay, content) {
  const tags = (essay.tags || []);
  const tagsHTML = tags.map(tag =>
    `<span class="tag tag-${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`
  ).join('');

  const breakdown = essay.breakdown || {};
  const breakdownHTML = Object.entries(breakdown).map(([key, val]) => `
    <div class="breakdown-item">
      <span class="breakdown-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
      <div class="breakdown-track">
        <div class="breakdown-fill" style="width:${val}%"></div>
      </div>
      <span class="breakdown-val">${val}</span>
    </div>
  `).join('');

  const suggestions = essay.suggestions || [];
  const suggestionsHTML = suggestions.map(sug => `
    <div class="suggestion-item">
      <div class="suggestion-icon" style="background:${sug.color}18; color:${sug.color}">${sug.icon || '💡'}</div>
      <div class="sug-info">
        <div class="sug-type">${sug.type}</div>
        <div class="sug-text">${sug.text}</div>
      </div>
    </div>
  `).join('');

  const icon = essay.icon || '📝';
  const mode = essay.mode || 'standard';

  content.innerHTML = `
    <h2>${icon} ${essay.title}</h2>
    <div class="modal-meta">📅 ${essay.date} · ${mode.charAt(0).toUpperCase() + mode.slice(1)} · ${essay.topic || 'General'}</div>

    <div class="modal-score-row">
      <div class="modal-score-big">${essay.score}</div>
      <div class="modal-score-info">
        <div class="modal-score-label">Overall Score</div>
        <div class="modal-score-grade">${essay.grade} Grade</div>
      </div>
      <div class="card-tags">${tagsHTML}</div>
    </div>

    <p style="font-size:14px; color: var(--text-secondary); line-height:1.7; margin-bottom:20px">${essay.summary || essay.description || ''}</p>

    ${essay.content ? `
      <h3 class="card-title" style="margin-bottom:8px">Essay Content</h3>
      <div style="font-size:13px; color:var(--text-secondary); line-height:1.8; max-height:180px; overflow-y:auto;
                  background:rgba(255,255,255,0.03); border-radius:10px; padding:14px; margin-bottom:20px;
                  border:1px solid rgba(255,255,255,0.06); white-space:pre-wrap;">${essay.content}</div>
    ` : ''}

    <h3 class="card-title" style="margin-bottom:12px">Score Breakdown</h3>
    <div class="breakdown-bars" style="margin-bottom:20px">${breakdownHTML}</div>

    <h3 class="card-title" style="margin-bottom:12px">AI Suggestions</h3>
    <div class="suggestions-list">${suggestionsHTML || '<p style="color:var(--text-secondary); font-size:13px;">No suggestions available.</p>'}</div>
  `;
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────
// INSIGHTS / CHARTS
// ─────────────────────────────────────────
let chartsInitialized = false;
let insightsChartInstances = {};

async function initInsights() {
  // Always reload insights fresh so stats stay current
  chartsInitialized = false;
  Object.values(insightsChartInstances).forEach(c => { try { c.destroy(); } catch {} });
  insightsChartInstances = {};

  const essays = await getEssaysCached();

  // ── Compute stat values ────────────────────────────────────────────────
  const total = essays.length;

  const avgScore = total
    ? Math.round(essays.reduce((s, e) => s + (e.score || 0), 0) / total * 10) / 10
    : 0;

  const bestEssay = total
    ? essays.reduce((best, e) => e.score > best.score ? e : best, essays[0])
    : null;

  // Calculate improvement trend (compare first half avg to second half avg)
  let improvementText = 'N/A';
  if (total >= 2) {
    const half = Math.floor(total / 2);
    const older = essays.slice(half);  // older (API sorted newest-first)
    const newer = essays.slice(0, half);
    const olderAvg = older.reduce((s, e) => s + e.score, 0) / older.length;
    const newerAvg = newer.reduce((s, e) => s + e.score, 0) / newer.length;
    const diff = Math.round((newerAvg - olderAvg) * 10) / 10;
    improvementText = diff >= 0 ? `+${diff}%` : `${diff}%`;
  }

  // ── Update stat cards ──────────────────────────────────────────────────
  const avgEl = document.getElementById('avgScore');
  if (avgEl) avgEl.textContent = avgScore;

  const totalEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
  if (totalEl) totalEl.textContent = total;

  const improveEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
  if (improveEl) improveEl.textContent = improvementText;

  const bestEl = document.querySelector('.stat-card:nth-child(4) .stat-value');
  if (bestEl) bestEl.textContent = bestEssay ? bestEssay.score : '--';

  const bestTrend = document.querySelector('.stat-card:nth-child(4) .stat-trend');
  if (bestTrend && bestEssay) {
    bestTrend.textContent = bestEssay.title?.slice(0, 25) + (bestEssay.title?.length > 25 ? '…' : '');
  }

  // ── Category bars ──────────────────────────────────────────────────────
  if (total > 0) {
    const avgBreakdown = (key) => {
      const sum = essays.reduce((acc, e) => acc + ((e.breakdown || {})[key] || 0), 0);
      return Math.round(sum / total);
    };

    const categories = {
      Grammar:    avgBreakdown('grammar'),
      Coherence:  avgBreakdown('coherence'),
      Vocabulary: avgBreakdown('vocabulary'),
      Relevance:  avgBreakdown('relevance'),
      Structure:  avgBreakdown('structure'),
    };

    const catBars = document.getElementById('categoryBars');
    if (catBars) {
      catBars.innerHTML = Object.entries(categories).map(([label, val]) => `
        <div class="category-bar-item">
          <span class="cat-label">${label}</span>
          <div class="cat-track">
            <div class="cat-fill" style="width:0%" data-val="${val}"></div>
          </div>
          <span class="cat-val">${val}</span>
        </div>
      `).join('');

      // Animate bars
      requestAnimationFrame(() => {
        catBars.querySelectorAll('.cat-fill').forEach(fill => {
          const val = fill.dataset.val;
          setTimeout(() => { fill.style.width = `${val}%`; }, 100);
        });
      });
    }
  }

  // Load Chart.js dynamically then render
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => renderCharts(essays);
    document.head.appendChild(script);
  } else {
    renderCharts(essays);
  }

  chartsInitialized = true;
}

function renderCharts(essays) {
  Chart.defaults.color = 'rgba(240, 240, 255, 0.6)';

  // ── Trend Chart ────────────────────────────────────────────────────────
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    if (insightsChartInstances.trend) {
      insightsChartInstances.trend.destroy();
    }
    // Show last 10 essays in chronological order
    const trendEssays = [...essays].reverse().slice(-10);
    const scores = trendEssays.map(e => e.score);
    const labels = trendEssays.map(e => (e.title || '').split(' ').slice(0, 2).join(' '));

    insightsChartInstances.trend = new Chart(trendCtx, {
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
          tension: 0.4,
        }],
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
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { maxRotation: 30, font: { size: 11 } },
          },
          y: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });
    trendCtx._chartInstance = insightsChartInstances.trend;
  }

  // ── Radar Chart ────────────────────────────────────────────────────────
  const radarCtx = document.getElementById('radarChart');
  if (radarCtx && essays.length > 0) {
    if (insightsChartInstances.radar) {
      insightsChartInstances.radar.destroy();
    }
    const avg = (key) => {
      const sum = essays.reduce((acc, e) => acc + ((e.breakdown || {})[key] || 0), 0);
      return Math.round(sum / essays.length);
    };

    insightsChartInstances.radar = new Chart(radarCtx, {
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
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: 'rgba(255,255,255,0.06)' },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: {
              color: 'rgba(240,240,255,0.6)',
              font: { size: 12, family: 'Inter', weight: '600' },
            },
            ticks: { display: false, stepSize: 20 },
          },
        },
      },
    });
    radarCtx._chartInstance = insightsChartInstances.radar;
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
  const nav = new Navigation();

  // Pre-fetch essays so pages feel instant
  getEssaysCached().then(() => {
    initHome();
    initHistory();
  });

  const evaluator = new Evaluator();

  initNotifications();

  // Modal close handlers
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  setTimeout(initScrollAnimations, 200);
});
