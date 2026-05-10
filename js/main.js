
async function obtenerProductos() {
    try {
        const respuesta = await fetch("https://fakestoreapi.com/products");
        const productosAPI = await respuesta.json();


        
        const productosTransformados = productosAPI.map(producto => ({
            id: `producto-${producto.id}`,
            titulo: producto.title,
            imagen: producto.image,
            descripcion: producto.description,
            categoria: {
                nombre: producto.category,
                id: producto.category.toLowerCase().replace(/['\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
            },

            precio: producto.price
        }));

        
        cargarProductos(productosTransformados);

        
        window.productos = productosTransformados;

    } catch (error) {
        console.error("Error al obtener los productos de la API:", error);
    }
}

obtenerProductos();

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const buscador = document.querySelector("#buscador");

if (buscador) {
    buscador.addEventListener("input", filtrarProductos);
}

const ordenSelect = document.querySelector("#orden");
if (ordenSelect) ordenSelect.addEventListener("change", filtrarProductos);

function filtrarProductos() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    let productosFiltrados = window.productos;

    if (textoBusqueda) {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.titulo.toLowerCase().includes(textoBusqueda)
        );
    }

    const categoriaActiva = document.querySelector(".boton-categoria.active");
    if (categoriaActiva && categoriaActiva.id !== "todos") {
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.categoria.id === categoriaActiva.id
        );
    }

    const criterio = ordenSelect ? ordenSelect.value : "default";
    productosFiltrados = ordenarProductos(productosFiltrados, criterio);

    cargarProductos(productosFiltrados);
}

function ordenarProductos(lista, criterio) {
    const copia = [...lista];
    switch (criterio) {
        case "price-asc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "price-desc":
            return copia.sort((a, b) => b.precio - a.precio);
        case "title-asc":
            return copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
        case "title-desc":
            return copia.sort((a, b) => b.titulo.localeCompare(a.titulo));
        default:
            return copia; // sin ordenar
    }
}

function cargarProductos(productosElegidos) {

    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {

        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo.slice(0, 40)}${producto.titulo.length > 10 ? '...' : ''}</h3>
                <p class="producto-precio">$${producto.precio}</p>
                <div class="producto-acciones">
                    <button class="producto-ver-mas" data-id="${producto.id}">Ver más</button>
                    <button class="producto-agregar icono-carrito" id="${producto.id}">
                        <img src="./img/comprar.png" alt="Agregar" width="20" height="20"> Agregar
                    </button>
                </div>
            </div>
        `;

        contenedorProductos.append(div);
    })

    actualizarBotonesAgregar();
}


botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        
        if (e.currentTarget.id !== "todos") {
            const productosFiltrados = window.productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            tituloPrincipal.innerText = productosFiltrados[0]?.categoria.nombre || "Categoría";
            cargarProductos(productosFiltrados);
        } else {
        
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(window.productos);
        }
    });
});

function actualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });

    const botonesVerMas = document.querySelectorAll('.producto-ver-mas');
    botonesVerMas.forEach(boton => {
        boton.addEventListener('click', abrirModal);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");


if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    actualizarNumerito();
} else {
    productosEnCarrito = [];
}


function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;

    
    const productoAgregado = window.productos.find(producto => producto.id === idBoton);

    if (productosEnCarrito.some(producto => producto.id === idBoton)) {
        
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
        alert(`${productoAgregado.titulo}\nCantidad actualizada en el carrito: ${productosEnCarrito[index].cantidad}`);

        
    } else {
        
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
        alert(`✅ Producto agregado al carrito:\n${productoAgregado.titulo}\nPrecio: $${productoAgregado.precio}`);
    }

    
    actualizarNumerito();

    
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

const modalProducto = document.querySelector('#modal-producto');
const cuerpoModal = document.querySelector('#cuerpo-modal');
const botonCerrarModal = document.querySelector('#cerrar-modal');
const overlayModal = document.querySelector('#overlay-modal');

function abrirModal(e){
    const id = e.currentTarget.dataset.id;
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    renderizarModal(producto);
    modalProducto.classList.remove('disabled');
    modalProducto.setAttribute('aria-hidden', 'false');
}

function cerrarModal(){
    if (!modalProducto) return;
    modalProducto.classList.add('disabled');
    modalProducto.setAttribute('aria-hidden', 'true');
    cuerpoModal.innerHTML = '';
}

function renderizarModal(producto){
    cuerpoModal.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.titulo}">
        <div>
            <h3 id="modal-titulo">${producto.titulo}</h3>
            <p class="modal-categoria">Categoría: ${producto.categoria.nombre}</p>
            <p class="modal-precio">Precio: $${producto.precio}</p>
            <p class="modal-descripcion">${producto.descripcion || 'Sin descripción'}</p>
            <div class="modal-acciones">
                <button id="modal-agregar" class="producto-agregar">Agregar al carrito</button>
                <button id="modal-cerrar" class="cerrar-modal-btn">Cerrar</button>
            </div>
        </div>
    `;

    const botonAgregarModal = document.querySelector('#modal-agregar');
    botonAgregarModal.addEventListener('click', () => {
        
        const fakeEvent = { currentTarget: { id: producto.id } };
        agregarAlCarrito(fakeEvent);
        cerrarModal();
    });

    const botonCerrarInterior = document.querySelector('#modal-cerrar');
    botonCerrarInterior.addEventListener('click', cerrarModal);
}

if (botonCerrarModal) botonCerrarModal.addEventListener('click', cerrarModal);
if (overlayModal) overlayModal.addEventListener('click', cerrarModal);
window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modalProducto && !modalProducto.classList.contains('disabled')){
        cerrarModal();
    }
});


const botonLogin = document.querySelector("#boton-login");
const modalAuth = document.querySelector("#modal-auth");
const cerrarAuth = document.querySelector("#cerrar-auth");
const panelLogin = document.querySelector("#panel-login");
const panelRegistro = document.querySelector("#panel-registro");
const btnIrRegistro = document.querySelector("#btn-ir-registro");
const btnIrLogin = document.querySelector("#btn-ir-login");
const formLogin = document.querySelector("#form-login");
const formRegistro = document.querySelector("#form-registro");
const textoLogin = document.querySelector("#texto-login");
const overlayAuth = document.querySelector(".modal-auth-overlay");

// Abre/cierra el modal de autenticación
if (botonLogin) {
    botonLogin.addEventListener("click", () => {
        if (hayUsuarioLogueado()) {
            cerrarSesion();
        } else {
            modalAuth.classList.remove("disabled");
            panelLogin.classList.add("active");
            panelRegistro.classList.remove("active");
        }
    });
}

// Cerrar modal al clickear el botón cerrar o el overlay
if (cerrarAuth) cerrarAuth.addEventListener("click", () => modalAuth.classList.add("disabled"));
if (overlayAuth) overlayAuth.addEventListener("click", () => modalAuth.classList.add("disabled"));

// Cambiar entre paneles de login y registro
if (btnIrRegistro) {
    btnIrRegistro.addEventListener("click", (e) => {
        e.preventDefault();
        panelLogin.classList.remove("active");
        panelRegistro.classList.add("active");
    });
}

if (btnIrLogin) {
    btnIrLogin.addEventListener("click", (e) => {
        e.preventDefault();
        panelRegistro.classList.remove("active");
        panelLogin.classList.add("active");
    });
}

// Manejar envío del formulario de login
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.querySelector("#email-login").value.trim();
        const contraseña = document.querySelector("#password-login").value;
        const msgError = document.querySelector("#msg-login-error");

        const resultado = loginUsuario(email, contraseña);
        if (resultado.exito) {
            msgError.textContent = "";
            formLogin.reset();
            modalAuth.classList.add("disabled");
            actualizarBotonLogin();
            location.reload();

        } else {
            msgError.textContent = resultado.mensaje;
        }
    });
}

// Manejar envío del formulario de registro
if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.querySelector("#email-registro").value.trim();
        const contraseña = document.querySelector("#password-registro").value;
        const confirmacion = document.querySelector("#password-confirm").value;
        const msgError = document.querySelector("#msg-registro-error");

        if (contraseña !== confirmacion) {
            msgError.textContent = "Las contraseñas no coinciden.";
            return;
        }

        const resultado = registrarUsuario(email, contraseña);
        if (resultado.exito) {
            msgError.textContent = "";
            // Hacer login automático después del registro
            loginUsuario(email, contraseña);
            formRegistro.reset();
            modalAuth.classList.add("disabled");
            actualizarBotonLogin();
            location.reload();

        } else {
            msgError.textContent = resultado.mensaje;
        }
    });
}

// Actualizar el botón login para mostrar email del usuario o volver al login
function actualizarBotonLogin() {
    if (hayUsuarioLogueado()) {
        const usuario = obtenerNombreUsuario();
        textoLogin.textContent = "Cerrar Sesión";
        botonLogin.title = `Sesión: ${usuario}`;
    } else {
        textoLogin.textContent = "Iniciar Sesión";
        botonLogin.title = "Abre el modal de login";
    }
}

// Llamar al cargar la página
actualizarBotonLogin();