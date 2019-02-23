
export const mesh = {
  vs_code: `
  attribute vec3 position: POSITION;
  attribute vec3 normal: NORMAL;

  uniform mat4 worldViewProjection : WORLDVIEWPROJECTION;

  varying vec3 v_Normal;
  void main() {
      gl_Position = worldViewProjection * vec4(position, 1.0);
      v_Normal = normal;
  }
  `,
  fs_code: `
  varying vec3 v_Normal;
  uniform vec3 emission;
  uniform vec2 positions[3];

  void main() {
      vec3 color = max(vec3(v_Normal.xy, 1.0), emission);
      gl_FragColor = vec4(color, 1.0);
  }
  `
};

export const fluid = {
  vs_code: `
  attribute vec3 position: POSITION;

  uniform sampler2D uPressure;
  void main() {
      gl_Position = vec4(position, 1.0);
  }
  `,

  fs_code: `
  precision highp float;
  precision mediump sampler2D;

  uniform vec2 positions[3];

  void main() {
    // texture2D(uPressure, boundary(vL)).x;
    float d = 0.0;
    for (int i = 0; i < 3; i++) {

    }
    // vec3 color = max(vec3(v_Normal.xy, 1.0), emission);
    gl_FragColor = vec4(1.0, 1.0, 0.3, 1.0);
  }
  `
}
