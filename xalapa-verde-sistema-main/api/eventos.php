<?php
require_once "conexion.php";

try {
    $stmt = $pdo->query("SELECT * FROM eventos");
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al consultar eventos: " . $e->getMessage()]);
}
