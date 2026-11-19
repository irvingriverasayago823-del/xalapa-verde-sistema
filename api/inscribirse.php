<?php
require_once "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true) ?? [];
$idUsuario = (int)($datos["id_usuario"] ?? 0);
$idEvento  = (int)($datos["id_evento"] ?? 0);

if ($idUsuario <= 0 || $idEvento <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan id_usuario o id_evento"]);
    exit;
}

try {
    $sql = "INSERT INTO inscripciones (id_usuario, id_evento, fecha_inscripcion) VALUES (?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$idUsuario, $idEvento]);

    http_response_code(201);
    echo json_encode(["mensaje" => "Te has inscrito correctamente al evento"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo guardar la inscripción: " . $e->getMessage()]);
}
