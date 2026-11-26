let estadoApp = {
  usuario: null,
  historialHuella: [],
  campanas: [],
  reportes: [],
  inscritosCount: 0,
};

document.addEventListener("DOMContentLoaded", () => {
  configurarPantallaAcceso();
  configurarNavegacionSidebar();
  configurarModalGuia();
  configurarHuella();
  configurarReportes();
  configurarPerfil();
  configurarExportacion();

  verificarSesionInicial();
});

function mostrarAlerta(id, mensaje) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.textContent = mensaje;
}

function ocultarAlerta(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

// --- PANTALLA DE ACCESO (BIENVENIDA / LOGIN / REGISTRO) ---
function mostrarSubvistaAcceso(nombre) {
  ["box-info", "form-login", "form-registro"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = id !== nombre;
  });
}

function configurarPantallaAcceso() {
  document.getElementById("btn-mostrar-login")?.addEventListener("click", () => {
    ocultarAlerta("alerta-login");
    mostrarSubvistaAcceso("form-login");
  });

  document.getElementById("btn-mostrar-registro")?.addEventListener("click", () => {
    ocultarAlerta("alerta-registro");
    mostrarSubvistaAcceso("form-registro");
  });

  document.getElementById("link-ir-registro")?.addEventListener("click", () => {
    ocultarAlerta("alerta-registro");
    mostrarSubvistaAcceso("form-registro");
  });

  document.getElementById("link-ir-login")?.addEventListener("click", () => {
    ocultarAlerta("alerta-login");
    mostrarSubvistaAcceso("form-login");
  });

  document.getElementById("btn-marca-inicio")?.addEventListener("click", () => {
    if (estadoApp.usuario) {
      cambiarTab("tab-inicio");
    } else {
      mostrarSubvistaAcceso("box-info");
    }
  });

  // LOGIN
  document.getElementById("form-login")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarAlerta("alerta-login");

    const correo = document.getElementById("login-correo").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch("api/auth.php?accion=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        mostrarAlerta("alerta-login", data.error || "Correo o contraseña incorrectos.");
        return;
      }

      entrarEnApp(data.usuario || { id_usuario: 1, nombre: correo, correo, rol: "ciudadano" });
    } catch (err) {
      console.error(err);
      mostrarAlerta("alerta-login", "Error al conectar con el servidor.");
    }
  });

  // REGISTRO
  document.getElementById("form-registro")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarAlerta("alerta-registro");

    const nombre = document.getElementById("reg-nombre").value.trim();
    const correo = document.getElementById("reg-correo").value.trim();
    const colonia = document.getElementById("reg-colonia").value.trim();
    const password = document.getElementById("reg-password").value;
    const password2 = document.getElementById("reg-password2").value;

    if (password !== password2) {
      mostrarAlerta("alerta-registro", "Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("api/auth.php?accion=registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, colonia, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        mostrarAlerta("alerta-registro", data.error || "No se pudo crear la cuenta.");
        return;
      }

      const usuarioCreado = data.usuario || {
        id_usuario: 1,
        nombre,
        correo,
        colonia,
        rol: "ciudadano",
      };
      entrarEnApp(usuarioCreado);
    } catch (err) {
      console.error(err);
      mostrarAlerta("alerta-registro", "Error al registrar usuario.");
    }
  });

  // LOGOUT
  document.getElementById("btn-logout-top")?.addEventListener("click", async () => {
    try {
      await fetch("api/auth.php?accion=logout");
    } catch (err) {
      console.error(err);
    }
    estadoApp.usuario = null;
    document.getElementById("vista-app").hidden = true;
    document.getElementById("vista-acceso").hidden = false;
    document.getElementById("badge-usuario").hidden = true;
    document.getElementById("btn-logout-top").hidden = true;
    mostrarSubvistaAcceso("box-info");
  });
}

async function verificarSesionInicial() {
  try {
    const res = await fetch("api/auth.php?accion=sesion");
    if (res.ok) {
      const data = await res.json();
      if (data && data.usuario) {
        entrarEnApp(data.usuario);
        return;
      }
    }
  } catch (err) {
    console.error(err);
  }
  mostrarSubvistaAcceso("box-info");
}

function entrarEnApp(usuario) {
  estadoApp.usuario = usuario;

  document.getElementById("vista-acceso").hidden = true;
  document.getElementById("vista-app").hidden = false;

  const badge = document.getElementById("badge-usuario");
  badge.hidden = false;
  badge.textContent = `${usuario.nombre} · ${usuario.rol || "ciudadano"}`;

  document.getElementById("btn-logout-top").hidden = false;

  cambiarTab("tab-inicio");
  llenarFormularioPerfil(usuario);
  cargarTodo();
}

function llenarFormularioPerfil(usuario) {
  const nombreEl = document.getElementById("perfil-nombre");
  const correoEl = document.getElementById("perfil-correo");
  const coloniaEl = document.getElementById("perfil-colonia");
  if (nombreEl) nombreEl.value = usuario.nombre || "";
  if (correoEl) correoEl.value = usuario.correo || "";
  if (coloniaEl) coloniaEl.value = usuario.colonia || "";
}

// --- NAVEGACIÓN SIDEBAR ---
function configurarNavegacionSidebar() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => cambiarTab(btn.dataset.tab));
  });
}

function cambiarTab(tabId) {
  document.querySelectorAll(".nav-item").forEach((b) => {
    b.classList.toggle("activo", b.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach((p) => {
    p.classList.toggle("activa", p.id === tabId);
  });
}

// --- MODAL GUÍA ---
function configurarModalGuia() {
  const modal = document.getElementById("modal-guia");
  document.getElementById("btn-guia")?.addEventListener("click", () => {
    if (modal) modal.hidden = false;
  });
  document.getElementById("btn-cerrar-guia")?.addEventListener("click", () => {
    if (modal) modal.hidden = true;
  });
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true;
  });
}

// --- CARGA DE DATOS ---
async function cargarTodo() {
  await Promise.all([
    cargarHistorialHuella(),
    cargarCampanas(),
    cargarCategoriasReporte(),
    cargarReportes(),
  ]);
  actualizarKPIs();
}

function actualizarKPIs() {
  const hist = estadoApp.historialHuella;
  const ultimo = hist.length > 0 ? Number(hist[0].huella_total ?? hist[0].total ?? 0).toFixed(1) : "—";
  const totalCalc = hist.length;
  const campActivas = estadoApp.campanas.length || 3;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt("kpi-ultima-huella", ultimo);
  setTxt("kpi-total-calculos", totalCalc);
  setTxt("kpi-campanas-inscritas", estadoApp.inscritosCount);
  setTxt("kpi-campanas-activas", campActivas);

  setTxt("rep-ultima-huella", ultimo);
  setTxt("rep-total-calculos", totalCalc);
  setTxt("rep-total-campanas", estadoApp.inscritosCount);
}

// --- HUELLA DE CARBONO ---
function configurarHuella() {
  document.getElementById("form-huella")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarAlerta("alerta-huella");

    const energia = Number(document.getElementById("huella-energia").value) || 0;
    const agua = Number(document.getElementById("huella-agua").value) || 0;
    const tipoTrans = document.getElementById("huella-tipo-transporte").value;
    const distancia = Number(document.getElementById("huella-distancia").value) || 0;
    const residuos = Number(document.getElementById("huella-residuos").value) || 0;
    const separa = document.getElementById("huella-separa").value;

    const factorTrans =
      tipoTrans === "bici" ? 0 :
      tipoTrans === "bus" ? 0.089 :
      tipoTrans === "moto" ? 0.113 : 0.192;

    const factorRes = separa === "si" ? 0.25 : 0.45;

    const hEnergia = +(energia * 0.438).toFixed(2);
    const hAgua = +(agua * 0.344).toFixed(2);
    const hTransporte = +(distancia * factorTrans).toFixed(2);
    const hResiduos = +(residuos * factorRes).toFixed(2);
    const total = +(hEnergia + hAgua + hTransporte + hResiduos).toFixed(2);

    const box = document.getElementById("resultado-huella");
    box.hidden = false;
    box.innerHTML = `
      <strong>Total estimado: ${total.toFixed(2)} kg CO₂e / mes</strong>
      <p>Energía: ${hEnergia.toFixed(2)} · Agua: ${hAgua.toFixed(2)} · Transporte: ${hTransporte.toFixed(2)} · Residuos: ${hResiduos.toFixed(2)}</p>
    `;

    const idUsuario = estadoApp.usuario?.id_usuario ? Number(estadoApp.usuario.id_usuario) : 1;

    try {
      const res = await fetch("api/huella.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuario,
          huella_energia: hEnergia,
          huella_agua: hAgua,
          huella_transporte: hTransporte,
          huella_residuos: hResiduos,
          huella_total: total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      mostrarAlerta("alerta-huella", data.mensaje || data.error || "Cálculo guardado.");
      await cargarHistorialHuella();
      actualizarKPIs();
    } catch (err) {
      console.error(err);
      mostrarAlerta("alerta-huella", "No se pudo guardar en la base de datos.");
    }
  });
}

async function cargarHistorialHuella() {
  const tbody = document.getElementById("tbody-historial-huella");
  if (!tbody) return;

  try {
    const res = await fetch("api/historial.php?tipo=huella");
    const lista = await res.json();
    if (!Array.isArray(lista) || lista.length === 0) {
      estadoApp.historialHuella = [];
      tbody.innerHTML = '<tr><td colspan="6">Sin cálculos registrados aún.</td></tr>';
      return;
    }

    estadoApp.historialHuella = lista;
    tbody.innerHTML = lista
      .map((item) => {
        const fecha = item.fecha_calculo ?? item.fecha ?? "—";
        const en = Number(item.huella_energia ?? item.energia ?? 0).toFixed(2);
        const ag = Number(item.huella_agua ?? item.agua ?? 0).toFixed(2);
        const tr = Number(item.huella_transporte ?? item.transporte ?? 0).toFixed(2);
        const re = Number(item.huella_residuos ?? item.residuos ?? 0).toFixed(2);
        const tot = Number(item.huella_total ?? item.total ?? 0).toFixed(2);
        return `
          <tr>
            <td>${fecha}</td>
            <td>${en}</td>
            <td>${ag}</td>
            <td>${tr}</td>
            <td>${re}</td>
            <td><strong>${tot}</strong></td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6">No se pudo cargar el historial.</td></tr>';
  }
}

// --- CAMPAÑAS E INSCRIPCIÓN ---
async function cargarCampanas() {
  const cont = document.getElementById("grid-campanas");
  if (!cont) return;

  try {
    const res = await fetch("api/eventos.php");
    const eventos = await res.json();
    estadoApp.campanas = Array.isArray(eventos) ? eventos : [];

    if (estadoApp.campanas.length === 0) {
      cont.innerHTML = "<p>No hay campañas disponibles.</p>";
      return;
    }

    const iconos = ["🚲", "♻️", "🌱"];
    cont.innerHTML = estadoApp.campanas
      .map((ev, idx) => {
        const id = ev.id_evento ?? ev.id ?? idx + 1;
        const nombre = ev.nombre ?? ev.titulo ?? "Campaña";
        const desc = ev.descripcion ?? "";
        const fecha = ev.fecha_inicio ?? ev.fecha ?? "Xalapa";
        return `
          <article class="campana-card">
            <div class="campana-banner">${iconos[idx % iconos.length]}</div>
            <div class="campana-cuerpo">
              <span class="campana-badge">Activa</span>
              <h3>${nombre}</h3>
              <p>${desc}</p>
              <div class="campana-meta">${fecha}</div>
              <button type="button" class="btn-verde" onclick="inscribirseCampana(${id})">Inscribirse</button>
            </div>
          </article>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    cont.innerHTML = "<p>Error al cargar campañas.</p>";
  }
}

async function inscribirseCampana(idEvento) {
  const idUsuario = estadoApp.usuario?.id_usuario ? Number(estadoApp.usuario.id_usuario) : 1;
  try {
    const res = await fetch("api/inscribirse.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: idUsuario, id_evento: idEvento }),
    });
    const data = await res.json().catch(() => ({}));
    mostrarAlerta("alerta-campanas", data.mensaje || data.error || "Inscripción registrada.");
    if (res.ok) {
      estadoApp.inscritosCount += 1;
      actualizarKPIs();
    }
  } catch (err) {
    console.error(err);
    mostrarAlerta("alerta-campanas", "Error al inscribirse.");
  }
}

document.getElementById("btn-reservar-planton")?.addEventListener("click", async () => {
  const idUsuario = estadoApp.usuario?.id_usuario ? Number(estadoApp.usuario.id_usuario) : 1;
  try {
    const res = await fetch("api/inscribirse.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: idUsuario, id_evento: 3 }),
    });
    const data = await res.json().catch(() => ({}));
    mostrarAlerta("alerta-plantones", data.mensaje || data.error || "Lugar reservado.");
    if (res.ok) {
      estadoApp.inscritosCount += 1;
      actualizarKPIs();
    }
  } catch (err) {
    console.error(err);
    mostrarAlerta("alerta-plantones", "Error al reservar lugar.");
  }
});

// --- REPORTES ---
async function cargarCategoriasReporte() {
  const sel = document.getElementById("categoria-reporte");
  if (!sel) return;
  try {
    const res = await fetch("api/reportes.php?categorias=1");
    const cats = await res.json();
    if (Array.isArray(cats) && cats.length > 0) {
      sel.innerHTML = cats
        .map((c) => `<option value="${c.id_categoria ?? c.id ?? 1}">${c.nombre ?? c.categoria ?? "General"}</option>`)
        .join("");
    }
  } catch (err) {
    console.error(err);
  }
}

function configurarReportes() {
  document.getElementById("form-reporte")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idUsuario = estadoApp.usuario?.id_usuario ? Number(estadoApp.usuario.id_usuario) : 1;
    const idCategoria = Number(document.getElementById("categoria-reporte").value) || 1;
    const descripcion = document.getElementById("descripcion-reporte").value.trim();

    try {
      const res = await fetch("api/reportes.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idUsuario, id_categoria: idCategoria, descripcion }),
      });
      const data = await res.json().catch(() => ({}));
      mostrarAlerta("alerta-reportes", data.mensaje || data.error || "Reporte enviado.");
      if (res.ok) {
        e.target.reset();
        await cargarReportes();
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta("alerta-reportes", "Error al enviar reporte.");
    }
  });
}

async function cargarReportes() {
  const cont = document.getElementById("lista-reportes-cards");
  if (!cont) return;
  try {
    const res = await fetch("api/historial.php?tipo=reportes");
    const lista = await res.json();
    estadoApp.reportes = Array.isArray(lista) ? lista : [];
    if (estadoApp.reportes.length === 0) {
      cont.innerHTML = "<p>No hay reportes registrados aún.</p>";
      return;
    }
    cont.innerHTML = estadoApp.reportes
      .map((r) => `
        <article class="campana-card">
          <div class="campana-cuerpo">
            <p>${r.descripcion ?? "Reporte ambiental"}</p>
            <div class="campana-meta">${r.fecha_reporte ?? r.fecha ?? ""}</div>
          </div>
        </article>
      `)
      .join("");
  } catch (err) {
    console.error(err);
    cont.innerHTML = "<p>No se pudieron cargar los reportes.</p>";
  }
}

// --- PERFIL ---
function configurarPerfil() {
  document.getElementById("form-perfil")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("perfil-nombre").value.trim();
    const correo = document.getElementById("perfil-correo").value.trim();
    const colonia = document.getElementById("perfil-colonia").value.trim();

    estadoApp.usuario = {
      ...(estadoApp.usuario || { id_usuario: 1, rol: "ciudadano" }),
      nombre,
      correo,
      colonia,
    };

    const badge = document.getElementById("badge-usuario");
    if (badge) badge.textContent = `${nombre} · ${estadoApp.usuario.rol || "ciudadano"}`;
    mostrarAlerta("alerta-perfil", "Perfil actualizado.");
  });
}

// --- EXPORTAR CSV / PDF ---
function configurarExportacion() {
  document.getElementById("btn-exportar-csv")?.addEventListener("click", () => {
    const filas = [["Fecha", "Energia", "Agua", "Transporte", "Residuos", "Total"]];
    estadoApp.historialHuella.forEach((h) => {
      filas.push([
        h.fecha_calculo ?? h.fecha ?? "",
        h.huella_energia ?? 0,
        h.huella_agua ?? 0,
        h.huella_transporte ?? 0,
        h.huella_residuos ?? 0,
        h.huella_total ?? 0,
      ]);
    });
    const csv = filas.map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xalapa-verde-huella.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-imprimir-pdf")?.addEventListener("click", () => {
    window.print();
  });
}
