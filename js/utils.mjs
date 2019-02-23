export function initialize_gui(sim) {
  let gui = new dat.GUI();
  gui.add(sim.params, 'smoothing_radius', 1.0, 5.0)
  gui.add(sim.params, 'rest_density', -5, 5)
  gui.add(sim.params, 'stiffness', -5, 5)
  gui.add(sim.params, 'stiffness_near', -5, 5)
  gui.add(sim.params, 'has_gravity')
  return gui
}


export function initialize_stats() {
  let stats = new Stats();
  stats.showPanel(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = 0;
  stats.domElement.style.left = 0;
  document.body.appendChild(stats.domElement);
  return stats
}
