const rust = import('./pkg/distantly_smooth_fluid');

let simulation = null;

rust
  .then(m => {
    simulation = new m.Simulation(100, 1.4, 0.2)
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
  void main() {
      gl_FragColor = vec4(v_Normal, 1.0);
  }
  `;

function run() {
  let app = clay.application.create('#viewport', {
    width: window.innerWidth,
    height: window.innerHeight,

    init: function (app) {
      this._camera = app.createCamera(
        [0, 0, 10],
        [0, 0, 0],
        'orthographic',
        [this.width * 0.01, this.height * 0.01, 1000]);

      let instancedCubeMesh = new clay.InstancedMesh({
        geometry: new clay.geometry.Sphere({ radius: 0.1 }),
        material: app.createMaterial()
      });

      app.scene.add(instancedCubeMesh);

      let positions = simulation.send_simulation_to_js()['positions'];
      let particles_mesh = [];
      for (let i = 0; i < positions.length; i++) {

        let node = app.createNode();
        console.log(positions[i])
        node.position.set(
          positions[i][0],
          positions[i][1],
          0);

        particles_mesh.push({
          node: node
        });
      }

      instancedCubeMesh.instances = particles_mesh;
      this._particles = particles_mesh;
    },

    loop: function (app) {
      const dt = 1.0 / 60.0
      simulation.step(dt)
      let positions = simulation.send_simulation_to_js()['positions'];

      this._particles.forEach(function (particle, idx) {
        particle.node.position.x = positions[idx][0];
        particle.node.position.y = positions[idx][1];
      });
    }
  });
}
