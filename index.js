let Rust = import('./pkg/distantly_smooth_fluid');
import * as Shaders from './js/shaders.mjs';
import * as Utils from './js/utils.mjs';

let stats = Utils.initialize_stats();
let gui = null;
let simulation = null;

let num_particles = 1200
let width = 75.0
let particle_radius = 1.0;

Rust
  .then(m => {
    Rust = m
    simulation = initialize_simulation()
    gui = Utils.initialize_gui(simulation)
    run()
  })
  .catch(console.error)

function initialize_simulation() {
  let distribution = new Rust.Distribution(1.4, 1.0)
  let sim_params = new Rust.SimulationParameters(
    particle_radius * 3.0,
    1.0,
    60.0,
    1000.0,
    false
  )

  return new Rust.Simulation(
    num_particles, width, sim_params, distribution
  )
}

const scale = 0.16

function run() {
  let app = clay.application.create('#viewport', {
    width: window.innerWidth,
    height: window.innerHeight,

    init: function (app) {
      this._camera = app.createCamera(
        [0, 0, 10],
        [0, 0, 0],
        'orthographic',
        [this.width * scale, this.height * scale, 100]);

      let positions = simulation.send_simulation_to_js()['positions'];
      this._particles = [];
      for (let i = 0; i < positions.length; i++) {

        let sphere = app.createSphere({
          radius: 1.0,
          shader: new clay.Shader(Shaders.mesh.vs_code, Shaders.mesh.fs_code)
        });

        sphere.position.set(
          positions[i][0],
          positions[i][1],
          0
        );

        sphere.scale.set(1.0, 1.0, 1.0);

        this._particles.push(sphere)
      }

      var Shader = clay.Shader;
      var pp_FilterNode = clay.compositor.FilterNode;
      var pp_SceneNode = clay.compositor.SceneNode;
      this._compositor = new clay.compositor.Compositor();

      this._compositor.addNode(new pp_SceneNode({
        name: 'scene',
        scene: app.scene,
        camera: this._camera,
        outputs: {
          'color': {
            parameters: {
              width: 1024,
              height: 1024
            }
          }
        }
      }));


      var colorAdjustNode = new pp_FilterNode({
        name: 'coloradjust',
        shader: Shader.source('clay.compositor.coloradjust'),
        inputs: {
          'texture': {
            node: 'scene',
            pin: 'color'
          }
        },
        outputs: null
      })
      colorAdjustNode.setParameter('gamma', 1.3);
      this._compositor.addNode(colorAdjustNode);
      this._compositor.render(app.renderer);

      // setInterval(function(){
      //     mesh.rotation.rotateY(Math.PI/500);
      // }, 20);

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

      this._compositor.render(app.renderer)
      let debug_indices = simulation.send_debug_to_js(0, 0)['indices']
      // debug_indices.forEach((index) => {
      //   this._particles[index].material.setUniform('emission', [0.7, 0.7, 0.7])
      // })
      stats.end()
    }
  });
}
