let Rust = import('./pkg/distantly_smooth_fluid');
import * as Shaders from './js/shaders.mjs';
import * as Utils from './js/utils.mjs';

let stats = Utils.initialize_stats();
let gui = null;
let simulation = null;

let num_particles = 800
let bounds_radius = 60.0
let particle_radius = 1.0

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
    true
  )

  return new Rust.Simulation(
    num_particles, bounds_radius, sim_params, distribution
  )
}

const scale = 0.16
let width = window.innerWidth
let height = window.innerHeight

function run() {
  var Shader = clay.Shader;
  var pp_FilterNode = clay.compositor.FilterNode;
  var pp_SceneNode = clay.compositor.SceneNode;
  var compositor = new clay.compositor.Compositor();

  let renderer = new clay.Renderer({
    canvas: document.getElementById('viewport')
  })

  let camera = new clay.camera.Orthographic({
    left: (width * scale) * -0.5,
    right: (width * scale) * 0.5,
    top: (height * scale) * 0.5,
    bottom: (height * scale) * -0.5,
    near: -50,
    far: 50
  })

  camera.position.set(0, 0, 10)

  camera.lookAt(new clay.Vector3())
  renderer.resize(width, height)

  let scene = new clay.Scene()

  var material = new clay.Material({
    shader: new clay.Shader(
      Shaders.mesh.vs_code,
      Shaders.mesh.fs_code,
    )
  });

  let spheres = [];
  for (var i = 0; i < simulation.particle_count(); i++) {

    var sphere = new clay.Mesh({
      geometry: new clay.geometry.Sphere(),
      material: material
    });
    sphere.material.set('color', [1, 1, 1]);
    sphere.position.set(0, 0, 0);
    sphere.scale.set(1.4, 1.4, 1.4);
    scene.add(sphere)
    spheres.push(sphere)
  }

  compositor.addNode(new pp_SceneNode({
    name: 'scene',
    scene: scene,
    camera: camera,
    outputs: {
      'color': {
        parameters: {
          width: 512,
          height: 512
        }
      }
    }
  }));

  var upsample = new pp_FilterNode({
    name: 'gaussian_blur',
    shader: clay.Shader.source('clay.compositor.gaussian_blur'),
    inputs: {
      'texture': {
        node: 'scene',
        pin: 'color'
      }
    },
    outputs: {
      color: {
        attachment: clay.FrameBuffer.COLOR_ATTACHMENT0,
        parameters: {
          format: clay.Texture.RGBA,
          width: width,
          height: height
        },
        // Node will keep the RTT rendered in last frame
        keepLastFrame: true,
        // Force the node output the RTT rendered in last frame
        outputLastFrame: true
      }
    }
  })

  var thing = new pp_FilterNode({
    name: 'thing',
    shader: Shaders.fluid.fs_code,
    inputs: {
      'texture': {
        node: 'scene',
        pin: 'color'
      }
    },
    outputs: null
  })

  // colorAdjustNode.setParameter('resolution', [width, height]);
  compositor.addNode(upsample);
  compositor.addNode(thing);

  var picking = new clay.picking.PixelPicking({
    renderer: renderer
  });

  setInterval(function () {
    stats.begin()
    simulation.step(1 / 60)
    compositor.render(renderer)

    let positions = simulation.send_simulation_to_js()['positions']
    for (let i = 0; i < positions.length; i++) {
      spheres[i].position.set(positions[i][0], positions[i][1], 0)
    }
    picking.update(scene, camera);

    stats.end()
  }, 16)

  renderer.canvas.addEventListener('click', function (e) {
    console.log(picking.pick(e.offsetX, e.offsetY));
  });
  //     this._compositor.render(app.renderer)
  //     let debug_indices = simulation.send_debug_to_js(0, 0)['indices']
  //     // debug_indices.forEach((index) => {
  //     //   this._particles[index].material.setUniform('emission', [0.7, 0.7, 0.7])
  //     // })
  //   }
  // });
}
