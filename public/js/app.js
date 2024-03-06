
// Arreglo de ingredientes predefinidos con sus nombres y modelos correspondientes
const ingredientes = [
  { nombre: 'tomate', modelo: './assets/Tomato.glb' },
  { nombre: 'calabazin', modelo: './assets/Tomato.glb' },
  // Otros ingredientes...
];

// Hacer una solicitud al servidor para obtener los ingredientes
fetch('/ingredientes')
  .then(response => response.json())
  .then(data => {
    // Iterar sobre los ingredientes obtenidos de la base de datos
    data.forEach((ingrediente, index) => {
      const position = `0 0 ${index * 2 + 2}`; // Calcular la posición en base al índice
      
      // Buscar el modelo correspondiente en el arreglo de ingredientes predefinidos
      const modelo = ingredientes.find(i => i.nombre === ingrediente.nombre)?.modelo || './assets/Tomato.glb';
      
      // Crear la entidad <a-entity> para el ingrediente
      const entity = document.createElement('a-entity');
      entity.setAttribute('position', position);
      entity.setAttribute('gltf-model', modelo);
      
      // Agregar la entidad al escenario
      document.querySelector('a-scene').appendChild(entity);
    });
  })
  .catch(error => console.error('Error al obtener ingredientes:', error));

// Define una función para ejecutar cuando el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Espera a que se cargue la escena
  document.querySelector('a-scene').addEventListener('loaded', function () {
    // Obtiene referencia al botón
    var boton = document.querySelector('#boton');

    // Cuando se haga clic en el botón
    boton.addEventListener('click', function () {
      // Oculta el botón
      boton.setAttribute('visible', 'false');

      // Muestra el modelo con la animación
      var modelo = document.querySelector('.animacionCorte');
      modelo.setAttribute('visible', 'true');

      // Inicia la animación del modelo
      modelo.emit('play');

      // Espera 5.7 segundos
      setTimeout(function () {
        // Oculta el modelo
        modelo.setAttribute('visible', 'false');

        // Muestra la esfera
        var esfera = document.querySelector('#esfera');
        esfera.setAttribute('visible', 'true');
      }, 6000); // 5100 milisegundos = 5.1 segundos
    });
  });
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



/*
AFRAME.registerComponent('grab-and-move', {
  init: function () {
    var el = this.el;
    var camera = document.querySelector('[camera]');
    var leftController = document.querySelector('#left-controller');
    var rightController = document.querySelector('#right-controller');
    var isGrabbed = false;
    var startPosition;
    var startControllerPosition;

    // Event listener para el botón de agarre en el controlador izquierdo
    leftController.addEventListener('triggerdown', function (evt) {
      evt.preventDefault();
      isGrabbed = true;
      startPosition = el.object3D.position.clone();
      startControllerPosition = leftController.object3D.position.clone();
      // Desactivar look-controls mientras se agarra el objeto
      camera.removeAttribute('look-controls');
    });

    // Event listener para el botón de agarre en el controlador derecho
    rightController.addEventListener('triggerdown', function (evt) {
      evt.preventDefault();
      isGrabbed = true;
      startPosition = el.object3D.position.clone();
      startControllerPosition = rightController.object3D.position.clone();
      // Desactivar look-controls mientras se agarra el objeto
      camera.removeAttribute('look-controls');
    });

    // Event listener para soltar el botón de agarre en cualquiera de los controladores
    document.addEventListener('triggerup', function (evt) {
      if (!isGrabbed) return;
      evt.preventDefault();
      isGrabbed = false;
      // Reactivar look-controls al soltar el objeto
      camera.setAttribute('look-controls', '');
    });

    // Event listener para el movimiento de los controladores
    document.addEventListener('controllermove', function (evt) {
      if (!isGrabbed) return;
      evt.preventDefault();
      
      // Obtener la diferencia de posición desde el inicio del agarre
      var controllerPosition = evt.detail.position.clone();
      var controllerDelta = controllerPosition.clone().sub(startControllerPosition);

      // Calcular la nueva posición del objeto basado en la diferencia del controlador
      var newPosition = startPosition.clone().add(controllerDelta);
      el.object3D.position.copy(newPosition);
    });
  }
});
*/

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
        console.log("rotar");
      } else { // Si el plano no está rotado, lo gira 90 grados
        puerta.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 1000; easing: linear');
        puerta.setAttribute('animation__position', 'property: position; to: 0 0 1; dur: 1000; easing: linear');
        rotated = true;
        sound.components.sound.playSound();
      }
    });
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
