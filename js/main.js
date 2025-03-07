document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el carrito al cargar la página
    actualizarCarrito();

    // Carrusel automático en la sección hero
    const heroImages = document.querySelectorAll(".hero img");
    let currentHeroIndex = 0;

    if (heroImages.length > 0) {
        setInterval(() => {
            // Remover la clase 'active' de la imagen actual
            heroImages[currentHeroIndex].classList.remove("active");

            // Cambiar al siguiente índice (cíclico)
            currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;

            // Agregar la clase 'active' a la siguiente imagen
            heroImages[currentHeroIndex].classList.add("active");
        }, 4000); // Cambiar imagen cada 3 segundos
    }
    // Agregar eventos a los botones de "Agregar al carrito"
    document.querySelectorAll(".agregar-carrito").forEach(boton => {
        boton.addEventListener("click", () => {
            const producto = boton.closest(".producto").querySelector("h3").textContent.trim();
            const precio = parseFloat(boton.closest(".producto").querySelector(".precio").getAttribute("data-precio"));
            const cantidad = parseInt(boton.closest(".producto").querySelector("input[type='number']").value) || 1;
            const color = boton.closest(".producto").querySelector("select").value; // Captura el color seleccionado

            if (cantidad > 0 && precio > 0) {
                agregarAlCarrito(producto, cantidad, precio, color);
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Por favor, selecciona una cantidad válida.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
            }
        });
    });

    // Evento para finalizar compra
    const btnFinalizarCompra = document.getElementById("finalizar-compra");
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener("click", finalizarCompra);
    }

    // Evento para vaciar carrito
    const btnVaciarCarrito = document.getElementById("vaciar-carrito");
    if (btnVaciarCarrito) {
        btnVaciarCarrito.addEventListener("click", vaciarCarrito);
    }
});

// Función para agregar un producto al carrito
function agregarAlCarrito(producto, cantidad, precio, color) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const index = carrito.findIndex(item => item.producto === producto && item.color === color);

    if (index !== -1) {
        carrito[index].cantidad += cantidad;
    } else {
        carrito.push({ producto, cantidad, precio, color });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();

    Swal.fire({
        title: "Producto agregado",
        text: `Se añadió "${producto}" (${color}) al carrito.`,
        icon: "success",
        showConfirmButton: false,
        timer: 1500
    });
}

// Función para actualizar el carrito
function actualizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const listaCarrito = document.getElementById("lista-carrito");
    const contadorCarrito = document.getElementById("contador-carrito");
    const precioTotal = document.getElementById("precio-total");

    if (listaCarrito) {
        listaCarrito.innerHTML = ""; // Limpiar la lista antes de renderizar
        carrito.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${item.producto} (${item.color}) x ${item.cantidad} - $${(item.cantidad * item.precio).toFixed(2)}
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            `;
            listaCarrito.appendChild(li);
        });

        // Agregar evento a cada botón de eliminar
        document.querySelectorAll(".btn-eliminar").forEach(boton => {
            boton.addEventListener("click", () => {
                eliminarProductoCarrito(boton.dataset.index);
            });
        });
    }

    if (contadorCarrito) {
        const totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalCantidad || 0;
    }

    if (precioTotal) {
        const total = carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
        precioTotal.textContent = `$${total.toFixed(2)}`;
    }
}

// Función para eliminar un producto del carrito
function eliminarProductoCarrito(index) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1); // Eliminar el producto según su índice
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();

    Swal.fire({
        title: "Producto eliminado",
        text: "El producto ha sido eliminado del carrito.",
        icon: "info",
        showConfirmButton: false,
        timer: 1500
    });
}


// Función para vaciar el carrito
function vaciarCarrito() {
    localStorage.removeItem("carrito");
    actualizarCarrito();

    Swal.fire({
        title: "Carrito vacío",
        text: "El carrito ha sido vaciado.",
        icon: "info",
        showConfirmButton: false,
        timer: 1500
    });
}

// Función para finalizar la compra
function finalizarCompra() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        Swal.fire({
            title: "Carrito vacío",
            text: "No tienes productos en el carrito.",
            icon: "warning",
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    // Crear el mensaje con el detalle de los productos y el total
    const total = carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
    const mensaje = carrito
        .map(item => `${item.producto} (${item.color}) x ${item.cantidad} - $${(item.cantidad * item.precio).toFixed(2)}`)
        .join("\n");
    const mensajeCompleto = `Hola! Quiero finalizar la compra de mi pedido de:\n${mensaje}\n\nTotal: $${total.toFixed(2)}`;

    // Crear la URL de WhatsApp con el mensaje completo
    const url = `https://api.whatsapp.com/send?phone=+5491164747827&text=${encodeURIComponent(mensajeCompleto)}`;

    // Abrir WhatsApp y vaciar el carrito
    window.open(url, "_blank");
    vaciarCarrito();
}
