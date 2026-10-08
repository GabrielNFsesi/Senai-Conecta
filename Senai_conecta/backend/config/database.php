<?php
// Classe responsável pela conexão com o banco de dados
class Database {

    // Dados de acesso ao banco
    private string $host = "localhost";
    private string $db_name = "senai_conecta";
    private string $username = "root";
    private string $password = "";
    // Armazena a conexão
    public ?PDO $conn = null;

    // Cria e retorna a conexão com o banco
    public function getConnection(): PDO {
        // Verifica se ainda não existe uma conexão
        if ($this->conn === null) {
            try {
                // Realiza a conexão usando PDO
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password,
                    [
                        // Ativa o tratamento de erros
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        // Retorna os resultados como array associativo
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
            } catch (PDOException $e) {
                // Retorna erro caso a conexão falhe
                http_response_code(500);
                echo json_encode(["erro" => "Falha na conexão com o banco de dados."]);
                exit;
            }
        }
        // Retorna a conexão
        return $this->conn;
    }
}