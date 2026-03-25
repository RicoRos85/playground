// ── State ──────────────────────────────────────────────
const state = {
  tasks: JSON.parse(localStorage.getItem('dashboard-tasks') || '[]'),
  filter: 'all',
  apiKey: localStorage.getItem('dashboard-api-key') || '',
  history: [],   // { role: 'user'|'assistant', content: string }
  loading: false,
};

// ── DOM refs ────────────────────────────────────────────
const taskInput   = document.getElementById('task-input');
const prioritySel = document.getElementById('task-priority');
const addBtn      = document.getElementById('add-task-btn');
const taskList    = document.getElementById('task-list');
const clearDone   = document.getElementById('clear-done-btn');
const filterBtns  = document.querySelectorAll('.filter-btn');

const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn  = document.getElementById('save-key-btn');
const keyStatus   = document.getElementById('key-status');

const messages    = document.getElementById('messages');
const chatInput   = document.getElementById('chat-input');
const sendBtn     = document.getElementById('send-btn');

// ── Task helpers ────────────────────────────────────────
function saveTasks() {
  localStorage.setItem('dashboard-tasks', JSON.stringify(state.tasks));
}

function addTask(text, priority) {
  state.tasks.unshift({ id: Date.now(), text, priority, done: false });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const t = state.tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function filteredTasks() {
  if (state.filter === 'pending') return state.tasks.filter(t => !t.done);
  if (state.filter === 'done')    return state.tasks.filter(t => t.done);
  return state.tasks;
}

// ── Render tasks ────────────────────────────────────────
function renderTasks() {
  const total   = state.tasks.length;
  const done    = state.tasks.filter(t => t.done).length;
  const pending = total - done;

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-done').textContent    = done;
  document.getElementById('stat-pending').textContent = pending;

  const list = filteredTasks();
  if (list.length === 0) {
    taskList.innerHTML = '<li class="no-tasks">Ingen opgaver her</li>';
    return;
  }

  taskList.innerHTML = list.map(t => `
    <li class="task-item ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="task-check ${t.done ? 'checked' : ''}" data-action="toggle"></button>
      <span class="task-priority-dot priority-${t.priority}"></span>
      <span class="task-text">${escHtml(t.text)}</span>
      <button class="task-delete" data-action="delete" title="Slet">×</button>
    </li>
  `).join('');
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Task events ─────────────────────────────────────────
addBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text, prioritySel.value);
  taskInput.value = '';
  taskInput.focus();
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addBtn.click();
});

taskList.addEventListener('click', e => {
  const item = e.target.closest('.task-item');
  if (!item) return;
  const id = Number(item.dataset.id);
  if (e.target.dataset.action === 'toggle') toggleTask(id);
  if (e.target.dataset.action === 'delete') deleteTask(id);
});

clearDone.addEventListener('click', () => {
  state.tasks = state.tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

// ── API key ──────────────────────────────────────────────
if (state.apiKey) {
  apiKeyInput.value = '••••••••••••••••';
  keyStatus.textContent = 'Nøgle gemt ✓';
  sendBtn.disabled = false;
}

saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key || key.startsWith('•')) return;
  state.apiKey = key;
  localStorage.setItem('dashboard-api-key', key);
  apiKeyInput.value = '••••••••••••••••';
  keyStatus.textContent = 'Nøgle gemt ✓';
  sendBtn.disabled = false;
});

// ── Chat helpers ─────────────────────────────────────────
function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `<div class="message-bubble">${escHtml(content)}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function appendLoading() {
  const div = document.createElement('div');
  div.className = 'message assistant loading';
  div.innerHTML = `<div class="message-bubble">
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>
  </div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// ── Send message ─────────────────────────────────────────
async function sendMessage() {
  if (state.loading) return;
  const text = chatInput.value.trim();
  if (!text) return;
  if (!state.apiKey) {
    alert('Indsæt venligst din Anthropic API-nøgle øverst til højre.');
    return;
  }

  chatInput.value = '';
  chatInput.style.height = 'auto';
  state.loading = true;
  sendBtn.disabled = true;

  appendMessage('user', text);
  state.history.push({ role: 'user', content: text });

  const loader = appendLoading();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: buildSystemPrompt(),
        messages: state.history,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '(tomt svar)';
    state.history.push({ role: 'assistant', content: reply });

    loader.remove();
    appendMessage('assistant', reply);
  } catch (err) {
    loader.remove();
    appendMessage('assistant', `Fejl: ${err.message}`);
  } finally {
    state.loading = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

function buildSystemPrompt() {
  const pending = state.tasks.filter(t => !t.done);
  const done    = state.tasks.filter(t => t.done);
  let prompt = 'Du er en hjælpsom assistent på et personligt dashboard. Svar på dansk med mindre brugeren skriver på et andet sprog.';
  if (state.tasks.length > 0) {
    prompt += `\n\nBrugerens aktuelle opgaveliste:\nAfventer (${pending.length}): ${pending.map(t => `"${t.text}" [${t.priority}]`).join(', ') || 'ingen'}`;
    if (done.length) prompt += `\nFærdige: ${done.map(t => `"${t.text}"`).join(', ')}`;
  }
  return prompt;
}

// ── Chat events ───────────────────────────────────────────
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
  sendBtn.disabled = !chatInput.value.trim() || !state.apiKey;
});

// ── Init ──────────────────────────────────────────────────
renderTasks();
