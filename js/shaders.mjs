
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

  void main() {
      float dot = dot(v_Normal, vec3(0.0, 0.0, 1.0));
      vec3 color = max(vec3(dot, dot, dot), emission);
      gl_FragColor = vec4(color, 1.0);
  }
  `
};

export const fluid = {
  fs_code: `
  uniform sampler2D texture;
  uniform vec4 viewport : VIEWPORT;

  varying vec2 v_Texcoord;

  void main() {
    // vec2 st = gl_FragCoord.xy / resolution.xy - vec2(1.0, 1.0);
    // st /= 0.01;

    vec2 resolution = 1.0 / viewport.zw;

    // vec3 color = texture2D(texture, (gl_FragCoord.xy) * resolution).xyz;
    float value = texture2D(texture, (gl_FragCoord.xy) * resolution).x;
    vec3 color = vec3(0.1, 0.1, 0.15);
    if (value > 0.7) {
      color = vec3(0.3, 0.5, 0.9);
    }
    else if (value > 0.5) {
      color = vec3(0.4, 0.7, 1.0);
    }
    gl_FragColor = vec4(color, 1.0);
  }
  `
}
