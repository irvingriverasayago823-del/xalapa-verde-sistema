<?php
ini_set("display_errors", 0);
session_start();
header("Content-Type: application/json; charset=utf-8");
require_once "conexion.php";

$accion = $_GET["accion"] ?? "";

if ($accion === "sesion") {
    echo json_encode(["usuario" => $_SESSION["usuario"] ?? null]);
    exit;
}

if ($accion === "logout") {
    $_SESSION = [];
    session_destroy();
    echo json_encode(["mensaje" => "Sesión cerrada"]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true) ?? [];

function analizarTablaUsuarios(PDO $pdo): array {
    $stmt = $pdo->query("DESCRIBE usuarios");
    $cols = [];
    $colPassDetectada = null;
    $colCorreoDetectada = null;

    foreach ($stmt->fetchAll() as $fila) {
        $campo = $fila["Field"] ?? $fila["field"] ?? "";
        if ($campo === "") continue;
        $lower = strtolower($campo);
        $cols[$lower] = $campo;

        if (!$colPassDetectada && (str_contains($lower, "pass") || str_contains($lower, "contra") || str_contains($lower, "clave"))) {
            $colPassDetectada = $campo;
        }
        if (!$colCorreoDetectada && (str_contains($lower, "correo") || str_contains($lower, "email") || str_contains($lower, "mail"))) {
            $colCorreoDetectada = $campo;
        }
    }

    return [
        "cols"   => $cols,
        "correo" => $colCorreoDetectada ?? "correo",
        "pass"   => $colPassDetectada,
    ];
}

if ($accion === "registro") {
    $nombre   = trim($datos["nombre"] ?? "");
    $correo   = trim($datos["correo"] ?? "");
    $colonia  = trim($datos["colonia"] ?? "");
    $password = (string)($datos["password"] ?? "");

    if ($nombre === "" || $correo === "" || $password === "") {
        http_response_code(400);
        echo json_encode(["error" => "Completa nombre, correo y contraseña."]);
        exit;
    }

    try {
        $info = analizarTablaUsuarios($pdo);
        $cols = $info["cols"];
        $colCorreo = $info["correo"];
        $colPass = $info["pass"];

        $check = $pdo->prepare("SELECT * FROM usuarios WHERE `$colCorreo` = ? LIMIT 1");
        $check->execute([$correo]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "Ese correo ya está registrado."]);
            exit;
        }

        $campos = [];
        $valores = [];

        if (isset($cols["nombre"])) {
            $campos[] = "`" . $cols["nombre"] . "`";
            $valores[] = $nombre;
        } elseif (isset($cols["nombre_completo"])) {
            $campos[] = "`" . $cols["nombre_completo"] . "`";
            $valores[] = $nombre;
        }

        $campos[] = "`$colCorreo`";
        $valores[] = $correo;

        if (isset($cols["colonia"]) && $colonia !== "") {
            $campos[] = "`" . $cols["colonia"] . "`";
            $valores[] = $colonia;
        }

        if ($colPass) {
            $campos[] = "`$colPass`";
            $valores[] = password_hash($password, PASSWORD_DEFAULT);
        }

        if (isset($cols["id_rol"])) {
            $campos[] = "`" . $cols["id_rol"] . "`";
            $valores[] = 2;
        }

        $placeholders = implode(", ", array_fill(0, count($campos), "?"));
        $sql = "INSERT INTO usuarios (" . implode(", ", $campos) . ") VALUES ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($valores);

        $idNuevo = (int)$pdo->lastInsertId();
        $usuario = [
            "id_usuario" => $idNuevo ?: 1,
            "nombre" => $nombre,
            "correo" => $correo,
            "colonia" => $colonia,
            "rol" => "ciudadano",
        ];
        $_SESSION["usuario"] = $usuario;

        http_response_code(201);
        echo json_encode(["mensaje" => "Cuenta creada.", "usuario" => $usuario]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al registrar: " . $e->getMessage()]);
    }
    exit;
}

if ($accion === "login") {
    $correo   = trim($datos["correo"] ?? "");
    $password = (string)($datos["password"] ?? "");

    if ($correo === "" || $password === "") {
        http_response_code(400);
        echo json_encode(["error" => "Ingresa correo y contraseña."]);
        exit;
    }

    try {
        $info = analizarTablaUsuarios($pdo);
        $colCorreo = $info["correo"];
        $colPass = $info["pass"];

        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE `$colCorreo` = ? LIMIT 1");
        $stmt->execute([$correo]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Correo o contraseña incorrectos."]);
            exit;
        }

        $valida = true;
        if ($colPass && isset($user[$colPass])) {
            $passGuardada = (string)$user[$colPass];
            $valida = password_verify($password, $passGuardada) || hash_equals($passGuardada, $password);
        }

        if (!$valida) {
            http_response_code(401);
            echo json_encode(["error" => "Correo o contraseña incorrectos."]);
            exit;
        }

        $usuario = [
            "id_usuario" => (int)($user["id_usuario"] ?? $user["id"] ?? 1),
            "nombre" => $user["nombre"] ?? $user["nombre_completo"] ?? $correo,
            "correo" => $correo,
            "colonia" => $user["colonia"] ?? "",
            "rol" => "ciudadano",
        ];
        $_SESSION["usuario"] = $usuario;

        echo json_encode(["mensaje" => "Sesión iniciada.", "usuario" => $usuario]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al iniciar sesión: " . $e->getMessage()]);
    }
    exit;
}

http_response_code(400);
echo json_encode(["error" => "Acción no válida."]);
