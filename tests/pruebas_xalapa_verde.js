const assert = require("assert");

// Función equivalente al cálculo de huella mensual en kg CO2e
function calcularHuella({ energiaKwh, aguaM3, transporteKm, residuosKg, separaResiduos }) {
  const factorEnergia = 0.45;
  const factorAgua = 0.35;
  const factorTransporte = 0.18;
  const factorResiduos = separaResiduos ? 0.40 : 0.85;

  const huellaEnergia = energiaKwh * factorEnergia;
  const huellaAgua = aguaM3 * factorAgua;
  const huellaTransporte = transporteKm * factorTransporte;
  const huellaResiduos = residuosKg * factorResiduos;
  const total = Number(
    (huellaEnergia + huellaAgua + huellaTransporte + huellaResiduos).toFixed(2)
  );

  return {
    huellaEnergia,
    huellaAgua,
    huellaTransporte,
    huellaResiduos,
    total
  };
}

// Validación de registro de usuario
function validarRegistro({ nombre, correo, password, confirmPassword }) {
  if (!nombre || !nombre.trim()) return { ok: false, error: "Nombre requerido" };
  if (!correo || !correo.includes("@")) return { ok: false, error: "Correo inválido" };
  if (!password || password.length < 6) return { ok: false, error: "Contraseña muy corta" };
  if (password !== confirmPassword) return { ok: false, error: "Las contraseñas no coinciden" };
  return { ok: true };
}

// Validación de reporte ambiental
function validarReporte({ idCategoria, descripcion }) {
  if (!idCategoria) return { ok: false, error: "Categoría requerida" };
  if (!descripcion || descripcion.trim().length < 3) {
    return { ok: false, error: "Descripción muy corta" };
  }
  return { ok: true };
}

// --- PRUEBAS UNITARIAS ---
const resultadoHuella = calcularHuella({
  energiaKwh: 10,
  aguaM3: 5,
  transporteKm: 20,
  residuosKg: 4,
  separaResiduos: true
});
assert.strictEqual(resultadoHuella.total, 11.45);

assert.strictEqual(
  validarRegistro({
    nombre: "Irving",
    correo: "irving@ejemplo.com",
    password: "password123",
    confirmPassword: "password123"
  }).ok,
  true
);

assert.strictEqual(
  validarRegistro({
    nombre: "Irving",
    correo: "irving@ejemplo.com",
    password: "password123",
    confirmPassword: "otra"
  }).ok,
  false
);

assert.strictEqual(
  validarReporte({ idCategoria: 1, descripcion: "Basura acumulada en esquina" }).ok,
  true
);

assert.strictEqual(
  validarReporte({ idCategoria: 1, descripcion: "  " }).ok,
  false
);

console.log("Todas las pruebas unitarias de Xalapa Verde pasaron correctamente.");
