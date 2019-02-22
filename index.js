const rust = import('./pkg/distantly_smooth_fluid');

let simulation = null;

rust
  .then(m => {
    simulation = new m.Simulation(200, 100, 100, 2.0, 2.4, 1.0)
    console.log(simulation.send_simulation_to_js())
    run();
  })
  .catch(console.error);

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
          radius: 20.0,
          shader: new clay.Shader(vsCode, fsCode)
        });

        sphere.position.set(
          positions[i][0],
          positions[i][1],
          0
        );

        sphere.scale.set(2.0, 2.0, 2.0);

        this._particles.push(sphere)

      }


    },

    loop: function (app) {
      simulation.step(1.0 / 60.0)

      let positions = simulation.send_simulation_to_js()['positions']

      this._particles.forEach((particle, idx) => {
        particle.position.x = positions[idx][0];
        particle.position.y = positions[idx][1];
      });


      let debug_indices = simulation.send_debug_to_js(0, 0)['indices']
      console.log(debug_indices)
      debug_indices.forEach((index) => {
        this._particles[index].material.setUniform('emission', [0.7, 0.7, 0.7])
      })

    }
  });
}
