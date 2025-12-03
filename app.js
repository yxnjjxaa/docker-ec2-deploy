const express = require('express');
const app = express();

// 환경변수에서 포트 가져오기 (기본값: 3000)
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'My Web App';
const ENVIRONMENT = process.env.NODE_ENV || 'development';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 메모리 기반 데이터 저장 (서버 재시작 시 초기화됨)
let todos = [];
let formSubmissions = [];
let todoIdCounter = 1;

// 메인 페이지
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${APP_NAME}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        .header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        .header p {
          opacity: 0.9;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tab {
          background: white;
          border: none;
          padding: 15px 30px;
          border-radius: 10px 10px 0 0;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #667eea;
          transition: all 0.3s;
        }
        .tab:hover {
          background: #f0f0f0;
        }
        .tab.active {
          background: white;
          color: #764ba2;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        .content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          min-height: 500px;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 1.8rem;
        }
        .todo-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .todo-input {
          flex: 1;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
        }
        .todo-input:focus {
          outline: none;
          border-color: #667eea;
        }
        .btn {
          padding: 15px 30px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-danger {
          background: #ff6b6b;
          color: white;
        }
        .btn-danger:hover {
          background: #ee5a5a;
        }
        .btn-small {
          padding: 8px 15px;
          font-size: 0.9rem;
        }
        .todo-list {
          list-style: none;
        }
        .todo-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          animation: slideIn 0.3s;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .todo-item.completed {
          opacity: 0.6;
          text-decoration: line-through;
        }
        .todo-text {
          flex: 1;
          font-size: 1.1rem;
        }
        .todo-actions {
          display: flex;
          gap: 10px;
        }
        .contact-form {
          max-width: 500px;
          margin: 0 auto;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }
        .submissions {
          margin-top: 30px;
        }
        .submission-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 15px;
        }
        .submission-item h3 {
          color: #667eea;
          margin-bottom: 10px;
        }
        .submission-item p {
          color: #666;
          margin-bottom: 5px;
        }
        .info-box {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #667eea;
        }
        .value {
          color: #333;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #999;
        }
        .empty-state::before {
          content: "📝";
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ${APP_NAME}</h1>
          <p>웹 애플리케이션 - TodoList, 연락처 폼</p>
        </div>

        <div class="tabs">
          <button class="tab active" onclick="showTab('todo')">✅ TodoList</button>
          <button class="tab" onclick="showTab('form')">📝 연락처 폼</button>
          <button class="tab" onclick="showTab('info')">ℹ️ 정보</button>
        </div>

        <div class="content">
          <!-- TodoList 탭 -->
          <div id="todo" class="tab-content active">
            <div class="section">
              <h2>✅ TodoList</h2>
              <div class="todo-form">
                <input type="text" class="todo-input" id="todoInput" placeholder="할 일을 입력하세요..." onkeypress="if(event.key==='Enter') addTodo()">
                <button class="btn btn-primary" onclick="addTodo()">추가</button>
              </div>
              <ul class="todo-list" id="todoList">
                <li class="empty-state">할 일이 없습니다. 새로운 할 일을 추가해보세요!</li>
              </ul>
            </div>
          </div>

          <!-- 연락처 폼 탭 -->
          <div id="form" class="tab-content">
            <div class="section">
              <h2>📝 연락처 폼</h2>
              <form class="contact-form" onsubmit="submitForm(event)">
                <div class="form-group">
                  <label for="name">이름 *</label>
                  <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                  <label for="email">이메일 *</label>
                  <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                  <label for="phone">전화번호</label>
                  <input type="tel" id="phone" name="phone">
                </div>
                <div class="form-group">
                  <label for="message">메시지 *</label>
                  <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">제출하기</button>
              </form>
              <div class="submissions" id="submissions">
                <h3 style="margin-top: 30px; margin-bottom: 15px;">제출된 폼</h3>
                <div id="submissionsList"></div>
              </div>
            </div>
          </div>

          <!-- 정보 탭 -->
          <div id="info" class="tab-content">
            <div class="section">
              <h2>ℹ️ 애플리케이션 정보</h2>
              <div class="info-box">
                <div class="info-item">
                  <span class="label">환경</span>
                  <span class="value">${ENVIRONMENT}</span>
                </div>
                <div class="info-item">
                  <span class="label">포트</span>
                  <span class="value">${PORT}</span>
                </div>
                <div class="info-item">
                  <span class="label">상태</span>
                  <span class="value">✅ 정상 작동</span>
                </div>
                <div class="info-item">
                  <span class="label">서버 업타임</span>
                  <span class="value" id="uptime">-</span>
                </div>
              </div>
              <a href="/api/status" class="btn btn-primary" style="display: inline-block; margin-top: 20px; text-decoration: none;">API 상태 확인</a>
            </div>
          </div>
        </div>
      </div>

      <script>
        // 탭 전환
        function showTab(tabName) {
          document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
          });
          document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
          });
          document.getElementById(tabName).classList.add('active');
          event.target.classList.add('active');
          
          if (tabName === 'todo') {
            loadTodos();
          } else if (tabName === 'form') {
            loadSubmissions();
          } else if (tabName === 'info') {
            loadUptime();
          }
        }

        // TodoList 기능
        function loadTodos() {
          fetch('/api/todos')
            .then(res => res.json())
            .then(data => {
              const todoList = document.getElementById('todoList');
              if (data.length === 0) {
                todoList.innerHTML = '<li class="empty-state">할 일이 없습니다. 새로운 할 일을 추가해보세요!</li>';
              } else {
                todoList.innerHTML = data.map(todo => \`
                  <li class="todo-item \${todo.completed ? 'completed' : ''}">
                    <span class="todo-text">\${todo.text}</span>
                    <div class="todo-actions">
                      <button class="btn btn-primary btn-small" onclick="toggleTodo(\${todo.id})">
                        \${todo.completed ? '↩️' : '✓'}
                      </button>
                      <button class="btn btn-danger btn-small" onclick="deleteTodo(\${todo.id})">삭제</button>
                    </div>
                  </li>
                \`).join('');
              }
            });
        }

        function addTodo() {
          const input = document.getElementById('todoInput');
          const text = input.value.trim();
          if (!text) return;
          
          fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          })
            .then(res => res.json())
            .then(() => {
              input.value = '';
              loadTodos();
            });
        }

        function toggleTodo(id) {
          fetch(\`/api/todos/\${id}/toggle\`, { method: 'POST' })
            .then(() => loadTodos());
        }

        function deleteTodo(id) {
          fetch(\`/api/todos/\${id}\`, { method: 'DELETE' })
            .then(() => loadTodos());
        }

        // 폼 제출 기능
        function submitForm(event) {
          event.preventDefault();
          const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
          };
          
          fetch('/api/form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          })
            .then(res => res.json())
            .then(data => {
              alert('제출되었습니다!');
              event.target.reset();
              loadSubmissions();
            });
        }

        function loadSubmissions() {
          fetch('/api/form')
            .then(res => res.json())
            .then(data => {
              const list = document.getElementById('submissionsList');
              if (data.length === 0) {
                list.innerHTML = '<div class="empty-state">제출된 폼이 없습니다.</div>';
              } else {
                list.innerHTML = data.map(sub => \`
                  <div class="submission-item">
                    <h3>\${sub.name}</h3>
                    <p><strong>이메일:</strong> \${sub.email}</p>
                    <p><strong>전화번호:</strong> \${sub.phone || '없음'}</p>
                    <p><strong>메시지:</strong> \${sub.message}</p>
                    <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">
                      \${new Date(sub.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                \`).join('');
              }
            });
        }

        // 업타임 로드
        function loadUptime() {
          fetch('/api/status')
            .then(res => res.json())
            .then(data => {
              const seconds = Math.floor(data.uptime);
              const hours = Math.floor(seconds / 3600);
              const minutes = Math.floor((seconds % 3600) / 60);
              const secs = seconds % 60;
              document.getElementById('uptime').textContent = 
                \`\${hours}시간 \${minutes}분 \${secs}초\`;
            });
        }

        // 초기 로드
        loadTodos();
      </script>
    </body>
    </html>
  `);
});

// API 엔드포인트
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT,
    appName: APP_NAME,
    uptime: process.uptime()
  });
});

// TodoList API
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  const todo = {
    id: todoIdCounter++,
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.json(todo);
});

app.post('/api/todos/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    res.json(todo);
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Todo not found' });
  }
});

// 폼 제출 API
app.get('/api/form', (req, res) => {
  res.json(formSubmissions);
});

app.post('/api/form', (req, res) => {
  const submission = {
    ...req.body,
    id: formSubmissions.length + 1,
    timestamp: new Date().toISOString()
  };
  formSubmissions.push(submission);
  res.json(submission);
});

// Health check 엔드포인트 (로드밸런서용)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${ENVIRONMENT}`);
  console.log(`🏷️  App Name: ${APP_NAME}`);
});
