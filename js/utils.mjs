export function initialize_gui(params) {
  var gui = new dat.GUI();
  gui.add(params, 'smoothing_radius', 1.0, 5.0)
  gui.add(params, 'rest_density', 1.0, 10.0)
  gui.add(params, 'stiffness', 1, 100)
  gui.add(params, 'near_stiffness', 10, 1000)
  gui.add(params, 'gravity')
  return gui
}


export function initialize_stats() {
  var stats = new Stats();
  stats.showPanel(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = 0;
  stats.domElement.style.left = 0;
  document.body.appendChild(stats.domElement);
  return stats
}
