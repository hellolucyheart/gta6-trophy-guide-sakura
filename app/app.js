/* Leonida Trophy Guide — tracker logic, written for this entry.
   Loads its data from the relative path data/trophies.json and keeps
   progress in the browser only. No network use beyond that local file. */
(function () {
  'use strict';

  var STORE_KEY = 'leonida-trophy-guide-v3';
  var DATA_PATH = 'data/trophies.json';

  var FILTERS = [
    ['all', 'All 55'],
    ['story', 'Story'],
    ['mission', 'Missions'],
    ['activity', 'Activities'],
    ['collectible', 'Collectibles'],
    ['combat', 'Combat'],
    ['exploration', 'Exploration'],
    ['economy', 'Economy'],
    ['social', 'Social'],
    ['missable', 'Missable'],
    ['earned', 'Earned'],
    ['remaining', 'Remaining']
  ];

  var STAGES = [
    { n: 1, title: 'Stage 1 — Story first', blurb: 'Chapters 1 to 4, the named story missions and the finale. Play the story in order; nothing here can be missed.' },
    { n: 2, title: 'Stage 2 — People of Leonida', blurb: 'Stranger strands, character finales, partner moments, bowling, hunting and fishing. Meet the people, then finish their stories.' },
    { n: 3, title: 'Stage 3 — The long grind', blurb: 'Activities, collectibles, combat and economy. The three missable trophies live here — do them before you finish the grind.' },
    { n: 4, title: 'Stage 4 — Platinum', blurb: 'Reach 100% completion, then the platinum unlocks on its own. The finish line.' }
  ];

  var trophies = [];
  var byId = {};
  var earned = {};
  var filter = 'all';
  var query = '';
  var spoiler = false;
  var openId = null;

  var listEl = document.getElementById('trophyList');
  var resultEl = document.getElementById('resultCount');
  var emptyEl = document.getElementById('emptyNote');
  var progressText = document.getElementById('progressText');
  var gradeText = document.getElementById('gradeText');
  var progressFill = document.getElementById('progressFill');
  var searchBox = document.getElementById('searchBox');
  var spoilerToggle = document.getElementById('spoilerToggle');
  var filterRow = document.getElementById('filterRow');
  var roadmapEl = document.getElementById('roadmapStages');
  var detailPanel = document.getElementById('detailPanel');
  var detailBody = document.getElementById('detailBody');

  function loadSaved() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && Array.isArray(data.earned)) {
        data.earned.forEach(function (id) { earned[id] = true; });
      }
    } catch (err) { earned = {}; }
  }

  function save() {
    var ids = Object.keys(earned).map(Number).sort(function (a, b) { return a - b; });
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ app: 'leonida-trophy-guide', version: 3, earned: ids }));
    } catch (err) { /* storage unavailable; progress still shows this session */ }
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function isHidden(trophy) {
    if (!spoiler) return false;
    if (earned[trophy.id]) return false;
    return trophy.kind === 'story' || trophy.kind === 'mission';
  }

  function matchesFilter(trophy) {
    if (filter === 'missable') return trophy.missable;
    if (filter === 'earned') return !!earned[trophy.id];
    if (filter === 'remaining') return !earned[trophy.id];
    if (filter === 'all') return true;
    return trophy.kind === filter;
  }

  function matchesQuery(trophy) {
    if (!query) return true;
    var hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.kind).toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  function visibleTrophies() {
    return trophies.filter(function (t) { return matchesFilter(t) && matchesQuery(t); });
  }

  function renderProgress() {
    var total = trophies.length;
    var got = trophies.filter(function (t) { return earned[t.id]; }).length;
    var pct = total ? Math.round((got / total) * 100) : 0;
    progressText.textContent = got + ' of ' + total + ' earned · ' + pct + '%';
    var counts = {};
    trophies.forEach(function (t) {
      if (earned[t.id]) counts[t.grade] = (counts[t.grade] || 0) + 1;
    });
    var parts = ['platinum', 'gold', 'silver', 'bronze'].map(function (g) {
      return gradeLabel(g) + ' ' + (counts[g] || 0);
    });
    gradeText.textContent = parts.join(' · ');
    progressFill.style.width = pct + '%';
  }

  function renderFilters() {
    filterRow.innerHTML = '';
    FILTERS.forEach(function (pair) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = pair[1];
      btn.setAttribute('data-filter', pair[0]);
      if (pair[0] === filter) btn.classList.add('active');
      btn.addEventListener('click', function () {
        filter = pair[0];
        renderAll();
      });
      filterRow.appendChild(btn);
    });
  }

  function renderRoadmap() {
    roadmapEl.innerHTML = '';
    STAGES.forEach(function (stage) {
      var members = trophies.filter(function (t) { return t.roadmap_stage === stage.n; });
      var card = document.createElement('article');
      card.className = 'stage-card';
      var title = document.createElement('h3');
      title.textContent = stage.title;
      var blurb = document.createElement('p');
      blurb.textContent = stage.blurb;
      var count = document.createElement('p');
      count.className = 'stage-count';
      count.textContent = members.length + ' trophies';
      card.appendChild(title);
      card.appendChild(blurb);
      card.appendChild(count);
      var names = document.createElement('ul');
      members.slice(0, 6).forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
        names.appendChild(li);
      });
      if (members.length > 6) {
        var more = document.createElement('li');
        more.textContent = '…and ' + (members.length - 6) + ' more';
        names.appendChild(more);
      }
      card.appendChild(names);
      roadmapEl.appendChild(card);
    });
  }

  function openDetail(id) {
    var trophy = byId[id];
    if (!trophy) return;
    openId = id;
    detailBody.innerHTML = '';
    var title = document.createElement('h2');
    title.textContent = isHidden(trophy) ? 'Hidden story trophy' : trophy.name;
    detailBody.appendChild(title);
    var meta = document.createElement('p');
    meta.textContent = gradeLabel(trophy.grade) + ' · ' + trophy.kind +
      (trophy.missable ? ' · MISSABLE' : '') + ' · Stage ' + trophy.roadmap_stage;
    detailBody.appendChild(meta);
    if (!isHidden(trophy)) {
      var desc = document.createElement('p');
      desc.textContent = trophy.description;
      detailBody.appendChild(desc);
    }
    var guideHead = document.createElement('h3');
    guideHead.textContent = 'Guide';
    detailBody.appendChild(guideHead);
    var guide = document.createElement('p');
    guide.textContent = trophy.guide;
    detailBody.appendChild(guide);
    if (trophy.missable) {
      var missHead = document.createElement('h3');
      missHead.textContent = 'Why it can be missed';
      detailBody.appendChild(missHead);
      var miss = document.createElement('p');
      miss.textContent = trophy.missable_reason;
      detailBody.appendChild(miss);
    }
    var stepsHead = document.createElement('h3');
    stepsHead.textContent = 'Steps';
    detailBody.appendChild(stepsHead);
    var steps = document.createElement('ol');
    trophy.steps.forEach(function (step) {
      var li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    });
    detailBody.appendChild(steps);
    var src = document.createElement('p');
    src.className = 'source-line';
    src.textContent = 'Sources: ' + trophy.sources.join('; ');
    detailBody.appendChild(src);
    detailPanel.hidden = false;
  }

  function closeDetail() {
    openId = null;
    detailPanel.hidden = true;
    detailBody.innerHTML = '';
  }

  function renderList() {
    listEl.innerHTML = '';
    var shown = visibleTrophies();
    resultEl.textContent = shown.length + ' of ' + trophies.length + ' trophies shown';
    emptyEl.hidden = shown.length !== 0;
    shown.forEach(function (trophy) {
      var li = document.createElement('li');
      li.className = 'trophy-card grade-' + trophy.grade + (earned[trophy.id] ? ' earned' : '') + (trophy.missable ? ' missable-card' : '');
      var check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'trophy-check';
      check.checked = !!earned[trophy.id];
      check.setAttribute('aria-label', isHidden(trophy) ? 'Mark this hidden story trophy as earned' : 'Mark ' + trophy.name + ' as earned');
      check.addEventListener('change', function () {
        if (check.checked) { earned[trophy.id] = true; } else { delete earned[trophy.id]; }
        save();
        renderAll();
      });
      li.appendChild(check);
      var body = document.createElement('div');
      var name = document.createElement('p');
      name.className = 'trophy-name';
      var dot = document.createElement('span');
      dot.className = 'grade-dot';
      name.appendChild(dot);
      if (isHidden(trophy)) {
        var hidden = document.createElement('span');
        hidden.className = 'spoiler-hidden';
        hidden.textContent = 'Hidden story trophy — earn it to reveal';
        name.appendChild(hidden);
      } else {
        name.appendChild(document.createTextNode(trophy.name));
      }
      body.appendChild(name);
      if (!isHidden(trophy)) {
        var desc = document.createElement('p');
        desc.className = 'trophy-desc';
        desc.textContent = trophy.description;
        body.appendChild(desc);
      }
      var meta = document.createElement('div');
      meta.className = 'trophy-meta';
      var gradePill = document.createElement('span');
      gradePill.className = 'pill grade-' + trophy.grade;
      gradePill.textContent = gradeLabel(trophy.grade);
      meta.appendChild(gradePill);
      var kindPill = document.createElement('span');
      kindPill.className = 'pill';
      kindPill.textContent = trophy.kind;
      meta.appendChild(kindPill);
      var stagePill = document.createElement('span');
      stagePill.className = 'pill';
      stagePill.textContent = 'Stage ' + trophy.roadmap_stage;
      meta.appendChild(stagePill);
      if (trophy.missable) {
        var missPill = document.createElement('span');
        missPill.className = 'pill missable-pill';
        missPill.textContent = 'MISSABLE';
        meta.appendChild(missPill);
      }
      body.appendChild(meta);
      li.appendChild(body);
      var guideBtn = document.createElement('button');
      guideBtn.type = 'button';
      guideBtn.className = 'guide-btn';
      guideBtn.textContent = 'Guide';
      guideBtn.addEventListener('click', function () { openDetail(trophy.id); });
      li.appendChild(guideBtn);
      listEl.appendChild(li);
    });
  }

  function renderAll() {
    renderProgress();
    renderFilters();
    renderRoadmap();
    renderList();
    if (openId) {
      openDetail(openId);
    } else {
      detailPanel.hidden = true;
      detailBody.innerHTML = '';
    }
  }

  function readHash() {
    var raw = window.location.hash.replace(/^#/, '');
    var params = new URLSearchParams(raw);
    var changed = false;
    // A hash navigation describes the whole view: reset to defaults first,
    // then apply what the hash names, so each hash URL renders the same.
    filter = 'all';
    query = '';
    searchBox.value = '';
    spoiler = false;
    spoilerToggle.checked = false;
    openId = null;
    var f = params.get('filter');
    if (f && FILTERS.some(function (pair) { return pair[0] === f; })) { filter = f; changed = true; }
    var q = params.get('search');
    if (q !== null) { query = q.toLowerCase(); searchBox.value = q; changed = true; }
    if (params.get('spoiler') === '1') { spoiler = true; spoilerToggle.checked = true; changed = true; }
    var earnedParam = params.get('earned');
    if (earnedParam) {
      // A hash that names earned trophies replaces the earned set exactly.
      earned = {};
      earnedParam.split(',').forEach(function (part) {
        var id = Number(part);
        if (byId[id]) { earned[id] = true; changed = true; }
      });
      if (changed) save();
    }
    var trophyParam = params.get('trophy');
    if (trophyParam && byId[Number(trophyParam)]) { openId = Number(trophyParam); }
    var view = params.get('view');
    if (view === 'roadmap') {
      setTimeout(function () {
        var el = document.getElementById('roadmap');
        if (el) el.scrollIntoView();
      }, 50);
    }
    return changed;
  }

  function exportProgress() {
    var ids = Object.keys(earned).map(Number).sort(function (a, b) { return a - b; });
    var payload = JSON.stringify({ app: 'leonida-trophy-guide', version: 3, earned: ids }, null, 2);
    var blob = new Blob([payload], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-trophy-progress.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!data || !Array.isArray(data.earned)) throw new Error('bad file');
        var next = {};
        data.earned.forEach(function (id) { if (byId[Number(id)]) next[Number(id)] = true; });
        earned = next;
        save();
        renderAll();
      } catch (err) {
        window.alert('That file is not a Leonida progress export.');
      }
    };
    reader.readAsText(file);
  }

  searchBox.addEventListener('input', function () {
    query = searchBox.value.trim().toLowerCase();
    renderList();
    renderProgress();
  });
  spoilerToggle.addEventListener('change', function () {
    spoiler = spoilerToggle.checked;
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', function () {
    if (window.confirm('Clear all earned trophies?')) {
      earned = {};
      save();
      renderAll();
    }
  });
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  window.addEventListener('hashchange', function () { readHash(); renderAll(); });

  loadSaved();
  fetch(DATA_PATH)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      trophies = data.trophies || data;
      trophies.forEach(function (t) { byId[t.id] = t; });
      readHash();
      renderAll();
    })
    .catch(function () {
      resultEl.textContent = 'Could not load the trophy data.';
    });
})();
