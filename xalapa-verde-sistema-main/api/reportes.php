<?php
ini_set("display_errors", 0);
session_start();
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

function obtenerColumnasTabla(PDO $pdo, string $tabla): array {
    $stmt = $pdo->query("DESCRIBE `$tabla`");
    $cols = [];
    foreach ($stmt->fetchAll() as $fila) {
        $campo = $fila["Field"] ?? $fila["field"] ?? "";
        if ($campo !== "") {
            $cols[strtolower($campo)] = $campo;
        }
    }
    return $cols;
}

function buscarColumnaReportes(array $cols, array $candidatas): ?string {
    foreach ($candidatas as $cand) {
        if (isset($cols[strtolower($cand)])) {
            return $cols[strtolower($cand)];
        }
    }
    return null;
}

function obtenerPrimeraCategoriaId(PDO $pdo): ?int {
    try {
        $stmt = $pdo->query("SELECT * FROM categorias_reporte ORDER BY 1 ASC LIMIT 1");
        $fila = $stmt->fetch();
        if (!$fila) return null;
        foreach ($fila as $k => $v) {
            if (str_contains(strtolower((string)$k), "id") && is_numeric($v)) {
                return (int)$v;
            }
        }
        $primero = reset($fila);
        return is_numeric($primero) ? (int)$primero : null;
    } catch (PDOException $e) {
        return null;
    }
}

if (isset($_GET["categorias"])) {
    try {
        $stmt = $pdo->query("SELECT * FROM categorias_reporte ORDER BY 1 ASC");
        $rows = $stmt->fetchAll();
        $normalizadas = [];
        foreach ($rows as $r) {
            $idCat = null;
            foreach ($r as $k => $v) {
                if (str_contains(strtolower((string)$k), "id") && is_numeric($v)) {
                    $idCat = (int)$v;
                    break;
                }
            }
            $nombreCat = $r["nombre"] ?? $r["categoria"] ?? $r["titulo"] ?? ("Categoría #" . ($idCat ?? 1));
            $normalizadas[] = [
                "id_categoria" => $idCat ?? 1,
                "nombre" => $nombreCat,
            ];
        }
        echo json_encode($normalizadas);
    } catch (PDOException $e) {
        echo json_encode([]);
    }
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true) ?? [];
$idUsuario   = (int)($datos["id_usuario"] ?? $_SESSION["usuario"]["id_usuario"] ?? 1);
$idCategoria = isset($datos["id_categoria"]) && (int)$datos["id_categoria"] > 0
    ? (int)$datos["id_categoria"]
    : (obtenerPrimeraCategoriaId($pdo) ?? 1);
$descripcion = trim($datos["descripcion"] ?? "");

if ($descripcion === "") {
    http_response_code(400);
    echo json_encode(["error" => "Escribe una descripción para el reporte."]);
    exit;
}

try {
    $cols = obtenerColumnasTabla($pdo, "reportes");

    $colUsuario     = buscarColumnaReportes($cols, ["id_usuario", "usuario_id", "iduser"]);
    $colCategoria   = buscarColumnaReportes($cols, ["id_categoria", "categoria_id", "idcategoria"]);
    $colDescripcion = buscarColumnaReportes($cols, ["descripcion", "detalle", "mensaje", "comentario", "reporte"]);
    $colEstado      = buscarColumnaReportes($cols, ["estado", "estatus"]);

    $campos = [];
    $valores = [];

    if ($colUsuario) {
        $campos[] = "`$colUsuario`";
        $valores[] = $idUsuario;
    }
    if ($colCategoria) {
        $campos[] = "`$colCategoria`";
        $valores[] = $idCategoria;
    }
    if ($colDescripcion) {
        $campos[] = "`$colDescripcion`";
        $valores[] = $descripcion;
    }
    if ($colEstado) {
        $campos[] = "`$colEstado`";
        $valores[] = "Pendiente";
    }

    if (empty($campos)) {
        http_response_code(500);
        echo json_encode(["error" => "No se encontraron columnas compatibles en la tabla reportes."]);
        exit;
    }

    $placeholders = implode(", ", array_fill(0, count($campos), "?"));
    $sql = "INSERT INTO reportes (" . implode(", ", $campos) . ") VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);

    http_response_code(201);
    echo json_encode([
        "mensaje" => "Reporte guardado en base de datos.",
        "id" => (int)$pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al guardar reporte: " . $e->getMessage()]);
}
