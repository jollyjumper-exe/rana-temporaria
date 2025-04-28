varying vec3 vDirection;
uniform vec2 resolution;
uniform float time;

float random(vec2 seed) {
  return fract(sin(dot(seed + vec2(time * 0.1, 0.0), vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float gradient = smoothstep(0.0, 1.0, vDirection.y);
  vec3 color = mix(vec3(0.0, 0.4, 0.7), vec3(0.0, 0.0, 0.2), gradient);

  vec2 uv = gl_FragCoord.xy / resolution.xy;
  
  float heightFactor = gl_FragCoord.y / resolution.y;
  float densityFactor = heightFactor;

  float star = random(uv * 100.0);
  if (star > 1.035 - densityFactor * 0.05) { 
    float size = random(uv * 50.0);
    size = mix(0.001, 0.01, size);
    gl_FragColor = vec4(vec3(1.0), size);
  } else {
    gl_FragColor = vec4(color, 1.0);
  }
}
