/* Study Manager — local-first task, schedule, study-hour and backup tools. */
(function () {
  'use strict';
  const STORE = 'jeeOSManagerV1';
  const today = () => new Date().toLocaleDateString('en-CA');
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const esc = v => String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const defaultState = { tasks: [], sessions: [], dailyGoal: 180, activeSession: null, settings: { reminders: false } };
  let state;
  try { state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(STORE) || '{}')); }
  catch (_) { state = Object.assign({}, defaultState); }
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  state.sessions = Array.isArray(state.sessions) ? state.sessions : [];
  state.settings = Object.assign({ reminders: false }, state.settings || {});
  const save = () => localStorage.setItem(STORE, JSON.stringify(state));
  const el = id => document.getElementById(id);
  const fmtMins = mins => { mins = Math.max(0, Math.round(mins || 0)); const h = Math.floor(mins / 60); const m = mins % 60; return h ? h + 'h ' + m + 'm' : m + 'm'; };
  const dateLabel = d => { if (!d) return 'No date'; const dt = new Date(d + 'T12:00:00'); return dt.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' }); };
  const minutesToday = () => state.sessions.filter(s => s.date === today()).reduce((n, s) => n + Number(s.minutes || 0), 0) + (state.activeSession && state.activeSession.date === today() ? Math.floor((Date.now() - state.activeSession.startedAt) / 60000) : 0);
  const activeTask = () => state.tasks.find(t => t.id === (state.activeSession && state.activeSession.taskId));
  function addNav() {
    if (document.querySelector('[data-view="manager"]')) return;
    const b = document.createElement('button'); b.className = 'nav-item'; b.dataset.view = 'manager'; b.innerHTML = '◷ <span>Time & Tasks</span>';
    const nav = el('nav'); if (nav) nav.appendChild(b);
    const section = document.createElement('section'); section.id = 'view-manager'; section.className = 'view';
    section.innerHTML = `
      <div class="section-head"><span class="eyebrow">PERSONAL OPERATING SYSTEM</span><h2>Tasks, time and study hours.</h2><p class="muted">Your data stays in this browser by default. Export a backup regularly.</p></div>
      <div class="stats-grid manager-stats">
        <div class="stat"><span>Focused today</span><strong id="sm-today">0m</strong><small id="sm-goal-label">of daily goal</small></div>
        <div class="stat"><span>Tasks due today</span><strong id="sm-due">0</strong><small>unfinished tasks</small></div>
        <div class="stat"><span>Completed today</span><strong id="sm-done">0</strong><small>tasks finished</small></div>
        <div class="stat"><span>This week</span><strong id="sm-week">0m</strong><small>tracked focus time</small></div>
      </div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h3>Add a task or appointment</h3></div>
          <form id="sm-task-form" class="sm-form">
            <label>Task title<input id="sm-title" maxlength="180" required placeholder="e.g. Rotational motion: even questions"></label>
            <div class="sm-two"><label>Type<select id="sm-category"><option>Study</option><option>College</option><option>Assignment</option><option>Exam</option><option>Personal</option><option>Break</option></select></label>
            <label>Subject<select id="sm-subject"><option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>IPE</option><option>JEE</option><option>College</option><option>General</option></select></label></div>
            <div class="sm-two"><label>Date<input id="sm-date" type="date" value="${today()}" required></label><label>Start time<input id="sm-time" type="time"></label></div>
            <div class="sm-two"><label>Estimate (minutes)<input id="sm-estimate" type="number" min="5" max="720" step="5" value="45"></label><label>Priority<select id="sm-priority"><option>High</option><option selected>Normal</option><option>Low</option></select></label></div>
            <label>Notes (optional)<input id="sm-notes" maxlength="300" placeholder="Chapter, page range, or reminder"></label>
            <button type="submit">＋ Add to schedule</button>
          </form>
        </div>
        <div class="panel">
          <div class="panel-head"><h3>Focus tracker</h3><span id="sm-timer-status" class="pill">Ready</span></div>
          <label class="sm-label">Session task<select id="sm-session-task"><option value="">General study session</option></select></label>
          <div id="sm-clock" class="sm-clock">00:00:00</div>
          <div class="timer-controls"><button id="sm-start">Start focus</button><button id="sm-stop" class="secondary" disabled>Finish session</button></div>
          <p class="muted">The timer records actual elapsed time. Keep this page open while studying. If the browser closes, reopen it to recover the active session.</p>
          <hr class="sm-rule">
          <label class="sm-label">Daily study goal (minutes)<input id="sm-goal" type="number" min="30" max="900" step="15" value="${state.dailyGoal}"></label>
          <div class="bar"><i id="sm-goal-bar" style="width:0%"></i></div>
          <div class="sm-inline"><span id="sm-goal-progress">0 / 180 minutes</span><button id="sm-reminders" class="secondary">Enable reminders</button></div>
          <p id="sm-reminder-status" class="muted">In-page reminders work while this app is open.</p>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h3>Schedule and task list</h3><div class="sm-filters"><select id="sm-filter"><option value="all">All tasks</option><option value="today">Today</option><option value="open">Unfinished</option><option value="done">Completed</option></select><button id="sm-export" class="secondary">Export backup</button><button id="sm-import-btn" class="secondary">Import backup</button><input id="sm-import" type="file" accept="application/json" hidden></div></div>
        <div id="sm-tasks" class="task-list"></div>
      </div>
      <div class="two-col">
        <div class="panel"><div class="panel-head"><h3>Study time by subject · 7 days</h3></div><div id="sm-subject-stats"></div></div>
        <div class="panel"><div class="panel-head"><h3>Recent focus sessions</h3></div><div id="sm-sessions" class="task-list"></div></div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Data and privacy</h3></div><p class="muted">Tasks, notes and study logs are saved in this browser's local storage, not automatically synced across devices. Export a JSON backup before clearing browser data. The app does not control other Android apps or create reliable background alarms.</p><button id="sm-export-csv" class="secondary">Export study log (CSV)</button></div>
    `;
    document.querySelector('.main').appendChild(section);
    b.addEventListener('click', () => window.showManagerView());
    document.querySelectorAll('[data-view-link="manager"]').forEach(x => x.addEventListener('click', () => window.showManagerView()));
  }
  function startView() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    el('view-manager').classList.add('active-view');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === 'manager'));
    if (el('pageTitle')) el('pageTitle').textContent = 'Time, tasks and study hours.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    render();
  }
  window.showManagerView = startView;
  function render() {
    const date = today(), todayTasks = state.tasks.filter(t => t.date === date), done = todayTasks.filter(t => t.done).length;
    const mins = minutesToday(), goal = Number(state.dailyGoal) || 180;
    el('sm-today').textContent = fmtMins(mins); el('sm-goal-label').textContent = 'of ' + fmtMins(goal);
    el('sm-due').textContent = todayTasks.filter(t => !t.done).length; el('sm-done').textContent = done;
    const weekStart = new Date(); weekStart.setHours(0,0,0,0); weekStart.setDate(weekStart.getDate() - 6);
    const weekSessions = state.sessions.filter(s => new Date(s.date + 'T12:00:00') >= weekStart);
    const weekMins = weekSessions.reduce((n,s) => n + Number(s.minutes || 0),0) + (state.activeSession ? Math.max(0, Math.floor((Date.now() - state.activeSession.startedAt)/60000)) : 0);
    el('sm-week').textContent = fmtMins(weekMins); el('sm-goal').value = goal; el('sm-goal-progress').textContent = fmtMins(mins) + ' / ' + fmtMins(goal);
    el('sm-goal-bar').style.width = Math.min(100, Math.round(mins / goal * 100)) + '%';
    el('sm-timer-status').textContent = state.activeSession ? 'Tracking' : 'Ready';
    el('sm-start').disabled = !!state.activeSession; el('sm-stop').disabled = !state.activeSession;
    el('sm-session-task').innerHTML = '<option value="">General study session</option>' + state.tasks.filter(t => !t.done).map(t => '<option value="'+esc(t.id)+'">'+esc(t.title)+'</option>').join('');
    if (state.activeSession) el('sm-session-task').value = state.activeSession.taskId || '';
    const filter = el('sm-filter').value;
    let tasks = state.tasks.slice().sort((a,b) => (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '99:99').localeCompare(b.time || '99:99') || ({High:0,Normal:1,Low:2}[a.priority] - {High:0,Normal:1,Low:2}[b.priority]));
    if (filter === 'today') tasks = tasks.filter(t => t.date === date);
    if (filter === 'open') tasks = tasks.filter(t => !t.done);
    if (filter === 'done') tasks = tasks.filter(t => t.done);
    el('sm-tasks').innerHTML = tasks.length ? tasks.map(t => '<div class="sm-task '+(t.done?'sm-done':'')+'"><label class="sm-task-main"><input type="checkbox" data-sm-done="'+esc(t.id)+'" '+(t.done?'checked':'')+'><span><b>'+esc(t.title)+'</b><small>'+esc(t.category)+' · '+esc(t.subject)+' · '+dateLabel(t.date)+(t.time?' at '+esc(t.time):'')+' · '+fmtMins(t.estimate)+(t.notes?' · '+esc(t.notes):'')+'</small></span></label><span class="sm-priority sm-'+String(t.priority||'Normal').toLowerCase()+'">'+esc(t.priority||'Normal')+'</span><button class="mini-delete" data-sm-delete="'+esc(t.id)+'" aria-label="Delete task">×</button></div>').join('') : '<div class="muted">No tasks in this view yet.</div>';
    el('sm-subject-stats').innerHTML = ['Physics','Chemistry','Mathematics','IPE','JEE','College','General'].map(subject => {
      const n = weekSessions.filter(s => s.subject === subject).reduce((sum,s) => sum + Number(s.minutes || 0),0);
      return '<div class="progress-line"><div class="subject-meta"><span>'+subject+'</span><span>'+fmtMins(n)+'</span></div><div class="bar"><i style="width:'+Math.min(100, n/Math.max(1,weekMins)*100)+'%"></i></div></div>';
    }).join('');
    const recent = state.sessions.slice().reverse().slice(0,8);
    el('sm-sessions').innerHTML = recent.length ? recent.map(s => '<div class="task"><span><b>'+esc(s.title || 'General study')+'</b><small class="muted">'+esc(s.subject || 'General')+' · '+dateLabel(s.date)+'</small></span><strong>'+fmtMins(s.minutes)+'</strong></div>').join('') : '<div class="muted">Your completed focus sessions will appear here.</div>';
    el('sm-clock').textContent = state.activeSession ? clockText(Date.now() - state.activeSession.startedAt) : '00:00:00';
    el('sm-reminder-status').textContent = state.settings.reminders ? 'Reminders enabled for tasks due today while this page is open.' : 'In-page reminders work while this app is open.';
    bindTaskButtons(); save();
  }
  function clockText(ms) { const sec = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(sec/3600), Math.floor(sec/60)%60, sec%60].map(n => String(n).padStart(2,'0')).join(':'); }
  function bindTaskButtons() {
    document.querySelectorAll('[data-sm-done]').forEach(x => x.onchange = () => { const t = state.tasks.find(t => t.id === x.dataset.smDone); if (t) { t.done = x.checked; t.completedAt = t.done ? Date.now() : null; save(); render(); } });
    document.querySelectorAll('[data-sm-delete]').forEach(x => x.onclick = () => { const t = state.tasks.find(t => t.id === x.dataset.smDelete); if (t && confirm('Delete "' + t.title + '"?')) { state.tasks = state.tasks.filter(y => y.id !== t.id); save(); render(); } });
  }
  el('sm-task-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = el('sm-title').value.trim(); if (!title) return;
    state.tasks.push({ id: uid(), title, category: el('sm-category').value, subject: el('sm-subject').value, date: el('sm-date').value || today(), time: el('sm-time').value, estimate: Math.max(5, Number(el('sm-estimate').value) || 45), priority: el('sm-priority').value, notes: el('sm-notes').value.trim(), done: false, createdAt: Date.now() });
    e.target.reset(); el('sm-date').value = today(); el('sm-estimate').value = 45; save(); render();
  });
  el('sm-start').onclick = () => {
    if (state.activeSession) return;
    const taskId = el('sm-session-task').value, task = state.tasks.find(t => t.id === taskId);
    state.activeSession = { id: uid(), taskId: taskId || '', title: task ? task.title : 'General study', subject: task ? task.subject : el('sm-subject').value, date: today(), startedAt: Date.now() };
    save(); render();
  };
  el('sm-stop').onclick = () => {
    if (!state.activeSession) return;
    const active = state.activeSession, mins = Math.max(1, Math.round((Date.now() - active.startedAt) / 60000));
    state.sessions.push({ id: active.id, title: active.title, subject: active.subject, date: active.date, startedAt: active.startedAt, endedAt: Date.now(), minutes: mins });
    state.activeSession = null; save(); render();
  };
  el('sm-goal').onchange = () => { state.dailyGoal = Math.min(900, Math.max(30, Number(el('sm-goal').value) || 180)); save(); render(); };
  el('sm-filter').onchange = render;
  el('sm-export').onclick = () => download('study-pilot-backup-'+today()+'.json', JSON.stringify({ exportedAt: new Date().toISOString(), manager: state, core: JSON.parse(localStorage.getItem('jeeOS') || '{}'), videos: JSON.parse(localStorage.getItem('jeeOSVideos') || '[]'), materials: JSON.parse(localStorage.getItem('jeeMaterials') || '[]') }, null, 2), 'application/json');
  el('sm-import-btn').onclick = () => el('sm-import').click();
  el('sm-import').onchange = async e => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try { const data = JSON.parse(await file.text()); const imported = data.manager || data; if (!Array.isArray(imported.tasks) || !Array.isArray(imported.sessions)) throw new Error('This does not look like a Study Manager backup.');
      if (!confirm('Importing replaces the current Time & Tasks data. Continue?')) return;
      state = Object.assign({}, defaultState, imported); save(); render(); alert('Backup imported.');
    } catch (err) { alert('Could not import backup: ' + err.message); } finally { e.target.value = ''; }
  };
  el('sm-export-csv').onclick = () => {
    const rows = [['Date','Task / session','Subject','Minutes','Start','End'], ...state.sessions.map(s => [s.date,s.title,s.subject,s.minutes,new Date(s.startedAt).toISOString(),new Date(s.endedAt).toISOString()])];
    const csv = rows.map(r => r.map(v => '"'+String(v == null ? '' : v).replace(/"/g,'""')+'"').join(',')).join('\r\n');
    download('study-log-'+today()+'.csv', csv, 'text/csv;charset=utf-8');
  };
  el('sm-reminders').onclick = async () => {
    if (!('Notification' in window)) { alert('This browser does not support notifications. In-page reminders still work while the app is open.'); return; }
    const permission = await Notification.requestPermission();
    state.settings.reminders = permission === 'granted'; save(); render();
    if (state.settings.reminders) new Notification('Study reminders enabled', { body: 'Keep Study Pilot open to receive in-page schedule reminders.' });
  };
  function download(name, text, type) { const a = document.createElement('a'), url = URL.createObjectURL(new Blob([text], {type})); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500); }
  let lastReminderMinute = '';
  function checkReminders() {
    if (!state.settings.reminders || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date(), stamp = today() + ' ' + now.getHours() + ':' + now.getMinutes();
    if (stamp === lastReminderMinute) return; lastReminderMinute = stamp;
    state.tasks.filter(t => !t.done && t.date === today() && t.time).forEach(t => {
      const [h,m] = t.time.split(':').map(Number);
      if (h === now.getHours() && m === now.getMinutes()) new Notification('Scheduled task', { body: t.title + (t.notes ? ' — ' + t.notes : '') });
    });
  }
  addNav();
  // Keep the legacy dashboard navigation working while adding this module.
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => { if (b.dataset.view === 'manager') startView(); }));
  document.querySelectorAll('[data-view-link="manager"]').forEach(b => b.addEventListener('click', startView));
  setInterval(() => { if (state.activeSession) el('sm-clock').textContent = clockText(Date.now() - state.activeSession.startedAt); checkReminders(); }, 1000);
  setInterval(() => { if (state.activeSession) { save(); if (el('view-manager').classList.contains('active-view')) render(); } }, 60000);
  // Provide simple recurring-task templates through the task form's saved defaults, without silently creating duplicates.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('/sw.js').catch(() => {});
  render();
})();