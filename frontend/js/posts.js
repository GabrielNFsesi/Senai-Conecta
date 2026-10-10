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
 
function renderPost(post) {
    const user = JSON.parse(localStorage.getItem('usuario') || 'null');
    const isOwner = user && Number(user.id_usuario) === Number(post.id_usuario);
    const isLiked = post.curtido_pelo_usuario == 1;
 
    return `
    <div class="post-card" id="post-${post.id_publicacao}">
        <div class="post-header">
            <a class="post-author-link" href="${profileUrl(post.username)}">
                ${renderAvatar(post.foto_usuario, post.nome, 'avatar-sm')}
                <div>
                    <span class="post-author">${escapeHtml(post.nome)}</span>
                    <span style="color:#777">@${escapeHtml(post.username)}</span>
                </div>
            </a>
            ${isOwner ? `<button class="btn" onclick="deletePost(${post.id_publicacao})">Excluir</button>` : ''}
        </div>
        ${post.texto ? `<p>${escapeHtml(post.texto)}</p>` : ''}
        ${post.imagem ? `<img src="${API_BASE_URL}/uploads/${encodeURIComponent(post.imagem)}" class="post-image">` : ''}
        <div class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id_publicacao})">
                ${isLiked ? '♥' : '♡'} ${post.total_curtidas}
            </button>
            <small style="color:#888">${new Date(post.datahora_publicacao).toLocaleString('pt-BR')}</small>
        </div>
    </div>
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
 