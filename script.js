// DOM要素
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// 状態
let todos = [];
let currentFilter = 'all';

// ローカルストレージからTODOを読み込み
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// ローカルストレージにTODOを保存
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 一意のIDを生成
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// TODOを追加
function addTodo(text) {
    const todo = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: Date.now()
    };
    todos.unshift(todo);
    saveTodos();
    render();
}

// TODOの完了状態を切り替え
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }
}

// TODOを削除
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
}

// 完了済みTODOを削除
function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
}

// フィルターに基づいてTODOを取得
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

// TODO項目のHTML要素を作成
function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;

    li.innerHTML = `
        <div class="todo-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="削除">&times;</button>
    `;

    // チェックボックスのクリックイベント
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('click', () => toggleTodo(todo.id));
    checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTodo(todo.id);
        }
    });

    // 削除ボタンのクリックイベント
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    return li;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 画面を描画
function render() {
    const filteredTodos = getFilteredTodos();

    // リストをクリア
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = currentFilter === 'all'
            ? 'タスクがありません'
            : currentFilter === 'active'
            ? '未完了のタスクはありません'
            : '完了したタスクはありません';
        todoList.appendChild(emptyMsg);
    } else {
        filteredTodos.forEach(todo => {
            todoList.appendChild(createTodoElement(todo));
        });
    }

    // カウントを更新
    const activeCount = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${activeCount}件の未完了タスク`;

    // 完了済み削除ボタンの表示/非表示
    const completedCount = todos.filter(t => t.completed).length;
    clearCompletedBtn.style.display = completedCount > 0 ? 'block' : 'none';
}

// フォーム送信イベント
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        addTodo(text);
        todoInput.value = '';
        todoInput.focus();
    }
});

// フィルターボタンのイベント
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// 完了済み削除ボタンのイベント
clearCompletedBtn.addEventListener('click', clearCompleted);

// 初期化
loadTodos();
render();
