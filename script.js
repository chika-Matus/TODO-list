// TODOリストのデータを管理
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let nextId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;

// ページネーション設定
const ITEMS_PER_PAGE = 5;
let currentPage = 1;

// DOM要素の取得
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const pagination = document.getElementById('pagination');

// 初期表示
renderTodos();

// EnterキーでTODOを追加
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// TODOを追加する関数
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;
    
    const todo = {
        id: nextId++,
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveTodos();
    
    // 新しいTODOを追加したら最後のページに移動
    const totalPages = Math.ceil(todos.length / ITEMS_PER_PAGE);
    currentPage = totalPages;
    
    renderTodos();
    todoInput.value = '';
}

// TODOを削除する関数
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    
    // 現在のページが空になった場合、前のページに移動
    const totalPages = Math.ceil(todos.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    renderTodos();
}

// TODOの完了状態を切り替える関数
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// TODOを編集モードにする関数
function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');

    const todo = todos.find(t => t.id === id);
    const originalText = todo.text;

    // 編集用のinput要素を安全に生成
    todoText.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-input-edit';
    input.value = originalText;
    todoText.appendChild(input);

    // アクションボタンも安全に生成
    todoActions.innerHTML = '';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = '保存';
    saveBtn.onclick = () => saveEdit(id);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.onclick = () => cancelEdit(id, originalText);

    todoActions.appendChild(saveBtn);
    todoActions.appendChild(cancelBtn);

    // 入力フィールドにフォーカス
    input.focus();
    input.select();
}

// 編集を保存する関数
function saveEdit(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const editInput = todoItem.querySelector('.todo-input-edit');
    const newText = editInput.value.trim();
    
    if (newText === '') return;
    
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, text: newText };
        }
        return todo;
    });
    
    saveTodos();
    renderTodos();
}

// 編集をキャンセルする関数
function cancelEdit(id, originalText) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');

    // 元のテキストを安全に戻す
    todoText.textContent = originalText;

    // アクションボタンも安全に生成
    todoActions.innerHTML = '';
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '編集';
    editBtn.onclick = () => editTodo(id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.onclick = () => deleteTodo(id);

    todoActions.appendChild(editBtn);
    todoActions.appendChild(deleteBtn);
}

// TODOリストを表示する関数
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">TODOがありません。新しいタスクを追加してください。</div>';
        pagination.innerHTML = '';
        return;
    }

    // ページネーション計算
    const totalPages = Math.ceil(todos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTodos = todos.slice(startIndex, endIndex);

    // 安全な方法でTODOを表示
    todoList.innerHTML = '';
    currentTodos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item${todo.completed ? ' completed' : ''}`;
        todoItem.setAttribute('data-id', todo.id);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.onchange = () => toggleTodo(todo.id);

        const todoText = document.createElement('div');
        todoText.className = 'todo-text';
        todoText.textContent = todo.text;

        const todoActions = document.createElement('div');
        todoActions.className = 'todo-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '編集';
        editBtn.onclick = () => editTodo(todo.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '削除';
        deleteBtn.onclick = () => deleteTodo(todo.id);

        todoActions.appendChild(editBtn);
        todoActions.appendChild(deleteBtn);

        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoText);
        todoItem.appendChild(todoActions);

        todoList.appendChild(todoItem);
    });

    // ページネーションを表示
    renderPagination(totalPages);
}

// ページネーションを表示する関数
function renderPagination(totalPages) {
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, todos.length);
    
    pagination.innerHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            前へ
        </button>
        <span class="pagination-info">
            ${startItem}-${endItem} / ${todos.length}件
        </span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            次へ
        </button>
    `;
}

// ページを変更する関数
function changePage(page) {
    const totalPages = Math.ceil(todos.length / ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTodos();
    }
}

// ローカルストレージに保存する関数
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}