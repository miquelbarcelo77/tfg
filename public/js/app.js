document.addEventListener('DOMContentLoaded', () => {
  const menuOpcionesButton = document.querySelector('#menuOpcionesButton');
  const menuOpcionesOpen = document.querySelector('#menuOpcionesOpen');
  const logoutButton = document.querySelector('#botonSalir');
  const fireSource = document.getElementById('fireSource');
  let fireCreated = false; // Indicador de si el anillo de fuego está activo
  let fireBoxes = []; // Almacenar las cajas de fuego para poder eliminarlas
  // En el archivo JavaScript que se carga con inicio.html

  const usuarioAutenticado = localStorage.getItem('usuarioAutenticado');
  console.log(usuarioAutenticado);
  if (usuarioAutenticado !== 'true') {
    // Si no hay indicación de un usuario autenticado, redirigir a index.html
    window.location.href = 'index.html';
  }

  //OPTIONS
  menuOpcionesButton.addEventListener('click', () => {
    menuOpcionesOpen.setAttribute('visible', true);
  });

  retrocesoButton.addEventListener('click', () => {
    menuOpcionesOpen.setAttribute('visible', false);
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('usuarioAutenticado');
    window.location.href = 'index.html';
  });

  function ajustarVolumen(cambio) {
    const audioEntity = document.querySelector('#audioEntity a-sound');
    let nuevoVolumen = parseFloat(audioEntity.getAttribute('volume')) + cambio;
    nuevoVolumen = Math.max(0, Math.min(1, nuevoVolumen)); // Asegurar que el volumen esté entre 0 y 1
    audioEntity.setAttribute('volume', nuevoVolumen);
  }

  botonSubirVolumen.addEventListener('click', () => ajustarVolumen(0.1));
  botonBajarVolumen.addEventListener('click', () => ajustarVolumen(-0.1));

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
    },

    tick: function () {
      this.checkPosition(); // Llama a checkPosition en cada frame
    },

    handleCollision: function (e) {
      const collidedEl = e.detail.body.el;
      console.log(collidedEl.getAttribute('data-es-tallat'));
      if (collidedEl.getAttribute('data-es-tallat') === 'true' && !this.data.hasIngredient && !collidedEl.getAttribute('data-cocinado')) {
        this.ingredient = collidedEl;
        this.data.hasIngredient = true;
        collidedEl.removeAttribute('dynamic-body');
        collidedEl.setAttribute('position', '-2.3 0.7 -3.15'); // Ajustar la posición y para que quede sobre la sartén
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
        console.log(this.data.cooking);
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
      console.log("trystartCooking: " + this.data.cooking);
      if (this.data.cooking && this.data.hasIngredient && !this.isCooking && !this.ingredient.getAttribute('data-cocinado')) {
        console.log(this.data.cooking);
        this.startCooking();
        this.isCooking = true;
      }
    },

    startCooking: function () {
      if (!this.progress) {
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
          this.el.removeChild(this.progress); // Elimina la barra de progreso
          this.progress = null;
          this.data.hasIngredient = false;
          let pieces = this.ingredient.querySelectorAll('[geometry]'); // Selecciona todos los hijos con geometría, asumiendo que esos son tus piezas
          pieces.forEach((piece) => {
            piece.setAttribute('material', 'color', 'green');
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



  //Cargar los glb con static body
  document.querySelector('#woodenTable').addEventListener('model-loaded', () => {
    document.querySelector('#woodenTable').setAttribute('static-body', '');
  });

  document.querySelector('#shaker').addEventListener('model-loaded', () => {
    document.querySelector('#shaker').setAttribute('static-body', '');
  });

  document.querySelector('#fireSource').addEventListener('model-loaded', () => {
    document.querySelector('#fireSource').setAttribute('static-body', '');
  });

  const ingredientes = [
    { nombre: 'tomate', modelo: './assets/tomato.glb', scale: '1.5 1.5 1.5', color: 'red' },
    { nombre: 'calabazin', modelo: './assets/cucumber.glb', scale: '1.5 1.5 1.5', color: 'yellow' },
    { nombre: 'patata', modelo: './assets/patata.glb', scale: '1.5 1.5 1.5', color: 'green' },
    { nombre: 'pimiento', modelo: './assets/pimiento.glb', scale: '1.5 1.5 1.5', color: 'blue' },

    // Otros ingredientes...
  ];

  // Ajuste en la función agregarIngredientes para incluir EsTallat
  function agregarIngredientes() {
    fetch('/ingredientes')
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Se esperaba un array, se recibió:', data);
          // Manejar adecuadamente la situación, posiblemente mostrando un mensaje al usuario
          return; // Salir de la función si los datos no son un array
        }
        data.forEach((ingrediente, index) => {
          const positionX = index;// 2 + 6;
          const position = `${positionX} 1 -3`;
          const ingredienteEncontrado = ingredientes.find(i => i.nombre === ingrediente.NomInteractuable);
          const modelo = ingredienteEncontrado ? ingredienteEncontrado.modelo : './assets/default.glb';
          const escala = ingredienteEncontrado ? ingredienteEncontrado.scale : '0.1 0.1 0.1';
          let entity; // Define fuera del if para usarlo después en ambos casos

          // Verificar si el ingrediente está cortado
          if (ingrediente.EsTallat) {
            // Añadir cuadrados que representan el ingrediente cortado
            let container = document.createElement('a-entity');
            container.setAttribute('position', position);

            // Añadir cuadrados que representan el ingrediente cortado
            for (let i = 0; i < 4; i++) {
              let piece = document.createElement('a-entity');
              piece.setAttribute('geometry', {
                primitive: 'cylinder',
                radius: 0.05,
                height: 0.01  // Altura muy baja para simular la rodaja
              });
              const offsetX = (i % 2) * 0.2 - 0.1; // Alternar la posición en X para 2 piezas
              const offsetZ = Math.floor(i / 2) * 0.2 - 0.1; // Alternar la posición en Y para las 2 piezas
              piece.setAttribute('position', `${offsetX} 0 ${offsetZ}`);
              piece.setAttribute('rotation', '0 0 0');
              // Añadir profundidad si es necesario
              piece.setAttribute('material', 'color', ingredienteEncontrado && ingredienteEncontrado.color ? ingredienteEncontrado.color : '#FF6347');
              container.appendChild(piece);
            }
            container.setAttribute('mixin', 'grabContainer');
            container.setAttribute('class', 'grab');
            container.setAttribute('data-es-tallat', 'true');
            container.setAttribute('hidden', true);
            container.setAttribute('reset', `resetPosition: ${position}`);
            container.setAttribute('data-idInteractuable', ingrediente.IdInteractuable);
            document.querySelector('a-scene').appendChild(container);
          } else {
            // Crear la entidad <a-entity> para el ingrediente no cortado
            entity = document.createElement('a-entity');
            entity.setAttribute('position', position);
            entity.setAttribute('gltf-model', modelo);
            entity.setAttribute('scale', escala);
            entity.setAttribute('mixin', 'grab');
            entity.setAttribute('class', 'grab ingrediente');
            entity.setAttribute('data-vida', ingrediente.PuntsVida);
            entity.setAttribute('data-idInteractuable', ingrediente.IdInteractuable);
            entity.setAttribute('data-color', ingredienteEncontrado.color);  // Guardar el color en el elemento
            entity.setAttribute('reset', `resetPosition: ${position}`);
            entity.setAttribute('colocado-en-tabla', '');
            document.querySelector('a-scene').appendChild(entity);
          }
          // Crear y añadir la barra de progreso
          if (!ingrediente.EsTallat && entity) {
            const progressBar = document.createElement('a-box');
            const progressBarPosition = `${positionX} ${parseFloat(position.split(' ')[1])} -3`; // Posición Y ligeramente arriba del ingrediente
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
        });
      })
      .catch(error => console.error('Error al obtener ingredientes:', error));
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
        const idIngredienteGolpeado = ingredienteGolpeado.getAttribute('data-idInteractuable');
        if (ingredienteGolpeado.classList.contains('ingrediente')) {
          // Supongamos que cada ingrediente tiene un atributo 'data-vida'
          const listoParaCortar = ingredienteGolpeado.getAttribute('data-listo-para-cortar') === 'true';
          if (listoParaCortar) {
            vidaActual = parseInt(ingredienteGolpeado.getAttribute('data-vida'));
            vidaActual = Math.max(0, vidaActual - 2); // Asegúrate de no tener valores negativos
            ingredienteGolpeado.setAttribute('data-vida', vidaActual.toString());

            // Actualiza la barra de progreso, si es necesario
            // Supongamos que cada ingrediente tiene una referencia a su barra de progreso
            progressBar = ingredienteGolpeado.barraProgreso; // Asegúrate de haber establecido esta referencia
            if (progressBar) {
              const vidaMaxima = 20; // O el valor que corresponda
              const anchoBarra = 0.2 * (vidaActual / vidaMaxima); // Ajusta '0.2' según el ancho máximo de tu barra
              progressBar.setAttribute('width', anchoBarra.toString());
            }
          }
          if (vidaActual <= 12 && vidaActual > 5) {
            progressBar.setAttribute('color', '#E58C1A');
            // Por ejemplo, eliminar el ingrediente, mostrar una animación, etc.
          }
          // Aquí podrías también manejar la lógica para cuando la vida llega a 0
          if (vidaActual <= 5 && vidaActual > 0) {
            progressBar.setAttribute('color', '#FF0000');
            // Por ejemplo, eliminar el ingrediente, mostrar una animación, etc.
          }
          //Cambiar de ingrediente
          if (vidaActual <= 0) {
            progressBar.remove();
            this.mostrarIngredienteCortado(ingredienteGolpeado);
          }
        }
      });
    },

    mostrarIngredienteCortado: function (ingredienteGolpeado) {
      // Eliminar la representación actual del ingrediente no cortado
      let color = ingredienteGolpeado.getAttribute('data-color');  // Obtener el color del atributo data
      const idIngredienteGolpeado = ingredienteGolpeado.getAttribute('data-idInteractuable');
      ingredienteGolpeado.remove();

      let cortado = document.createElement('a-entity');
      cortado.setAttribute('position', '1 0.6 -3');
      // Crear y mostrar el ingrediente cortado
      for (let i = 0; i < 4; i++) {
        let piece = document.createElement('a-entity');
        piece.setAttribute('geometry', {
          primitive: 'cylinder',
          radius: 0.05,
          height: 0.01  // Altura muy baja para simular la rodaja
        });
        const offsetX = (i % 2) * 0.2 - 0.1; // Alternar la posición en X para 2 piezas
        const offsetZ = Math.floor(i / 2) * 0.2 - 0.1; // Alternar la posición en Y para las 2 piezas
        piece.setAttribute('position', `${offsetX} 0 ${offsetZ}`);
        piece.setAttribute('rotation', '0 0 0');
        // Añadir profundidad si es necesario
        piece.setAttribute('material', 'color', color);
        cortado.appendChild(piece);
      }
      cortado.setAttribute('mixin', 'grabContainer');
      cortado.setAttribute('class', 'grab');
      cortado.setAttribute('data-es-tallat', 'true');
      cortado.setAttribute('hidden', true);
      cortado.setAttribute('reset', `resetPosition: 1 0.6 -3`);
      cortado.setAttribute('data-idInteractuable', idIngredienteGolpeado);
      document.querySelector('a-scene').appendChild(cortado);

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
          if (data.success && Array.isArray(data.objetivos)) { // Verifica que 'objetivos' es un array
            data.objetivos.forEach(objetivo => {
              if (data.success && Array.isArray(data.objetivos)) { // Verifica que 'objetivos' es un array
                data.objetivos.forEach(objetivo => {
                  // Selecciona el elemento UI correspondiente usando el atributo data-objetivo
                  const objUI = document.querySelector(`[data-objetivo="${objetivo.IdObj}"]`);
                  if (objUI) {
                    // Encuentra el elemento que sirve como icono de estado dentro del elemento del objetivo
                    const iconoEstadoEl = objUI.querySelector('.icono-estado');
                    // Cambia el atributo src del icono para reflejar el estado completado
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
    },
    remove: function () {
      // Limpiar event listeners si el componente se elimina
      this.el.removeEventListener('collide', this.handleCollision);
    }
  });

  //COMPONENTE DE CORTE
  AFRAME.registerComponent('colocado-en-tabla', {
    init: function () {
      this.el.addEventListener('collide', (e) => {
        if (e.detail.body.el.id === 'tabla') {
          // Ajustar la posición del ingrediente al centro de la tabla
          let tablaPos = document.querySelector('#tabla').getAttribute('position');
          this.el.setAttribute('position', { x: tablaPos.x, y: tablaPos.y + 0.25, z: tablaPos.z });
          // Cambiar a static-body para hacerlo inmóvil
          this.el.setAttribute('dynamic-body', 'mass', 0);
          this.el.removeAttribute('dynamic-body');
          this.el.setAttribute('static-body', '');
          this.el.setAttribute('data-listo-para-cortar', 'true');
        }
      });
    }
  });


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
        } else { // Si el plano no está rotado, lo gira 90 grados
          puerta.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 1000; easing: linear');
          puerta.setAttribute('animation__position', 'property: position; to: 0 0 1; dur: 1000; easing: linear');
          rotated = true;
          sound.components.sound.playSound();
        }
      });
    }
  });

  AFRAME.registerComponent('puerta-horno', {
    schema: {
      cookingTime: { type: 'number', default: 8000 } // Tiempo de cocción en milisegundos
    },
    init: function () {
      this.isCooking = false; // Estado inicial de cocción
      this.isFirstClick = true;
      this.rotated = false; // Estado inicial de la puerta
      this.sound = document.querySelector('#doorSound'); // Sonido de la puerta
      var puertaHorno = document.querySelector('.puerta-horno');

      this.el.addEventListener('click', () => {
        if (this.isFirstClick) {
          puertaHorno.setAttribute('animation', 'property: rotation; to: 90 90 0; dur: 1000; easing: linear');
          this.isFirstClick = false;
          this.sound.components.sound.playSound();
          return;
        }

        if (this.isCooking) {
          console.log("La cocción está en curso. No se puede abrir la puerta.");
          return; // No hacer nada si la cocción está en curso
        }

        if (!this.rotated) {
          console.log("entra");
          // Cierra la puerta y comienza la cocción
          puertaHorno.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 1000; easing: linear');
          this.rotated = true;
          this.startCooking();
        } else {
          // Abre la puerta, si la cocción ha terminado
          puertaHorno.setAttribute('animation', 'property: rotation; to: 0 0 0; dur: 1000; easing: linear');
          this.rotated = false;
        }

        // Reproducir el sonido de la puerta
        if (this.sound && this.sound.components.sound) {
          this.sound.components.sound.playSound();
        }
      });
    },
    startCooking: function () {
      this.isCooking = true;
      console.log("Cocción iniciada");

      // Configurar un temporizador para el tiempo de cocción
      setTimeout(() => {
        this.isCooking = false; // Actualizar el estado de cocción
        console.log("Cocción finalizada");
        // Opcional: Abrir la puerta automáticamente aquí si es necesario
      }, this.data.cookingTime);
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

  // Por ejemplo, cargar los objetivos para esta IdPartida
  cargarObjetivosDePartida();

  function cargarObjetivosDePartida() {
    fetch(`/obtenerObjetivos`) // Ya no necesitas pasar el idPartida en la URL
      .then(response => response.json())
      .then(objetivos => {
        console.log(objetivos); // Haz algo con los objetivos aquí
        const sceneEl = document.querySelector('a-scene'); // Encuentra el elemento de la escena

        objetivos.forEach((objetivo, index) => {
          // Crea el plane para el objetivo
          const objetivoEl = document.createElement('a-plane');
          objetivoEl.setAttribute('position', { x: 8, y: 5 - index * 0.4, z: 2 }); // Ajusta la posición según necesites
          objetivoEl.setAttribute('rotation', '0 -90 0');
          objetivoEl.setAttribute('width', '7');
          objetivoEl.setAttribute('height', '0.4');
          objetivoEl.setAttribute('color', '#FFF');
          objetivoEl.classList.add('objetivo');  // Añade la clase 'objetivo'
          objetivoEl.setAttribute('data-objetivo', objetivo.IdObj);

          // Crea el texto para el objetivo
          const textoEl = document.createElement('a-text');
          textoEl.setAttribute('value', objetivo.NomObj);
          textoEl.setAttribute('align', 'center');
          textoEl.setAttribute('color', '#000');
          textoEl.setAttribute('position', '-1 0 0.1'); // Ajusta según la necesidad

          // Añade el texto al plane del objetivo
          objetivoEl.appendChild(textoEl);

          // Crea el icono de estado (tick verde o X roja)
          const iconoEstadoEl = document.createElement('a-image');
          iconoEstadoEl.className = 'icono-estado';  // Asegúrate de que esta clase se añade correctamente
          iconoEstadoEl.setAttribute('src', objetivo.Completado ? '#tick-verde' : '#x-roja');
          iconoEstadoEl.setAttribute('position', '2.3 0 0.1');
          iconoEstadoEl.setAttribute('height', '0.3');
          iconoEstadoEl.setAttribute('width', '0.3');

          // Añade el icono al plane del objetivo
          objetivoEl.appendChild(iconoEstadoEl);

          // Añade el plane del objetivo a la escena
          sceneEl.appendChild(objetivoEl);
        });
      })
      .catch(error => console.error('Error al cargar objetivos:', error));
  }

});