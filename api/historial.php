<?php
require_once "conexion.php";

$tipo = $_GET["tipo"] ?? "reportes";

try {
    if ($tipo === "huella") {
        $idUsuario = isset($_GET["id_usuario"]) ? (int)$_GET["id_usuario"] : 0;
        if ($idUsuario > 0) {
            $stmt = $pdo->prepare("SELECT * FROM calculos_huella WHERE id_usuario = ? ORDER BY 1 DESC LIMIT 10");
            $stmt->execute([$idUsuario]);
        } else {
            $stmt = $pdo->query("SELECT * FROM calculos_huella ORDER BY 1 DESC LIMIT 10");
        }
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // Por defecto: reportes recientes
    $stmt = $pdo->query("SELECT * FROM reportes ORDER BY 1 DESC LIMIT 15");
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar historial: " . $e->getMessage()]);
}
