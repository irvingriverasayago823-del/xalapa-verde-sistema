CREATE DATABASE IF NOT EXISTS xalapa_verde
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE xalapa_verde;

CREATE TABLE roles (
  id_rol  TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id_usuario    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rol        TINYINT UNSIGNED NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
    REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE categorias_reporte (
  id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE reportes (
  id_reporte   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario   INT UNSIGNED NOT NULL,
  id_categoria INT UNSIGNED NOT NULL,
  titulo       VARCHAR(150) NOT NULL,
  descripcion  TEXT NOT NULL,
  ubicacion    VARCHAR(200),
  estatus      ENUM('pendiente','en_proceso','resuelto') DEFAULT 'pendiente',
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporte_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_reporte_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias_reporte(id_categoria) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE eventos (
  id_evento      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_organizador INT UNSIGNED NOT NULL,
  titulo         VARCHAR(150) NOT NULL,
  descripcion    TEXT,
  lugar          VARCHAR(200) NOT NULL,
  fecha_hora     DATETIME NOT NULL,
  cupo           SMALLINT UNSIGNED,
  CONSTRAINT fk_evento_organizador FOREIGN KEY (id_organizador)
    REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE inscripciones (
  id_usuario        INT UNSIGNED NOT NULL,
  id_evento         INT UNSIGNED NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_evento),
  CONSTRAINT fk_insc_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_insc_evento FOREIGN KEY (id_evento)
    REFERENCES eventos(id_evento) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comentarios (
  id_comentario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_reporte    INT UNSIGNED NOT NULL,
  id_usuario    INT UNSIGNED NOT NULL,
  texto         VARCHAR(500) NOT NULL,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_com_reporte FOREIGN KEY (id_reporte)
    REFERENCES reportes(id_reporte) ON DELETE CASCADE,
  CONSTRAINT fk_com_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;
