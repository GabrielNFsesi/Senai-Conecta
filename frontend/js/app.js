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
 
const postForm = document.getElementById('postForm');
 
// "bound" evita registrar o mesmo envio mais de uma vez (ex.: script carregado duas vezes)
if (postForm && !postForm.dataset.bound) {
    postForm.dataset.bound = '1';
 
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
 
        // "sending" evita enviar de novo enquanto a publicação anterior ainda está em andamento
        if (postForm.dataset.sending) return;
        postForm.dataset.sending = '1';
 
        const btn = postForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
 
        const formData = new FormData();
        formData.append('texto', document.getElementById('postText').value);
        const img = document.getElementById('postImage').files[0];
        if (img) formData.append('imagem', img);
 
        try {
            await apiFetch('/publicacoes', { method: 'POST', body: formData });
            postForm.reset();
            loadFeed();
        } catch (err) {
            alert(err.message);
        } finally {
            delete postForm.dataset.sending;
            if (btn) btn.disabled = false;
        }
    });
}
