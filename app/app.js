// Leonida Trophy Guide — tracker logic, written for this entry.
// Checklist with saved progress (localStorage), export/import, filters by
// kind and grade, a spoiler setting, a roadmap view and a detail panel.
// The app loads only its own files: the trophy data comes from
// data/trophies.json, fetched relative to this page. No network at runtime.
const KEY = 'gta6-trophy-guide-sakura-v1';
const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceDir = doc.sources || {};
const byId = new Map(trophies.map((t) => [t.id, t]));

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: '100% completion',
  platinum: 'Platinum',
  online: 'Online',
};
const ROADMAP = [
  { stage: 1, title: 'Stage 1 — Story first: Chapters 1–4 and the finale', text: 'Play the campaign in order. Keep a manual save at the start of every chapter and one before the final mission — there is no mission replay, so a chapter-start save is your only way back.' },
  { stage: 2, title: 'Stage 2 — Partner crime and one-off moments', text: 'Trophies that need your partner beside you, or a single moment in free roam. Do them while the story is still fresh, before the cleanup phase.' },
  { stage: 3, title: 'Stage 3 — Strangers of Leonida', text: 'The stranger mission strands: Andy, Kenton, Billy, Randy, Tyrone and Bret, plus two more chains to reach eight. Finish each strand to its final mission; stranger work also feeds the 100% checklist.' },
  { stage: 4, title: 'Stage 4 — Collectibles and the whole map', text: 'Cards, WAiNK spots, vehicles, garages and full exploration. One long road trip across Leonida advances several of these at once.' },
  { stage: 5, title: 'Stage 5 — The long grinds and 100%', text: 'Stunts, shooting-range golds, races, challenges and the robbery set. Last of all: 100% completion, then the platinum pops by itself.' },
];

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const detailEl = document.getElementById('detail');
const detailBody = document.getElementById('detailBody');

let earned = new Set();
try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
earned = new Set([...earned].filter((id) => byId.has(Number(id))).map(Number));

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function spoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function isShown(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (kindEl.value === 'online') return false;
  if (kindEl.value === 'missable' && !t.missable) return false;
  if (kindEl.value !== 'all' && kindEl.value !== 'missable' && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  return true;
}

function badge(t) {
  const wrap = document.createElement('span');
  wrap.className = 'badges';
  const g = document.createElement('span');
  g.className = `grade ${t.grade}`;
  g.textContent = t.grade;
  wrap.append(g);
  const k = document.createElement('span');
  k.className = 'flag kind';
  k.textContent = KIND_LABELS[t.kind] || t.kind;
  wrap.append(k);
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'flag hid';
    h.textContent = 'Hidden on PSN';
    wrap.append(h);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'flag miss';
    m.textContent = 'Missable';
    wrap.append(m);
  }
  return wrap;
}

function renderList() {
  listEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!isShown(t)) continue;
    shown += 1;
    const li = document.createElement('li');
    if (earned.has(t.id)) li.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id); else earned.delete(t.id);
      save();
      renderAll();
    });
    li.append(box);
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tname';
    name.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
    body.append(name);
    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = spoilerHidden(t) ? 'Earn it to reveal this story trophy.' : t.description;
    body.append(desc);
    const guide = document.createElement('div');
    guide.className = 'tguide';
    guide.textContent = spoilerHidden(t)
      ? 'Guide hidden until earned.'
      : `${t.guide.slice(0, 220)}${t.guide.length > 220 ? '…' : ''} `;
    if (!spoilerHidden(t) && t.guide.length > 220) {
      const more = document.createElement('span');
      more.className = 'more';
      more.textContent = 'Read the full guide →';
      guide.append(more);
    }
    body.append(guide);
    li.append(body);
    li.append(badge(t));
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      openDetail(t.id);
    });
    listEl.append(li);
  }
  document.getElementById('shownCount').textContent = `Showing ${shown} of ${trophies.length} trophies`;
  document.getElementById('onlineNote').hidden = kindEl.value !== 'online';
}

function renderProgress() {
  const n = earned.size;
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('progressFill').style.width = `${Math.round((n / trophies.length) * 100)}%`;
  document.getElementById('percent').textContent = `${Math.round((n / trophies.length) * 100)}%`;
  document.getElementById('platinumNote').textContent = earned.has(1)
    ? 'Platinum: Vice Got a Price! — earned!'
    : `Platinum: Vice Got a Price! — ${54 - (n - (earned.has(1) ? 1 : 0))} to go`;
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const stage of ROADMAP) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    div.append(h);
    const p = document.createElement('p');
    p.textContent = stage.text;
    div.append(p);
    const ul = document.createElement('ul');
    for (const t of trophies.filter((x) => x.roadmap === stage.stage)) {
      const li = document.createElement('li');
      if (earned.has(t.id)) li.classList.add('done');
      li.textContent = spoilerHidden(t) ? 'Hidden story trophy' : `${t.name} (${t.grade})`;
      ul.append(li);
    }
    div.append(ul);
    stagesEl.append(div);
  }
}

function renderSources() {
  const span = document.getElementById('sourceList');
  span.replaceChildren();
  const entries = Object.values(sourceDir);
  entries.forEach((s, i) => {
    if (i > 0) span.append(document.createTextNode('; '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    span.append(a);
  });
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
}

function openDetail(id) {
  const t = byId.get(Number(id));
  if (!t) return;
  detailBody.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
  detailBody.append(h);
  detailBody.append(badge(t));
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = spoilerHidden(t)
    ? 'Official name and description hidden until earned (spoiler setting is on).'
    : `Official: “${t.description}” — ${t.grade}.`;
  detailBody.append(official);
  if (spoilerHidden(t)) {
    const p = document.createElement('p');
    p.textContent = 'Turn the spoiler setting off, or earn this trophy, to read its guide.';
    detailBody.append(p);
  } else {
    const gh = document.createElement('h3');
    gh.textContent = 'Guide';
    detailBody.append(gh);
    const gp = document.createElement('p');
    gp.textContent = t.guide;
    detailBody.append(gp);
    const sh = document.createElement('h3');
    sh.textContent = 'Sources';
    detailBody.append(sh);
    const ul = document.createElement('ul');
    for (const key of t.sources) {
      const s = sourceDir[key];
      if (!s) continue;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
      ul.append(li);
    }
    detailBody.append(ul);
    const rh = document.createElement('h3');
    rh.textContent = 'Roadmap';
    detailBody.append(rh);
    const rp = document.createElement('p');
    const stage = ROADMAP.find((s) => s.stage === t.roadmap);
    rp.textContent = stage ? stage.title : '';
    detailBody.append(rp);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    save();
    renderAll();
    openDetail(t.id);
  });
  detailBody.append(toggle);
  detailEl.hidden = false;
}

document.getElementById('detailClose').addEventListener('click', () => { detailEl.hidden = true; });

function setView(view) {
  const roadmap = view === 'roadmap';
  document.getElementById('viewRoadmap').hidden = !roadmap;
  document.getElementById('viewChecklist').hidden = roadmap;
  document.getElementById('tabRoadmap').classList.toggle('active', roadmap);
  document.getElementById('tabChecklist').classList.toggle('active', !roadmap);
}
document.getElementById('tabChecklist').addEventListener('click', () => setView('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => setView('roadmap'));

for (const el of [searchEl, kindEl, gradeEl, spoilerEl, hideEarnedEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'gta6', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const next = new Set(ids.filter((id) => byId.has(Number(id))).map(Number));
    earned = next;
    save();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  event.target.value = '';
});

// Deep links, used by the guide's own screenshots and by readers:
// ?view=roadmap, ?kind=story, ?grade=silver, ?spoiler=on, ?open=<trophy id>
if (params.get('view') === 'roadmap') setView('roadmap');
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('spoiler') === 'on') spoilerEl.checked = true;
if (params.get('q')) searchEl.value = params.get('q');

renderSources();
renderAll();
if (params.get('open')) openDetail(params.get('open'));
