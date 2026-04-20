let editandoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarRecetas();

    document.getElementById('btn-guardar-receta').addEventListener('click', () => {
        const producto = document.getElementById('receta-producto').value;
        const nombreProducto = document.getElementById('receta-producto').options[document.getElementById('receta-producto').selectedIndex].text;
        const harina = document.getElementById('ing-harina').value;
        const levadura = document.getElementById('ing-levadura').value;
        const soya = document.getElementById('ing-soya').value;
        const cereales = document.getElementById('ing-cereales').value;

        if (harina && levadura) {
            let recetas = JSON.parse(localStorage.getItem('Recetas')) || [];
            
            const datosReceta = {
                id: producto,
                nombre: nombreProducto,
                harina: parseFloat(harina),
                levadura: parseFloat(levadura),
                soya: parseFloat(soya || 0),
                cereales: parseFloat(cereales || 0)
            };

            if (editandoIndex !== null) {
                recetas[editandoIndex] = datosReceta;
                editandoIndex = null;
                document.getElementById('btn-guardar-receta').innerHTML = '<i class="fas fa-save"></i> Guardar Fórmula';
            } else {
                // Evitar duplicados del mismo producto
                const existe = recetas.findIndex(r => r.id === producto);
                if(existe !== -1) {
                    recetas[existe] = datosReceta;
                } else {
                    recetas.push(datosReceta);
                }
            }

            localStorage.setItem('Recetas', JSON.stringify(recetas));
            limpiarCampos();
            cargarRecetas();
            alert("Receta guardada exitosamente");
        } else {
            alert("Por favor ingresa al menos la harina y levadura básica");
        }
    });
});

function cargarRecetas() {
    const lista = document.getElementById('lista-recetas');
    const recetas = JSON.parse(localStorage.getItem('Recetas')) || [];
    lista.innerHTML = "";

    recetas.forEach((r, index) => {
        lista.innerHTML += `
            <tr>
                <td><strong>${r.nombre}</strong></td>
                <td>${r.harina} kg</td>
                <td>${r.levadura} gr</td>
                <td>${r.soya} Lts</td>
                <td>${r.cereales} gr</td>
                <td>
                    <button onclick="prepararEdicion(${index})" style="border:none; background:none; cursor:pointer; color:#3498db;"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarReceta(${index})" style="border:none; background:none; cursor:pointer; color:#e74c3c; margin-left:10px;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function prepararEdicion(index) {
    const recetas = JSON.parse(localStorage.getItem('Recetas')) || [];
    const r = recetas[index];

    document.getElementById('receta-producto').value = r.id;
    document.getElementById('ing-harina').value = r.harina;
    document.getElementById('ing-levadura').value = r.levadura;
    document.getElementById('ing-soya').value = r.soya;
    document.getElementById('ing-cereales').value = r.cereales;

    document.getElementById('btn-guardar-receta').innerHTML = '<i class="fas fa-sync"></i> Actualizar Fórmula';
    editandoIndex = index;
}

function eliminarReceta(index) {
    if (confirm("¿Desea eliminar esta fórmula?")) {
        let recetas = JSON.parse(localStorage.getItem('Recetas')) || [];
        recetas.splice(index, 1);
        localStorage.setItem('Recetas', JSON.stringify(recetas));
        cargarRecetas();
    }
}

function limpiarCampos() {
    document.getElementById('ing-harina').value = "";
    document.getElementById('ing-levadura').value = "";
    document.getElementById('ing-soya').value = "";
    document.getElementById('ing-cereales').value = "";
    editandoIndex = null;
}