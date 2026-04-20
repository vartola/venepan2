const API_URL = 'api.php';

let editandoProduccionId = null;
let editandoDespachoId = null;
let mesActualSoya = new Date().getMonth() + 1;
let anioActualSoya = new Date().getFullYear();

// Exportar funciones globales
window.editarProduccionSoya = editarProduccionSoya;
window.editarDespachoSoya = editarDespachoSoya;
window.eliminarProduccionSoya = eliminarProduccionSoya;
window.eliminarDespachoSoya = eliminarDespachoSoya;
window.expandirTablaSoya = expandirTablaSoya;
window.cerrarModalTablaSoya = cerrarModalTablaSoya;
window.buscarPorMesAnioSoya = buscarPorMesAnioSoya;
window.cerrarModalBusquedaSoya = cerrarModalBusquedaSoya;

document.addEventListener('DOMContentLoaded', () => {
    inicializarModales();
    inicializarMenuHamburguesa();
    inicializarBusqueda();
    inicializarSelectAnios();
    inicializarBotonesGuardar();
    inicializarEventosInput();
    inyectarEstilosNotificacion();
    
    cargarTablasSoya(mesActualSoya, anioActualSoya);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalProduccion();
            cerrarModalDespacho();
            cerrarModalBusquedaSoya();
            cerrarModalTablaSoya();
        }
    });
});

// ==================== FUNCIONES DE API ====================

async function cargarProduccionSoya(mes, anio) {
    try {
        const url = `${API_URL}?action=get_soya_produccion&mes=${mes}&anio=${anio}`;
        console.log('Cargando producción de soya desde:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la petición: ' + response.status);
        const data = await response.json();
        console.log('Datos de producción de soya:', data);
        return data;
    } catch (error) {
        console.error('Error al cargar producción de soya:', error);
        mostrarNotificacion('Error al cargar datos de producción', 'error');
        return [];
    }
}

async function cargarDespachoSoya(mes, anio) {
    try {
        const url = `${API_URL}?action=get_soya_despacho&mes=${mes}&anio=${anio}`;
        console.log('Cargando despacho de soya desde:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la petición: ' + response.status);
        const data = await response.json();
        console.log('Datos de despacho de soya:', data);
        return data;
    } catch (error) {
        console.error('Error al cargar despacho de soya:', error);
        mostrarNotificacion('Error al cargar datos de despacho', 'error');
        return [];
    }
}

async function guardarProduccionAPI(registro) {
    try {
        const response = await fetch(`${API_URL}?action=save_soya_produccion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        const result = await response.json();
        console.log('Respuesta guardar producción:', result);
        return result;
    } catch (error) {
        console.error('Error en API:', error);
        return { success: false, message: 'Error de conexión con el servidor' };
    }
}

async function guardarDespachoAPI(registro) {
    try {
        const response = await fetch(`${API_URL}?action=save_soya_despacho`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });
        const result = await response.json();
        console.log('Respuesta guardar despacho:', result);
        return result;
    } catch (error) {
        console.error('Error en API:', error);
        return { success: false, message: 'Error de conexión con el servidor' };
    }
}

async function eliminarProduccionAPI(id) {
    try {
        const response = await fetch(`${API_URL}?action=delete_soya_produccion`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        return { success: false };
    }
}

async function eliminarDespachoAPI(id) {
    try {
        const response = await fetch(`${API_URL}?action=delete_soya_despacho`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        return { success: false };
    }
}

// ==================== CARGAR TABLAS ====================

async function cargarTablasSoya(mes, anio) {
    console.log('Cargando tablas para mes:', mes, 'año:', anio);
    
    const produccion = await cargarProduccionSoya(mes, anio);
    const despacho = await cargarDespachoSoya(mes, anio);

    // TABLA DE PRODUCCIÓN
    const tablaProd = document.getElementById('lista-soya-produccion');
    if (tablaProd) {
        if (produccion.length === 0 || produccion.error) {
            tablaProd.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">
                <i class="fas fa-box-open" style="font-size:40px;display:block;margin-bottom:10px;"></i>
                No hay registros de producción para ${getNombreMes(mes)} ${anio}
            </td></tr>`;
        } else {
            tablaProd.innerHTML = produccion.map(item => {
                const fechaFormateada = item.fecha ? item.fecha.split('-').reverse().join('/') : 'Sin fecha';
                const total = (parseFloat(item.primera) + parseFloat(item.desecho_humedo) + parseFloat(item.desecho_seco)).toFixed(2);
                return `
                <tr>
                    <td><b>${fechaFormateada}</b><br>Lote: ${item.lote || 'N/A'}</td>
                    <td>Medidas: ${item.medidas || 0}<br>Desgranada: ${parseFloat(item.soya_desgranada || 0).toFixed(2)}kg<br>Azufre: ${parseFloat(item.azufre || 0).toFixed(2)}kg<br>Humedad: ${parseFloat(item.humedad || 0).toFixed(2)}%</td>
                    <td><b>1ra: ${parseFloat(item.primera || 0).toFixed(2)}kg</b><br>Total: ${total}kg</td>
                    <td>Húmedo: ${parseFloat(item.desecho_humedo || 0).toFixed(2)}kg<br>Seco: ${parseFloat(item.desecho_seco || 0).toFixed(2)}kg</td>
                    <td>${item.id_proveedor || 'N/A'}</td>
                    <td>
                        <button onclick="editarProduccionSoya(${item.id_soya})" style="color:#3498db;border:none;background:none;cursor:pointer;" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="eliminarProduccionSoya(${item.id_soya})" style="color:red;border:none;background:none;cursor:pointer;" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
    }

    // TABLA DE DESPACHO
    const tablaDesp = document.getElementById('lista-soya-despacho');
    if (tablaDesp) {
        if (despacho.length === 0 || despacho.error) {
            tablaDesp.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:#999;">
                <i class="fas fa-truck" style="font-size:40px;display:block;margin-bottom:10px;"></i>
                No hay registros de despacho para ${getNombreMes(mes)} ${anio}
            </td></tr>`;
        } else {
            tablaDesp.innerHTML = despacho.map(item => {
                const fechaFormateada = item.fecha ? item.fecha.split('-').reverse().join('/') : 'Sin fecha';
                return `
                <tr>
                    <td><b>${item.lote || 'N/A'}</b><br><small>${fechaFormateada}</small></td>
                    <td>125g: ${item.u125g || 0} | 250g: ${item.u250g || 0}<br>8Kg: ${item.u8kg || 0} | 12Kg: ${item.u12kg || 0}</td>
                    <td><b>${parseFloat(item.total_kg || 0).toFixed(2)} Kg</b></td>
                    <td>
                        <button onclick="editarDespachoSoya(${item.id_despacho})" style="color:#3498db;border:none;background:none;cursor:pointer;" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="eliminarDespachoSoya(${item.id_despacho})" style="color:red;border:none;background:none;cursor:pointer;" title="Eliminar"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
    }
}

// ==================== CRUD PRODUCCIÓN ====================

async function guardarProduccion() {
    const fecha = document.getElementById('soya-fecha').value;
    const lote = document.getElementById('soya-lote').value.trim();
    
    if (!fecha || !lote) {
        mostrarNotificacion('⚠️ Complete la Fecha y el Lote', 'error');
        return;
    }
    
    const totalProducido = parseFloat(document.getElementById('soya-total').value) || 0;
    
    const registro = {
        id_soya: editandoProduccionId || null,
        id_producto: parseInt(document.getElementById('soya-tipo-producto').value) || 12,
        fecha: fecha,
        lote: lote,
        medidas: parseInt(document.getElementById('soya-medidas').value) || 0,
        soya_desgranada: parseFloat(document.getElementById('soya-desgranada').value) || 0,
        azufre: parseFloat(document.getElementById('soya-azufre').value) || 0,
        humedad: parseFloat(document.getElementById('soya-humedad').value) || 0,
        primera: parseFloat(document.getElementById('soya-primera').value) || 0,
        desecho_humedo: parseFloat(document.getElementById('soya-desecho-h').value) || 0,
        desecho_seco: parseFloat(document.getElementById('soya-desecho-s').value) || 0,
        total_producido: totalProducido,
        id_proveedor: document.getElementById('soya-proveedor').value.trim() || null
    };

    console.log('Guardando producción:', registro);
    
    const btnGuardar = document.getElementById('btn-guardar-produccion');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> GUARDANDO...';
    btnGuardar.disabled = true;
    
    const result = await guardarProduccionAPI(registro);
    
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
    
    if (result.success) {
        mostrarNotificacion(result.message || 'Producción guardada correctamente', 'success');
        editandoProduccionId = null;
        limpiarFormularioProduccion();
        await cargarTablasSoya(mesActualSoya, anioActualSoya);
        cerrarModalProduccion();
        
        const btn = document.getElementById('btn-guardar-produccion');
        if (btn) btn.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
    } else {
        mostrarNotificacion(result.message || 'Error al guardar en la base de datos', 'error');
    }
}

async function eliminarProduccionSoya(id) {
    if (!confirm('¿Eliminar este registro de producción permanentemente?')) return;
    
    const result = await eliminarProduccionAPI(id);
    
    if (result.success) {
        mostrarNotificacion('Producción eliminada correctamente', 'success');
        await cargarTablasSoya(mesActualSoya, anioActualSoya);
    } else {
        mostrarNotificacion('Error al eliminar', 'error');
    }
}

async function editarProduccionSoya(id) {
    editandoProduccionId = id;
    
    const produccion = await cargarProduccionSoya(mesActualSoya, anioActualSoya);
    const item = produccion.find(p => p.id_soya === id);
    
    if (item) {
        document.getElementById('soya-fecha').value = item.fecha || '';
        document.getElementById('soya-lote').value = item.lote || '';
        document.getElementById('soya-medidas').value = item.medidas || 0;
        document.getElementById('soya-desgranada').value = item.soya_desgranada || 0;
        document.getElementById('soya-azufre').value = item.azufre || 0;
        document.getElementById('soya-humedad').value = item.humedad || 0;
        document.getElementById('soya-primera').value = item.primera || 0;
        document.getElementById('soya-desecho-h').value = item.desecho_humedo || 0;
        document.getElementById('soya-desecho-s').value = item.desecho_seco || 0;
        document.getElementById('soya-proveedor').value = item.id_proveedor || '';
        calcularProduccion();
    }
    
    const btnGuardar = document.getElementById('btn-guardar-produccion');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR REGISTRO';
    
    cambiarFormularioSoya('produccion');
    abrirModalProduccion();
}

// ==================== CRUD DESPACHO ====================

async function guardarDespacho() {
    const fecha = document.getElementById('soya-fecha-despacho').value;
    const lote = document.getElementById('despacho-lote').value.trim();
    
    if (!fecha || !lote) {
        mostrarNotificacion('⚠️ Complete la Fecha y el Lote', 'error');
        return;
    }
    
    const registro = {
        id_despacho: editandoDespachoId || null,
        lote: lote,
        fecha: fecha,
        u125g: parseInt(document.getElementById('soya-125g').value) || 0,
        u250g: parseInt(document.getElementById('soya-250g').value) || 0,
        u8kg: parseInt(document.getElementById('soya-8kg').value) || 0,
        u12kg: parseInt(document.getElementById('soya-12kg').value) || 0,
        total_kg: parseFloat(document.getElementById('soya-kg-despacho').value) || 0
    };

    console.log('Guardando despacho:', registro);
    
    const btnGuardar = document.getElementById('btn-guardar-despacho');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> GUARDANDO...';
    btnGuardar.disabled = true;
    
    const result = await guardarDespachoAPI(registro);
    
    btnGuardar.innerHTML = textoOriginal;
    btnGuardar.disabled = false;
    
    if (result.success) {
        mostrarNotificacion(result.message || 'Despacho guardado correctamente', 'success');
        editandoDespachoId = null;
        limpiarFormularioDespacho();
        await cargarTablasSoya(mesActualSoya, anioActualSoya);
        cerrarModalDespacho();
        
        const btn = document.getElementById('btn-guardar-despacho');
        if (btn) btn.innerHTML = '<i class="fas fa-shipping-fast"></i> REGISTRAR ENTREGA';
    } else {
        mostrarNotificacion(result.message || 'Error al guardar en la base de datos', 'error');
    }
}

async function eliminarDespachoSoya(id) {
    if (!confirm('¿Eliminar este registro de despacho permanentemente?')) return;
    
    const result = await eliminarDespachoAPI(id);
    
    if (result.success) {
        mostrarNotificacion('Despacho eliminado correctamente', 'success');
        await cargarTablasSoya(mesActualSoya, anioActualSoya);
    } else {
        mostrarNotificacion('Error al eliminar', 'error');
    }
}

async function editarDespachoSoya(id) {
    editandoDespachoId = id;
    
    const despacho = await cargarDespachoSoya(mesActualSoya, anioActualSoya);
    const item = despacho.find(d => d.id_despacho === id);
    
    if (item) {
        document.getElementById('soya-fecha-despacho').value = item.fecha || '';
        document.getElementById('despacho-lote').value = item.lote || '';
        document.getElementById('soya-125g').value = item.u125g || 0;
        document.getElementById('soya-250g').value = item.u250g || 0;
        document.getElementById('soya-8kg').value = item.u8kg || 0;
        document.getElementById('soya-12kg').value = item.u12kg || 0;
        calcularDespacho();
    }
    
    const btnGuardar = document.getElementById('btn-guardar-despacho');
    if (btnGuardar) btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR REGISTRO';
    
    cambiarFormularioSoya('despacho');
    abrirModalDespacho();
}

// ==================== FUNCIONES DE CÁLCULO ====================

function calcularProduccion() {
    const p1 = parseFloat(document.getElementById('soya-primera').value) || 0;
    const dh = parseFloat(document.getElementById('soya-desecho-h').value) || 0;
    const ds = parseFloat(document.getElementById('soya-desecho-s').value) || 0;
    document.getElementById('soya-total').value = (p1 + dh + ds).toFixed(2);
    document.getElementById('soya-total-sin').value = p1.toFixed(2);
}

function calcularDespacho() {
    const t = (parseFloat(document.getElementById('soya-125g').value) || 0) * 0.125 +
              (parseFloat(document.getElementById('soya-250g').value) || 0) * 0.250 +
              (parseFloat(document.getElementById('soya-8kg').value) || 0) * 8 +
              (parseFloat(document.getElementById('soya-12kg').value) || 0) * 12;
    document.getElementById('soya-kg-despacho').value = t.toFixed(2);
}

// ==================== VALIDACIONES ====================

function validarNumeroPositivo(input) {
    if (input.value < 0) {
        input.value = 0;
        mostrarNotificacion("No se permiten números negativos", "error");
    }
}

function validarCampoNumerico(input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
    });
    input.addEventListener('input', () => validarNumeroPositivo(input));
    input.addEventListener('blur', () => { if (input.value === '' || input.value === null) input.value = 0; });
}

function inicializarEventosInput() {
    document.querySelectorAll('.campo-numerico').forEach(input => validarCampoNumerico(input));
    document.querySelectorAll('.calculo-produccion').forEach(input => input.addEventListener('input', calcularProduccion));
    document.querySelectorAll('.calculo-despacho').forEach(input => input.addEventListener('input', calcularDespacho));
}

// ==================== LIMPIAR FORMULARIOS ====================

function limpiarFormularioProduccion() {
    const inputs = document.querySelectorAll('#form-contenedor-produccion input');
    inputs.forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') i.value = '';
    });
    calcularProduccion();
}

function limpiarFormularioDespacho() {
    const inputs = document.querySelectorAll('#form-contenedor-despacho input');
    inputs.forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') i.value = '';
    });
    calcularDespacho();
}

// ==================== MODALES ====================

function inicializarModales() {
    const btnAbrir = document.getElementById('btn-abrir-form-soya');
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            cambiarFormularioSoya('produccion');
            abrirModalProduccion();
        });
    }

    const btnCerrarProd = document.getElementById('btn-cerrar-produccion');
    const btnCerrarDesp = document.getElementById('btn-cerrar-despacho');
    const overlay = document.getElementById('form-overlay-soya');

    if (btnCerrarProd) btnCerrarProd.addEventListener('click', cerrarModalProduccion);
    if (btnCerrarDesp) btnCerrarDesp.addEventListener('click', cerrarModalDespacho);
    if (overlay) overlay.addEventListener('click', () => { cerrarModalProduccion(); cerrarModalDespacho(); });
}

function abrirModalProduccion() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-produccion');
    if (overlay && modal) {
        overlay.classList.add('activo');
        modal.classList.add('activo');
        if (editandoProduccionId === null) limpiarFormularioProduccion();
    }
}

function cerrarModalProduccion() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-produccion');
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
    if (editandoProduccionId !== null) {
        editandoProduccionId = null;
        const btn = document.getElementById('btn-guardar-produccion');
        if (btn) btn.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
    }
}

function abrirModalDespacho() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-despacho');
    if (overlay && modal) {
        overlay.classList.add('activo');
        modal.classList.add('activo');
        if (editandoDespachoId === null) limpiarFormularioDespacho();
    }
}

function cerrarModalDespacho() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-despacho');
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
    if (editandoDespachoId !== null) {
        editandoDespachoId = null;
        const btn = document.getElementById('btn-guardar-despacho');
        if (btn) btn.innerHTML = '<i class="fas fa-shipping-fast"></i> REGISTRAR ENTREGA';
    }
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
                cambiarFormularioSoya(seccionId);
                if (seccionId === 'produccion') abrirModalProduccion();
                else if (seccionId === 'despacho') abrirModalDespacho();
                menuItems.forEach(mi => mi.classList.remove('activo'));
                item.classList.add('activo');
                menuDesplegable.classList.remove('mostrar');
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (menuDesplegable && menuHamburguesa && !menuDesplegable.contains(e.target) && !menuHamburguesa.contains(e.target)) {
            menuDesplegable.classList.remove('mostrar');
        }
    });
}

function cambiarFormularioSoya(seccionId) {
    const tituloPanel = document.querySelector('.page-info h2');
    const subtituloPanel = document.querySelector('.page-info span');
    if (seccionId === 'produccion') {
        if (tituloPanel) tituloPanel.textContent = 'Panel de Control de Soya';
        if (subtituloPanel) subtituloPanel.textContent = 'Registro de Producción';
    } else if (seccionId === 'despacho') {
        if (tituloPanel) tituloPanel.textContent = 'Panel de Control de Soya';
        if (subtituloPanel) subtituloPanel.textContent = 'Entrega a Despacho';
    }
}

function inicializarBotonesGuardar() {
    const btnProd = document.getElementById('btn-guardar-produccion');
    const btnDesp = document.getElementById('btn-guardar-despacho');
    if (btnProd) {
        btnProd.removeEventListener('click', guardarProduccion);
        btnProd.addEventListener('click', guardarProduccion);
    }
    if (btnDesp) {
        btnDesp.removeEventListener('click', guardarDespacho);
        btnDesp.addEventListener('click', guardarDespacho);
    }
}

// ==================== BÚSQUEDA ====================

function inicializarBusqueda() {
    const lupa = document.getElementById('lupa-busqueda');
    if (lupa) lupa.addEventListener('click', abrirModalBusquedaSoya);
}

function inicializarSelectAnios() {
    const selectAnio = document.getElementById('buscar-anio-soya');
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

function abrirModalBusquedaSoya() {
    const modal = document.getElementById('modal-busqueda-soya');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        const hoy = new Date();
        document.getElementById('buscar-mes-soya').value = hoy.getMonth() + 1;
        document.getElementById('buscar-anio-soya').value = hoy.getFullYear();
    }
}

function cerrarModalBusquedaSoya() {
    const modal = document.getElementById('modal-busqueda-soya');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function buscarPorMesAnioSoya() {
    const mes = parseInt(document.getElementById('buscar-mes-soya').value);
    const anio = parseInt(document.getElementById('buscar-anio-soya').value);
    mesActualSoya = mes;
    anioActualSoya = anio;
    cargarTablasSoya(mes, anio);
    cerrarModalBusquedaSoya();
    mostrarNotificacion(`Mostrando datos de ${getNombreMes(mes)} ${anio}`, 'success');
}

function getNombreMes(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
}

// ==================== EXPANDIR TABLAS ====================

function expandirTablaSoya(idTabla) {
    const tabla = document.getElementById(idTabla);
    const modal = document.getElementById('modal-tabla-soya');
    const contenido = document.getElementById('contenido-modal-tabla-soya');
    if (!tabla || !modal || !contenido) return;
    const clon = tabla.cloneNode(true);
    contenido.innerHTML = "";
    contenido.appendChild(clon);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalTablaSoya() {
    const modal = document.getElementById('modal-tabla-soya');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ==================== NOTIFICACIONES ====================

function mostrarNotificacion(mensaje, tipo) {
    const notificacionesPrevias = document.querySelectorAll('.notificacion-venepan');
    notificacionesPrevias.forEach(n => n.remove());

    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-venepan ${tipo}`;
    notificacion.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${mensaje}</span>`;
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
        transition: opacity 0.5s;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

function inyectarEstilosNotificacion() {
    if (document.getElementById('estilos-soya')) return;
    const style = document.createElement('style');
    style.id = 'estilos-soya';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .btn-expand:hover { background: #8e2d2d !important; transform: scale(1.05); transition: all 0.3s; }
    `;
    document.head.appendChild(style);
} 