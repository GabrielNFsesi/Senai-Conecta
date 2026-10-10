document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeed();
});
 
// chamada por auth.js / posts.js sempre que o conteúdo da página precisa ser atualizado
function reloadPage() {
    loadFeed();
}
 
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const posts = await apiFetch('/publicacoes');
        feed.innerHTML = posts.length
            ? posts.map(post => renderPost(post)).join('')
            : `<p class="empty-msg">Nenhuma publicação ainda.</p>`;
    } catch (err) {
        feed.innerHTML = `<p class="error-msg">Erro ao carregar o feed.</p>`;
    }
}
 
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const formData = new FormData();
    formData.append('texto', document.getElementById('postText').value);
    const img = document.getElementById('postImage').files[0];
    if (img) formData.append('imagem', img);
 
    try {
        await apiFetch('/publicacoes', { method: 'POST', body: formData });
        document.getElementById('postForm').reset();
        loadFeed();
    } catch (err) {
        alert(err.message);
    }
});
 document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeed();
});
 
// chamada por auth.js / posts.js sempre que o conteúdo da página precisa ser atualizado
function reloadPage() {
    loadFeed();
}
 
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const posts = await apiFetch('/publicacoes');
        feed.innerHTML = posts.length
            ? posts.map(post => renderPost(post)).join('')
            : `<p class="empty-msg">Nenhuma publicação ainda.</p>`;
    } catch (err) {
        feed.innerHTML = `<p class="error-msg">Erro ao carregar o feed.</p>`;
    }
}
 
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const formData = new FormData();
    formData.append('texto', document.getElementById('postText').value);
    const img = document.getElementById('postImage').files[0];
    if (img) formData.append('imagem', img);
 
    try {
        await apiFetch('/publicacoes', { method: 'POST', body: formData });
        document.getElementById('postForm').reset();
        loadFeed();
    } catch (err) {
        alert(err.message);
    }
});
 document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadFeed();
});
 
// chamada por auth.js / posts.js sempre que o conteúdo da página precisa ser atualizado
function reloadPage() {
    loadFeed();
}
 
async function loadFeed() {
    const feed = document.getElementById('feed');
    try {
        const posts = await apiFetch('/publicacoes');
        feed.innerHTML = posts.length
            ? posts.map(post => renderPost(post)).join('')
            : `<p class="empty-msg">Nenhuma publicação ainda.</p>`;
    } catch (err) {
        feed.innerHTML = `<p class="error-msg">Erro ao carregar o feed.</p>`;
    }
}
 
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const formData = new FormData();
    formData.append('texto', document.getElementById('postText').value);
    const img = document.getElementById('postImage').files[0];
    if (img) formData.append('imagem', img);
 
    try {
        await apiFetch('/publicacoes', { method: 'POST', body: formData });
        document.getElementById('postForm').reset();
        loadFeed();
    } catch (err) {
        alert(err.message);
    }
});
 