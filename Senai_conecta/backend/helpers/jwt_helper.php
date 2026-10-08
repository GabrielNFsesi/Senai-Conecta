<?php
class JWTHelper {
    // DICA: use uma chave secreta para assinar o token.
    private static string $secret = "SENAI_CONECTA_CHAVE_SECRETA_2026";

    // DICA: para criar o JWT, monte Header, Payload e Signature.
    public static function encode(array $payload): string {
        // Define o tipo do token e o algoritmo.
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        // Converta Header e Payload para Base64URL.
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        // Crie a assinatura usando Header + Payload + chave.
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        // Junte as 3 partes do JWT usando ".".
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // DICA: para validar, separe o token e confira a assinatura.
    public static function decode(string $jwt): ?array {
        // Separa Header, Payload e Signature.
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) !== 3) return null;

        // [0] Header, [1] Payload e [2] Signature.
        $header = self::base64UrlDecode($tokenParts[0]);
        $payload = self::base64UrlDecode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];

        // Recrie a assinatura usando a mesma lógica do encode().
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        // Compare a assinatura criada com a recebida.
        if ($base64UrlSignature !== $signatureProvided) return null;

        // Converte o Payload JSON para array.
        $payloadData = json_decode($payload, true);

        // Verifica se o token está expirado.
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) return null;

        return $payloadData;
    }

    // DICA: use para converter texto em Base64URL.
    private static function base64UrlEncode(string $text): string {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
    }

    // DICA: faz o processo inverso para decodificar.
    private static function base64UrlDecode(string $text): string {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $text));
    }
}