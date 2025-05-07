uniform vec3 lightPosition;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 viewDir = normalize(cameraPosition - vPosition);

    vec3 ambient = ambientColor;

    vec3 base = diffuseColor;
    vec3 bright = base * 1.5;
    vec3 dark = vec3(1.0) - base;
    vec3 highlight = vec3(1.0, 1.0, 0.8);

    float rawDiff = max(dot(normal, lightDir), 0.0);
    float noise = (random(vUv * 800.0) - 0.5) * 0.075;
    float diff = clamp(rawDiff + noise, 0.0, 1.0);

    vec3 diffuse;
    if (diff > 0.95)
        diffuse = highlight;
    else if (diff > 0.5)
        diffuse = bright;
    else if (diff > 0.25)
        diffuse = base;
    else
        diffuse = dark * 0.5;

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    spec = step(0.5, spec);
    vec3 specular = spec * specularColor;

    vec3 color = ambient + diffuse + specular;

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    fresnel = step(0.15, fresnel);
    vec3 fresnelColor = vec3(0.0);
    color = mix(color, fresnelColor, fresnel);

    gl_FragColor = vec4(color, 1.0);
}
