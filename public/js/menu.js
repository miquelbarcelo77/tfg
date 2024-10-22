// Define una función para ejecutar cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    const menuOpcionesButton = document.querySelector('#menuOpcionesButton');
    const menuOpcionesOpen = document.querySelector('#menuOpcionesOpen');
    const retrocesoButton = document.querySelector('#retrocesoButton');
    const botonSubirVolumen = document.querySelector('#botonSubirVolumen');
    const botonBajarVolumen = document.querySelector('#botonBajarVolumen');
    const logoutButton = document.querySelector('#botonSalir');

    const sound = document.querySelector('#soundInicio');

    if (sound) {
        sound.addEventListener('sound-loaded', function () {
            sound.components.sound.playSound();
        });
    }


    document.querySelector('a-scene').addEventListener('loaded', function () {
        var botonTumbet = document.querySelector('#botonTumbet');
        var botonCocaDeTrampo = document.querySelector('#botonCocaDeTrampo');
        botonTumbet.addEventListener('click', function () {
            crearPartidaYRedirigir('Tumbet');
        });

        botonCocaDeTrampo.addEventListener('click', function () {
            crearPartidaYRedirigir('Coca de Trampo');
        });

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
            const audioEntity = document.querySelector('#soundInicio');
            let nuevoVolumen = parseFloat(audioEntity.getAttribute('volume')) + cambio;
            nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen));
            audioEntity.setAttribute('volume', nuevoVolumen);
            console.log(`Volumen ajustado a ${nuevoVolumen}`);
        }

        botonSubirVolumen.addEventListener('click', () => ajustarVolumen(0.1));
        botonBajarVolumen.addEventListener('click', () => ajustarVolumen(-0.1));
    });
});

function nuevaPartida() {
    document.getElementById("selectPartidaMenu").setAttribute('visible', 'false');
    document.getElementById("menuInicio").setAttribute('visible', 'true');
    var selectPartidaMenu = document.getElementById("selectPartidaMenu");
    while (selectPartidaMenu.firstChild) {
        selectPartidaMenu.removeChild(selectPartidaMenu.firstChild);
    }
}

function iniciarSesion(username) {
    var loginMenu = document.getElementById("loginMenu");

    while (loginMenu.firstChild) {
        loginMenu.removeChild(loginMenu.firstChild);
    }
    document.querySelector('#selectPartidaMenu').setAttribute('visible', 'true'); // Mostrar menú de partida
    console.log("Sesion iniciada, usuario:" + username)
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
            // Activar los controles WASD de la cámara

            // Mostrar el panel de menu
            iniciarSesion(username);
        },
        error: function (xhr, status, error) {
            console.error("Error al guardar el nombre de usuario:", error);
            alert("Error al guardar el nombre de usuario");
        }
    });
}

document.addEventListener('a-keyboard-update', updateInput);
var input = '';

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
            var inputField = document.querySelector('#inputField');
            inputField.setAttribute('value', input);
            input = ''; // Reset input value
            enviarNombreUsuario();
            return;
        default:
            input += e.detail.value;
            break;
    }
    document.querySelector('#inputField').setAttribute('value', input + '_');
}

function cambiarEscena(nombreNivel) {
    const escenaJuego = document.getElementById('escenaJuego');

    // Llevar actual
    while (escenaJuego.firstChild) {
        console.log(escenaJuego.firstChild);
        escenaJuego.removeChild(escenaJuego.firstChild);
    }

    cargarNuevoNivel(escenaJuego, nombreNivel);
}

function cargarNuevoNivel(escena, nombreNivel) {

    const sound = document.querySelector('#soundInicio');

    function fadeOutSound(sound, duration) {
        const initialVolume = sound.getAttribute('volume');
        const step = initialVolume / (duration / 50); // Ajusta el paso en función de la duración y el intervalo de tiempo

        function decreaseVolume() {
            const currentVolume = sound.getAttribute('volume');
            if (currentVolume > 0) {
                const newVolume = Math.max(0, currentVolume - step);
                sound.setAttribute('volume', newVolume); // Disminuye el volumen
                setTimeout(decreaseVolume, 50); // Llama de nuevo después de 50 ms
            } else {
                sound.components.sound.stopSound(); // Detiene el sonido cuando el volumen llega a 0
            }
        }

        decreaseVolume();
    }

    setTimeout(function () {
        if (sound) {
            fadeOutSound(sound, 3000);
        }
    }, 3000);
    const sky = document.createElement('a-sky');
    sky.setAttribute('id', 'image-360');
    sky.setAttribute('src', '#sechelt');
    sky.setAttribute('animation__fade', 'property: components.material.material.color; type: color; from: #FFF; to: #000; dur: 300; startEvents: fade');
    sky.setAttribute('animation__fadeback', 'property: components.material.material.color; type: color; from: #000; to: #FFF; dur: 300; startEvents: animationcomplete__fade');
    escena.appendChild(sky);

    const rig = document.querySelector('#rig');
    const leftHand = rig.querySelector('#lhand');
    if (leftHand) {
        leftHand.parentNode.removeChild(leftHand);
    }

    const newLeftHand = document.createElement('a-entity');
    newLeftHand.setAttribute('id', 'lhand');
    newLeftHand.setAttribute('mixin', 'physics-hands');
    newLeftHand.setAttribute('hand-controls', 'hand: left; color: #ffcccc');
    rig.querySelector('a-entity').appendChild(newLeftHand);

    // Añadir iluminación ambiental y direccional
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', '#ffffff');
    escena.appendChild(ambientLight);

    const directionalLight = document.createElement('a-light');
    directionalLight.setAttribute('type', 'directional');
    directionalLight.setAttribute('color', '#ffffff');
    directionalLight.setAttribute('intensity', '0.4');
    directionalLight.setAttribute('position', '0 4 -3');
    escena.appendChild(directionalLight);

    cookingIndicator = document.createElement('a-box'); // Indicador de cocción
    cookingIndicator.setAttribute('position', '-7.5 1 -2.9'); // Ajusta la posición según sea necesario
    cookingIndicator.setAttribute('id', 'cooking-indicator'); // Ajusta la posición según sea necesario
    cookingIndicator.setAttribute('width', '0.9');
    cookingIndicator.setAttribute('height', '0.1');
    cookingIndicator.setAttribute('depth', '0.5');
    cookingIndicator.setAttribute('material', 'color: red; opacity: 0.2; transparent: true');
    cookingIndicator.setAttribute('class', 'cooking-indicator');
    cookingIndicator.setAttribute('static-body', '');
    escena.appendChild(cookingIndicator);

    emplatarCoca = document.createElement('a-box'); // Indicador de cocción
    emplatarCoca.setAttribute('position', `-9.2 0.4 -2.8`);
    emplatarCoca.setAttribute('rotation', '0 0 0');
    emplatarCoca.setAttribute('width', '1');
    emplatarCoca.setAttribute('height', '0.1');
    emplatarCoca.setAttribute('depth', '0.8');
    emplatarCoca.setAttribute('id', 'emplatarCoca');
    emplatarCoca.setAttribute('material', 'color: red; opacity: 0.3; transparent: true');
    emplatarCoca.setAttribute('visible', 'true');
    emplatarCoca.setAttribute('emplatar-checker', 'tolerance: 0.3');
    emplatarCoca.setAttribute('static-body', '');
    escena.appendChild(emplatarCoca);

    // Añadir el suelo y el techo
    const floor = document.createElement('a-entity');
    floor.setAttribute('id', 'floor');
    floor.setAttribute('geometry', 'primitive: plane; width: 30; height: 30');
    floor.setAttribute('material', 'src: #textura-madera; repeat: 10 10; metalness: 0.5; roughness: 1');
    floor.setAttribute('position', '0 -0.5 0');
    floor.setAttribute('rotation', '-90 -0.5 0');
    floor.setAttribute('depth', '0.2');
    floor.setAttribute('static-body', '');
    escena.appendChild(floor);

    const roof = document.createElement('a-entity');
    roof.setAttribute('id', 'roof');
    roof.setAttribute('geometry', 'primitive: plane; width: 30; height: 30');
    roof.setAttribute('material', 'src: #textura-madera; repeat: 10 10; metalness: 0.5; roughness: 1');
    roof.setAttribute('position', '0 9 0');
    roof.setAttribute('rotation', '90 0 0');
    roof.setAttribute('depth', '0.2');
    roof.setAttribute('static-body', '');
    escena.appendChild(roof);

    // Añadir objetos interactivos
    const shaker = document.createElement('a-entity');
    shaker.setAttribute('id', 'shaker');
    shaker.setAttribute('gltf-model', 'url(assets/batidora.glb)');
    shaker.setAttribute('position', '2.5 0.65 -2.6');
    shaker.setAttribute('rotation', '0 -90 0');
    shaker.setAttribute('scale', '0.2 0.2 0.2');
    shaker.setAttribute('vibrate-on-click', '');
    shaker.setAttribute('progress-bar', '');
    shaker.setAttribute('class', 'clickable');
    escena.appendChild(shaker);

    const interactionTextSarten = document.createElement('a-entity');
    interactionTextSarten.setAttribute('text', 'value: Coloca la sarten y enciende los fogones con click izquierdo para cocinar un ingrediente cortado; color: white; align: center; width: 2.5;');
    interactionTextSarten.setAttribute('position', '-2.2 1.6 -3.3');
    interactionTextSarten.setAttribute('rotation', '0 0 0');
    escena.appendChild(interactionTextSarten);

    const fireSource = document.createElement('a-entity');
    fireSource.setAttribute('id', 'fireSource');
    fireSource.setAttribute('gltf-model', 'url(assets/fogons.glb)');
    fireSource.setAttribute('position', '-2.2 0.55 -3');
    fireSource.setAttribute('rotation', '0 0 0');
    fireSource.setAttribute('scale', '0.065 0.065 0.065');
    fireSource.setAttribute('class', 'clickable');
    escena.appendChild(fireSource);

    // Añadir una mesa de madera con interactividad
    const woodenTable = document.createElement('a-entity');
    woodenTable.setAttribute('id', 'woodenTable');
    woodenTable.setAttribute('gltf-model', 'url(assets/wooden_table.glb)');
    woodenTable.setAttribute('position', '7 0 -3');
    woodenTable.setAttribute('rotation', '0 70 0');
    escena.appendChild(woodenTable);

    // Añadir texto informativo sobre cómo interactuar con los objetos
    const interactionText = document.createElement('a-entity');
    interactionText.setAttribute('text', 'value: Coge los ingredientes; color: white; align: center; width: 6;');
    interactionText.setAttribute('position', '7 3 -3');
    interactionText.setAttribute('rotation', '0 -20 0');
    escena.appendChild(interactionText);

    // Añadir un cronómetro a la escena
    const timer = document.createElement('a-entity');
    timer.setAttribute('id', 'timer');
    timer.setAttribute('text', 'value: 5:00; color: white; align: center; width: 3;');
    timer.setAttribute('position', '-2.175 2.2 -3.65');
    escena.appendChild(timer);

    // Añadir un plano como superficie de trabajo
    const workTable = document.createElement('a-plane');
    workTable.setAttribute('id', 'tabla');
    workTable.setAttribute('position', '1 0.52 -3');
    workTable.setAttribute('rotation', '-90 0 0');
    workTable.setAttribute('width', '1.5');
    workTable.setAttribute('height', '0.5');
    workTable.setAttribute('depth', '0.01');
    workTable.setAttribute('color', '#562701');
    workTable.setAttribute('src', 'assets/madera.jpg');
    workTable.setAttribute('static-body', '');
    escena.appendChild(workTable);

    const interactionTextTabla = document.createElement('a-entity');
    interactionTextTabla.setAttribute('text', 'value: Coloca un ingrediente en la tabla y golpealo con el cuchillo para cortarlo; color: white; align: center; width: 2;');
    interactionTextTabla.setAttribute('position', '1 1.6 -3.3');
    interactionTextTabla.setAttribute('rotation', '0 0 0');
    escena.appendChild(interactionTextTabla);

    const walls = [
        { pos: '0 4 -15', size: '30 10 1', color: 'gray' },  // Pared detrás
        { pos: '0 4 15', size: '30 10 1', color: 'gray' },   // Pared delante
        { pos: '-15 4 0', size: '1 10 30', color: 'gray', opacity: 0.5 },  // Pared izquierda con ventana
        { pos: '15 4 0', size: '1 10 30', color: 'gray', opacity: 0.5 }    // Pared derecha
    ];

    walls.forEach(wall => {
        const wallEntity = document.createElement('a-box');
        wallEntity.setAttribute('position', wall.pos);
        wallEntity.setAttribute('width', wall.size.split(" ")[0]);
        wallEntity.setAttribute('height', wall.size.split(" ")[1]);
        wallEntity.setAttribute('depth', wall.size.split(" ")[2]);
        wallEntity.setAttribute('color', wall.color);
        if (wall.opacity) {
            wallEntity.setAttribute('material', 'opacity', wall.opacity);
            wallEntity.setAttribute('material', 'transparent', true);
        }
        wallEntity.setAttribute('static-body', '');
        escena.appendChild(wallEntity);
    });

    const countertop = document.createElement('a-box');
    countertop.setAttribute('position', '0 0 -3');
    countertop.setAttribute('depth', '1.5');
    countertop.setAttribute('height', '1');
    countertop.setAttribute('width', '8');
    countertop.setAttribute('material', 'src: url(assets/images/granite.jpg); repeat: 4 2; metalness: 0.5');
    countertop.setAttribute('color', '#FFF');
    countertop.setAttribute('static-body', '');
    escena.appendChild(countertop);

    // Añadir utensilios de cocina interactivos
    const kitchenKnife = document.createElement('a-entity');
    kitchenKnife.setAttribute('id', 'kitchenKnife');
    kitchenKnife.setAttribute('mixin', 'grabLarge');
    kitchenKnife.setAttribute('class', 'grab');
    kitchenKnife.setAttribute('gltf-model', 'url(assets/kitchen_knife.glb)');
    kitchenKnife.setAttribute('position', '2 0.54 -3');
    kitchenKnife.setAttribute('rotation', '0 0 0');
    kitchenKnife.setAttribute('scale', '1.2 1.2 1.2');
    kitchenKnife.setAttribute('reset', 'resetPosition: 2 1.2 -3');
    kitchenKnife.setAttribute('detectar-golpe', '');
    escena.appendChild(kitchenKnife);

    const fryingPan = document.createElement('a-entity');
    fryingPan.setAttribute('id', 'fryingPan');
    fryingPan.setAttribute('mixin', 'grabSarten');
    fryingPan.setAttribute('class', 'grab');
    fryingPan.setAttribute('gltf-model', 'url(assets/frying_pan_scaleZ.glb)');
    fryingPan.setAttribute('position', '-2.2 0.54 -3.05');
    fryingPan.setAttribute('rotation', '0 0 0');
    fryingPan.setAttribute('reset', 'resetPosition: 3.1 1.2 -3');
    fryingPan.setAttribute('sarten', '');
    escena.appendChild(fryingPan);

    // Añadir funcionalidades de cambio de fondo
    /*const fondoSelector = document.createElement('a-entity');
    fondoSelector.setAttribute('position', '-10 1 9');
    fondoSelector.setAttribute('rotation', '0 90 0');

    const enlaceCambioFondo = [
        { src: '#city', position: '-2 0 0' },
        { src: '#sechelt', position: '-0.5 0 0', sound: '#house' },
        { src: '#cubes', position: '1 0 0' },
        { src: '#city', position: '2.5 0 0', sound: '#sound' }
    ];

    enlaceCambioFondo.forEach(link => {
        const enlace = document.createElement('a-entity');
        enlace.setAttribute('class', 'link');
        enlace.setAttribute('static-body', '');
        enlace.setAttribute('geometry', 'primitive: plane; height: 1; width: 1');
        enlace.setAttribute('material', 'shader: flat; src: ' + link.src);
        enlace.setAttribute('event-set__mouseenter', 'scale: 1.2 1.2 1');
        enlace.setAttribute('event-set__mouseleave', 'scale: 1 1 1');
        enlace.setAttribute('event-set__click', `_target: #image-360; _delay: 300; material.src: ${link.src}`);
        enlace.setAttribute('position', link.position);
        if (link.sound) {
            enlace.setAttribute('sound', `on: click; src: ${link.sound}`);
        }
        fondoSelector.appendChild(enlace);
    });
    escena.appendChild(fondoSelector);*/

    // Lateral izquierdo de la encimera
    const leftSide = document.createElement('a-box');
    leftSide.setAttribute('position', '-4.1 0.25 -3');
    leftSide.setAttribute('width', '0.2');
    leftSide.setAttribute('height', '0.5');
    leftSide.setAttribute('depth', '1.5');
    leftSide.setAttribute('color', '#d2b48c');
    leftSide.setAttribute('static-body', '');
    escena.appendChild(leftSide);

    // Lateral derecho de la encimera
    const rightSide = document.createElement('a-box');
    rightSide.setAttribute('position', '4.1 0.25 -3');
    rightSide.setAttribute('width', '0.2');
    rightSide.setAttribute('height', '0.5');
    rightSide.setAttribute('depth', '1.5');
    rightSide.setAttribute('color', '#d2b48c');
    rightSide.setAttribute('static-body', '');
    escena.appendChild(rightSide);

    // Trasera de la encimera
    const backSide = document.createElement('a-box');
    backSide.setAttribute('position', '0 2 -3.85');
    backSide.setAttribute('width', '8.4');
    backSide.setAttribute('height', '4');
    backSide.setAttribute('depth', '0.2');
    backSide.setAttribute('color', '#d2b48c');
    backSide.setAttribute('static-body', '');
    escena.appendChild(backSide);

    // Parte superior sobre la encimera, como una estantería o almacén adicional
    const upperShelf = document.createElement('a-box');
    upperShelf.setAttribute('position', '-2.175 3 -3.1');
    upperShelf.setAttribute('width', '2.5');
    upperShelf.setAttribute('height', '0.2');
    upperShelf.setAttribute('depth', '1.5');
    upperShelf.setAttribute('color', 'grey');
    upperShelf.setAttribute('static-body', '');
    escena.appendChild(upperShelf);

    // Añadir la bandeja para emplatar con detector de colisiones
    if (nombreNivel === 'Tumbet') {
        const bandeja = document.createElement('a-entity');
        bandeja.setAttribute('id', 'bandeja');
        bandeja.setAttribute('gltf-model', 'url(assets/bandeja.glb)');
        bandeja.setAttribute('position', '-5.5 0.57 -2.8');
        bandeja.setAttribute('rotation', '0 0 0');
        bandeja.setAttribute('scale', '2.5 2.5 2.5');
        bandeja.setAttribute('bandeja-checker', 'tolerance: 0.2');
        escena.appendChild(bandeja);

        // Añadir el bol con posibilidad de ser tomado y reposicionado
        const bol = document.createElement('a-entity');
        bol.setAttribute('id', 'bol');
        bol.setAttribute('mixin', 'grab');
        bol.setAttribute('class', 'grab');
        bol.setAttribute('gltf-model', 'url(assets/bowl.glb)');
        bol.setAttribute('position', '1.9 1.4 -2.7');
        bol.setAttribute('bandeja-checker', 'tolerance: 0.2');
        bol.setAttribute('reset', 'resetPosition: 1.9 1.4 -2.7');
        escena.appendChild(bol);
    } else {
        const devallPasta = document.createElement('a-plane');
        devallPasta.setAttribute('id', 'devallPasta');
        devallPasta.setAttribute('color', 'black');
        devallPasta.setAttribute('width', '1.6');
        devallPasta.setAttribute('height', '0.9');
        devallPasta.setAttribute('position', '-5.25 0.54 -2.8');
        devallPasta.setAttribute('rotation', '-90 0 0');
        const pastaCoca = document.createElement('a-box');
        pastaCoca.setAttribute('id', 'pastaCoca');
        pastaCoca.setAttribute('position', '-5.3 0.57 -2.8');
        pastaCoca.setAttribute('width', '1.2');
        pastaCoca.setAttribute('height', '0.05');
        pastaCoca.setAttribute('depth', '0.6');
        pastaCoca.setAttribute('color', '#FFE6A3');
        pastaCoca.setAttribute('body', 'type: static');
        pastaCoca.setAttribute('pasta-checker', 'tolerance: 0.2');
        pastaCoca.setAttribute('horno', 'tolerance: 0.2');
        escena.appendChild(pastaCoca);
        escena.appendChild(devallPasta);
    }

    // Añadir texto informativo sobre la bandeja
    if (nombreNivel === 'Tumbet') {
        const textoBandeja = document.createElement('a-entity');
        textoBandeja.setAttribute('text', 'value: Coloca los ingredientes cocinados para emplatar; color: white; align: center; width: 2;');
        textoBandeja.setAttribute('position', '-5.5 2 -3');
        escena.appendChild(textoBandeja);
    } else {
        const textoBandeja = document.createElement('a-entity');
        textoBandeja.setAttribute('text', 'value: Coloca los ingredientes cortados (sin cocinar) encima de la pasta; color: white; align: center; width: 2;');
        textoBandeja.setAttribute('position', '-5.5 2 -3');

        const textoEmplatar = document.createElement('a-entity');
        textoEmplatar.setAttribute('text', 'value: Coloca la coca de trampo una vez cocinada para terminar la partida; color: white; align: center; width: 2;');
        textoEmplatar.setAttribute('position', '-9.3 1.5 -2.9');

        escena.appendChild(textoBandeja);
        escena.appendChild(textoEmplatar);
    }


    const armarioHTML = `
        <a-entity id="armario" position="3 2 -3.7" scale="0.7 0.7 0.7" puerta class="clickable">
            <!-- Partes de la nevera -->
            <a-box id="arriba" width="2" height="0.1" depth="1" src="assets/madera.jpg" position="0 1 0.5"
                rotation="0 0 0"></a-box>
            <a-box id="detras" width="2" height="0.1" depth="2" src="assets/madera.jpg" position="0 0 0"
                rotation="90 0 0"></a-box>
            <a-box id="bajo" width="2" height="0.1" depth="1" src="assets/madera.jpg" position="0 -1 0.5"
                rotation="0 0 0"></a-box>
            <a-box class="puerta" width="2" height="0.1" depth="2" src="assets/madera.jpg" position="0 0 1"
                rotation="90 0 0">
                <!-- Pomo -->
                <a-box id="pomo" width="0.1" height="0.4" depth="0.2" color="white" position="0.7 0.1 -0.3"
                    rotation="90 0 0"></a-box>
            </a-box>
            <a-box id="der" width="1" height="2" depth="0.1" color="white" position="1 0 0.5"
                rotation="0 90 0"></a-box>
            <a-box id="izq" width="1" height="2" depth="0.1" color="white" position="-1 0 0.5"
                rotation="0 -90 0"></a-box>
        </a-entity>
        `;

    // Añadir el código HTML del armario a la escena
    escena.insertAdjacentHTML('beforeend', armarioHTML);

    // Crear el código HTML para el horno
    const hornoHTML = `
        <a-entity id="horno" position="-7.5 1.1 -3.2" scale="0.8 0.8 0.8" horno>
            <a-box id="arribaHorno" width="2" height="0.1" depth="1" color="black" position="0 1 0.5"
                rotation="0 0 0"></a-box>
            <a-box id="detrasHorno" width="2" height="0.1" depth="2" color="black" position="0 0 0"
                rotation="90 0 0"></a-box>
            <a-box id="bajoHorno" width="2" height="0.1" depth="1" color="black" position="0 -1 0.5"
                rotation="0 0 0"></a-box>
            <a-box id="puertaHorno" class="puerta-horno" width="2" height="0.1" depth="2" color="grey"
                transparent="true" position="0 0 1" opacity="0.5" rotation="90 0 0" static-body horno>
                <a-box id="pomo" width="0.1" height="0.4" depth="0.2" color="white" position="0.7 0.1 -0.3"
                    rotation="90 0 0"></a-box>
            </a-box>
            <a-box id="derHorno" width="1" height="2" depth="0.1" color="black" position="1 0 0.5"
                rotation="0 90 0"></a-box>
            <a-box id="izqHorno" width="1" height="2" depth="0.1" color="black" position="-1 0 0.5"
                rotation="0 -90 0"></a-box>
        </a-entity>
        `;

    // Añadir el código HTML del horno a la escena
    escena.insertAdjacentHTML('beforeend', hornoHTML);

    // Crear el elemento a-box para el obstáculo
    const obstaculo = document.createElement('a-box');
    obstaculo.setAttribute('position', '-5.2 0 -3');
    obstaculo.setAttribute('width', '2.1');
    obstaculo.setAttribute('height', '1');
    obstaculo.setAttribute('depth', '1.5');
    obstaculo.setAttribute('color', '#d2b48c');
    obstaculo.setAttribute('static-body', '');
    escena.appendChild(obstaculo);

    const bajoHorno = document.createElement('a-box');
    bajoHorno.setAttribute('position', '-8.2 -0.2 -3');
    bajoHorno.setAttribute('width', '4');
    bajoHorno.setAttribute('height', '1');
    bajoHorno.setAttribute('depth', '1.5');
    bajoHorno.setAttribute('color', '#d2b48c');
    bajoHorno.setAttribute('static-body', '');
    escena.appendChild(bajoHorno);

    if (nombreNivel === 'Coca de Trampo') {
        const text = document.createElement('a-entity');
        text.setAttribute('text', 'value: Coloca la coca de trampo en el horno; color: white; align: center; width: 2;');
        text.setAttribute('position', '-7.5 2 -2.4');
        escena.appendChild(text);
    }
}

let nombreNivelActual = '';
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
            if (data.success) {
                nombreNivelActual = nombreNivel;
                cambiarEscena(nombreNivel);
                iniciarFuncionesJuego();
                // Simplificado
            } else {
                console.error('No se pudo crear la partida.');
            }
        })
        .catch(error => {
            console.error('Error al crear la partida:', error);
        });
}

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
                    text.setAttribute('value', `${partida.NomNiv}`);
                    text.setAttribute('align', 'center');

                    plane.appendChild(text);
                    menu.appendChild(plane);

                    // Opcional: Añadir un evento onclick a cada plane para cargar la partida seleccionada
                    plane.addEventListener('click', () => cargarPartida(partida.IdPartida, partida.NomNiv));
                }
            });
            const plane = document.createElement('a-plane');
            plane.setAttribute('position', `0 -2 0`);
            plane.setAttribute('material', 'color', '#F00');
            plane.setAttribute('width', '1');
            plane.setAttribute('height', '0.5');
            plane.setAttribute('id', 'retrocesoButtonPartida');
            const text = document.createElement('a-text');
            text.setAttribute('value', 'SALIR');
            text.setAttribute('align', 'center');
            plane.appendChild(text);
            menu.appendChild(plane);

            // Hacer visible el menú con las partidas
            menu.setAttribute('visible', 'true');

            plane.addEventListener('click', function () {
                window.location.href = 'index.html';
            });

        })
        .catch(error => console.error('Error:', error));
}

function cargarPartida(idPartida, nombreNivel) {
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
            if (data.success) {
                nombreNivelActual = nombreNivel;
                cambiarEscena(nombreNivel);
                iniciarFuncionesJuego();
                // Redirige sin pasar idPartida en la URL
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

function iniciarFuncionesJuego() {
    const menuOpcionesButton = document.querySelector('#menuOpcionesButton');
    const menuOpcionesOpen = document.querySelector('#menuOpcionesOpen');
    const retrocesoButton = document.querySelector('#retrocesoButton');
    const logoutButton = document.querySelector('#botonSalir');
    const botonSubirVolumen = document.querySelector('#botonSubirVolumen');
    const botonBajarVolumen = document.querySelector('#botonBajarVolumen');
    const fireSource = document.getElementById('fireSource');
    let fireCreated = false;
    let fireBoxes = [];


    const usuarioAutenticado = localStorage.getItem('usuarioAutenticado');
    console.log(usuarioAutenticado);
    if (usuarioAutenticado !== 'true') {
        // Si no hay indicación de un usuario autenticado, redirigir a index.html
        window.location.href = 'index.html';
    }

    startTimer();

    function startTimer() {
        const timerEl = document.getElementById('timer');
        let totalTime = 300; // 5 minutos en segundos
        const timerInterval = setInterval(() => {
            let minutes = Math.floor(totalTime / 60);
            let seconds = totalTime % 60;

            // Formatea el tiempo para mostrar siempre dos dígitos para los segundos
            timerEl.setAttribute('text', `value: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}; color: white; align: center; width: 3;`);

            totalTime--; // Decrementa el contador de tiempo
            if (totalTime < 0) {
                clearInterval(timerInterval);
                timerEl.setAttribute('text', 'value: 0:00; color: red; align: center; width: 6;');
            }
        }, 1000);
    }


    //FOGONES
    fireSource.addEventListener('click', () => {
        if (!fireCreated) {
            fireBoxes = createFireRing(); // Actualiza la lista de cajas con las nuevas creadas
            fireCreated = true;
        } else {
            // Eliminar todas las cajas de fuego
            for (let box of fireBoxes) {
                box.parentNode.removeChild(box);
            }
            fireBoxes = []; // Limpiar el arreglo después de eliminar las cajas
            fireCreated = false;
        }
        const sartenEl = document.querySelector('#fryingPan');
        sartenEl.setAttribute('sarten', 'cooking', fireCreated);
        let sartenComponent = sartenEl.components['sarten']; // Accede al componente 'sarten'
        if (sartenComponent) {
            sartenComponent.tryStartCooking(); // Llama a la función tryStartCooking del componente
        }
    });

    //FOGONES
    function createFireRing() {
        const numberOfBoxes = 12; // Número de cajas
        const radius = 0.2; // Radio del círculo
        const scale = "0.05 0.02 0.05";
        let localFireBoxes = []; // Usar un arreglo local para recoger las nuevas cajas

        for (var i = 0; i < numberOfBoxes; i++) {
            var angle = (i / numberOfBoxes) * Math.PI * 2; // Ángulo para cada caja
            var centerPosition = { x: -2.2, y: 0.58, z: -3.05 }; // Nueva posición central para el círculo de fuego
            var x = Math.cos(angle) * radius + centerPosition.x;
            var y = centerPosition.y;
            var z = Math.sin(angle) * radius + centerPosition.z;

            // Crear entidad de caja
            var box = document.createElement('a-box');
            box.setAttribute('position', `${x} ${y} ${z}`);
            box.setAttribute('material', 'color', '#FF5733');
            box.setAttribute('scale', scale);
            box.setAttribute('animation', {
                property: 'position',
                to: `${x} ${y + 0.02} ${z}`,
                dir: 'alternate',
                dur: 500,
                loop: true
            });

            document.querySelector('a-scene').appendChild(box);
            localFireBoxes.push(box); // Añadir la caja al arreglo local
        }
        return localFireBoxes; // Devolver el arreglo local para ser usado fuera
    }

    AFRAME.registerComponent('sarten', {
        schema: {
            cooking: { type: 'bool', default: false },
            hasIngredient: { type: 'bool', default: false }
        },

        init: function () {
            this.fireIndicator = document.createElement('a-box');
            this.fireIndicator.setAttribute('position', '-2.2 0.54 -3.05');
            this.fireIndicator.setAttribute('rotation', '-90 0 0');
            this.fireIndicator.setAttribute('width', '0.2');
            this.fireIndicator.setAttribute('height', '0.2');
            this.fireIndicator.setAttribute('depth', '0.1');
            this.fireIndicator.setAttribute('material', 'color: blue; opacity: 0.2; transparent: true'); // Color azul con opacidad del 50%
            this.fireIndicator.setAttribute('visible', 'true'); // Inicialmente no visible

            // Añadir el indicador a la escena
            document.querySelector('a-scene').appendChild(this.fireIndicator);
            this.el.addEventListener('collide', this.handleCollision.bind(this));
            this.progress = null;
            this.ingredient = null;
            this.frySound = document.querySelector('#frySound');
        },

        tick: function () {
            this.checkPosition(); // Llama a checkPosition en cada frame
        },

        handleCollision: function (e) {
            const collidedEl = e.detail.body.el;
            if (collidedEl.getAttribute('data-es-tallat') === 'true' && !this.data.hasIngredient && !collidedEl.getAttribute('data-cocinado')) {
                this.ingredient = collidedEl;
                this.data.hasIngredient = true;
                collidedEl.removeAttribute('dynamic-body');
                collidedEl.setAttribute('position', '-2.25 0.77 -3.15'); // Ajustar la posición y para que quede sobre la sartén
                collidedEl.setAttribute('rotation', '0 0 0');
                collidedEl.setAttribute('static-body', '');
                this.tryStartCooking();
            }
        },

        checkPosition: function () {
            // Coordenadas de los fogones y tolerancia para la posición
            const firePos = { x: -2.2, y: 0.54, z: -3.05 };
            const tolerance = 0.12;  // Tolerancia de 50cm en todas las direcciones
            const sartenPos = this.el.object3D.position;
            // Verificar si la sartén está aproximadamente en la posición de los fogones
            if (Math.abs(sartenPos.x - firePos.x) <= tolerance &&
                Math.abs(sartenPos.y - firePos.y) <= tolerance &&
                Math.abs(sartenPos.z - firePos.z) <= tolerance) {
                if (!this.data.cooking) { // Solo cambiar a static si previamente no estaba en la posición
                    this.el.removeAttribute('dynamic-body');
                    this.el.setAttribute('static-body', ''); // Hacer la sartén estática
                    this.el.setAttribute('rotation', '0 0 0'); // Establecer la rotación a 0 0 0
                    this.fireIndicator.setAttribute('visible', 'true');  // Muestra el indicador
                    this.fireIndicator.setAttribute('color', 'green');  // Cambia el color a verde cuando está en posición
                } else if (this.data.cooking) {
                    this.el.removeAttribute('static-body'); // Hacer la sartén dinámica si se mueve fuera del rango
                    this.el.setAttribute('dynamic-body', '');
                    console.log("estatico2");
                    this.data.cooking = false;
                    this.fireIndicator.setAttribute('visible', 'true');  // Muestra el indicador
                    this.fireIndicator.setAttribute('color', 'blue');  // Cambia el color a verde cuando está en posición
                }
                this.tryStartCooking();
            }
        },

        tryStartCooking: function () {
            if (this.data.cooking && this.data.hasIngredient && !this.isCooking && !this.ingredient.getAttribute('data-cocinado')) {
                console.log(this.data.cooking);
                this.startCooking();
                this.isCooking = true;
            }
        },

        startCooking: function () {
            if (!this.progress) {

                if (this.frySound) {
                    this.frySound.components.sound.playSound();
                }
                this.progress = document.createElement('a-box');
                this.progress.setAttribute('width', '0.02');
                this.progress.setAttribute('height', '0.05');
                this.progress.setAttribute('depth', '0.02');
                this.progress.setAttribute('color', 'green');
                this.progress.setAttribute('position', '0 0.1 0');
                this.el.appendChild(this.progress);

                this.updateProgress();
            }
        },

        updateProgress: function () {
            const interval = setInterval(() => {
                let newWidth = parseFloat(this.progress.getAttribute('width')) + 0.2 / 40; // Duración de 8s dividido en intervalos
                this.progress.setAttribute('width', newWidth.toString());

                if (newWidth >= 0.2) {
                    clearInterval(interval);
                    if (this.frySound) {
                        this.frySound.components.sound.stopSound();
                    }
                    this.el.removeChild(this.progress); // Elimina la barra de progreso
                    this.progress = null;
                    this.data.hasIngredient = false;
                    let pieces = this.ingredient.querySelectorAll('[geometry]'); // Selecciona todos los hijos con geometría, asumiendo que esos son tus piezas
                    pieces.forEach((piece) => {
                        let material = piece.getAttribute('material'); // Cambia el color a colorCooked
                        material.src = `./assets/textures/cocinado.jpg`
                        piece.setAttribute('material', material);
                    });
                    this.ingredient.setAttribute('data-cocinado', true);
                    this.ingredient.removeAttribute('static-body');
                    this.ingredient.setAttribute('dynamic-body', '');
                    this.isCooking = false;
                    this.cooked(); // Emite un evento indicando que la cocción ha terminado
                }
            }, 200); // Actualiza cada 200ms
        },


        cooked: function () {
            console.log("cooked"); // Actualiza cada 200ms
        }
    });

    AFRAME.registerComponent('bandeja-checker', {
        schema: {
            tolerance: { type: 'number', default: 0.3 },
            allCookedRequired: { type: 'bool', default: true } // Asegura que todos deben estar cocidos
        },
        init: function () {
            this.cookedItems = 0;
            this.requiredItems = 3; // Ajustar según el número de elementos necesarios
            console.log("Componente bandeja-checker inicializado");
            this.indicators = [];
            // Crear tres indicadors per tres ingredients
            for (let i = 0; i < 3; i++) {
                let indicator = document.createElement('a-box');
                let offset = (i - 1) * 0.5;
                indicator.setAttribute('position', `${-5.5 + offset} 0.6 -2.8`);
                indicator.setAttribute('rotation', '-90 0 0');
                indicator.setAttribute('width', '0.2');
                indicator.setAttribute('height', '0.2');
                indicator.setAttribute('depth', '0.1');
                indicator.setAttribute('material', 'color: blue; opacity: 0.2; transparent: true');
                indicator.setAttribute('visible', 'true');
                document.querySelector('a-scene').appendChild(indicator);
                this.indicators.push(indicator);
            }
            this.el.addEventListener('collide', this.handleCollision.bind(this));
        },
        handleCollision: function (evt) {
            let collidedEl = evt.detail.body.el;
            let isCooked = collidedEl.getAttribute("data-cocinado") === 'true';
            if (isCooked && this.cookedItems != this.requiredItems) {
                this.indicators.forEach((indicator, index) => {
                    let indicatorPos = AFRAME.utils.coordinates.parse(indicator.getAttribute('position'));
                    let collidedPos = collidedEl.object3D.position;
                    if (this.checkPosition(collidedPos, indicatorPos)) {
                        this.setIndicator(true, collidedEl, indicator);
                        this.cookedItems++;
                    } else {
                        this.setIndicator(false, collidedEl, indicator);
                    }
                });
            }
            if (this.cookedItems === this.requiredItems && collidedEl.id === 'bol') {
                let bowl = document.querySelector('#bol');
                if (bowl.getAttribute('tomate-salsa') === 'true') {
                    this.moveTomatoToTray(bowl);
                    console.log("moveTomato");
                }
            }

        },
        moveTomatoToTray: function (bowl) {
            if (bowl.getAttribute('tomate-salsa') === 'true') {
                // Crear un a-plane que representarà la salsa
                let tomatoSauce = document.createElement('a-plane');
                tomatoSauce.setAttribute('height', '0.2');
                tomatoSauce.setAttribute('width', '1');
                tomatoSauce.setAttribute('color', '#740303');  // Color vermell tomate
                tomatoSauce.setAttribute('position', '-5.5 0.7 -2.8');
                tomatoSauce.setAttribute('rotation', '-90 0 0');
                console.log("antes de añadir");
                document.querySelector('a-scene').appendChild(tomatoSauce);
                if (bowl.getObject3D('semicircle')) {
                    bowl.removeObject3D('semicircle');
                }
                bowl.removeAttribute('tomate-salsa');

                fetch('/api/completarObjetivo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idObj: 4,
                        completado: true
                    })
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('Objetivo 4 completado correctamente');

                            const objUI = document.querySelector('[data-objetivo="4"]');
                            if (objUI) {
                                const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                iconoEstadoEl.setAttribute('src', '#tick-verde');
                            }
                        } else {
                            console.error('Error al completar el objetivo:', data.message);
                        }
                    }).catch(error => {
                        console.error('Error en la solicitud de completar objetivo:', error);
                    });
                this.checkTimer();
                setTimeout(() => {
                    this.showEndScreen();
                }, 3000);
            }
        },
        showEndScreen: function () {
            fetch(`/obtenerObjetivos`)
                .then(response => response.json())
                .then(objetivos => {
                    const sceneEl = document.querySelector('a-scene');

                    // Crear pantalla de finalización
                    const endScreenTumbet = document.createElement('a-plane');
                    endScreenTumbet.setAttribute('id', 'endScreenTumbet');
                    endScreenTumbet.setAttribute('visible', 'true');
                    endScreenTumbet.setAttribute('position', '10 -10 -10');
                    endScreenTumbet.setAttribute('width', '4');
                    endScreenTumbet.setAttribute('height', '2');
                    endScreenTumbet.setAttribute('color', '#FFF');

                    const endText = document.createElement('a-text');
                    endText.setAttribute('value', 'Partida Finalizada');
                    endText.setAttribute('align', 'center');
                    endText.setAttribute('color', '#000');
                    endText.setAttribute('position', '0 0.5 0.1');

                    endScreenTumbet.appendChild(endText);

                    // Mostrar objetivos completados
                    const endScreenObjetivos = document.createElement('a-plane');
                    endScreenObjetivos.setAttribute('position', '14 -10 -8');
                    endScreenObjetivos.setAttribute('rotation', '0 -60 0');
                    endScreenObjetivos.setAttribute('width', '5.5');
                    endScreenObjetivos.setAttribute('height', '4');
                    const textoFinalObjetivos = document.createElement('a-text');
                    textoFinalObjetivos.setAttribute('value', 'Objetivos Realizados');
                    textoFinalObjetivos.setAttribute('align', 'center');
                    textoFinalObjetivos.setAttribute('color', '#000');
                    textoFinalObjetivos.setAttribute('position', `0 1.2 0.1`);
                    objetivos.forEach((objetivo, index) => {
                        const objetivoText = document.createElement('a-text');
                        objetivoText.setAttribute('value', `${objetivo.NomObj}`);
                        objetivoText.setAttribute('align', 'center');
                        objetivoText.setAttribute('color', '#000');
                        objetivoText.setAttribute('position', `-0.8 ${0.6 - index * 0.3} 0.1`);
                        objetivoText.setAttribute('width', '4');
                        endScreenObjetivos.appendChild(objetivoText);
                        const iconoEstadoEl = document.createElement('a-image');
                        iconoEstadoEl.className = 'icono-estado';
                        iconoEstadoEl.setAttribute('src', objetivo.Completado ? '#tick-verde' : '#x-roja');
                        iconoEstadoEl.setAttribute('position', `2 ${0.6 - index * 0.3} 0.1`);
                        iconoEstadoEl.setAttribute('height', '0.3');
                        iconoEstadoEl.setAttribute('width', '0.3');
                        endScreenObjetivos.appendChild(iconoEstadoEl);
                    });
                    endScreenObjetivos.appendChild(textoFinalObjetivos);

                    const retryButton = document.createElement('a-plane');
                    retryButton.setAttribute('position', '0 -0.5 0.1');
                    retryButton.setAttribute('width', '2');
                    retryButton.setAttribute('height', '0.5');
                    retryButton.setAttribute('color', '#CCC');
                    retryButton.classList.add('clickable');
                    retryButton.addEventListener('click', () => {
                        window.location.href = 'index.html'; // Redirige al inicio
                    });

                    const retryText = document.createElement('a-text');
                    retryText.setAttribute('value', 'Volver al Inicio');
                    retryText.setAttribute('align', 'center');
                    retryText.setAttribute('color', '#000');
                    retryText.setAttribute('position', '0 0 0.1');

                    retryButton.appendChild(retryText);
                    endScreenTumbet.appendChild(retryButton);

                    sceneEl.appendChild(endScreenTumbet);
                    sceneEl.appendChild(endScreenObjetivos);
                    const cameraRig = document.getElementById('rig');
                    cameraRig.setAttribute('position', '10 -11 -8'); // Ajustar la posición del rig

                    // Remover la mano izquierda y añadir el láser
                    const leftHand = cameraRig.querySelector('#lhand');
                    if (leftHand) {
                        leftHand.parentNode.removeChild(leftHand);
                    }

                    const newLeftHand = document.createElement('a-entity');
                    newLeftHand.setAttribute('id', 'lhand');
                    newLeftHand.setAttribute('laser-controls', 'hand: left');
                    newLeftHand.setAttribute('raycaster', 'far: 5');
                    newLeftHand.setAttribute('line', 'color: red; opacity: 0.5');
                    cameraRig.querySelector('a-entity').appendChild(newLeftHand);

                    this.disableControls();

                    this.disableInteractions();

                    this.stopFootsteps();
                })
                .catch(error => console.error('Error al obtener los objetivos:', error));
        },

        disableControls: function () {
            let cameraRig = document.getElementById('rig');
            if (cameraRig.components['movement-controls']) {
                cameraRig.components['movement-controls'].data.enabled = false;
            }
            let camera = cameraRig.querySelector('[camera]');
            if (camera.components['wasd-controls']) {
                camera.components['wasd-controls'].pause();
            }
        },

        disableInteractions: function () {
            document.querySelectorAll('.clickable').forEach(function (clickable) {
                clickable.classList.remove('clickable');
            });
        },

        stopFootsteps: function () {
            let footsteps = document.getElementById('footsteps');
            if (footsteps.components.sound) {
                footsteps.components.sound.stopSound();
            }
        },

        checkPosition: function (collidedPos, indicatorPos) {
            return Math.abs(collidedPos.x - indicatorPos.x) <= this.data.tolerance &&
                Math.abs(collidedPos.y - indicatorPos.y) <= this.data.tolerance &&
                Math.abs(collidedPos.z - indicatorPos.z) <= this.data.tolerance;
        },
        setIndicator: function (active, collidedEl, indicator) {
            if (active) {
                indicator.setAttribute('material', 'color', 'green');
                collidedEl.removeAttribute('dynamic-body');
                collidedEl.setAttribute('static-body', '');
            }
        },
        checkTimer: function () {
            const timerElement = document.querySelector('#timer');
            const timerValue = timerElement.getAttribute('text').value;

            if (timerValue !== '0:00') {
                fetch('/api/completarObjetivo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idObj: 15,
                        completado: true
                    })
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('Objetivo 15 completado correctamente');

                            const objUI = document.querySelector('[data-objetivo="15"]');
                            if (objUI) {
                                const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                iconoEstadoEl.setAttribute('src', '#tick-verde');
                            }
                        } else {
                            console.error('Error al completar el objetivo:', data.message);
                        }
                    }).catch(error => {
                        console.error('Error en la solicitud de completar objetivo:', error);
                    });
            }
        }
    });

    AFRAME.registerComponent('pasta-checker', {
        schema: {
            tolerance: { type: 'number', default: 0.15 },
        },
        init: function () {
            this.items = 0;
            this.requiredItems = 4;
            console.log("Componente pasta-checker inicializado");
            this.indicators = [];

            for (let i = 0; i < 4; i++) {
                let indicator = document.createElement('a-box');
                let offset = (i - 1) * 0.3;
                if (i === 1 || i === 3) {
                    indicator.setAttribute('position', `${-5.4 + offset} 0.6 -2.9`);
                } else {
                    indicator.setAttribute('position', `${-5.4 + offset} 0.6 -2.65`);
                }
                indicator.setAttribute('rotation', '-90 0 0');
                indicator.setAttribute('width', '0.2');
                indicator.setAttribute('data-ocupat', 'false');
                indicator.setAttribute('height', '0.2');
                indicator.setAttribute('depth', '0.1');
                indicator.setAttribute('material', 'color: blue; opacity: 0.2; transparent: true');
                indicator.setAttribute('visible', 'true');
                document.querySelector('a-scene').appendChild(indicator);
                this.indicators.push(indicator);
            }

            this.el.addEventListener('collide', this.handleCollision.bind(this));
        },
        //Funció de colisio
        handleCollision: function (evt) {
            let collidedEl = evt.detail.body.el;
            let isCooked = false;
            let esTallat = false;
            if (collidedEl) {
                if (collidedEl.getAttribute("data-cocinado")) {
                    isCooked = collidedEl.getAttribute("data-cocinado") === 'true';
                }
                esTallat = collidedEl.getAttribute("data-es-tallat") === 'true';
            }

            if ((isCooked || esTallat) && this.items != this.requiredItems) {
                this.indicators.forEach((indicator, index) => {
                    if (indicator.getAttribute('data-ocupat') === 'false') {
                        let indicatorPos = AFRAME.utils.coordinates.parse(indicator.getAttribute('position'));
                        let collidedPos = collidedEl.object3D.position;
                        if (this.checkPosition(collidedPos, indicatorPos)) {
                            this.setIndicator(true, collidedEl, indicator);
                        } else {
                            this.setIndicator(false, collidedEl, indicator);
                        }
                    }
                });
            }

            if (this.items === this.requiredItems) {
                this.applyDynamicBody();
            }
        },
        checkPosition: function (collidedPos, indicatorPos) {
            return Math.abs(collidedPos.x - indicatorPos.x) <= this.data.tolerance &&
                Math.abs(collidedPos.y - indicatorPos.y) <= this.data.tolerance &&
                Math.abs(collidedPos.z - indicatorPos.z) <= this.data.tolerance;
        },
        setIndicator: function (active, collidedEl, indicator) {
            if (active) {
                indicator.setAttribute('material', 'color', 'green');
                indicator.setAttribute('data-ocupat', 'true');
                this.items++;
                setTimeout(() => {
                    //Eliminació del dynamic body per a borrar l'ingredient i creació d'un nou
                    if (collidedEl.getAttribute('dynamic-body')) {
                        collidedEl.removeAttribute('dynamic-body');
                        console.log("no es dynamic ja l'ingredient" + this.items);

                        let container = document.createElement('a-entity');
                        let worldPosition = new THREE.Vector3();
                        collidedEl.object3D.getWorldPosition(worldPosition);

                        let localPosition = new THREE.Vector3();
                        this.el.object3D.worldToLocal(localPosition.copy(worldPosition));
                        localPosition.y += 0.05;
                        container.object3D.position.copy(localPosition);
                        console.log(container.getAttribute('position'));

                        let material = collidedEl.firstChild.getAttribute('material');
                        console.log(material);
                        let color = material && material.color ? material.color : '#FF6347';
                        console.log("COLOR " + color);
                        for (let i = 0; i < 5; i++) {
                            let piece = document.createElement('a-box');
                            piece.setAttribute('width', '0.05');
                            piece.setAttribute('height', '0.05');
                            piece.setAttribute('depth', '0.05');
                            const offsetX = Math.random() * 0.2 - 0.1;
                            const offsetZ = Math.random() * 0.2 - 0.1;
                            piece.setAttribute('position', `${offsetX} 0 ${offsetZ}`);
                            piece.setAttribute('rotation', '40 0 0');
                            piece.setAttribute('material', `color: ${color}`);
                            console.log(piece.getAttribute('material'));
                            container.appendChild(piece);
                        }

                        container.setAttribute('data-es-tallat', 'true');
                        container.setAttribute('rotation', collidedEl.getAttribute('rotation'));
                        container.setAttribute('data-idInteractuable', collidedEl.getAttribute('data-idInteractuable'));
                        container.setAttribute('data-nombre', collidedEl.getAttribute('data-nombre'));
                        collidedEl.parentNode.removeChild(collidedEl);
                        this.el.appendChild(container);
                        console.log(collidedEl);
                    }
                }, 1);
            }
        },
        //Conversió a dynamic
        applyDynamicBody: function () {
            this.el.setAttribute('body', 'type: dynamic');
            this.el.setAttribute('class', 'grab');
            this.el.setAttribute('mixin', 'grabSarten');
            this.el.setAttribute('reset', 'resetPosition: -7.5 1 -2.9');
        }
    });

    AFRAME.registerComponent('emplatar-checker', {
        schema: {
            tolerance: { type: 'number', default: 0.3 },
        },
        init: function () {
            console.log("Componente emplatar-checker inicializado");
            this.indicator = document.querySelector('#emplatarCoca');
            this.el.addEventListener('collide', this.handleCollision.bind(this));
        },
        handleCollision: function (evt) {
            let collidedEl = evt.detail.body.el;
            let isCooked = collidedEl.getAttribute('data-pasta-cooked') === 'true';
            if (collidedEl.getAttribute('id') === 'pastaCoca' && isCooked) {
                let indicatorPos = AFRAME.utils.coordinates.parse(this.indicator.getAttribute('position'));
                let collidedPos = collidedEl.object3D.position;
                if (this.checkPosition(collidedPos, indicatorPos)) {
                    this.setIndicator(true, collidedEl, this.indicator);
                } else {
                    this.setIndicator(false, collidedEl, this.indicator);
                }
            }
        },
        showEndScreen: function () {
            fetch(`/obtenerObjetivos`)
                .then(response => response.json())
                .then(objetivos => {
                    const sceneEl = document.querySelector('a-scene');

                    // Crear pantalla de finalización
                    const endScreenCoca = document.createElement('a-plane');
                    endScreenCoca.setAttribute('id', 'endScreenCoca');
                    endScreenCoca.setAttribute('visible', 'true');
                    endScreenCoca.setAttribute('position', '10 -10 -10');
                    endScreenCoca.setAttribute('width', '4');
                    endScreenCoca.setAttribute('height', '2');
                    endScreenCoca.setAttribute('color', '#FFF');

                    const endText = document.createElement('a-text');
                    endText.setAttribute('value', 'Partida Finalizada');
                    endText.setAttribute('align', 'center');
                    endText.setAttribute('color', '#000');
                    endText.setAttribute('position', '0 0.5 0.1');

                    endScreenCoca.appendChild(endText);

                    // Mostrar objetivos completados
                    const endScreenObjetivos = document.createElement('a-plane');
                    endScreenObjetivos.setAttribute('position', '14 -10 -8');
                    endScreenObjetivos.setAttribute('rotation', '0 -60 0');
                    endScreenObjetivos.setAttribute('width', '5.5');
                    endScreenObjetivos.setAttribute('height', '4');
                    const textoFinalObjetivos = document.createElement('a-text');
                    textoFinalObjetivos.setAttribute('value', 'Objetivos Realizados');
                    textoFinalObjetivos.setAttribute('align', 'center');
                    textoFinalObjetivos.setAttribute('color', '#000');
                    textoFinalObjetivos.setAttribute('position', `0 1.2 0.1`);
                    objetivos.forEach((objetivo, index) => {
                        const objetivoText = document.createElement('a-text');
                        objetivoText.setAttribute('value', `${objetivo.NomObj}`);
                        objetivoText.setAttribute('align', 'center');
                        objetivoText.setAttribute('color', '#000');
                        objetivoText.setAttribute('position', `-0.8 ${0.6 - index * 0.3} 0.1`);
                        objetivoText.setAttribute('width', '4');
                        endScreenObjetivos.appendChild(objetivoText);
                        const iconoEstadoEl = document.createElement('a-image');
                        iconoEstadoEl.className = 'icono-estado';
                        iconoEstadoEl.setAttribute('src', objetivo.Completado ? '#tick-verde' : '#x-roja');
                        iconoEstadoEl.setAttribute('position', `2 ${0.6 - index * 0.3} 0.1`);
                        iconoEstadoEl.setAttribute('height', '0.3');
                        iconoEstadoEl.setAttribute('width', '0.3');
                        endScreenObjetivos.appendChild(iconoEstadoEl);
                    });
                    endScreenObjetivos.appendChild(textoFinalObjetivos);

                    const retryButton = document.createElement('a-plane');
                    retryButton.setAttribute('position', '0 -0.5 0.1');
                    retryButton.setAttribute('width', '2');
                    retryButton.setAttribute('height', '0.5');
                    retryButton.setAttribute('color', '#CCC');
                    retryButton.classList.add('clickable');
                    retryButton.addEventListener('click', () => {
                        window.location.href = 'index.html'; // Redirige al inicio
                    });

                    const retryText = document.createElement('a-text');
                    retryText.setAttribute('value', 'Volver al Inicio');
                    retryText.setAttribute('align', 'center');
                    retryText.setAttribute('color', '#000');
                    retryText.setAttribute('position', '0 0 0.1');

                    retryButton.appendChild(retryText);
                    endScreenCoca.appendChild(retryButton);

                    sceneEl.appendChild(endScreenCoca);
                    sceneEl.appendChild(endScreenObjetivos);


                    const cameraRig = document.getElementById('rig');
                    cameraRig.setAttribute('position', '10 -11 -8'); // Ajustar la posición del rig

                    // Remover la mano izquierda y añadir el láser
                    const leftHand = cameraRig.querySelector('#lhand');
                    if (leftHand) {
                        leftHand.parentNode.removeChild(leftHand);
                    }

                    const newLeftHand = document.createElement('a-entity');
                    newLeftHand.setAttribute('id', 'lhand');
                    newLeftHand.setAttribute('laser-controls', 'hand: left');
                    newLeftHand.setAttribute('raycaster', 'far: 5');
                    newLeftHand.setAttribute('line', 'color: red; opacity: 0.5');
                    cameraRig.querySelector('a-entity').appendChild(newLeftHand);

                    this.disableControls();

                    this.disableInteractions();

                    this.stopFootsteps();
                })
                .catch(error => console.error('Error al obtener los objetivos:', error));

        },

        disableControls: function () {
            let cameraRig = document.getElementById('rig');
            if (cameraRig.components['movement-controls']) {
                cameraRig.components['movement-controls'].data.enabled = false;
            }
            let camera = cameraRig.querySelector('[camera]');
            if (camera.components['wasd-controls']) {
                camera.components['wasd-controls'].pause();
            }
        },

        disableInteractions: function () {
            document.querySelectorAll('.clickable').forEach(function (clickable) {
                clickable.classList.remove('clickable');
            });
        },

        stopFootsteps: function () {
            let footsteps = document.getElementById('footsteps');
            if (footsteps.components.sound) {
                footsteps.components.sound.stopSound();
            }
        },

        checkPosition: function (collidedPos, indicatorPos) {
            return Math.abs(collidedPos.x - indicatorPos.x) <= this.data.tolerance &&
                Math.abs(collidedPos.y - indicatorPos.y) <= this.data.tolerance &&
                Math.abs(collidedPos.z - indicatorPos.z) <= this.data.tolerance;
        },

        setIndicator: function (active, collidedEl, indicator) {
            if (active) {
                indicator.setAttribute('material', 'color', 'green');
                collidedEl.setAttribute('body', 'type: static');
                fetch('/api/completarObjetivo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idObj: 5,
                        completado: true
                    })
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('Objetivo 5 completado correctamente');

                            const objUI = document.querySelector('[data-objetivo="5"]');
                            if (objUI) {
                                const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                iconoEstadoEl.setAttribute('src', '#tick-verde');
                            }
                        } else {
                            console.error('Error al completar el objetivo:', data.message);
                        }
                    }).catch(error => {
                        console.error('Error en la solicitud de completar objetivo:', error);
                    });
                this.checkTimer;
                setTimeout(() => {
                    this.showEndScreen();
                }, 3000);
            }
        },
        checkTimer: function () {
            const timerElement = document.querySelector('#timer');
            const timerValue = timerElement.getAttribute('text').value;

            if (timerValue !== '0:00') {
                fetch('/api/completarObjetivo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idObj: 16,
                        completado: true
                    })
                }).then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('Objetivo 16 completado correctamente');

                            const objUI = document.querySelector('[data-objetivo="16"]');
                            if (objUI) {
                                const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                iconoEstadoEl.setAttribute('src', '#tick-verde');
                            }
                        } else {
                            console.error('Error al completar el objetivo:', data.message);
                        }
                    }).catch(error => {
                        console.error('Error en la solicitud de completar objetivo:', error);
                    });
            }
        }
    });


    //Cargar los glb con static body
    document.querySelector('#woodenTable').addEventListener('model-loaded', () => {
        document.querySelector('#woodenTable').setAttribute('static-body', '');
    });

    if (document.querySelector('#bandeja')) {
        document.querySelector('#bandeja').addEventListener('model-loaded', () => {
            document.querySelector('#bandeja').setAttribute('static-body', '');
        });
    }

    document.querySelector('#shaker').addEventListener('model-loaded', () => {
        document.querySelector('#shaker').setAttribute('static-body', '');
    });

    document.querySelector('#fireSource').addEventListener('model-loaded', () => {
        document.querySelector('#fireSource').setAttribute('static-body', '');
    });

    const ingredientes = [
        { nombre: 'tomate', modelo: './assets/tomato.glb', scale: '1.5 1.5 1.5', color: '#FF0000', colorCooked: '#740303' },
        { nombre: 'calabazin', modelo: './assets/cucumber.glb', scale: '1.5 1.5 1.5', color: '#008000', colorCooked: '#153504' },
        { nombre: 'patata', modelo: './assets/patata.glb', scale: '1.5 1.5 1.5', color: '#FFFF00', colorCooked: '#A28200' },
        { nombre: 'pimiento', modelo: './assets/pimiento.glb', scale: '1.5 1.5 1.5', color: '#FF0000', colorCooked: '#3E0000' },
        { nombre: 'cebolla', modelo: './assets/onion.glb', scale: '1.5 1.5 1.5', color: '#FFFFFF', colorCooked: '#FFFFFF' },
        { nombre: 'pimiento verde', modelo: './assets/pimientoVerde.glb', scale: '1.5 1.5 1.5', color: '#008000', colorCooked: '#008000' },
    ];

    function agregarIngredientes() {
        fetch('/ingredientes')
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error('Se esperaba un array, se recibió:', data);
                    return;
                }
                data.forEach((ingrediente, index) => {
                    const positionX = index / 2 + 6;
                    const position = `${positionX} 1 -2.8`; //-5.3 0.57 -2.8 //positionX 1 -3
                    const ingredienteEncontrado = ingredientes.find(i => i.nombre === ingrediente.NomInteractuable);
                    const modelo = ingredienteEncontrado ? ingredienteEncontrado.modelo : './assets/default.glb';
                    const escala = ingredienteEncontrado ? ingredienteEncontrado.scale : '0.1 0.1 0.1';
                    let entity;

                    if (ingrediente.EsTallat && nombreNivelActual === 'Tumbet') {
                        let container = document.createElement('a-entity');
                        container.setAttribute('position', position);

                        for (let i = 0; i < 6; i++) {
                            let piece = document.createElement('a-entity');
                            piece.setAttribute('geometry', {
                                primitive: 'cylinder',
                                radius: 0.05,
                                height: 0.01
                            });
                            const offsetZ = i * 0.05;

                            piece.setAttribute('position', `0 0 ${offsetZ}`);
                            piece.setAttribute('rotation', '40 0 0');
                            piece.setAttribute('material', 'color', ingredienteEncontrado && ingredienteEncontrado.color ? ingredienteEncontrado.color : '#FF6347');
                            container.appendChild(piece);
                        }
                        container.setAttribute('mixin', 'grabContainer');
                        container.setAttribute('class', 'grab');
                        container.setAttribute('data-es-tallat', 'true');
                        container.setAttribute('rotation', '0 0 0');
                        container.setAttribute('reset', `resetPosition: ${position}`);
                        container.setAttribute('data-idInteractuable', ingrediente.IdInteractuable);
                        container.setAttribute('data-nombre', ingrediente.NomInteractuable);
                        document.querySelector('a-scene').appendChild(container);
                    } else if (ingrediente.EsTallat && nombreNivelActual === 'Coca de Trampo') {
                        let container = document.createElement('a-entity');
                        container.setAttribute('position', position);

                        for (let i = 0; i < 5; i++) {
                            let piece = document.createElement('a-entity');
                            piece.setAttribute('geometry', {
                                primitive: 'box',
                                width: 0.05,
                                height: 0.05,
                                depth: 0.05
                            });
                            const offsetX = Math.random() * 0.2 - 0.1;
                            const offsetZ = Math.random() * 0.2 - 0.1;
                            piece.setAttribute('position', `${offsetX} 0 ${offsetZ}`);
                            piece.setAttribute('rotation', '40 0 0');
                            piece.setAttribute('material', 'color', ingredienteEncontrado && ingredienteEncontrado.color ? ingredienteEncontrado.color : '#FF6347');
                            container.appendChild(piece);
                        }
                        container.setAttribute('mixin', 'grabContainer');
                        container.setAttribute('class', 'grab');
                        container.setAttribute('data-es-tallat', 'true');
                        container.setAttribute('rotation', '0 0 0');
                        container.setAttribute('reset', `resetPosition: ${position}`);
                        container.setAttribute('data-idInteractuable', ingrediente.IdInteractuable);
                        container.setAttribute('data-nombre', ingrediente.NomInteractuable);
                        document.querySelector('a-scene').appendChild(container);

                    } else {
                        entity = document.createElement('a-entity');
                        entity.setAttribute('position', position);
                        entity.setAttribute('gltf-model', modelo);
                        entity.setAttribute('scale', escala);
                        entity.setAttribute('mixin', 'grab');
                        entity.setAttribute('class', 'grab ingrediente');
                        entity.setAttribute('data-vida', ingrediente.PuntsVida);
                        entity.setAttribute('data-idInteractuable', ingrediente.IdInteractuable);
                        entity.setAttribute('data-color', ingredienteEncontrado.color);
                        entity.setAttribute('reset', `resetPosition: ${position}`);
                        if (ingrediente.NomInteractuable === 'tomate' && nombreNivelActual === 'Tumbet') {
                            entity.setAttribute('es-tomate', 'true');
                            entity.setAttribute('colocado-en-batidora', '');
                        } else {
                            entity.setAttribute('colocado-en-tabla', '');
                        }
                        document.querySelector('a-scene').appendChild(entity);
                    }
                    console.log(nombreNivelActual);
                    console.log(ingrediente.NomInteractuable);
                    if (!ingrediente.EsTallat && entity) {
                        if (ingrediente.NomInteractuable === 'tomate') {
                            if (nombreNivelActual === 'Coca de Trampo') {
                                agregarBarraDeProgreso(entity, ingrediente, positionX);
                            }
                        } else {
                            agregarBarraDeProgreso(entity, ingrediente, positionX);
                        }
                    }
                });
            })
            .catch(error => console.error('Error al obtener ingredientes:', error));
    }

    function agregarBarraDeProgreso(entity, ingrediente, positionX) {
        const progressBar = document.createElement('a-box');
        const progressBarPosition = `${positionX} 0.2 -3`; // Posición Y ligeramente arriba del ingrediente
        progressBar.setAttribute('position', progressBarPosition);
        const vidaInicial = ingrediente.PuntsVida / 20; // Asumiendo 20 como máximo de puntos de vida
        const anchoBarra = vidaInicial / 5; // Calcula el ancho basado en los puntos de vida
        progressBar.setAttribute('width', anchoBarra.toString());
        progressBar.setAttribute('height', '0.02');
        progressBar.setAttribute('depth', '0.05');
        progressBar.setAttribute('color', 'green'); // Color verde para representar la salud

        progressBar.classList.add('barra-vida');
        progressBar.setAttribute('data-nomInteractuable', ingrediente.NomInteractuable);
        entity.barraProgreso = progressBar; // Guardar referencia a la barra de progreso en el ingrediente
        entity.setAttribute('actualizar-barra-progreso', '');
        document.querySelector('a-scene').appendChild(progressBar);
    }

    AFRAME.registerComponent('actualizar-barra-progreso', {
        tick: function () {
            // Suponiendo que `this.el` es el ingrediente y tiene una barra de progreso asociada
            let barraProgreso = this.el.barraProgreso; // Supongamos que guardaste la referencia aquí
            if (!barraProgreso) return;

            // Obtener la posición del ingrediente
            let posicionIngrediente = this.el.getAttribute('position');

            // Calcular la nueva posición de la barra de progreso
            let nuevaPosicionBarra = {
                x: posicionIngrediente.x,
                y: posicionIngrediente.y + 0.5, // Ajusta este valor según sea necesario
                z: posicionIngrediente.z
            };

            // Actualizar la posición de la barra de progreso
            barraProgreso.setAttribute('position', nuevaPosicionBarra);
        }
    });

    AFRAME.registerComponent('detectar-golpe', {
        init: function () {
            this.el.addEventListener('collide', (e) => {
                let vidaActual;
                let progressBar;
                const ingredienteGolpeado = e.detail.body.el;
                const sonidoCorte = document.querySelector('#cutSound');
                if (ingredienteGolpeado.classList.contains('ingrediente')) {
                    const listoParaCortar = ingredienteGolpeado.getAttribute('data-listo-para-cortar') === 'true';
                    if (listoParaCortar) {
                        vidaActual = parseInt(ingredienteGolpeado.getAttribute('data-vida'));
                        vidaActual = Math.max(0, vidaActual - 2);
                        ingredienteGolpeado.setAttribute('data-vida', vidaActual.toString());

                        if (sonidoCorte) {
                            sonidoCorte.components.sound.playSound();
                        }

                        progressBar = ingredienteGolpeado.barraProgreso;
                        if (progressBar) {
                            const vidaMaxima = 20;
                            const anchoBarra = 0.2 * (vidaActual / vidaMaxima);
                            progressBar.setAttribute('width', anchoBarra.toString());
                        }
                    }
                    if (vidaActual <= 12 && vidaActual > 5) {
                        progressBar.setAttribute('color', '#E58C1A');
                    }
                    if (vidaActual <= 5 && vidaActual > 0) {
                        progressBar.setAttribute('color', '#FF0000');
                    }
                    if (vidaActual <= 0) {
                        progressBar.parentNode.removeChild(progressBar);
                        this.mostrarIngredienteCortado(ingredienteGolpeado);
                    }
                }
            });
        },

        mostrarIngredienteCortado: function (ingredienteGolpeado) {
            let color = ingredienteGolpeado.getAttribute('data-color');
            const idIngredienteGolpeado = ingredienteGolpeado.getAttribute('data-idInteractuable');
            ingredienteGolpeado.remove();

            if (nombreNivelActual === 'Tumbet') {
                let cortado = document.createElement('a-entity');
                cortado.setAttribute('position', '1 0.6 -3');
                for (let i = 0; i < 6; i++) {
                    let piece = document.createElement('a-entity');
                    piece.setAttribute('geometry', {
                        primitive: 'cylinder',
                        radius: 0.05,
                        height: 0.01
                    });
                    const offsetZ = i * 0.05;

                    piece.setAttribute('position', `0 0 ${offsetZ}`);
                    piece.setAttribute('rotation', '40 0 0');
                    piece.setAttribute('material', 'color', color);
                    cortado.appendChild(piece);
                }
                cortado.setAttribute('mixin', 'grabContainer');
                cortado.setAttribute('class', 'grab');
                cortado.setAttribute('data-es-tallat', 'true');
                cortado.setAttribute('rotation', '0 0 0');
                cortado.setAttribute('reset', `resetPosition: 1 0.6 -3`);
                cortado.setAttribute('data-idInteractuable', idIngredienteGolpeado);
                document.querySelector('a-scene').appendChild(cortado);
            } else {
                let cortado = document.createElement('a-entity');
                cortado.setAttribute('position', '1 0.6 -3');
                for (let i = 0; i < 5; i++) {
                    let piece = document.createElement('a-entity');
                    piece.setAttribute('geometry', {
                        primitive: 'box',
                        width: 0.05,
                        height: 0.05,
                        depth: 0.05
                    });
                    const offsetX = Math.random() * 0.2 - 0.1;
                    const offsetZ = Math.random() * 0.2 - 0.1;
                    piece.setAttribute('position', `${offsetX} 0 ${offsetZ}`);
                    piece.setAttribute('rotation', '40 0 0');
                    piece.setAttribute('material', 'color', color);
                    cortado.appendChild(piece);
                }
                cortado.setAttribute('mixin', 'grabContainer');
                cortado.setAttribute('class', 'grab');
                cortado.setAttribute('data-es-tallat', 'true');
                cortado.setAttribute('rotation', '0 0 0');
                cortado.setAttribute('reset', `resetPosition: 1 0.6 -3`);
                cortado.setAttribute('data-idInteractuable', idIngredienteGolpeado);
                document.querySelector('a-scene').appendChild(cortado);
            }

            this.ingredienteCortado(idIngredienteGolpeado);
        },

        ingredienteCortado: function (idInteractuable) {
            fetch('/actualizar-estado-ingrediente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idInteractuable: idInteractuable,
                    esTallat: true
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Estado del ingrediente actualizado correctamente.');
                        this.verificarYActualizarObjetivo(idInteractuable);
                    } else {
                        console.error('Error al actualizar el estado del ingrediente:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error en la solicitud al servidor:', error);
                });
        },
        verificarYActualizarObjetivo: function (idInteractuable) {
            fetch('/api/completarObjetivoPorIngrediente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idInteractuable })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success && Array.isArray(data.objetivos)) {
                        data.objetivos.forEach(objetivo => {
                            if (data.success && Array.isArray(data.objetivos)) {
                                data.objetivos.forEach(objetivo => {
                                    const objUI = document.querySelector(`[data-objetivo="${objetivo.IdObj}"]`);
                                    if (objUI) {
                                        const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                        iconoEstadoEl.setAttribute('src', '#tick-verde');
                                    }
                                });
                            } else {
                                console.error('Error al actualizar los objetivos:', data.message);
                            }
                        });
                    } else {
                        console.error('Error al actualizar los objetivos:', data.message);
                    }
                })
                .catch(error => console.error('Error al completar objetivos por ingrediente:', error));
        }

    });



    // Esperar a que la mesa se haya cargado para añadir los ingredientes
    document.querySelector('#woodenTable').addEventListener('model-loaded', agregarIngredientes);

    // Hacer una solicitud al servidor para obtener los ingredientes
    document.querySelector('#woodenTable').addEventListener('model-loaded', agregarIngredientes);

    //RESET AL CAER
    AFRAME.registerComponent('reset', {
        schema: {
            resetPosition: { type: 'vec3' }, // Posición a la que se reseteará el objeto
        },
        init: function () {
            // Se ejecuta una vez cuando el componente se añade por primera vez
            this.el.addEventListener('collide', this.handleCollision.bind(this));
        },
        handleCollision: function (e) {
            // Comprobar si el objeto con el que se ha colisionado es el suelo
            if (e.detail.body.el) {
                if (e.detail.body.el.id === 'floor') { // Asumiendo que el ID del suelo es 'floor'
                    // Resetear la posición del objeto
                    this.el.object3D.position.set(
                        this.data.resetPosition.x,
                        this.data.resetPosition.y,
                        this.data.resetPosition.z
                    );
                    // Si estás usando un sistema de físicas, es posible que necesites actualizar el cuerpo de físicas también
                    if (this.el.body) {
                        this.el.body.position.set(
                            this.data.resetPosition.x,
                            this.data.resetPosition.y,
                            this.data.resetPosition.z
                        );
                        // Reinicia la velocidad para evitar movimientos extraños tras el reset
                        this.el.body.velocity.set(0, 0, 0);
                        this.el.body.angularVelocity.set(0, 0, 0);
                    }
                }
                if (e.detail.body.el.id === 'roof') { // Asumiendo que el ID del suelo es 'floor'
                    // Resetear la posición del objeto
                    this.el.object3D.position.set(
                        this.data.resetPosition.x,
                        this.data.resetPosition.y,
                        this.data.resetPosition.z
                    );
                    // Si estás usando un sistema de físicas, es posible que necesites actualizar el cuerpo de físicas también
                    if (this.el.body) {
                        this.el.body.position.set(
                            this.data.resetPosition.x,
                            this.data.resetPosition.y,
                            this.data.resetPosition.z
                        );
                        // Reinicia la velocidad para evitar movimientos extraños tras el reset
                        this.el.body.velocity.set(0, 0, 0);
                        this.el.body.angularVelocity.set(0, 0, 0);
                    }
                }
            }

        },
        remove: function () {
            // Limpiar event listeners si el componente se elimina
            this.el.removeEventListener('collide', this.handleCollision);
        }
    });

    //COMPONENT DE TALL
    AFRAME.registerComponent('colocado-en-tabla', {
        init: function () {
            this.el.addEventListener('collide', (e) => {
                if (e.detail.body.el) {
                    if (e.detail.body.el.id === 'tabla') {
                        let tablaPos = document.querySelector('#tabla').getAttribute('position');
                        this.el.setAttribute('position', { x: tablaPos.x, y: tablaPos.y + 0.05, z: tablaPos.z });
                        this.el.setAttribute('dynamic-body', 'mass', 0);
                        this.el.removeAttribute('dynamic-body');
                        this.el.setAttribute('static-body', '');
                        this.el.setAttribute('data-listo-para-cortar', 'true');
                    }
                }
            });
        }
    });

    //Vibrate on click
    AFRAME.registerComponent('vibrate-on-click', {
        schema: {
            enabled: { default: true }
        },

        init: function () {
            var el = this.el;
            var originalPosition = el.object3D.position.clone();
            this.blenderSound = document.querySelector('#blenderSound');

            el.addEventListener('click', () => {
                if (!this.data.enabled) return;
                setTimeout(() => {
                    if (this.blenderSound) {
                        this.blenderSound.components.sound.playSound();
                    }
                }, 300);

                this.data.enabled = false;
                var duration = 7000;
                var intervalTime = 100;
                var maxIterations = duration / intervalTime;
                var counter = 0;

                var interval = setInterval(() => {
                    if (counter < maxIterations) {
                        var direction = Math.random() < 0.5 ? -1 : 1;
                        el.object3D.position.x = originalPosition.x + Math.random() * 0.02 * direction;
                        el.object3D.position.y = originalPosition.y + Math.random() * 0.02 * direction;
                        el.object3D.position.z = originalPosition.z + Math.random() * 0.02 * direction;
                        counter++;
                    } else {
                        el.object3D.position.copy(originalPosition);
                        clearInterval(interval);
                        this.data.enabled = true;

                        let tomate = document.querySelector('[en-batidora="true"]');
                        if (tomate) {
                            tomate.parentNode.removeChild(tomate);
                            let bol = document.querySelector('#bol');
                            bol.setAttribute('add-tomato-to-bowl', '');
                            // Completar objectiu especific
                            fetch('/api/completarObjetivo', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    idObj: 12,
                                    completado: true
                                })
                            }).then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        console.log('Objetivo 12 completado correctamente');

                                        // Actualizar el ícono del objetivo a verde
                                        const objUI = document.querySelector('[data-objetivo="12"]');
                                        if (objUI) {
                                            const iconoEstadoEl = objUI.querySelector('.icono-estado');
                                            iconoEstadoEl.setAttribute('src', '#tick-verde');
                                        }
                                    } else {
                                        console.error('Error al completar el objetivo:', data.message);
                                    }
                                }).catch(error => {
                                    console.error('Error en la solicitud de completar objetivo:', error);
                                });
                        }
                    }
                }, intervalTime);
            });
        }
    });

    AFRAME.registerComponent('add-tomato-to-bowl', {
        init: function () {
            var geometry = new THREE.SphereGeometry(0.1, 16, 16);
            var material = new THREE.MeshBasicMaterial({ color: 0xFF6347, side: THREE.DoubleSide });
            var sphere = new THREE.Mesh(geometry, material);

            sphere.position.y = 0.3;

            this.el.setObject3D('semicircle', sphere);
            this.el.setAttribute('tomate-salsa', true);
        },
        remove: function () {
            if (this.el.getObject3D('semicircle')) {
                this.el.removeObject3D('semicircle');
            }
        }
    });


    AFRAME.registerComponent('colocado-en-batidora', {
        init: function () {
            this.el.addEventListener('collide', (e) => {
                if (e.detail.body.el.id === 'shaker') {
                    let shakerPos = document.querySelector('#shaker').getAttribute('position');
                    this.el.setAttribute('position', { x: shakerPos.x, y: shakerPos.y + 0.4, z: shakerPos.z - 0.1 });

                    this.el.setAttribute('dynamic-body', 'mass', 0);
                    this.el.setAttribute('en-batidora', 'true');
                    this.el.removeAttribute('dynamic-body');
                    this.el.setAttribute('static-body', '');

                    this.el.setAttribute('data-en-batidora', 'true');
                    this.el.setAttribute('data-cocinado', true);
                }
            });
        }
    });

    //Barra progreso
    AFRAME.registerComponent('progress-bar', {
        init: function () {
            // Crear la barra de progreso como un hijo del objeto que vibra
            var progressBar = document.createElement('a-entity');
            progressBar.setAttribute('geometry', {
                primitive: 'box',
                height: '0.1',
                width: '0'
            });
            progressBar.setAttribute('material', { color: '#FF2D00' });
            progressBar.setAttribute('position', '0 4 0'); // Ajusta la posición según sea necesario
            progressBar.setAttribute('rotation', '0 90 0');
            this.el.appendChild(progressBar);

            this.el.addEventListener('click', () => {
                progressBar.setAttribute('material', { color: '#FF2D00' });
                var width = 0;
                var duration = 7000; // Duración total en milisegundos
                var intervalTime = 100; // Intervalo de tiempo para actualizar la barra
                var maxIterations = duration / intervalTime;
                var counter = 0;
                var interval = setInterval(() => {
                    if (counter < maxIterations) {
                        width = (counter / maxIterations) * 2; // Ajusta '2' según el ancho deseado de la barra completa
                        progressBar.setAttribute('geometry', 'width', width.toString());
                        counter++;
                    } else {
                        progressBar.setAttribute('material', { color: '#00FF00' });
                        clearInterval(interval);
                    }
                }, intervalTime);
            });
        }
    });

    AFRAME.registerComponent('play-on-wasd', {
        init: function () {
            // Obtiene el sonido
            var sound = document.querySelector('#footsteps');
            // Variable para mantener la última instancia de sonido reproducida
            var soundInstance = null;

            // Evento para detectar cuando se presionan las teclas
            window.addEventListener('keydown', function (event) {
                // Si se presiona alguna tecla WASD y no hay una instancia de sonido reproduciéndose
                if ((event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') && soundInstance === null) {
                    // Reproduce el sonido en bucle
                    soundInstance = sound.components.sound.playSound();
                }
            });

            // Evento para detectar cuando se sueltan las teclas
            window.addEventListener('keyup', function (event) {
                // Si todas las teclas WASD están sueltas y hay una instancia de sonido reproduciéndose
                if ((event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') && soundInstance !== null) {
                    // Detiene la instancia de sonido
                    soundInstance = sound.components.sound.stopSound();
                    soundInstance = null;
                }
            });
        }
    });

    AFRAME.registerComponent('puerta', {
        init: function () {
            var el = this.el;
            var rotated = false; // Variable para controlar el estado de rotación
            var sound = document.querySelector('#doorSound'); // Obtener el elemento de sonido

            el.addEventListener('click', function () {
                var puerta = el.querySelector('.puerta');

                // Si el plano está rotado, lo devuelve a su posición original
                if (rotated) {
                    puerta.setAttribute('animation', 'property: rotation; to: 90 -90 0; dur: 1000; easing: linear');
                    puerta.setAttribute('animation__position', 'property: position; to: -1 0 2; dur: 1000; easing: linear');
                    rotated = false;
                    sound.components.sound.playSound();
                } else { // Si el plano no está rotado, lo gira 90 grados
                    puerta.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 1000; easing: linear');
                    puerta.setAttribute('animation__position', 'property: position; to: 0 0 1; dur: 1000; easing: linear');
                    rotated = true;
                    sound.components.sound.playSound();
                }
            });
        }
    });

    AFRAME.registerComponent('horno', {
        schema: {
            cookingTime: { type: 'number', default: 10000 }, // Tiempo de cocción en milisegundos
            tolerance: { type: 'number', default: 0.3 } // Tolerancia de colisión
        },
        init: function () {
            this.isCooking = false; // Estado inicial de cocción
            this.rotated = false; // Estado inicial de la puerta
            this.isFirstClick = true;
            this.pastaInOven = null; // Pasta que está dentro del horno
            this.sound = document.querySelector('#doorSound');
            this.ovenSound = document.querySelector('#ovenSound');
            this.ovenReady = document.querySelector('#ovenReady');
            var puertaHorno = document.querySelector('.puerta-horno');
            this.cookingIndicator = document.getElementById('cooking-indicator');
            this.el.addEventListener('collide', this.handleCollision.bind(this));
            this.humos = [];

            this.el.addEventListener('click', () => {
                if (this.el.getAttribute('id') === 'horno' || this.el.getAttribute('id') === 'puertaHorno') {

                    if (this.isFirstClick) {
                        console.log("CLICK");
                        puertaHorno.setAttribute('animation', 'property: rotation; to: 90 -90 0; dur: 1000; easing: linear');
                        puertaHorno.setAttribute('animation__position', 'property: position; to: -1 0 2; dur: 1000; easing: linear');
                        this.isFirstClick = false;
                        this.sound.components.sound.playSound();
                        return;
                    }

                    if (this.isCooking) {
                        console.log("La cocción está en curso. No se puede abrir la puerta.");
                        return;
                    }

                    if (!this.rotated) {
                        puertaHorno.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 1000; easing: linear');
                        puertaHorno.setAttribute('animation__position', 'property: position; to: 0 0 1; dur: 1000; easing: linear');
                        this.rotated = true;

                    } else {
                        puertaHorno.setAttribute('animation', 'property: rotation; to: 90 -90 0; dur: 1000; easing: linear');
                        puertaHorno.setAttribute('animation__position', 'property: position; to: -1 0 2; dur: 1000; easing: linear');
                        this.rotated = false;
                    }
                    if (this.pastaInOven) {
                        this.startCooking();
                    }

                    if (this.sound && this.sound.components.sound) {
                        this.sound.components.sound.playSound();
                    }
                }
            });
        },
        handleCollision: function (evt) {
            let collidedEl = evt.detail.body.el;
            if (collidedEl) {
                console.log(collidedEl);
                if (collidedEl.getAttribute('id') === 'cooking-indicator') {
                    let indicatorPos = new THREE.Vector3();
                    let cocaPos = new THREE.Vector3();

                    collidedEl.object3D.getWorldPosition(indicatorPos);
                    this.el.object3D.getWorldPosition(cocaPos);

                    if (this.checkPosition(cocaPos, indicatorPos)) {
                        console.log("La coca de trampó ha tocado el indicador de cocción.");
                        if (!this.isCooking /*&& this.rotated*/) {
                            this.startCooking();
                        }
                    }
                }
            }
        },
        checkPosition: function (collidedPos, indicatorPos) {
            return Math.abs(collidedPos.x - indicatorPos.x) <= this.data.tolerance &&
                Math.abs(collidedPos.y - indicatorPos.y) <= this.data.tolerance &&
                Math.abs(collidedPos.z - indicatorPos.z) <= this.data.tolerance;
        },
        startCooking: function () {
            if (!this.isCooking) {
                this.isCooking = true;
                if (this.ovenSound) {
                    this.ovenSound.components.sound.playSound();
                }
                console.log("COCINANDO");
                this.cookingIndicator.setAttribute('material', 'color: green; opacity: 0.5');
                this.el.setAttribute('body', 'type: static-body');
                this.pastaInOven = this.el;

                // Añadir entidades de humo
                this.createSmoke();

                setTimeout(() => {
                    this.isCooking = false;
                    this.cookingIndicator.setAttribute('material', 'color: red; opacity: 0.2');
                    if (this.pastaInOven) {
                        this.pastaInOven.setAttribute('body', 'type: dynamic-body');
                        this.pastaInOven.setAttribute('color', '#AD7A3C');
                        this.pastaInOven.setAttribute('data-pasta-cooked', 'true');
                    }
                    this.removeSmoke(); // Quitar el humo
                    console.log("SE HA COCINADO");
                }, this.data.cookingTime);
            }
        },
        createSmoke: function () {
            const positions = [
                { x: -7.5, y: 2, z: -3 },
                { x: -7, y: 2, z: -3 },
                { x: -8, y: 2, z: -3 }
            ];

            const sceneEl = document.querySelector('a-scene');

            positions.forEach(pos => {
                const humo = document.createElement('a-entity');
                humo.setAttribute('geometry', {
                    primitive: 'sphere',
                    radius: 0.2
                });
                humo.setAttribute('material', {
                    color: '#666666',
                    opacity: 0.7,
                    transparent: true
                });
                humo.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
                humo.setAttribute('animation', {
                    property: 'position',
                    to: `${pos.x} ${pos.y + 0.5} ${pos.z}`,
                    loop: true,
                    dur: 1000,
                    dir: 'alternate'
                });
                sceneEl.appendChild(humo);
                this.humos.push(humo);
            });
        },
        removeSmoke: function () {
            const sceneEl = document.querySelector('a-scene');
            if (this.ovenSound) {
                this.ovenSound.components.sound.stopSound();
            }
            if (this.ovenReady) {
                this.ovenReady.components.sound.playSound();
            }
            this.humos.forEach(humo => {
                sceneEl.removeChild(humo);
            });
            this.humos = [];
        }
    });

    AFRAME.registerComponent('foo', {
        init: function () {
            this.el.addEventListener('collide', function (e) {
                console.log('Player has collided with ', e.detail.body.el);
            });
        }
    })

    AFRAME.registerComponent('static-movement', {
        init: function () {
            var el = this.el; // Elemento al que se aplica el componente
            var camera = document.querySelector('#rig'); // Selecciona la cámara por su ID

            // Evento de clic
            el.addEventListener('click', function () {
                // Obtiene la posición de la cámara
                var cameraPosition = camera.getAttribute('position');
                console.log('Posición de la cámara:', cameraPosition);
            });
        }
    });

    AFRAME.registerComponent('collision-handler', {
        init: function () {
            var el = this.el; // Elemento al que se aplica el componente
            var camera = document.querySelector('#rig'); // Selecciona la cámara por su ID
            var limite = document.querySelector('#limite'); // Selecciona el límite por su ID

            // Verifica la posición de la cámara en cada fotograma
            el.addEventListener('tick', function () {
                var cameraPosition = camera.getAttribute('position');
                var limitePosition = limite.getAttribute('position');

                // Limita la posición de la cámara según los límites
                var newX = Math.min(limitePosition.x + 5, Math.max(limitePosition.x - 5, cameraPosition.x));
                var newZ = Math.min(limitePosition.z + 5, Math.max(limitePosition.z - 5, cameraPosition.z));

                camera.setAttribute('position', { x: newX, y: cameraPosition.y, z: newZ });
            });
        }
    });

    //LIMITAR DISTANCIA
    AFRAME.registerComponent('limit-my-distance', {
        init: function () {
            // nothing here
        },
        tick: function () {
            // limit Z
            if (this.el.object3D.position.z > 6) {
                this.el.object3D.position.z = -3;
                console.log("entra");
            }
            if (this.el.object3D.position.z < -6) {
                this.el.object3D.position.z = 3;
                console.log("entra");
            }

            // limit X
            if (this.el.object3D.position.x > 6) {
                this.el.object3D.position.x = -3;
                console.log("entra");
            }
            if (this.el.object3D.position.x < -6) {
                this.el.object3D.position.x = 3;
                console.log("entra");
            }

        }
    });

    const queryParams = new URLSearchParams(window.location.search);

    // Extrae el IdPartida de los parámetros
    const idPartida = queryParams.get('partidaId');
    console.log(idPartida);

    cargarObjetivosDePartida();

    function cargarObjetivosDePartida() {
        fetch(`/obtenerObjetivos`)
            .then(response => response.json())
            .then(objetivos => {
                const sceneEl = document.querySelector('a-scene');

                objetivos.forEach((objetivo, index) => {
                    //Creacio                    
                    const objetivoEl = document.createElement('a-plane');
                    objetivoEl.setAttribute('position', { x: 8, y: 5 - index * 0.4, z: 1 });
                    objetivoEl.setAttribute('rotation', '0 -90 0');
                    objetivoEl.setAttribute('width', '7');
                    objetivoEl.setAttribute('height', '0.4');
                    objetivoEl.setAttribute('color', '#FFF');
                    objetivoEl.classList.add('objetivo');
                    objetivoEl.setAttribute('data-objetivo', objetivo.IdObj);

                    const textoEl = document.createElement('a-text');
                    textoEl.setAttribute('value', objetivo.NomObj);
                    textoEl.setAttribute('align', 'center');
                    textoEl.setAttribute('color', '#000');
                    textoEl.setAttribute('position', '-1 0 0.1');

                    objetivoEl.appendChild(textoEl);

                    const iconoEstadoEl = document.createElement('a-image');
                    iconoEstadoEl.className = 'icono-estado';
                    iconoEstadoEl.setAttribute('src', objetivo.Completado ? '#tick-verde' : '#x-roja');
                    iconoEstadoEl.setAttribute('position', '2.3 0 0.1');
                    iconoEstadoEl.setAttribute('height', '0.3');
                    iconoEstadoEl.setAttribute('width', '0.3');

                    objetivoEl.appendChild(iconoEstadoEl);

                    sceneEl.appendChild(objetivoEl);
                });
            })
            .catch(error => console.error('Error al cargar objetivos:', error));
    }
}



