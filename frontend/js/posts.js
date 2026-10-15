// Funções compartilhadas entre a página inicial e a página de perfil
 
function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, match => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[match]));
}
 
// Foto do usuário; se não existir/carregar, mostra um círculo com a inicial do nome
function renderAvatar(foto, nome, extraClass = '') {
    const inicial = escapeHtml((nome || '?').trim().charAt(0).toUpperCase());
    const fallback = `<div class="avatar avatar-fallback ${extraClass}">${inicial}</div>`;
    if (!foto) return fallback;
    return `
        <img src="${API_BASE_URL}/uploads/${encodeURIComponent(foto)}" alt="Foto de ${escapeHtml(nome)}"
             class="avatar ${extraClass}"
             onerror="this.outerHTML = this.dataset.fallback" data-fallback='${fallback.replace(/'/g, '&#39;')}'>
    `;
}
 
function profileUrl(username) {
    return `perfil.html?u=${encodeURIComponent(username)}`;
}
 
const ICON_HEART = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
 
function renderPost(post) {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    const isOwner = user && Number(user.id_usuario) === Number(post.id_usuario);
    const isLiked = post.curtido_pelo_usuario == 1;
    const data = new Date(post.datahora_publicacao.replace(' ', 'T'))
        .toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
 
    return `
    <article class="post-card" id="post-${post.id_publicacao}">
        <header class="post-header">
            <a class="post-author-link" href="${profileUrl(post.username)}">
                ${renderAvatar(post.foto_usuario, post.nome)}
                <div class="post-who">
                    <span class="post-author">${escapeHtml(post.nome)}</span>
                    <span class="post-handle">@${escapeHtml(post.username)}</span>
                </div>
            </a>
            <div class="post-meta">
                <time>${data}</time>
                ${isOwner ? `<button class="btn" onclick="deletePost(${post.id_publicacao})">Excluir</button>` : ''}
            </div>
        </header>
        ${post.texto ? `<p class="post-text">${escapeHtml(post.texto)}</p>` : ''}
        ${post.imagem ? `<img src="${API_BASE_URL}/uploads/${encodeURIComponent(post.imagem)}" class="post-image" alt="Imagem da publicação" loading="lazy">` : ''}
        <footer class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id_publicacao})"
                    aria-pressed="${isLiked}" aria-label="${isLiked ? 'Remover curtida' : 'Curtir'}">
                ${ICON_HEART}
                <span>${post.total_curtidas}</span>
            </button>
        </footer>
    </article>
    `;
}
 
async function toggleLike(idPublicacao) {
    if (!localStorage.getItem('token')) {
        openAuthModal();
        return;
    }
    try {
        await apiFetch('/curtir', {
            method: 'POST',
            body: JSON.stringify({ id_publicacao: idPublicacao })
        });
        reloadPage();
    } catch (err) {
        alert(err.message);
    }
}
 
async function deletePost(idPublicacao) {
    if (!confirm('Deseja realmente excluir esta publicação?')) return;
    try {
        await apiFetch(`/publicacoes/${idPublicacao}`, { method: 'DELETE' });
        reloadPage();
    } catch (err) {
        alert(err.message);
    }
}
 