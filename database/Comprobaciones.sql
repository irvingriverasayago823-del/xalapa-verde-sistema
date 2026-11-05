USE xalapa_verde;

SHOW TABLES;

DESCRIBE usuarios;

SHOW CREATE TABLE inscripciones;

SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'xalapa_verde'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Estas 5 deben dar ERROR (es lo que se espera)
INSERT INTO usuarios (id_rol,nombre,correo,password_hash) VALUES (99,'X','x@x.com','h');

INSERT INTO roles (nombre) VALUES ('ciudadano');

INSERT INTO inscripciones (id_usuario,id_evento) VALUES (3,1);

DELETE FROM roles WHERE id_rol = 1;

INSERT INTO reportes (id_usuario,id_categoria,titulo,descripcion) VALUES (3,99,'T','D');

-- Prueba de cascada
DELETE FROM eventos WHERE id_evento = 1;

SELECT * FROM inscripciones;
