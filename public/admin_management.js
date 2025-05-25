// 显示指定页面
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    targetPage.classList.add('active');

    // 根据页面 ID 加载相应的数据
    switch (pageId) {
        case 'user-account-management':
            loadUserAccounts();
            break;
        case 'user-reservation-info':
            loadUserReservations();
            break;
        case 'user-subscription-info':
            loadUserSubscriptions();
            break;
        case 'game-review':
            loadGameReviews();
            break;
    }
}

// 加载用户账号信息
async function loadUserAccounts() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const users = await response.json();
        const table = document.getElementById('user-account-table');
        const tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        users.forEach((user, index) => {
            const row = tbody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            cell1.textContent = index + 1;
            cell2.textContent = user.username;
            cell3.textContent = user.role;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.addEventListener('click', () => deleteUser(user.id));
            const editButton = document.createElement('button');
            editButton.textContent = '修改';
            editButton.addEventListener('click', () => editUser(user.id));
            cell4.appendChild(deleteButton);
            cell4.appendChild(editButton);
        });
    } catch (error) {
        console.error('加载用户账号信息失败:', error);
    }
}

// 删除用户账号
async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (response.ok) {
            loadUserAccounts();
        } else {
            console.error('删除用户账号失败');
        }
    } catch (error) {
        console.error('删除用户账号失败:', error);
    }
}

// 修改用户账号信息
function editUser(userId) {
    // 这里可以实现修改用户信息的逻辑，例如弹出一个模态框让管理员输入新的信息
    console.log('修改用户信息:', userId);
}

// 加载用户游戏预约信息
async function loadUserReservations() {
    try {
        const response = await fetch('/api/admin/reservations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const reservations = await response.json();
        const table = document.getElementById('user-reservation-table');
        const tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        reservations.forEach((reservation, index) => {
            const row = tbody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.textContent = index + 1;
            cell2.textContent = reservation.username;
            cell3.textContent = reservation.gameName;
        });
    } catch (error) {
        console.error('加载用户游戏预约信息失败:', error);
    }
}

// 加载用户游戏订阅信息
async function loadUserSubscriptions() {
    try {
        const response = await fetch('/api/admin/subscriptions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const subscriptions = await response.json();
        const table = document.getElementById('user-subscription-table');
        const tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        subscriptions.forEach((subscription, index) => {
            const row = tbody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            cell1.textContent = index + 1;
            cell2.textContent = subscription.username;
            cell3.textContent = subscription.gameName;
        });
    } catch (error) {
        console.error('加载用户游戏订阅信息失败:', error);
    }
}

// 加载开发者投递的游戏审核信息
async function loadGameReviews() {
    try {
        const response = await fetch('/api/admin/game-reviews', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const gameReviews = await response.json();
        const table = document.getElementById('game-review-table');
        const tbody = table.getElementsByTagName('tbody')[0];
        tbody.innerHTML = '';
        gameReviews.forEach((gameReview, index) => {
            const row = tbody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);
            const cell6 = row.insertCell(5);
            cell1.textContent = index + 1;
            cell2.textContent = gameReview.developerName;
            cell3.textContent = gameReview.gameType;
            cell4.textContent = gameReview.gameName;
            cell5.textContent = gameReview.gameDescription;
            const approveButton = document.createElement('button');
            approveButton.textContent = '审核通过';
            approveButton.addEventListener('click', () => approveGame(gameReview.id));
            const rejectButton = document.createElement('button');
            rejectButton.textContent = '审核不通过';
            rejectButton.addEventListener('click', () => rejectGame(gameReview.id));
            cell6.appendChild(approveButton);
            cell6.appendChild(rejectButton);
        });
    } catch (error) {
        console.error('加载开发者投递的游戏审核信息失败:', error);
    }
}

// 审核通过游戏
async function approveGame(gameId) {
    try {
        const response = await fetch(`/api/admin/game-reviews/${gameId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (response.ok) {
            loadGameReviews();
        } else {
            console.error('审核通过游戏失败');
        }
    } catch (error) {
        console.error('审核通过游戏失败:', error);
    }
}

// 审核不通过游戏
async function rejectGame(gameId) {
    try {
        const response = await fetch(`/api/admin/game-reviews/${gameId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (response.ok) {
            loadGameReviews();
        } else {
            console.error('审核不通过游戏失败');
        }
    } catch (error) {
        console.error('审核不通过游戏失败:', error);
    }
}

// 上一页
function prevPage(tableId) {
    // 这里可以实现上一页的逻辑，例如更新表格数据
    console.log('上一页:', tableId);
}

// 下一页
function nextPage(tableId) {
    // 这里可以实现下一页的逻辑，例如更新表格数据
    console.log('下一页:', tableId);
}

// 初始化时显示第一个页面
showPage('user-account-management');