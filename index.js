let rust = import('./pkg/distantly_smooth_fluid');

const stats = new Stats();
stats.showPanel(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = 0;
stats.domElement.style.left = 0;
document.body.appendChild(stats.domElement);

const gui = new dat.GUI();

let simulation = null;

let num_particles = 1000
let width = 75.0
let particle_radius = 1.0;

rust
  .then(m => {
    rust = m
    initialize_simulation()
    initialize_gui()
    run()
  })
  .catch(console.error)

function initialize_simulation() {
  let distribution = new rust.Distribution(1.4, 1.0)
  let sim_params = new rust.SimulationParameters(
    particle_radius * 3.0,
    1.0,
    60.0,
    1000.0,
    true
  )

  simulation = new rust.Simulation(
    num_particles, width, sim_params, distribution
  )
}

function initialize_gui() {
  gui.add(simulation.params, 'smoothing_radius', 1.0, 5.0)
  gui.add(simulation.params, 'rest_density', -5, 5)
  gui.add(simulation.params, 'stiffness', -5, 5)
  gui.add(simulation.params, 'stiffness_near', -5, 5)
  gui.add(simulation.params, 'has_gravity')
}

const vsCode = `
  attribute vec3 position: POSITION;
  attribute vec3 normal: NORMAL;

  uniform mat4 worldViewProjection : WORLDVIEWPROJECTION;

  varying vec3 v_Normal;
  void main() {
      gl_Position = worldViewProjection * vec4(position, 1.0);
      v_Normal = normal;
  }
  `;

const fsCode = `
  varying vec3 v_Normal;
  uniform vec3 emission;

  void main() {
      vec3 color = max(vec3(v_Normal.xy, 1.0), emission);
      gl_FragColor = vec4(color, 1.0);
  }
  `;

const scale = 0.3

function run() {
  let app = clay.application.create('#viewport', {
    width: window.innerWidth,
    height: window.innerHeight,

    init: function (app) {
      this._camera = app.createCamera(
        [0, 0, 10],
        [0, 0, 0],
        'orthographic',
        [this.width * scale, this.height * scale, 1000]);

      let positions = simulation.send_simulation_to_js()['positions'];
      this._particles = [];
      for (let i = 0; i < positions.length; i++) {

        let sphere = app.createSphere({
          radius: 1.0,
          shader: new clay.Shader(vsCode, fsCode)
        });

        sphere.position.set(
          positions[i][0],
          positions[i][1],
          0
        );

        sphere.scale.set(1.0, 1.0, 1.0);

        this._particles.push(sphere)
      }
    },

    loop: function (app) {
      const dt = app.frameTime / 1000
      stats.begin();
      this._particles.forEach((particle) => {
        particle.material.setUniform('emission', [0.0, 0.0, 0.0])
      })

      simulation.step(dt)

      let positions = simulation.send_simulation_to_js()['positions']

      this._particles.forEach((particle, idx) => {
        particle.position.x = positions[idx][0];
        particle.position.y = positions[idx][1];
      });


      let debug_indices = simulation.send_debug_to_js(0, 0)['indices']
      // debug_indices.forEach((index) => {
      //   this._particles[index].material.setUniform('emission', [0.7, 0.7, 0.7])
      // })
      stats.end();
    }
  });
}
