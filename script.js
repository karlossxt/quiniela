import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===== CONFIG DE FIREBASE (proyecto: quiniela-59f55) =====
const firebaseConfig = {
  apiKey: "AIzaSyDzvYMAAzip5SQiWaMvtLU-S5RMnziF_uo",
  authDomain: "quiniela-59f55.firebaseapp.com",
  projectId: "quiniela-59f55",
  storageBucket: "quiniela-59f55.firebasestorage.app",
  messagingSenderId: "974092732413",
  appId: "1:974092732413:web:805ee440c3ef48fb74bb94",
  measurementId: "G-R7Z92B7FWE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== 1. EDITA ESTA LISTA CADA SEMANA =====
const PARTIDOS = [
    // --- Liga MX ---
    { id: 1,  liga: "Liga MX", fecha: "Vie 23 Oct · 19:00", local: "Necaxa",         visitante: "Toluca" },
    { id: 2,  liga: "Liga MX", fecha: "Vie 23 Oct · 21:00", local: "América",        visitante: "Cruz Azul" },
    { id: 3,  liga: "Liga MX", fecha: "Sáb 24 Oct · 19:00", local: "León",           visitante: "Toluca" },
    { id: 4,  liga: "Liga MX", fecha: "Sáb 24 Oct · 19:00", local: "Monterrey",      visitante: "Chivas" },
    { id: 5,  liga: "Liga MX", fecha: "Sáb 24 Oct · 21:00", local: "Pumas",          visitante: "Tigres" },
    { id: 6,  liga: "Liga MX", fecha: "Dom 25 Oct · 17:00", local: "Atlas",          visitante: "Puebla" },
    { id: 7,  liga: "Liga MX", fecha: "Dom 25 Oct · 17:00", local: "América",        visitante: "Pachuca" },
    { id: 8,  liga: "Liga MX", fecha: "Dom 25 Oct · 19:00", local: "Querétaro",      visitante: "Juárez" },
    { id: 9,  liga: "Liga MX", fecha: "Dom 25 Oct · 21:00", local: "Tijuana",        visitante: "Santos Laguna" },
    // --- La Liga (Jornada 1) ---
    { id: 10, liga: "La Liga", fecha: "Sáb 15 Ago · 11:30", local: "Deportivo Alavés", visitante: "Getafe" },
    { id: 11, liga: "La Liga", fecha: "Sáb 15 Ago · 13:30", local: "Sevilla",         visitante: "Rayo Vallecano" },
    { id: 12, liga: "La Liga", fecha: "Dom 16 Ago · 09:00", local: "Racing",          visitante: "Villarreal" },
    { id: 13, liga: "La Liga", fecha: "Dom 16 Ago · 11:00", local: "Espanyol",        visitante: "Levante" },
    { id: 14, liga: "La Liga", fecha: "Dom 16 Ago · 13:30", local: "Celta de Vigo",   visitante: "Osasuna" },
    { id: 15, liga: "La Liga", fecha: "Mié 26 Ago · 13:00", local: "Real Madrid",     visitante: "Real Sociedad" },
    { id: 16, liga: "La Liga", fecha: "Jue 27 Ago · 13:00", local: "Barcelona",       visitante: "Athletic Club" },
    // --- Premier League (Jornada 1) ---
    { id: 17, liga: "Premier", fecha: "Vie 21 Ago · 13:00", local: "Arsenal",           visitante: "Coventry City" },
    { id: 18, liga: "Premier", fecha: "Sáb 22 Ago · 05:30", local: "Hull City",         visitante: "Man United" },
    { id: 19, liga: "Premier", fecha: "Sáb 22 Ago · 08:00", local: "Everton",           visitante: "Crystal Palace" },
    { id: 20, liga: "Premier", fecha: "Dom 23 Ago · 07:00", local: "Man City",          visitante: "Bournemouth" },
    { id: 21, liga: "Premier", fecha: "Dom 23 Ago · 09:30", local: "Newcastle",         visitante: "Liverpool" },
    { id: 22, liga: "Premier", fecha: "Lun 24 Ago · 13:00", local: "Fulham",            visitante: "Chelsea" }
];

const MAX_PARTIDOS = 8;

// ===== Utilidades =====
function getWeekId() {
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const SEMANA = getWeekId();
let resultadosSemana = null;

const $ = (id) => document.getElementById(id);
const contenedor = $("cuerpo-partidos");

$("semana").textContent = `Semana: ${SEMANA}`;

// ===== Render de partidos en tabla =====
PARTIDOS.forEach(p => {
    const row = document.createElement("tr");
    row.className = "match-row";
    row.dataset.id = p.id;
    row.innerHTML = `
        <td class="text-center">
            <input type="checkbox" class="match-checkbox w-5 h-5" value="${p.id}">
        </td>
        <td><span class="text-xs font-bold text-blue-400">${p.liga}</span><div class="text-[10px] text-gray-500">${p.fecha}</div></td>
        <td><span class="team-name">${p.local}</span></td>
        <td>
            <div class="flex items-center gap-1 justify-center">
                <input type="number" class="w-12 bg-gray-700 text-center rounded score-l" disabled placeholder="0">
                <span class="text-gray-500">-</span>
                <input type="number" class="w-12 bg-gray-700 text-center rounded score-v" disabled placeholder="0">
            </div>
        </td>
        <td><span class="team-name flex justify-end">${p.visitante}</span></td>
    `;
    contenedor.appendChild(row);
});

// ===== Contador de seleccionados =====
function contarSeleccionados() {
    return document.querySelectorAll(".match-checkbox:checked").length;
}

function actualizarContador() {
    const contador = $("contador");
    const n = contarSeleccionados();
    contador.textContent = `${n} / ${MAX_PARTIDOS} seleccionados`;
    contador.className = n === MAX_PARTIDOS
        ? "text-sm mb-4 font-semibold text-green-400"
        : "text-sm mb-4 font-semibold text-gray-400";
}

function aplicarEstilos() {
    document.querySelectorAll(".match-row").forEach(row => {
        const chk = row.querySelector(".match-checkbox");
        row.classList.toggle("match-row-selected", chk.checked);
    });
}

// ===== Persistencia local (borrador) =====
function guardarBorrador() {
    const selecciones = {};
    PARTIDOS.forEach(p => {
        const chk = document.querySelector(`.match-checkbox[value="${p.id}"]`);
        if (chk && chk.checked) {
            const row = chk.closest(".match-row");
            const inputs = row.querySelectorAll(".score-l, .score-v");
            selecciones[p.id] = { elegido: true, local: inputs[0].value, visitante: inputs[1].value };
        }
    });
    localStorage.setItem(`quiniela_borrador_${SEMANA}`, JSON.stringify({
        nombre: $("userName").value,
        selecciones
    }));
}

function cargarBorrador() {
    let draft;
    try { draft = JSON.parse(localStorage.getItem(`quiniela_borrador_${SEMANA}`) || "{}"); } catch { draft = {}; }
    if (draft.nombre) $("userName").value = draft.nombre;
    Object.entries(draft.selecciones || {}).forEach(([id, sel]) => {
        const chk = document.querySelector(`.match-checkbox[value="${id}"]`);
        if (!chk || !sel.elegido) return;
        const row = chk.closest(".match-row");
        const inputs = row.querySelectorAll(".score-l, .score-v");
        chk.checked = true;
        inputs.forEach(i => i.disabled = false);
        inputs[0].value = sel.local ?? "";
        inputs[1].value = sel.visitante ?? "";
    });
    aplicarEstilos();
    actualizarContador();
}

// ===== Lógica de selección (máximo 8) =====
contenedor.addEventListener("change", (e) => {
    const chk = e.target.closest(".match-checkbox");
    if (!chk) return;
    const row = chk.closest(".match-row");
    const inputs = row.querySelectorAll(".score-l, .score-v");

    if (chk.checked) {
        if (contarSeleccionados() > MAX_PARTIDOS) {
            chk.checked = false;
            alert(`Solo puedes elegir ${MAX_PARTIDOS} partidos`);
        } else {
            inputs.forEach(i => i.disabled = false);
        }
    } else {
        inputs.forEach(i => { i.disabled = true; i.value = ""; });
    }
    actualizarContador();
    aplicarEstilos();
    guardarBorrador();
});

contenedor.addEventListener("input", guardarBorrador);
$("userName").addEventListener("input", guardarBorrador);

// ===== Guardar pronósticos en Firestore =====
function mostrarMensaje(el, texto, tipo) {
    el.textContent = texto;
    el.className = tipo === "ok"
        ? "text-center text-sm mt-3 text-green-400"
        : "text-center text-sm mt-3 text-red-400";
}

$("btnEnviar").addEventListener("click", async () => {
    const nombre = $("userName").value.trim();
    const checkboxes = [...document.querySelectorAll(".match-checkbox:checked")];

    if (!nombre) return mostrarMensaje($("mensaje"), "Escribe tu nombre primero", "error");
    if (checkboxes.length !== MAX_PARTIDOS) return mostrarMensaje($("mensaje"), `Selecciona exactamente ${MAX_PARTIDOS} partidos`, "error");

    const pronosticos = [];
    for (const chk of checkboxes) {
        const row = chk.closest(".match-row");
        const inputs = row.querySelectorAll(".score-l, .score-v");
        const l = inputs[0].value, v = inputs[1].value;
        const nl = Number(l), nv = Number(v);
        if (l === "" || v === "" || !Number.isInteger(nl) || !Number.isInteger(nv) || nl < 0 || nv < 0) {
            return mostrarMensaje($("mensaje"), "Completa los marcadores de todos los partidos (enteros ≥ 0)", "error");
        }
        pronosticos.push({ partidoId: Number(chk.value), local: nl, visitante: nv });
    }

    const btn = $("btnEnviar");
    btn.disabled = true;
    btn.textContent = "Guardando...";
    try {
        const q = query(collection(db, "pronosticos"), where("nombre", "==", nombre), where("semana", "==", SEMANA));
        const snap = await getDocs(q);
        const datos = { nombre, semana: SEMANA, fecha: new Date(), pronosticos };
        if (!snap.empty) {
            await setDoc(doc(db, "pronosticos", snap.docs[0].id), datos);
            mostrarMensaje($("mensaje"), "¡Pronóstico actualizado! Puedes reenviarlo si cambiaste de idea.", "ok");
        } else {
            await addDoc(collection(db, "pronosticos"), datos);
            mostrarMensaje($("mensaje"), "¡Pronóstico guardado!", "ok");
        }
    } catch (err) {
        mostrarMensaje($("mensaje"), "Error al guardar: " + err.message, "error");
    }
    btn.disabled = false;
    btn.textContent = "Enviar Pronósticos";
});

// ===== Puntuación =====
function calcularPuntos(pred, res) {
    if (res.local === null || res.local === undefined) return 0;
    if (pred.local === res.local && pred.visitante === res.visitante) return 3;
    const pe = pred.local === pred.visitante ? "E" : pred.local > pred.visitante ? "L" : "V";
    const re = res.local === res.visitante ? "E" : res.local > res.visitante ? "L" : "V";
    return pe === re ? 1 : 0;
}

// ===== Resultados (Modo Admin) =====
$("btnAdmin").addEventListener("click", () => {
    const panel = $("panel-admin");
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) cargarEditorResultados();
});

function cargarEditorResultados() {
    const tbody = $("cuerpo-resultados");
    tbody.innerHTML = "";
    PARTIDOS.forEach(p => {
        const res = resultadosSemana && resultadosSemana[p.id];
        const l = res && res.local != null ? res.local : "";
        const v = res && res.visitante != null ? res.visitante : "";
        const row = document.createElement("tr");
        row.className = "match-row";
        row.innerHTML = `
            <td><span class="text-xs font-bold text-blue-400">${p.liga}</span><div class="text-[10px] text-gray-500">${p.fecha}</div></td>
            <td><span class="team-name">${p.local}</span></td>
            <td>
                <div class="flex items-center gap-1 justify-center">
                    <input type="number" class="w-12 bg-gray-600 text-center rounded res-l" data-id="${p.id}" value="${l}" placeholder="-">
                    <span class="text-gray-500">-</span>
                    <input type="number" class="w-12 bg-gray-600 text-center rounded res-v" data-id="${p.id}" value="${v}" placeholder="-">
                </div>
            </td>
            <td><span class="team-name flex justify-end">${p.visitante}</span></td>
        `;
        tbody.appendChild(row);
    });
}

$("btnGuardarResultados").addEventListener("click", async () => {
    const resultados = {};
    let incompletos = false;
    document.querySelectorAll(".res-l, .res-v").forEach(inp => {
        const id = Number(inp.dataset.id);
        if (inp.value === "") {
            incompletos = true;
            return;
        }
        const n = Number(inp.value);
        if (!Number.isInteger(n) || n < 0) {
            alert("Los marcadores deben ser números enteros ≥ 0");
            throw new Error("invalid");
        }
        if (!resultados[id]) resultados[id] = {};
        if (inp.classList.contains("res-l")) resultados[id].local = n;
        else resultados[id].visitante = n;
    });

    if (incompletos) {
        const ok = confirm("Hay partidos sin marcador. Los que no tengan resultado no otorgan puntos. ¿Continuar?");
        if (!ok) return;
    }

    try {
        await setDoc(doc(db, "resultados", SEMANA), { semana: SEMANA, fecha: new Date(), resultados }, { merge: true });
        $("mensaje-admin").textContent = "¡Resultados guardados!";
        $("mensaje-admin").className = "text-center text-sm mt-3 text-green-400";
        await cargarResultadosSemana();
        renderTabla();
    } catch (err) {
        if (err.message === "invalid") return;
        $("mensaje-admin").textContent = "Error: " + err.message;
        $("mensaje-admin").className = "text-center text-sm mt-3 text-red-400";
    }
});

// ===== Cargar resultados de la semana =====
async function cargarResultadosSemana() {
    try {
        const snap = await getDoc(doc(db, "resultados", SEMANA));
        resultadosSemana = snap.exists() ? snap.data().resultados : null;
    } catch {
        resultadosSemana = null;
    }
}

// ===== Tabla de posiciones =====
async function renderTabla() {
    const cont = $("tabla-posiciones");
    const estado = $("estado-resultados");
    if (!resultadosSemana) {
        estado.textContent = "Resultados aún no publicados";
        estado.className = "text-xs font-semibold text-yellow-400";
    } else {
        estado.textContent = "Resultados publicados";
        estado.className = "text-xs font-semibold text-green-400";
    }

    const q = query(collection(db, "pronosticos"), where("semana", "==", SEMANA));
    const snap = await getDocs(q);
    const filas = snap.docs.map(d => {
        const data = d.data();
        let puntos = 0, exactos = 0;
        (data.pronosticos || []).forEach(pred => {
            const res = resultadosSemana && resultadosSemana[pred.partidoId];
            const g = calcularPuntos(pred, res || {});
            if (g === 3) exactos++;
            puntos += g;
        });
        return { nombre: data.nombre, puntos, exactos };
    });

    filas.sort((a, b) => b.puntos - a.puntos || b.exactos - a.exactos);

    if (filas.length === 0) {
        cont.innerHTML = '<p class="text-gray-400 text-sm py-4">Aún no hay pronósticos esta semana.</p>';
        return;
    }

    const rows = filas.map((f, i) => `
        <tr class="border-b border-gray-700">
            <td class="py-2 px-2">${i + 1}</td>
            <td class="py-2 px-2 font-semibold">${f.nombre}</td>
            <td class="py-2 px-2 text-center">${f.exactos}</td>
            <td class="py-2 px-2 text-center text-green-400 font-bold">${f.puntos}</td>
        </tr>`).join("");

    cont.innerHTML = `
        <table class="w-full">
            <thead>
                <tr class="border-b border-gray-600">
                    <th>#</th>
                    <th>Nombre</th>
                    <th class="text-center">Marcadores Exactos</th>
                    <th class="text-center">Puntos</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

// ===== Inicialización =====
(async function init() {
    cargarBorrador();
    actualizarContador();
    await cargarResultadosSemana();
    await renderTabla();
    onSnapshot(query(collection(db, "pronosticos"), where("semana", "==", SEMANA)), () => renderTabla());
})();
