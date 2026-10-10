document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfile();
});
 
// chamada por auth.js / posts.js sempre que o conteúdo da página precisa ser atualizado
function reloadPage() {
    loadProfile();
}
 
async function loadProfile() {
    const header = document.getElementById('profileHeader');
    const postsBox = document.getElementById('profilePosts');
    const username = new URLSearchParams(window.location.search).get('u');
 
    if (!username) {
        header.innerHTML = `<p class="error-msg">Nenhum usuário informado.</p>`;
        postsBox.innerHTML = '';
        return;
    }
 
    try {
        const perfil = await apiFetch('/usuarios/' + encodeURIComponent(username));
 
        document.title = `@${perfil.username} - SENAI Conecta`;
 
        header.innerHTML = `
            ${renderAvatar(perfil.foto, perfil.nome, 'avatar-lg')}
            <div class="profile-info">
                <h2>${escapeHtml(perfil.nome)}</h2>
                <p class="profile-username">@${escapeHtml(perfil.username)}</p>
                <span class="badge">${perfil.tipo_perfil === 'criador' ? 'Criador' : 'Usuário'}</span>
                <div class="profile-stats">
                    <div><strong>${perfil.total_publicacoes}</strong> publicações</div>
                    <div><strong>${perfil.total_curtidas_recebidas}</strong> curtidas recebidas</div>
                </div>
            </div>
        `;
 
        postsBox.innerHTML = perfil.publicacoes.length
            ? perfil.publicacoes.map(post => renderPost(post)).join('')
            : `<p class="empty-msg">Este usuário ainda não fez publicações.</p>`;
    } catch (err) {
        header.innerHTML = `<p class="error-msg">${escapeHtml(err.message)}</p>`;
        postsBox.innerHTML = '';
    }
}