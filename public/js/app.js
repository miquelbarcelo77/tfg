document.addEventListener('DOMContentLoaded', () => {
  const fireSource = document.getElementById('fireSource');
  let fireCreated = false; // Indicador de si el anillo de fuego está activo
  let fireBoxes = []; // Almacenar las cajas de fuego para poder eliminarlas

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
  });

  // Espera a que se cargue la escena
  document.querySelector('a-scene').addEventListener('loaded', function () {
    /*// Obtiene referencia al botón
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
  });*/
  });

  function createFireRing() {
    const numberOfBoxes = 12; // Número de cajas
    const radius = 0.2; // Radio del círculo
    const scale = "0.05 0.05 0.05";
    let localFireBoxes = []; // Usar un arreglo local para recoger las nuevas cajas

    for (var i = 0; i < numberOfBoxes; i++) {
      var angle = (i / numberOfBoxes) * Math.PI * 2; // Ángulo para cada caja
      var centerPosition = { x: -2.2, y: 0.61, z: -3.05 }; // Nueva posición central para el círculo de fuego
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

  //Vibrate on click
  AFRAME.registerComponent('vibrate-on-click', {
    init: function () {
      var el = this.el; // El elemento actual
      var originalPosition = el.object3D.position.clone(); // Posición original
      el.addEventListener('click', () => {
        var duration = 8000; // Duración total de la vibración en milisegundos
        var intervalTime = 100; // Tiempo entre cada cambio de posición
        var maxIterations = duration / intervalTime; // Número total de iteraciones
        var counter = 0;
        var interval = setInterval(() => {
          if (counter < maxIterations) {
            var direction = Math.random() < 0.5 ? -1 : 1; // Dirección aleatoria
            el.object3D.position.x = originalPosition.x + Math.random() * 0.02 * direction;
            el.object3D.position.y = originalPosition.y + Math.random() * 0.02 * direction;
            el.object3D.position.z = originalPosition.z + Math.random() * 0.02 * direction;
            counter++;
          } else {
            el.object3D.position.copy(originalPosition);
            clearInterval(interval);
          }
        }, intervalTime);
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
        var duration = 8000; // Duración total en milisegundos
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
});