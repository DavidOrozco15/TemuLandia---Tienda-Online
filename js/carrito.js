let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
let historialCompras = [];


const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const botonHistorial = document.querySelector("#boton-historial");



function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {

        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo.slice(0, 10)}${producto.titulo.length > 10 ? '...' : ''}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}">
                    <img src="./img/eliminar-carrito.png" alt="Eliminar producto" width="20" height="20">
                </button>
            `;

            contenedorCarritoProductos.append(div);
        })

        actualizarBotonesEliminar();
        actualizarTotal();

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }

}

cargarProductosCarrito();


function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}


botonVaciar.addEventListener("click", vaciarCarrito);

function vaciarCarrito() {
    const confirmacion = confirm("¿Estás seguro de que quieres vaciar el carrito?");
    
    if (confirmacion) {
        productosEnCarrito.length = 0;
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        cargarProductosCarrito();
    }
}

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    if (contenedorTotal) contenedorTotal.innerText = `$${totalCalculado}`;
}

botonComprar.addEventListener("click", comprarCarrito);

function comprarCarrito() {

    if (!productosEnCarrito || productosEnCarrito.length === 0) return;


    if (!hayUsuarioLogueado()) {

        alert("Debes iniciar sesión para completar la compra.");
        return;
    }

    // Mostrar formulario de datos de entrega
    mostrarFormularioCompra();
}

// NUEVO: Mostrar formulario de compra
function mostrarFormularioCompra() {
    const modalFormulario = document.querySelector('#modal-formulario-compra');
    const inputCorreo = document.querySelector('#correo');
    
    if (!modalFormulario) return;
    
    // Pre-llenar el correo con el del usuario logueado
    inputCorreo.value = obtenerNombreUsuario();
    
    // Mostrar modal
    modalFormulario.classList.remove('disabled');
    modalFormulario.setAttribute('aria-hidden', 'false');
}

// NUEVO: Completar la compra con datos del formulario
function completarCompra(datosCliente) {
    // Snapshot de la compra
    const productosComprados = productosEnCarrito.map(p => ({ ...p }));
    const totalCompra = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);

    // Crear objeto de compra con datos del cliente
    const compra = {
        id: Date.now(),
        fecha: new Date().toLocaleString('es-ES'),
        productos: productosComprados,
        total: totalCompra,
        cliente: datosCliente  // Incluir datos del cliente
    };
    
    // Guardar compra
    guardarCompraUsuario(compra);

    // Renderizar resumen con datos del cliente
    renderizarResumenCompra(productosComprados, totalCompra, datosCliente);

    // Vaciar carrito y persistir
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

    // Actualizar vista del carrito
    cargarProductosCarrito();
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.add("disabled");
    
    // Cerrar formulario
    const modalFormulario = document.querySelector('#modal-formulario-compra');
    modalFormulario.classList.add('disabled');
}

function renderizarResumenCompra(productosComprados, total, datosCliente = null) {
    const resumenContenedor = document.querySelector('#carrito-resumen');
    const lista = document.querySelector('#resumen-lista');
    const totalSpan = document.querySelector('#resumen-total');

    if (!resumenContenedor || !lista || !totalSpan) return;

    lista.innerHTML = '';
    
    // Si hay datos del cliente, mostrarlos primero
    if (datosCliente) {
        const seccionCliente = document.createElement('div');
        seccionCliente.className = 'resumen-seccion-cliente';
        seccionCliente.innerHTML = `
            <h3>Información de Entrega</h3>
            <div class="resumen-cliente-info">
                <p><strong>Nombres:</strong> ${datosCliente.nombres}</p>
                <p><strong>Correo:</strong> ${datosCliente.correo}</p>
                <p><strong>Teléfono:</strong> ${datosCliente.telefono}</p>
                <p><strong>Dirección:</strong> ${datosCliente.direccion}</p>
                <p><strong>Ciudad:</strong> ${datosCliente.ciudad}</p>
                <p><strong>Departamento:</strong> ${datosCliente.departamento}</p>
                <p><strong>Código Postal:</strong> ${datosCliente.codigoPostal}</p>
                <p><strong>Método de Pago:</strong> ${datosCliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</p>
            </div>
        `;
        lista.appendChild(seccionCliente);
        
        // Agregar separador
        const separador = document.createElement('hr');
        lista.appendChild(separador);
    }
    
    // Mostrar productos
    const seccionProductos = document.createElement('div');
    seccionProductos.className = 'resumen-seccion-productos';
    seccionProductos.innerHTML = '<h3>Productos Comprados</h3>';
    
    productosComprados.forEach(p => {
        const item = document.createElement('div');
        item.classList.add('resumen-item');
        item.innerHTML = `
            <div class="resumen-info">
                <strong>${p.titulo}</strong>
                <div>Categoria: ${p.categoria?.nombre || ''}</div>
                <div>Precio unitario: $${Number(p.precio).toFixed(2)}</div>
                <div>Cantidad: ${p.cantidad}</div>
            </div>
            <div class="resumen-subtotal">$${(p.precio * p.cantidad).toFixed(2)}</div>
        `;
        seccionProductos.appendChild(item);
    });
    lista.appendChild(seccionProductos);

    totalSpan.innerText = `$${Number(total).toFixed(2)}`;
    resumenContenedor.classList.remove('disabled');

    // accesibilidad
    resumenContenedor.setAttribute('aria-hidden', 'false');

    const btnCerrar = document.querySelector('#resumen-cerrar');
    if (btnCerrar) btnCerrar.addEventListener('click', () => {
        resumenContenedor.classList.add('disabled');
        resumenContenedor.setAttribute('aria-hidden', 'true');
        // mostrar mensaje de gracias
        contenedorCarritoComprado.classList.remove('disabled');
    });
}

// ===== COPILOT: FUNCIONES DEL HISTORIAL DE COMPRAS (AGREGADAS POR COPILOT) =====
// Puede eliminarse: SÍ, completamente, sin afectar la funcionalidad base del carrito
if (botonHistorial) {
    botonHistorial.addEventListener('click', mostrarHistorial);
}

function mostrarHistorial() {
    const modalHistorial = document.querySelector('#modal-historial');
    const historiallista = document.querySelector('#historial-lista');
    const historiallVacio = document.querySelector('#historial-vacio');

    console.log("=== DEBUG mostrarHistorial ===");
    console.log("Modal historial encontrado:", !!modalHistorial);
    console.log("Lista historial encontrada:", !!historiallista);
    console.log("Historial vacío elemento:", !!historiallVacio);

    if (!modalHistorial) {
        console.error("ERROR: No se encontró #modal-historial en el DOM");
        return;
    }

    // COPILOT: Obtener historial del usuario actual (MODIFICADO POR COPILOT)
    console.log("hayUsuarioLogueado():", hayUsuarioLogueado());
    const historialActual = hayUsuarioLogueado() ? obtenerHistorialUsuario() : [];
    
    console.log("historialActual:", historialActual);
    console.log("localStorage historial-compras:", localStorage.getItem("historial-compras"));

    if (historialActual && historialActual.length > 0) {
        historiallVacio.classList.add('disabled');
        historiallista.innerHTML = '';

        historialActual.forEach((compra, index) => {
            const item = document.createElement('div');
            item.classList.add('historial-item');
            item.innerHTML = `
                <div class="historial-item-info">
                    <strong>Compra #${index + 1}</strong>
                    <div>${compra.fecha}</div>
                    <div>${compra.productos.length} producto(s)</div>
                </div>
                <div class="historial-item-total">${compra.total.toFixed(2)}$</div>
            `;
            item.addEventListener('click', () => mostrarDetalleCompra(compra.id));
            historiallista.appendChild(item);
        });
        
        modalHistorial.classList.remove('disabled');
    } else {
        historiallVacio.classList.remove('disabled');
        historiallista.innerHTML = '';
    }

    modalHistorial.classList.remove('disabled');
    modalHistorial.setAttribute('aria-hidden', 'false');

    const btnCerrarHistorial = document.querySelector('#historial-cerrar');
    if (btnCerrarHistorial) {
        btnCerrarHistorial.onclick = () => {
            modalHistorial.classList.add('disabled');
            modalHistorial.setAttribute('aria-hidden', 'true');
        };
    }
}

function mostrarDetalleCompra(compraId) {
    const compra = obtenerHistorialUsuario().find(c => c.id === compraId);
    if (!compra) return;

    const modalDetalle = document.querySelector('#modal-detalle-compra');
    const detalleProductos = document.querySelector('#detalle-productos');
    const detalleFecha = document.querySelector('.detalle-fecha');
    const detalleTotal = document.querySelector('#detalle-total-span');
    const modalHistorial = document.querySelector('#modal-historial');

    if (!modalDetalle || !detalleProductos || !detalleFecha) return;

    detalleFecha.innerHTML = `<strong>Fecha:</strong> ${compra.fecha}`;
    detalleProductos.innerHTML = '';
    
    // Si hay datos del cliente, mostrarlos primero
    if (compra.cliente) {
        const seccionCliente = document.createElement('div');
        seccionCliente.className = 'resumen-seccion-cliente';
        seccionCliente.innerHTML = `
            <h3>Información de Entrega</h3>
            <div class="resumen-cliente-info">
                <p><strong>Nombres:</strong> ${compra.cliente.nombres}</p>
                <p><strong>Correo:</strong> ${compra.cliente.correo}</p>
                <p><strong>Teléfono:</strong> ${compra.cliente.telefono}</p>
                <p><strong>Dirección:</strong> ${compra.cliente.direccion}</p>
                <p><strong>Ciudad:</strong> ${compra.cliente.ciudad}</p>
                <p><strong>Departamento:</strong> ${compra.cliente.departamento}</p>
                <p><strong>Código Postal:</strong> ${compra.cliente.codigoPostal}</p>
                <p><strong>Método de Pago:</strong> ${compra.cliente.metodoPago === 'efectivo' ? 'Efectivo' : 'Tarjeta'}</p>
            </div>
        `;
        detalleProductos.appendChild(seccionCliente);
        
        // Agregar separador
        const separador = document.createElement('hr');
        detalleProductos.appendChild(separador);
    }
    
    // Mostrar productos
    const seccionProductos = document.createElement('div');
    seccionProductos.className = 'resumen-seccion-productos';
    seccionProductos.innerHTML = '<h3>Productos Comprados</h3>';

    compra.productos.forEach(p => {
        const item = document.createElement('div');
        item.classList.add('detalle-item');
        item.innerHTML = `
            <div class="detalle-info">
                <strong>${p.titulo}</strong>
                <div>Categoría: ${p.categoria?.nombre || ''}</div>
                <div>Precio unitario: $${Number(p.precio).toFixed(2)}</div>
                <div>Cantidad: ${p.cantidad}</div>
            </div>
            <div class="detalle-subtotal">$${(p.precio * p.cantidad).toFixed(2)}</div>
        `;
        seccionProductos.appendChild(item);
    });
    
    detalleProductos.appendChild(seccionProductos);

    detalleTotal.innerText = `$${Number(compra.total).toFixed(2)}`;

    // Cerrar historial y abrir detalle
    modalHistorial.classList.add('disabled');
    modalDetalle.classList.remove('disabled');
    modalDetalle.setAttribute('aria-hidden', 'false');

    const btnCerrarDetalle = document.querySelector('#detalle-cerrar');
    if (btnCerrarDetalle) {
        btnCerrarDetalle.onclick = () => {
            modalDetalle.classList.add('disabled');
            modalDetalle.setAttribute('aria-hidden', 'true');
            mostrarHistorial();
        };
    }

    const btnVolverHistorial = document.querySelector('#volver-historial');
    if (btnVolverHistorial) {
        btnVolverHistorial.onclick = () => {
            modalDetalle.classList.add('disabled');
            modalDetalle.setAttribute('aria-hidden', 'true');
            mostrarHistorial();
        };
    }
}
// ===== FIN DE CÓDIGO COPILOT =====

// ===== COPILOT: MANEJADOR DE BOTÓN CERRAR SESIÓN (AGREGADO POR COPILOT) =====
const botonLogout = document.querySelector("#boton-logout");
if (botonLogout) {
    botonLogout.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            cerrarSesion();
        }
    });
}

// Mostrar/ocultar botón de logout según sesión
function actualizarBotonLogout() {
    if (botonLogout) {
        if (hayUsuarioLogueado()) {
            botonLogout.style.display = "block";
        } else {
            botonLogout.style.display = "none";
        }
    }
}

// NUEVO: Manejadores del formulario de compra
const modalFormulario = document.querySelector('#modal-formulario-compra');
const formCompra = document.querySelector('#form-compra');
const cerrarFormulario = document.querySelector('#cerrar-formulario');
const formularioOverlay = document.querySelector('.formulario-overlay');

if (cerrarFormulario) {
    cerrarFormulario.addEventListener('click', () => {
        modalFormulario.classList.add('disabled');
    });
}

if (formularioOverlay) {
    formularioOverlay.addEventListener('click', () => {
        modalFormulario.classList.add('disabled');
    });
}

if (formCompra) {
    formCompra.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombres = document.querySelector('#nombres').value.trim();
        const correo = document.querySelector('#correo').value.trim();
        const telefono = document.querySelector('#telefono').value.trim();
        const direccion = document.querySelector('#direccion').value.trim();
        const ciudad = document.querySelector('#ciudad').value.trim();
        const departamento = document.querySelector('#departamento').value.trim();
        const codigoPostal = document.querySelector('#codigo-postal').value.trim();
        const metodoPago = document.querySelector('#metodo-pago').value;
        const msgError = document.querySelector('#form-error');
        
        // Validar campos obligatorios
        if (!nombres || !correo || !telefono || !direccion || !ciudad || !departamento || !codigoPostal || !metodoPago) {
            msgError.textContent = 'Por favor completa todos los campos.';
            return;
        }
        
        // Validar teléfono (números)
        if (!/^\d{7,}$/.test(telefono.replace(/\s|-/g, ''))) {
            msgError.textContent = 'Teléfono inválido.';
            return;
        }
        
        // Si todo está bien, completar la compra
        msgError.textContent = '';
        
        const datosCliente = {
            nombres,
            correo,
            telefono,
            direccion,
            ciudad,
            departamento,
            codigoPostal,
            metodoPago
        };
        
        completarCompra(datosCliente);
        
        // Limpiar formulario
        formCompra.reset();
    });
}

// Llamar al cargar la página
actualizarBotonLogout();