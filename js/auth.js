function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem("usuario-actual")) || null;
}

function establecerUsuarioActual(usuario) {
    localStorage.setItem("usuario-actual", JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem("usuario-actual");
    localStorage.removeItem("productos-en-carrito");
    window.location.href = "./inicio.html";
}

function registrarUsuario(email, contraseña) {
    const usuarios = obtenerUsuarios();

    if (usuarios.some(u => u.email === email)) {
        return { exito: false, mensaje: "Este email ya está registrado" };
    }

    if (!contraseña || contraseña.length < 4) {
        return { exito: false, mensaje: "La contraseña debe tener al menos 4 caracteres" };
    }

    const nuevoUsuario = {
        id: Date.now(),
        email: email,
        contraseña: contraseña,
        fechaRegistro: new Date().toLocaleString('es-ES')
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    return { exito: true, mensaje: "Registro exitoso. Ahora puedes iniciar sesión." };
}

function loginUsuario(email, contraseña) {
    const usuarios = obtenerUsuarios();

    const usuario = usuarios.find(u => u.email === email && u.contraseña === contraseña);

    if (!usuario) {
        return { exito: false, mensaje: "Email o contraseña incorrectos" };
    }

    establecerUsuarioActual({
        id: usuario.id,
        email: usuario.email,
        fechaRegistro: usuario.fechaRegistro
    });

    return { exito: true, mensaje: "Sesión iniciada correctamente" };
}

function obtenerHistorialUsuario() {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) return [];

    const todosHistoriales = JSON.parse(localStorage.getItem("historial-compras")) || {};
    return todosHistoriales[usuarioActual.id] || [];
}

function guardarCompraUsuario(compra) {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) return false;

    const todosHistoriales = JSON.parse(localStorage.getItem("historial-compras")) || {};

    if (!todosHistoriales[usuarioActual.id]) {
        todosHistoriales[usuarioActual.id] = [];
    }

    todosHistoriales[usuarioActual.id].push(compra);
    localStorage.setItem("historial-compras", JSON.stringify(todosHistoriales));
    return true;
}

function hayUsuarioLogueado() {
    return obtenerUsuarioActual() !== null;
}

function obtenerNombreUsuario() {
    const usuario = obtenerUsuarioActual();
    return usuario ? usuario.email : null;
}

