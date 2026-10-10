<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
 
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/jwt_helper.php';
 
$db = (new Database())->getConnection();
 
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rawurldecode($uri);
$method = $_SERVER['REQUEST_METHOD'];
 
$basePath = '/senai_conecta/backend';
if (str_starts_with($uri, $basePath)) {
    $uri = substr($uri, strlen($basePath));
}
if ($uri === '') {
    $uri = '/';
}
 
/* ---------------------------------------------------------------
   FUNÇÕES AUXILIARES
---------------------------------------------------------------- */
 
function getAuthenticatedUser(): ?array {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return JWTHelper::decode($matches[1]);
    }
    return null;
}
 
// Salva uma imagem enviada em /uploads e devolve o nome do arquivo (ou null se inválida)
function saveUpload(array $file): ?string {
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed, true)) {
        return null;
    }
    $dir = __DIR__ . '/uploads/';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $name = uniqid() . '.' . $ext;
    return move_uploaded_file($file['tmp_name'], $dir . $name) ? $name : null;
}
 
// Lista publicações (todas ou só de um usuário), com total de curtidas e se o usuário logado curtiu
function fetchPosts(PDO $db, int $currentUserId, ?int $authorId = null): array {
    $where = $authorId !== null ? "WHERE p.id_usuario = :author" : "";
    $query = "
        SELECT p.*, u.nome, u.username, u.foto AS foto_usuario,
               COUNT(c.id_curtida) AS total_curtidas,
               MAX(CASE WHEN c.id_usuario = :current_user THEN 1 ELSE 0 END) AS curtido_pelo_usuario
        FROM publicacao p
        JOIN usuario u ON p.id_usuario = u.id_usuario
        LEFT JOIN curtida c ON p.id_publicacao = c.id_publicacao
        $where
        GROUP BY p.id_publicacao, u.id_usuario
        ORDER BY p.datahora_publicacao DESC
    ";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':current_user', $currentUserId, PDO::PARAM_INT);
    if ($authorId !== null) {
        $stmt->bindValue(':author', $authorId, PDO::PARAM_INT);
    }
    $stmt->execute();
    return $stmt->fetchAll();
}
 
/* ---------------------------------------------------------------
   ROTAS
---------------------------------------------------------------- */
 
// ROUTE: POST /login
if ($uri === '/login' && $method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data['email'] ?? '');
    $senha = $data['senha'] ?? '';
 
    $stmt = $db->prepare("SELECT * FROM usuario WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
 
    if ($user && $senha === $user['senha']) {
        $token = JWTHelper::encode([
            'id_usuario'  => $user['id_usuario'],
            'username'    => $user['username'],
            'nome'        => $user['nome'],
            'tipo_perfil' => $user['tipo_perfil'],
            'exp'         => time() + (8 * 3600)
        ]);
        echo json_encode(["token" => $token, "usuario" => [
            "id_usuario"  => $user['id_usuario'],
            "nome"        => $user['nome'],
            "username"    => $user['username'],
            "foto"        => $user['foto'],
            "tipo_perfil" => $user['tipo_perfil']
        ]]);
    } else {
        http_response_code(401);
        echo json_encode(["erro" => "E-mail ou senha inválidos."]);
    }
    exit;
}
 
// ROUTE: POST /cadastro
if ($uri === '/cadastro' && $method === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';
 
    // remove o "@" digitado no início e valida o formato do username
    $username = ltrim($username, '@');
    if ($username !== '' && !preg_match('/^[A-Za-z0-9_.\-]{3,50}$/', $username)) {
        http_response_code(400);
        echo json_encode(["erro" => "Nome de usuário deve ter de 3 a 50 caracteres: letras, números, _ . ou -"]);
        exit;
    }
 
    if (empty($nome) || empty($username) || empty($email) || empty($senha)) {
        http_response_code(400);
        echo json_encode(["erro" => "Todos os campos obrigatórios devem ser preenchidos."]);
        exit;
    }
 
    $stmt = $db->prepare("SELECT id_usuario FROM usuario WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["erro" => "Nome de usuário ou e-mail já cadastrados."]);
        exit;
    }
 
    $fotoPath = "default_avatar.png";
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $fotoPath = saveUpload($_FILES['foto']) ?? $fotoPath;
    }
 
    $stmt = $db->prepare("INSERT INTO usuario (nome, username, email, senha, foto) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nome, $username, $email, $senha, $fotoPath]);
 
    http_response_code(201);
    echo json_encode(["mensagem" => "Usuário cadastrado com sucesso!"]);
    exit;
}
 
// ROUTE: GET /usuarios?busca=xxx  (pesquisa por username)
if ($uri === '/usuarios' && $method === 'GET') {
    $busca = ltrim(trim($_GET['busca'] ?? ''), '@');
 
    if ($busca === '') {
        echo json_encode([]);
        exit;
    }
 
    // escapa curingas do LIKE para que "_" e "%" sejam tratados como texto
    $like = '%' . addcslashes($busca, '%_\\') . '%';
 
    $stmt = $db->prepare("
        SELECT id_usuario, nome, username, foto, tipo_perfil
        FROM usuario
        WHERE username LIKE ?
        ORDER BY username ASC
        LIMIT 10
    ");
    $stmt->execute([$like]);
    echo json_encode($stmt->fetchAll());
    exit;
}
 
// ROUTE: GET /usuarios/{username}  (perfil)
if (preg_match('/^\/usuarios\/([^\/]+)$/', $uri, $matches) && $method === 'GET') {
    $username = $matches[1];
 
    $stmt = $db->prepare("SELECT id_usuario, nome, username, foto, tipo_perfil FROM usuario WHERE username = ?");
    $stmt->execute([$username]);
    $perfil = $stmt->fetch();
 
    if (!$perfil) {
        http_response_code(404);
        echo json_encode(["erro" => "Usuário não encontrado."]);
        exit;
    }
 
    $idPerfil = (int) $perfil['id_usuario'];
 
    $stmt = $db->prepare("SELECT COUNT(*) FROM publicacao WHERE id_usuario = ?");
    $stmt->execute([$idPerfil]);
    $totalPublicacoes = (int) $stmt->fetchColumn();
 
    $stmt = $db->prepare("
        SELECT COUNT(*)
        FROM curtida c
        JOIN publicacao p ON c.id_publicacao = p.id_publicacao
        WHERE p.id_usuario = ?
    ");
    $stmt->execute([$idPerfil]);
    $totalCurtidas = (int) $stmt->fetchColumn();
 
    $logado = getAuthenticatedUser();
    $currentUserId = $logado ? (int) $logado['id_usuario'] : 0;
 
    $perfil['total_publicacoes'] = $totalPublicacoes;
    $perfil['total_curtidas_recebidas'] = $totalCurtidas;
    $perfil['publicacoes'] = fetchPosts($db, $currentUserId, $idPerfil);
 
    echo json_encode($perfil);
    exit;
}
 
// ROUTE: GET /publicacoes
if ($uri === '/publicacoes' && $method === 'GET') {
    $user = getAuthenticatedUser();
    $currentUserId = $user ? (int) $user['id_usuario'] : 0;
    echo json_encode(fetchPosts($db, $currentUserId));
    exit;
}
 
// ROUTE: POST /publicacoes  (somente tipo "criador")
if ($uri === '/publicacoes' && $method === 'POST') {
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["erro" => "Acesso não autorizado."]);
        exit;
    }
 
    // confere o tipo de perfil no banco (não confia só no token)
    $stmt = $db->prepare("SELECT tipo_perfil FROM usuario WHERE id_usuario = ?");
    $stmt->execute([$user['id_usuario']]);
    $tipo = $stmt->fetchColumn();
 
    if ($tipo !== 'criador') {
        http_response_code(403);
        echo json_encode(["erro" => "Apenas usuários do tipo criador podem publicar."]);
        exit;
    }
 
    $texto = trim($_POST['texto'] ?? '');
    $imagemPath = null;
 
    if (isset($_FILES['imagem']) && $_FILES['imagem']['error'] === UPLOAD_ERR_OK) {
        $imagemPath = saveUpload($_FILES['imagem']);
        if ($imagemPath === null) {
            http_response_code(400);
            echo json_encode(["erro" => "Formato de imagem inválido. Use JPG, PNG, GIF ou WEBP."]);
            exit;
        }
    }
 
    if ($texto === '' && $imagemPath === null) {
        http_response_code(400);
        echo json_encode(["erro" => "Escreva um texto ou envie uma imagem."]);
        exit;
    }
 
    $stmt = $db->prepare("INSERT INTO publicacao (id_usuario, texto, imagem) VALUES (?, ?, ?)");
    $stmt->execute([$user['id_usuario'], $texto, $imagemPath]);
 
    http_response_code(201);
    echo json_encode(["mensagem" => "Publicação criada com sucesso!"]);
    exit;
}
 
// ROUTE: POST /curtir  (criador e usuário podem curtir)
if ($uri === '/curtir' && $method === 'POST') {
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["erro" => "Acesso não autorizado."]);
        exit;
    }
 
    $data = json_decode(file_get_contents("php://input"), true);
    $id_publicacao = $data['id_publicacao'] ?? null;
 
    $stmt = $db->prepare("SELECT id_curtida FROM curtida WHERE id_publicacao = ? AND id_usuario = ?");
    $stmt->execute([$id_publicacao, $user['id_usuario']]);
    $curtida = $stmt->fetch();
 
    if ($curtida) {
        $delete = $db->prepare("DELETE FROM curtida WHERE id_curtida = ?");
        $delete->execute([$curtida['id_curtida']]);
        echo json_encode(["status" => "removido"]);
    } else {
        $insert = $db->prepare("INSERT INTO curtida (id_publicacao, id_usuario) VALUES (?, ?)");
        $insert->execute([$id_publicacao, $user['id_usuario']]);
        echo json_encode(["status" => "adicionado"]);
    }
    exit;
}
 
// ROUTE: DELETE /publicacoes/{id}
if (preg_match('/^\/publicacoes\/(\d+)$/', $uri, $matches) && $method === 'DELETE') {
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(["erro" => "Acesso não autorizado."]);
        exit;
    }
 
    $id_publicacao = $matches[1];
    $stmt = $db->prepare("DELETE FROM publicacao WHERE id_publicacao = ? AND id_usuario = ?");
    $stmt->execute([$id_publicacao, $user['id_usuario']]);
 
    if ($stmt->rowCount() > 0) {
        echo json_encode(["mensagem" => "Publicação excluída com sucesso."]);
    } else {
        http_response_code(403);
        echo json_encode(["erro" => "Ação não permitida ou publicação inexistente."]);
    }
    exit;
}
 
http_response_code(404);
echo json_encode(["erro" => "Rota não encontrada."]);