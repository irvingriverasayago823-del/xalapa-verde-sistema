<?php
ini_set("display_errors", 0);
session_start();
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

$datos = json_decode(file_get_contents("php://input"), true) ?? [];

$idUsuario       = (int)($datos["id_usuario"] ?? $_SESSION["usuario"]["id_usuario"] ?? 1);
$huellaEnergia   = (float)($datos["huella_energia"] ?? 0);
$huellaAgua      = (float)($datos["huella_agua"] ?? 0);
$huellaTransporte = (float)($datos["huella_transporte"] ?? 0);
$huellaResiduos  = (float)($datos["huella_residuos"] ?? 0);
$huellaTotal     = (float)($datos["huella_total"] ?? ($huellaEnergia + $huellaAgua + $huellaTransporte + $huellaResiduos));

function buscarColumna(array $cols, array $candidatas): ?string {
    foreach ($candidatas as $cand) {
        if (isset($cols[strtolower($cand)])) {
            return $cols[strtolower($cand)];
        }
    }
    return null;
}

try {
    $stmtDesc = $pdo->query("DESCRIBE calculos_huella");
    $cols = [];
    foreach ($stmtDesc->fetchAll() as $fila) {
        $campo = $fila["Field"] ?? $fila["field"] ?? "";
        if ($campo !== "") {
            $cols[strtolower($campo)] = $campo;
        }
    }

    $colUsuario    = buscarColumna($cols, ["id_usuario", "usuario_id", "iduser"]);
    $colEnergia    = buscarColumna($cols, ["huella_energia", "energia", "energia_kwh", "co2_energia"]);
    $colAgua       = buscarColumna($cols, ["huella_agua", "agua", "agua_m3", "co2_agua"]);
    $colTransporte = buscarColumna($cols, ["huella_transporte", "transporte", "transporte_km", "co2_transporte"]);
    $colResiduos   = buscarColumna($cols, ["huella_residuos", "residuos", "residuos_kg", "co2_residuos"]);
    $colTotal      = buscarColumna($cols, ["huella_total", "total", "co2_total", "huella_mensual"]);

    $campos = [];
    $valores = [];

    if ($colUsuario) {
        $campos[] = "`$colUsuario`";
        $valores[] = $idUsuario;
    }
    if ($colEnergia) {
        $campos[] = "`$colEnergia`";
        $valores[] = $huellaEnergia;
    }
    if ($colAgua) {
        $campos[] = "`$colAgua`";
        $valores[] = $huellaAgua;
    }
    if ($colTransporte) {
        $campos[] = "`$colTransporte`";
        $valores[] = $huellaTransporte;
    }
    if ($colResiduos) {
        $campos[] = "`$colResiduos`";
        $valores[] = $huellaResiduos;
    }
    if ($colTotal) {
        $campos[] = "`$colTotal`";
        $valores[] = $huellaTotal;
    }

    if (empty($campos)) {
        http_response_code(500);
        echo json_encode(["error" => "No se encontraron columnas compatibles en calculos_huella."]);
        exit;
    }

    $placeholders = implode(", ", array_fill(0, count($campos), "?"));
    $sql = "INSERT INTO calculos_huella (" . implode(", ", $campos) . ") VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);

    http_response_code(201);
    echo json_encode([
        "mensaje" => "Cálculo guardado en base de datos.",
        "id" => (int)$pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar cálculo: " . $e->getMessage()]);
}
