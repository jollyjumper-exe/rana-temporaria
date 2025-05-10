uniform vec3 lightPosition;
uniform vec3 ambientColor;
uniform vec3 baseColor;
uniform vec3 specularColor;
uniform float shininess;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// Classic Perlin noise by Stefan Gustavson
vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec2 P) {
    vec2 Pi = floor(P);
    vec2 Pf = fract(P);
    vec4 ix = vec4(Pi.x, Pi.x + 1.0, Pi.x, Pi.x + 1.0);
    vec4 iy = vec4(Pi.y, Pi.y, Pi.y + 1.0, Pi.y + 1.0);
    vec4 fx = vec4(Pf.x, Pf.x - 1.0, Pf.x, Pf.x - 1.0);
    vec4 fy = vec4(Pf.y, Pf.y, Pf.y - 1.0, Pf.y - 1.0);

    vec4 perm = permute(permute(ix) + iy);
    vec4 gradX = fract(perm * (1.0 / 41.0)) * 2.0 - 1.0;
    vec4 gradY = abs(gradX) - 0.5;
    vec4 gradT = floor(gradX + 0.5);
    gradX -= gradT;

    vec2 g00 = vec2(gradX.x, gradY.x);
    vec2 g10 = vec2(gradX.y, gradY.y);
    vec2 g01 = vec2(gradX.z, gradY.z);
    vec2 g11 = vec2(gradX.w, gradY.w);

    vec4 norm = 1.79284291400159 - 0.85373472095314 *
                vec4(dot(g00, g00), dot(g10, g10), dot(g01, g01), dot(g11, g11));
    g00 *= norm.x;
    g10 *= norm.y;
    g01 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fadeXY = fade(Pf);
    vec2 interpX = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);
    return mix(interpX.x, interpX.y, fadeXY.y);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 noiseFlowDirection(vec2 p) {
    float epsilon = 0.001;
    float nY1 = perlinNoise(p + vec2(0.0, epsilon));
    float nY2 = perlinNoise(p - vec2(0.0, epsilon));
    float nX1 = perlinNoise(p + vec2(epsilon, 0.0));
    float nX2 = perlinNoise(p - vec2(epsilon, 0.0));
    return normalize(vec2(nY1 - nY2, nX1 - nX2));
}

float rand(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 toLight = normalize(lightPosition - vPosition);
    vec3 toCamera = normalize(cameraPosition - vPosition);

    vec3 ambient = ambientColor;

    float noiseAngle = perlinNoise(vUv * 10.0 + time / 10.0) * 6.2831;
    vec2 flowDir = vec2(cos(noiseAngle), sin(noiseAngle));
    vec2 uvOffset = vUv + flowDir * 0.05;

    float detail1 = perlinNoise(uvOffset * 100.0 + time * 0.1);
    float detail2 = perlinNoise(uvOffset * 150.0 - time * 0.15);
    float detail3 = perlinNoise(uvOffset * 200.0 + vec2(time * 0.2, -time * 0.1));
    float blendedNoise = (detail1 + detail2 * 0.5 + detail3 * 0.25) / 1.75;
    float noiseLine = smoothstep(0.1, 0.3, blendedNoise);

    float angleToView = dot(normal, toCamera);
    vec3 viewIridescence = hsv2rgb(vec3(mod(angleToView, 1.0), 1.0, 1.0));
    vec3 invertedIridescence = hsv2rgb(1.0 - vec3(mod(angleToView, 1.0), 1.0, 1.0));

    vec3 reflectionDir = reflect(-toCamera, normal);
    vec3 environmentHue = hsv2rgb(vec3(0.6 + 0.4 * reflectionDir.y + time * 0.05, 1.0, 1.0));

    vec3 diffuse = mix(viewIridescence, environmentHue, 0.5);

    vec3 reflectDir = reflect(-toLight, normal);
    float spec = pow(max(dot(toCamera, reflectDir), 0.0), shininess);
    spec = step(0.2, spec);
    vec3 specular = spec * specularColor;

    vec3 surfaceColor = ambient + diffuse + specular;

    float fresnelFactor = pow(1.0 - max(dot(normal, toCamera), 0.0), 5.0);
    vec3 rimColor = hsv2rgb(vec3(vPosition.x, 1.0, 1.0));
    surfaceColor = mix(surfaceColor, rimColor, fresnelFactor);

    float softFresnel = pow(1.0 - max(dot(normal, toCamera), 0.0), 3.0);
    float reflectivity = smoothstep(0.5, 1.0, abs(reflectionDir.y));

    float finalOpacity = mix(0.1, 1.0, fresnelFactor);
    finalOpacity = mix(finalOpacity, 0.3, softFresnel);
    finalOpacity = mix(finalOpacity, 0.7, reflectivity);

    gl_FragColor = vec4(surfaceColor, finalOpacity);
}
