USE xalapa_verde;

INSERT INTO roles (nombre) VALUES ('ciudadano'),('organizador'),('administrador');

INSERT INTO usuarios (id_rol, nombre, correo, password_hash) VALUES
 (3,'Admin Xalapa Verde','admin@xalapaverde.mx','hash_demo_1'),
 (2,'Ana Organizadora','ana@correo.com','hash_demo_2'),
 (1,'Luis Ciudadano','luis@correo.com','hash_demo_3');

INSERT INTO categorias_reporte (nombre) VALUES
 ('Residuos'),('Tala de árboles'),('Fuga de agua'),('Contaminación del aire');

INSERT INTO reportes (id_usuario, id_categoria, titulo, descripcion, ubicacion) VALUES
 (3,1,'Basura acumulada','Acumulación de residuos en la esquina.','Centro, Xalapa');

INSERT INTO eventos (id_organizador, titulo, descripcion, lugar, fecha_hora, cupo) VALUES
 (2,'Reforestación comunitaria','Plantación de árboles nativos.','Parque Natura','2026-12-05 09:00:00',50);

INSERT INTO inscripciones (id_usuario, id_evento) VALUES (3,1);

INSERT INTO comentarios (id_reporte, id_usuario, texto) VALUES
 (1,2,'Se canalizará con limpia pública.');
