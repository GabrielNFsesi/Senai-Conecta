// Barra de pesquisa por @username (usada na página inicial e no perfil)
(function () {
    const input = document.getElementById('searchInput');
    const box = document.getElementById('searchResults');
    if (!input || !box) return;

    let timer;

    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(runSearch, 300);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(timer);
            runSearch();
        }
    });

    // fecha a lista ao clicar fora da barra
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) box.classList.add('hidden');
    });

    input.addEventListener('focus', () => {
        if (box.innerHTML.trim() !== '') box.classList.remove('hidden');
    });

    async function runSearch() {
        const termo = input.value.trim().replace(/^@/, '');

        if (termo === '') {
            box.innerHTML = '';
            box.classList.add('hidden');
            return;
        }

        try {
            const usuarios = await apiFetch('/usuarios?busca=' + encodeURIComponent(termo));

            if (usuarios.length === 0) {
                box.innerHTML = `<div class="search-empty">Nenhum usuário encontrado para "${escapeHtml(termo)}".</div>`;
            } else {
                box.innerHTML = usuarios.map(u => `
                    <a class="search-item" href="${profileUrl(u.username)}">
                        ${renderAvatar(u.foto, u.nome, 'avatar-sm')}
                        <div>
                            <div class="post-author">${escapeHtml(u.nome)}</div>
                            <small style="color:#777">@${escapeHtml(u.username)}</small>
                        </div>
                    </a>
                `).join('');
            }
        } catch (err) {
            box.innerHTML = `<div class="search-empty">${escapeHtml(err.message)}</div>`;
        }
        box.classList.remove('hidden');
    }
})();


(function () {
    function init() {
        const input = document.getElementById('searchInput');
        if (!input) {
            console.error('[busca] Campo #searchInput não encontrado no HTML.');
            return;
        }
 
        const wrapper = input.closest('.search-box') || input.parentElement;
        wrapper.style.position = 'relative';
 
        // cria a caixa de resultados se ela não existir no HTML
        let box = document.getElementById('searchResults');
        if (!box) {
            box = document.createElement('div');
            box.id = 'searchResults';
            wrapper.appendChild(box);
        }
 
        // estilos próprios da caixa (não dependem do style.css)
        const style = document.createElement('style');
        style.textContent = `
            #searchResults { display: none; position: absolute; top: calc(100% + 6px); left: 0; width: 100%;
                min-width: 260px; background: #fff; color: #333; border: 1px solid #e0e0e0; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,.15); z-index: 1000; overflow: hidden; }
            #searchResults.open { display: block; }
            #searchResults .s-item { display: flex; align-items: center; gap: .6rem; padding: .6rem .8rem;
                color: inherit; text-decoration: none; }
            #searchResults .s-item:hover { background: #f4f6f8; }
            #searchResults .s-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
                background: #0056b3; color: #fff; display: flex; align-items: center; justify-content: center;
                font-weight: bold; flex-shrink: 0; }
            #searchResults .s-name { font-weight: bold; }
            #searchResults .s-user { color: #777; font-size: .85rem; }
            #searchResults .s-msg { padding: .8rem; color: #777; font-size: .9rem; }
        `;
        document.head.appendChild(style);
 
        function esc(text) {
            return String(text ?? '').replace(/[&<>"']/g, m => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
            }[m]));
        }
 
        function avatar(u) {
            const inicial = esc((u.nome || '?').trim().charAt(0).toUpperCase());
            if (!u.foto) return `<div class="s-avatar">${inicial}</div>`;
            return `<img class="s-avatar" src="${API_BASE_URL}/uploads/${encodeURIComponent(u.foto)}" alt=""
                         onerror="this.outerHTML='<div class=&quot;s-avatar&quot;>${inicial}</div>'">`;
        }
 
        function show(html) {
            box.innerHTML = html;
            box.classList.add('open');
        }
 
        function hide() {
            box.classList.remove('open');
        }
 
        let timer;
        let lastRequest = 0;
 
        async function runSearch() {
            const termo = input.value.trim().replace(/^@+/, '');
 
            if (termo === '') {
                box.innerHTML = '';
                hide();
                return;
            }
 
            const thisRequest = ++lastRequest;
            show('<div class="s-msg">Buscando...</div>');
 
            try {
                const usuarios = await apiFetch('/usuarios?busca=' + encodeURIComponent(termo));
                if (thisRequest !== lastRequest) return; // ignora respostas antigas
 
                if (!Array.isArray(usuarios) || usuarios.length === 0) {
                    show(`<div class="s-msg">Nenhum usuário encontrado para "${esc(termo)}".</div>`);
                    return;
                }
 
                show(usuarios.map(u => `
                    <a class="s-item" href="perfil.html?u=${encodeURIComponent(u.username)}">
                        ${avatar(u)}
                        <div>
                            <div class="s-name">${esc(u.nome)}</div>
                            <div class="s-user">@${esc(u.username)}</div>
                        </div>
                    </a>
                `).join(''));
            } catch (err) {
                if (thisRequest !== lastRequest) return;
                console.error('[busca] Falha na requisição:', err);
                show(`<div class="s-msg">Não foi possível pesquisar agora. Verifique se o servidor está ligado.</div>`);
            }
        }
 
        input.addEventListener('input', () => {
            clearTimeout(timer);
            timer = setTimeout(runSearch, 300);
        });
 
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(timer);
                runSearch();
            } else if (e.key === 'Escape') {
                hide();
            }
        });
 
        input.addEventListener('focus', () => {
            if (box.innerHTML.trim() !== '') box.classList.add('open');
        });
 
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) hide();
        });
    }
 
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();