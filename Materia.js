// ==================== VARIABLES GLOBALES ====================
let editandoIndex = null;
let tipoMovimientoActual = "";

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    inicializarModales();
    inicializarMenuHamburguesa();
    inicializarBusqueda();
    inicializarSelectAnios();
    inicializarValidaciones();
    inicializarBotones();
    
    cargarMateria();
    cargarHistorial();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalCrear();
            cerrarModalMovimiento();
            cerrarModalBusquedaMateria();
        }
    });
});

// ==================== CONTROL DE MODALES ====================
function inicializarModales() {
    const btnCerrarCrear = document.getElementById('btn-cerrar-crear');
    const btnCerrarMov = document.getElementById('btn-cerrar-movimiento');
    const overlay = document.getElementById('form-overlay-materia');

    if (btnCerrarCrear) btnCerrarCrear.addEventListener('click', cerrarModalCrear);
    if (btnCerrarMov) btnCerrarMov.addEventListener('click', cerrarModalMovimiento);
    if (overlay) {
        overlay.addEventListener('click', () => {
            cerrarModalCrear();
            cerrarModalMovimiento();
        });
    }
}

function abrirModalCrear() {
    const overlay = document.getElementById('form-overlay-materia');
    const modal = document.getElementById('modal-crear-producto');
    
    if (overlay && modal) {
        overlay.classList.add('activo');
        modal.classList.add('activo');
        
        if (editandoIndex === null) {
            limpiarCampos();
            // Al crear nuevo, la fecha se asigna automáticamente
            document.getElementById('materia-fecha-ingreso').value = new Date().toISOString().split('T')[0];
        } else {
            // Al editar, deshabilitar el campo de cantidad
            document.getElementById('materia-kilos').disabled = true;
            document.getElementById('materia-fecha-ingreso').disabled = true;
        }
    }
}

function cerrarModalCrear() {
    const overlay = document.getElementById('form-overlay-materia');
    const modal = document.getElementById('modal-crear-producto');
    
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
    
    // Reactivar campos
    document.getElementById('materia-kilos').disabled = false;
    document.getElementById('materia-fecha-ingreso').disabled = false;
    
    if (editandoIndex !== null) {
        editandoIndex = null;
        const btnGuardar = document.getElementById('btn-guardar-materia');
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR PRODUCTO';
        }
    }
}

function abrirModalMovimiento(tipo) {
    tipoMovimientoActual = tipo;
    const overlay = document.getElementById('form-overlay-materia');
    const modal = document.getElementById('modal-movimiento');
    const titulo = document.getElementById('titulo-movimiento');
    
    if (overlay && modal) {
        titulo.innerHTML = tipo === 'ENTRADA' 
            ? '<i class="fas fa-arrow-down"></i> Registrar Entrada'
            : '<i class="fas fa-arrow-up"></i> Registrar Salida (FIFO)';
        
        overlay.classList.add('activo');
        modal.classList.add('activo');
        
        document.getElementById('mov-buscador').value = '';
        document.getElementById('mov-kilos').value = '';
        document.getElementById('mov-detalle').value = '';
        document.getElementById('mov-id-seleccionado').value = '';
        document.getElementById('sugerencias-mov').innerHTML = '';
        
        document.getElementById('mov-buscador').focus();
    }
}

function cerrarModalMovimiento() {
    const overlay = document.getElementById('form-overlay-materia');
    const modal = document.getElementById('modal-movimiento');
    
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
}

// ==================== MENÚ HAMBURGUESA ====================
function inicializarMenuHamburguesa() {
    const menuHamburguesa = document.getElementById('menuHamburguesa');
    const menuDesplegable = document.getElementById('menuDesplegable');
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuHamburguesa && menuDesplegable) {
        menuHamburguesa.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDesplegable.classList.toggle('mostrar');
        });

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const seccionId = item.getAttribute('data-seccion');
                
                if (seccionId === 'entrada') {
                    abrirModalMovimiento('ENTRADA');
                } else if (seccionId === 'salida') {
                    abrirModalMovimiento('SALIDA');
                } else if (seccionId === 'crear') {
                    abrirModalCrear();
                }

                menuItems.forEach(mi => mi.classList.remove('activo'));
                item.classList.add('activo');
                menuDesplegable.classList.remove('mostrar');
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (menuDesplegable && menuHamburguesa) {
            if (!menuDesplegable.contains(e.target) && !menuHamburguesa.contains(e.target)) {
                menuDesplegable.classList.remove('mostrar');
            }
        }
    });
}

// ==================== FUNCIONES DE BÚSQUEDA ====================
function inicializarBusqueda() {
    const lupa = document.getElementById('lupa-busqueda');
    if (lupa) {
        lupa.addEventListener('click', abrirModalBusquedaMateria);
    }
}

function inicializarSelectAnios() {
    const selectAnio = document.getElementById('buscar-anio-materia');
    if (!selectAnio) return;
    
    const anioActual = new Date().getFullYear();
    selectAnio.innerHTML = '';
    
    for (let i = anioActual - 2; i <= anioActual + 1; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === anioActual) option.selected = true;
        selectAnio.appendChild(option);
    }
}

function abrirModalBusquedaMateria() {
    const modal = document.getElementById('modal-busqueda-materia');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const hoy = new Date();
        document.getElementById('buscar-mes-materia').value = hoy.getMonth() + 1;
        document.getElementById('buscar-anio-materia').value = hoy.getFullYear();
    }
}

function cerrarModalBusquedaMateria() {
    const modal = document.getElementById('modal-busqueda-materia');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function buscarHistorialPorMesAnio() {
    const mes = parseInt(document.getElementById('buscar-mes-materia').value);
    const anio = parseInt(document.getElementById('buscar-anio-materia').value);
    
    mostrarNotificacion(`Filtrando historial de ${getNombreMes(mes)} ${anio}`, 'success');
    cerrarModalBusquedaMateria();
}function cargarMateria() {
    const lista = document.getElementById('lista-materia');
    const inventario = JSON.parse(localStorage.getItem('Materia')) || [];
    
    let contadorBajo = 0;
    let contadorSin = 0;

    if (!lista) return;

    if (inventario.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    No hay productos registrados. Usa el menú hamburguesa para crear uno.
                </td>
            </tr>
        `;
    } else {
        // Ordenar por nombre y luego por fecha
        const inventarioOrdenado = [...inventario].sort((a, b) => {
            if (a.nombre === b.nombre) {
                return new Date(a.fechaIngreso) - new Date(b.fechaIngreso);
            }
            return a.nombre.localeCompare(b.nombre);
        });
        
        let currentProduct = '';
        lista.innerHTML = inventarioOrdenado.map((item, index) => {
            const colorStock = item.kilos <= 0 ? '#e74c3c' : item.kilos < 10 ? '#f39c12' : '#27ae60';
            
            if (item.kilos <= 0) contadorSin++;
            else if (item.kilos < 10) contadorBajo++;

            const fechaIngreso = item.fechaIngreso ? formatearFecha(item.fechaIngreso) : 'N/A';
            
            // Agregar separador entre productos diferentes
            const mostrarSeparador = currentProduct !== item.nombre;
            currentProduct = item.nombre;
            
            const separador = mostrarSeparador ? 
                `<tr style="background: #f0f0f0;"><td colspan="7" style="padding: 5px 10px; font-weight: bold; color: #666;">📦 ${item.nombre}</td></tr>` : 
                '';

            return separador + `
                <tr>
                    <td><small style="color: #666;">${item.id}</small></td>
                    <td>${item.nombre}</td>
                    <td>
                        <strong>${item.lote || 'N/A'}</strong>
                        <br><small style="color: #666;">📅 ${fechaIngreso}</small>
                    </td>
                    <td>${item.proveedor || 'N/A'}</td>
                    <td style="font-weight: bold; color: ${colorStock};">${item.kilos.toFixed(2)} kg</td>
                    <td>
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button onclick="prepararEdicion('${item.id}')" 
                                    style="color:#3498db; border:none; background:none; cursor:pointer;"
                                    title="Editar producto (no cambia cantidad)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarInsumo('${item.id}')" 
                                    style="color:#e74c3c; border:none; background:none; cursor:pointer;"
                                    title="Eliminar lote">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    document.getElementById('total-insumos').textContent = inventario.length;
    document.getElementById('cant-bajo').textContent = contadorBajo;
    document.getElementById('cant-sin').textContent = contadorSin;
}

function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
}

// ==================== VALIDACIONES ====================
function inicializarValidaciones() {
    const camposNumericos = document.querySelectorAll('.campo-numerico');
    camposNumericos.forEach(input => validarCampoNumerico(input));
}

function validarNumeroPositivo(input) {
    if (input.value < 0) {
        input.value = 0;
        mostrarNotificacion("No se permiten números negativos", "error");
    }
}

function validarCampoNumerico(input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });
    
    input.addEventListener('input', function() {
        validarNumeroPositivo(this);
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '' || this.value === null) {
            this.value = 0;
        }
    });
}

// ==================== FUNCIONES DE MOVIMIENTO ====================
function buscarParaMovimiento() {
    const busqueda = document.getElementById('mov-buscador').value.toLowerCase();
    const sugerencias = document.getElementById('sugerencias-mov');
    const inventario = JSON.parse(localStorage.getItem('Materia')) || [];
    
    if (busqueda.length < 1) {
        sugerencias.innerHTML = "";
        return;
    }

    // Agrupar por nombre de producto para mostrar stock total
    const productosUnicos = [];
    const productosMap = new Map();
    
    inventario.forEach(item => {
        if (!productosMap.has(item.nombre)) {
            productosMap.set(item.nombre, {
                nombre: item.nombre,
                lotes: []
            });
        }
        productosMap.get(item.nombre).lotes.push(item);
    });

    const productosAgrupados = Array.from(productosMap.values());
    
    const filtrados = productosAgrupados.filter(p => 
        p.nombre.toLowerCase().includes(busqueda)
    );
    
    sugerencias.innerHTML = filtrados.map(p => {
        const stockTotal = p.lotes.reduce((sum, lote) => sum + lote.kilos, 0);
        const lotesInfo = p.lotes.map(l => 
            `Lote: ${l.lote || 'N/A'} (${l.kilos}kg - ${l.fechaIngreso})`
        ).join('<br>');
        
        return `
            <div onclick="seleccionarProductoMov('${p.nombre}')" 
                 style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; background: white;"
                 onmouseover="this.style.background='#f5f5f5'"
                 onmouseout="this.style.background='white'"
                 title="${lotesInfo}">
                <strong>${p.nombre}</strong>
                <small style="color: ${stockTotal <= 0 ? '#e74c3c' : stockTotal < 10 ? '#f39c12' : '#27ae60'};">
                    (Stock total: ${stockTotal} kg)
                </small>
                <br>
                <small style="color: #666;">${p.lotes.length} lote(s) disponible(s)</small>
            </div>
        `;
    }).join('');
}

function seleccionarProductoMov(nombre) {
    document.getElementById('mov-nombre-seleccionado').value = nombre;
    document.getElementById('mov-buscador').value = nombre;
    document.getElementById('sugerencias-mov').innerHTML = "";
    document.getElementById('mov-kilos').focus();
}

// ==================== GUARDAR PRODUCTO ====================
function inicializarBotones() {
    const btnGuardar = document.getElementById('btn-guardar-materia');
    const btnConfirmarMov = document.getElementById('btn-confirmar-mov');
    
    if (btnGuardar) btnGuardar.addEventListener('click', guardarProducto);
    if (btnConfirmarMov) btnConfirmarMov.addEventListener('click', confirmarMovimiento);
}

function guardarProducto() {
    const fechaIngreso = document.getElementById('materia-fecha-ingreso')?.value || new Date().toISOString().split('T')[0];
    
    const insumo = {
        id: document.getElementById('materia-id').value.trim(),
        nombre: document.getElementById('materia-nombre').value.trim(),
        lote: document.getElementById('materia-lote').value.trim() || `LOTE-${Date.now()}`,
        kilos: Math.max(0, parseFloat(document.getElementById('materia-kilos').value) || 0),
        proveedor: document.getElementById('materia-proveedor').value.trim() || "N/A",
        fechaIngreso: fechaIngreso,
        fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    if (!insumo.id || !insumo.nombre) {
        mostrarNotificacion("⚠️ El ID y el Nombre son obligatorios", "error");
        return;
    }

    let inventario = JSON.parse(localStorage.getItem('Materia')) || [];

    if (editandoIndex !== null) {
        // Al editar, NO se puede cambiar la cantidad ni la fecha de ingreso
        const itemOriginal = inventario[editandoIndex];
        insumo.kilos = itemOriginal.kilos; // Mantener la cantidad original
        insumo.fechaIngreso = itemOriginal.fechaIngreso; // Mantener fecha original
        
        inventario[editandoIndex] = insumo;
        editandoIndex = null;
        mostrarNotificacion("✅ Producto actualizado con éxito", "success");
        
        const btnGuardar = document.getElementById('btn-guardar-materia');
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR PRODUCTO';
    } else {
        // Verificar si ya existe un lote con el mismo ID
        const existe = inventario.some(item => item.id === insumo.id);
        if (existe) {
            mostrarNotificacion("⚠️ Ya existe un producto con ese ID", "error");
            return;
        }
        inventario.push(insumo);
        mostrarNotificacion(`✅ Nuevo lote guardado: ${insumo.lote} - ${insumo.fechaIngreso}`, "success");
    }

    localStorage.setItem('Materia', JSON.stringify(inventario));
    limpiarCampos();
    cargarMateria();
    cerrarModalCrear();
}

// ==================== CONFIRMAR MOVIMIENTO (FIFO) ====================
function confirmarMovimiento() {
    const nombreProducto = document.getElementById('mov-nombre-seleccionado').value;
    const kilosSolicitados = parseFloat(document.getElementById('mov-kilos').value);
    const detalleMov = document.getElementById('mov-detalle').value.trim();

    if (!nombreProducto || isNaN(kilosSolicitados) || kilosSolicitados <= 0) {
        mostrarNotificacion("⚠️ Seleccione un producto y una cantidad válida", "error");
        return;
    }

    let inventario = JSON.parse(localStorage.getItem('Materia')) || [];
    let historial = JSON.parse(localStorage.getItem('HistorialMateria')) || [];

    // Obtener todos los lotes del producto seleccionado
    const lotesProducto = inventario
        .filter(item => item.nombre === nombreProducto)
        .sort((a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso)); // Ordenar por fecha (más antiguo primero)

    if (lotesProducto.length === 0) {
        mostrarNotificacion("⚠️ Producto no encontrado", "error");
        return;
    }

    if (tipoMovimientoActual === 'SALIDA') {
        // Verificar stock total
        const stockTotal = lotesProducto.reduce((sum, lote) => sum + lote.kilos, 0);
        
        if (stockTotal < kilosSolicitados) {
            mostrarNotificacion(`❌ Stock insuficiente. Disponible: ${stockTotal} kg`, "error");
            return;
        }

        // Aplicar FIFO: descontar de los lotes más antiguos primero
        let kilosRestantes = kilosSolicitados;
        const lotesUtilizados = [];
        const indicesAEliminar = [];

        for (let i = 0; i < lotesProducto.length && kilosRestantes > 0; i++) {
            const lote = lotesProducto[i];
            const indexOriginal = inventario.findIndex(item => item.id === lote.id);
            
            if (lote.kilos <= kilosRestantes) {
                // Consumir todo el lote
                kilosRestantes -= lote.kilos;
                lotesUtilizados.push({
                    lote: lote.lote,
                    kilos: lote.kilos,
                    fecha: lote.fechaIngreso
                });
                inventario.splice(indexOriginal, 1); // Eliminar lote completamente
            } else {
                // Consumir parte del lote
                inventario[indexOriginal].kilos -= kilosRestantes;
                lotesUtilizados.push({
                    lote: lote.lote,
                    kilos: kilosRestantes,
                    fecha: lote.fechaIngreso
                });
                kilosRestantes = 0;
            }
        }

        // Crear detalle de lotes utilizados
        const detalleLotes = lotesUtilizados.map(l => 
            `${l.lote} (${l.kilos}kg - ${l.fecha})`
        ).join(', ');

        // Crear registro en historial
        const nuevoRegistro = {
            fecha: new Date().toLocaleString(),
            producto: nombreProducto,
            tipo: 'SALIDA',
            cantidad: kilosSolicitados,
            detalle: detalleMov || `Consumo FIFO - Lotes usados: ${detalleLotes}`
        };
        historial.unshift(nuevoRegistro);

        mostrarNotificacion(`✅ Salida FIFO registrada. Se usaron: ${detalleLotes}`, "success");

    } else { // ENTRADA
        // Crear un NUEVO lote para la entrada
        const nuevoLote = {
            id: `${nombreProducto.replace(/\s+/g, '-')}-${Date.now()}`,
            nombre: nombreProducto,
            lote: `LOTE-${Date.now()}`,
            kilos: kilosSolicitados,
            proveedor: detalleMov || "Proveedor no especificado",
            fechaIngreso: new Date().toISOString().split('T')[0],
            fechaActualizacion: new Date().toISOString().split('T')[0]
        };
        
        inventario.push(nuevoLote);

        // Crear registro en historial
        const nuevoRegistro = {
            fecha: new Date().toLocaleString(),
            producto: nombreProducto,
            tipo: 'ENTRADA',
            cantidad: kilosSolicitados,
            detalle: detalleMov || `Nuevo lote: ${nuevoLote.lote}`
        };
        historial.unshift(nuevoRegistro);

        mostrarNotificacion(`✅ Nueva entrada registrada - Lote: ${nuevoLote.lote}`, "success");
    }

    // Guardar cambios
    localStorage.setItem('Materia', JSON.stringify(inventario));
    localStorage.setItem('HistorialMateria', JSON.stringify(historial));
    
    cargarMateria();
    cargarHistorial();
    cerrarModalMovimiento();
}

// ==================== CARGAR TABLAS ====================
function cargarMateria() {
    const lista = document.getElementById('lista-materia');
    const inventario = JSON.parse(localStorage.getItem('Materia')) || [];
    
    let contadorBajo = 0;
    let contadorSin = 0;

    if (!lista) return;

    if (inventario.length === 0) {
        lista.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    No hay productos registrados. Usa el menú hamburguesa para crear uno.
                </td>
            </tr>
        `;
    } else {
        // Ordenar por fecha de ingreso (más antiguos primero)
        const inventarioOrdenado = [...inventario].sort((a, b) => 
            new Date(a.fechaIngreso) - new Date(b.fechaIngreso)
        );
        
        lista.innerHTML = inventarioOrdenado.map((item, index) => {
            const colorStock = item.kilos <= 0 ? '#e74c3c' : item.kilos < 10 ? '#f39c12' : '#27ae60';
            
            if (item.kilos <= 0) contadorSin++;
            else if (item.kilos < 10) contadorBajo++;

            // Formatear fecha
            const fechaIngreso = item.fechaIngreso ? item.fechaIngreso.split('-').reverse().join('/') : 'N/A';

            return `
                <tr>
                    <td><small style="color: #666;">${item.id}</small></td>
                    <td><strong>${item.nombre}</strong></td>
                    <td>
                        ${item.lote || 'N/A'}
                        <br><small style="color: #666;">Ingreso: ${fechaIngreso}</small>
                    </td>
                    <td>${item.proveedor || 'N/A'}</td>
                    <td style="font-weight: bold; color: ${colorStock};">${item.kilos.toFixed(2)} kg</td>
                    <td>
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button onclick="prepararEdicion('${item.id}')" 
                                    style="color:#3498db; border:none; background:none; cursor:pointer;"
                                    title="Editar producto (no cambia cantidad)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarInsumo('${item.id}')" 
                                    style="color:#e74c3c; border:none; background:none; cursor:pointer;"
                                    title="Eliminar lote">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    document.getElementById('total-insumos').textContent = inventario.length;
    document.getElementById('cant-bajo').textContent = contadorBajo;
    document.getElementById('cant-sin').textContent = contadorSin;
}

function cargarHistorial() {
    const tabla = document.getElementById('lista-historial');
    if (!tabla) return;
    
    const historial = JSON.parse(localStorage.getItem('HistorialMateria')) || [];
    
    if (historial.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #999;">
                    <i class="fas fa-history" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                    No hay movimientos registrados
                </td>
            </tr>
        `;
    } else {
        tabla.innerHTML = historial.map(reg => `
            <tr>
                <td><small style="color: #666;">${reg.fecha}</small></td>
                <td><strong>${reg.producto}</strong></td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; color: white; background: ${reg.tipo === 'ENTRADA' ? '#27ae60' : '#e67e22'};">
                        ${reg.tipo}
                    </span>
                </td>
                <td style="font-weight: bold; color: ${reg.tipo === 'ENTRADA' ? '#27ae60' : '#e67e22'};">
                    ${reg.tipo === 'ENTRADA' ? '+' : '-'}${reg.cantidad} kg
                </td>
                <td><small>${reg.detalle}</small></td>
            </tr>
        `).join('');
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function limpiarCampos() {
    document.querySelectorAll('#modal-crear-producto input').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') {
            i.value = "";
        }
    });
    editandoIndex = null;
    
    const btnGuardar = document.getElementById('btn-guardar-materia');
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR PRODUCTO';
    }
}

function prepararEdicion(id) {
    const inventario = JSON.parse(localStorage.getItem('Materia')) || [];
    const index = inventario.findIndex(item => item.id === id);
    const item = inventario[index];
    
    document.getElementById('materia-id').value = item.id;
    document.getElementById('materia-nombre').value = item.nombre;
    document.getElementById('materia-lote').value = item.lote || '';
    document.getElementById('materia-kilos').value = item.kilos;
    document.getElementById('materia-proveedor').value = item.proveedor || '';
    document.getElementById('materia-fecha-ingreso').value = item.fechaIngreso || '';
    
    editandoIndex = index;
    
    const btnGuardar = document.getElementById('btn-guardar-materia');
    btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR PRODUCTO (no cambia cantidad)';
    
    abrirModalCrear();
}

function eliminarInsumo(id) {
    if(confirm("¿Está seguro de eliminar este lote?")) {
        const inventario = JSON.parse(localStorage.getItem('Materia')) || [];
        const nuevoInventario = inventario.filter(item => item.id !== id);
        localStorage.setItem('Materia', JSON.stringify(nuevoInventario));
        cargarMateria();
        mostrarNotificacion("Lote eliminado correctamente", "success");
    }
}

function borrarHistorial() {
    if(confirm("¿Desea borrar todo el historial? Esto no afectará el stock actual.")) {
        localStorage.removeItem('HistorialMateria');
        cargarHistorial();
        mostrarNotificacion("Historial limpiado", "success");
    }
}

// ==================== NOTIFICACIONES ====================
function mostrarNotificacion(mensaje, tipo) {
    const notificacionesPrevias = document.querySelectorAll('.notificacion-venepan');
    notificacionesPrevias.forEach(n => n.remove());

    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-venepan ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

// Hacer funciones globales
window.prepararEdicion = prepararEdicion;
window.eliminarInsumo = eliminarInsumo;
window.borrarHistorial = borrarHistorial;
window.buscarParaMovimiento = buscarParaMovimiento;
window.seleccionarProductoMov = seleccionarProductoMov;
window.cerrarModalMovimiento = cerrarModalMovimiento;
window.cerrarModalBusquedaMateria = cerrarModalBusquedaMateria;
window.buscarHistorialPorMesAnio = buscarHistorialPorMesAnio;