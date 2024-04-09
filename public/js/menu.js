
// Define una función para ejecutar cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {

    const menuOpcionesButton = document.querySelector('#menuOpcionesButton');
    const menuOpcionesOpen = document.querySelector('#menuOpcionesOpen');
    const retrocesoButton = document.querySelector('#retrocesoButton');
    const botonSubirVolumen = document.querySelector('#botonSubirVolumen');
    const botonBajarVolumen = document.querySelector('#botonBajarVolumen');
    const logoutButton = document.querySelector('#botonSalir');

    // Espera a que se cargue la escena
    document.querySelector('a-scene').addEventListener('loaded', function () {
        var botonTumbet = document.querySelector('#botonTumbet');
        // Obtiene referencia al botón de Tortilla
        var botonCocaDeTrampo = document.querySelector('#botonCocaDeTrampo');
        
        // Cuando se haga clic en el botón de Tumbet
        botonTumbet.addEventListener('click', function () {
            // Redirige a la página de inicio.html al hacer clic en el botón de Tumbet
            crearPartidaYRedirigir('Tumbet');
        });

        // Cuando se haga clic en el botón de Tortilla
        botonCocaDeTrampo.addEventListener('click', function () {
            // Redirige a la página de inicio.html al hacer clic en el botón de Coca de Trampó
            crearPartidaYRedirigir('Coca de Trampo');
        });
    });

    function crearPartidaYRedirigir(nombreNivel) {
        fetch('/nuevaPartida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nivel: nombreNivel }),
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                window.location.href = `inicio.html`; // Simplificado
            } else {
                console.error('No se pudo crear la partida.');
            }
        })
        .catch(error => {
            console.error('Error al crear la partida:', error);
        });
    }
    
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('usuarioAutenticado');
        window.location.href = 'index.html';
    })
    
    menuOpcionesButton.addEventListener('click', () => {
        menuOpcionesOpen.setAttribute('visible', true);
    });

    retrocesoButton.addEventListener('click', () => {
        menuOpcionesOpen.setAttribute('visible', false);
    });

    function ajustarVolumen(cambio) {
        const audioEntity = document.querySelector('#audioEntity a-sound');
        let nuevoVolumen = parseFloat(audioEntity.getAttribute('volume')) + cambio;
        nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen)); // Asegurar que el volumen esté entre 0 y 1
        audioEntity.setAttribute('volume', nuevoVolumen);
        console.log(`Volumen ajustado a ${nuevoVolumen}`);
    }

    botonSubirVolumen.addEventListener('click', () => ajustarVolumen(0.1));
    botonBajarVolumen.addEventListener('click', () => ajustarVolumen(-0.1));
});

document.addEventListener('a-keyboard-update', updateInput);

var input = '';

function seleccionarPartida() {
    fetch('/obtenerPartidas', {
        method: 'GET', // Asumiendo que tu endpoint es GET
        credentials: 'include', // Para incluir cookies de sesión, si las usas
    })
        .then(response => response.json())
        .then(partidas => {
            const menu = document.getElementById("selectPartidaMenu");
            menu.innerHTML = ''; // Limpiar el menú para evitar duplicados

            // Asumiendo que partidas es un arreglo de objetos con información de las partidas
            partidas.forEach((partida, index) => {
                if (index < 4) { // Limitar a mostrar máximo 4 partidas
                    const plane = document.createElement('a-plane');
                    plane.setAttribute('position', `0 ${0.5 - 0.5 * index} 0`);
                    plane.setAttribute('material', 'color', index % 2 === 0 ? '#0C9' : '#F00');
                    plane.setAttribute('width', '2');
                    plane.setAttribute('height', '0.5');

                    const text = document.createElement('a-text');
                    text.setAttribute('value', `Partida ID: ${partida.IdPartida}`);
                    text.setAttribute('align', 'center');

                    plane.appendChild(text);
                    menu.appendChild(plane);

                    // Opcional: Añadir un evento onclick a cada plane para cargar la partida seleccionada
                    plane.addEventListener('click', () => cargarPartida(partida.IdPartida));
                }
            });

            // Hacer visible el menú con las partidas
            menu.setAttribute('visible', 'true');
        })
        .catch(error => console.error('Error:', error));
}

function cargarPartida(idPartida) {
    fetch('/seleccionarPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idPartida: idPartida }), // Envía el idPartida al backend
        credentials: 'include', // Para incluir cookies de sesión, si las usas
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            window.location.href = 'inicio.html'; // Redirige sin pasar idPartida en la URL
        } else {
            console.error('No se pudo seleccionar la partida.', data.message);
            // Maneja el error mostrando un mensaje al usuario, si es necesario
        }
    })
    .catch(error => {
        console.error('Error al seleccionar la partida:', error);
        // Maneja el error mostrando un mensaje al usuario, si es necesario
    });
}


function nuevaPartida() {
    console.log("Click");
    document.getElementById("selectPartidaMenu").setAttribute('visible', 'false');
    document.getElementById("menuInicio").setAttribute('visible', 'true');
    var selectPartidaMenu = document.getElementById("selectPartidaMenu");
    while (selectPartidaMenu.firstChild) {
        selectPartidaMenu.removeChild(selectPartidaMenu.firstChild);
    }
}

function iniciarPartida(nivel) {
    console.log("HOLA");
    fetch('/nuevaPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Asegúrate de incluir las cookies de sesión
        body: JSON.stringify({ nivel: nivel }) // Solo envía el nivel
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // La partida se ha creado exitosamente en el servidor
                console.log('Success');
                window.location.assign("inicio.html");
            } else {
                console.error('Error al iniciar partida');
            }
        })
        .catch(error => console.error('Error:', error));
}

function iniciarSesion(username) {
    document.querySelector('#loginMenu').setAttribute('visible', 'false'); // Ocultar teclado
    var loginMenu = document.getElementById("loginMenu");
    while (loginMenu.firstChild) {
        loginMenu.removeChild(loginMenu.firstChild);
    }
    document.querySelector('#selectPartidaMenu').setAttribute('visible', 'true'); // Mostrar menú de partida
    alert("Sesión iniciada, usuario: " + username);
    localStorage.setItem('usuarioAutenticado', 'true');
}

function enviarNombreUsuario() {
    var username = document.getElementById("inputField").getAttribute("value");
    console.log(username);
    // Verificar que el nombre de usuario no esté vacío
    if (!username) {
        alert("Por favor, introduce tu nombre de usuario");
        return;
    }
    // Enviar el nombre de usuario al servidor para verificar si está repetido
    $.ajax({
        url: "/verificar-usuario",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username: username }),
        success: function (response) {
            console.log(response);
            if (response.existe) {
                iniciarSesion(username);
            } else {
                // Si el nombre de usuario no está repetido en el servidor, continuar con el registro
                guardarUsuario(username);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al verificar el nombre de usuario:", error);
            alert("Error al verificar el nombre de usuario");
        }
    });
}

// Función para guardar el nombre de usuario en el servidor si no está repetido
function guardarUsuario(username) {
    $.ajax({
        url: "/guardar-usuario",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ username: username }),
        success: function (response) {
            alert("Nombre de usuario guardado correctamente");
            // Activar los controles WASD de la cámara
            var camera = document.getElementById("camera");
            camera.setAttribute("wasd-controls", "enabled: true");
            // Mostrar el panel de menu
            iniciarSesion(username);
        },
        error: function (xhr, status, error) {
            console.error("Error al guardar el nombre de usuario:", error);
            alert("Error al guardar el nombre de usuario");
        }
    });
}

AFRAME.registerComponent('keyboard-input', {
    init: function () {
        const inputField = document.getElementById('inputField');

        // Escucha el evento 'a-keyboard-update' para recibir actualizaciones del teclado
        this.el.addEventListener('a-keyboard-update', (event) => {
            const char = event.detail.char; // Obtiene el carácter de la tecla presionada
            const action = event.detail.action; // Obtiene la acción (pulsación, retroceso, etc.)

            // Si la acción es 'press', agrega el carácter al valor del campo de texto
            if (action === 'press') {
                console.log('Tecla presionada:', char);
                console.log('Valor actual del campo de texto:', inputField.getAttribute('text').value);
                inputField.setAttribute('text', 'value', inputField.getAttribute('text').value + char);
                console.log('Nuevo valor del campo de texto:', inputField.getAttribute('text').value);
            }
        });
    }
});

function updateInput(e) {
    var code = parseInt(e.detail.code);
    switch (code) {
        case 8: // Backspace
            input = input.slice(0, -1);
            break;
        case 13: // Enter
            alert('Submitted');
            var inputField = document.querySelector('#inputField');
            inputField.setAttribute('value', input);
            inputField.setAttribute('color', 'blue');
            inputField.setAttribute('position', '0 1.6 1'); // Reset position
            input = ''; // Reset input value
            enviarNombreUsuario();
            return;
        default:
            input += e.detail.value;
            break;
    }
    document.querySelector('#inputField').setAttribute('value', input + '_');
}

