import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  // ... tu config ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Lista de 20 partidos (Simulados, puedes cambiarlos cada semana)
const partidos = [
    { id: 1, liga: "Liga MX", local: "América", visitante: "Chivas" },
    { id: 2, liga: "La Liga", local: "Real Madrid", visitante: "Barcelona" },
    // ... agrega hasta completar 20
];

const contenedor = document.getElementById('contenedor-partidos');

// Renderizar partidos
partidos.forEach(p => {
    contenedor.innerHTML += `
        <div class="border border-gray-700 p-4 rounded-lg bg-gray-750 flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-blue-400">${p.liga}</span>
                <input type="checkbox" class="match-checkbox w-5 h-5" value="${p.id}">
            </div>
            <div class="flex justify-between items-center">
                <span>${p.local}</span>
                <div class="flex gap-2">
                    <input type="number" class="w-10 bg-gray-600 text-center rounded score-l" disabled>
                    <input type="number" class="w-10 bg-gray-600 text-center rounded score-v" disabled>
                </div>
                <span>${p.visitante}</span>
            </div>
        </div>
    `;
});

// Lógica de validación: Máximo 8
const checkboxes = document.querySelectorAll('.match-checkbox');
checkboxes.forEach(chk => {
    chk.addEventListener('change', (e) => {
        const row = e.target.closest('div').parentElement;
        const inputs = row.querySelectorAll('input[type="number"]');
        const seleccionados = document.querySelectorAll('.match-checkbox:checked').length;

        if (e.target.checked) {
            if (seleccionados > 8) {
                e.target.checked = false;
                alert("Solo puedes elegir 8 partidos");
            } else {
                inputs.forEach(i => i.disabled = false);
            }
        } else {
            inputs.forEach(i => { i.disabled = true; i.value = ""; });
        }
    });
});

// Guardar en Firebase
document.getElementById('btnEnviar').addEventListener('click', async () => {
    const nombre = document.getElementById('userName').value;
    const elegidos = document.querySelectorAll('.match-checkbox:checked');

    if (!nombre || elegidos.length !== 8) {
        alert("Pon tu nombre y selecciona exactamente 8 partidos");
        return;
    }

    // Aquí construirías el objeto con los resultados y lo mandas a addDoc(collection(db, "pronosticos"), ...)
    alert("¡Pronóstico guardado! (Conecta addDoc para finalizar)");
});
