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
    window.location.href = `inicio.html?partidaId=${idPartida}`;
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

// Define una función para ejecutar cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Espera a que se cargue la escena
    document.querySelector('a-scene').addEventListener('loaded', function () {
        // Obtiene referencia al botón de inicio
        var botonInicio = document.querySelector('#botonInicio');
        // Obtiene referencia al botón de opciones
        var botonOpciones = document.querySelector('#botonOpciones');
        // Obtiene referencia al botón de Tumbet
        var botonTumbet = document.querySelector('#botonTumbet');
        // Obtiene referencia al botón de Tortilla
        var botonTortilla = document.querySelector('#botonTortilla');
        // Obtiene referencia al botón de Pa amb Oli
        var botonPaAmbOli = document.querySelector('#botonPaAmbOli');

        // Cuando se haga clic en el botón de Inicio
        /*botonInicio.addEventListener('click', function () {
            // Oculta el menú inicial
            //var menuInicial = document.querySelector('#menuInicial');
            //menuInicial.setAttribute('visible', 'false');

            // Muestra el menú de inicio
            var menuInicio = document.querySelector('#menuInicio');
            menuInicio.setAttribute('visible', 'true');
        });*/

        // Cuando se haga clic en el botón de Tumbet
        botonTumbet.addEventListener('click', function () {
            // Redirige a la página de inicio.html al hacer clic en el botón de Tumbet
            window.location.href = 'inicio.html';
        });

        // Cuando se haga clic en el botón de Tortilla
        botonTortilla.addEventListener('click', function () {
            // Redirige a la página de inicio.html al hacer clic en el botón de Tortilla
            window.location.href = 'inicio.html';
        });

        // Cuando se haga clic en el botón de Pa amb Oli
        botonPaAmbOli.addEventListener('click', function () {
            // Redirige a la página de inicio.html al hacer clic en el botón de Pa amb Oli
            window.location.href = 'inicio.html';
        });
    });
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

document.addEventListener('a-keyboard-update', updateInput);

//OPCIONES
document.addEventListener('DOMContentLoaded', () => {
    const menuOpcionesButton = document.querySelector('#menuOpcionesButton');
    const menuVolumen = document.querySelector('#menuVolumen');
    const retrocesoButton = document.querySelector('#retrocesoButton');
    const audioElement = document.querySelector('audio');

    menuOpcionesButton.addEventListener('click', () => {
        menuVolumen.setAttribute('visible', true);
    });

    retrocesoButton.addEventListener('click', () => {
        menuVolumen.setAttribute('visible', false);
    });

    function ajustarVolumen(cambio) {
        let nuevoVolumen = audioElement.volume + cambio;
        nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen));
        audioElement.volume = nuevoVolumen;
        console.log(`Volumen ajustado a ${nuevoVolumen}`);
    }

    const botonSubirVolumen = document.querySelector('#botonSubirVolumen');
    const botonBajarVolumen = document.querySelector('#botonBajarVolumen');

    botonSubirVolumen.addEventListener('click', () => ajustarVolumen(0.1));
    botonBajarVolumen.addEventListener('click', () => ajustarVolumen(-0.1));
});