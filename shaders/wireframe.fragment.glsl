uniform vec3 lightPosition;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

uniform float power;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float triangle(float t) {
    return 1.0 - abs(t - 0.5) * 2.0;
}

void main() {
    float xFrequency = 10.0;
    float xRamp = fract(vUv.x * xFrequency);
    float yFrequency = 5.0;
    float yRamp = fract(vUv.y * yFrequency);

    float xStripeIntensity = triangle(xRamp);
    float yStripeIntensity = triangle(yRamp);
    float sharpness = 5.0;
    float peak = pow(max(xStripeIntensity, yStripeIntensity), sharpness);

    float xStripes = step(0.8, xStripeIntensity);
    float yStripes = step(0.9, yStripeIntensity);
    float stripes = min(1.0, xStripes + yStripes);

    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 viewDir = normalize(cameraPosition - vPosition);

    vec3 ambient = ambientColor;
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    vec3 phongColor = ambient + diffuse + specular;

    float fresnel = pow(1.0 - distance(vUv, vec2(0.5)), 2.0);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    vec3 baseBlue = vec3(0.0, 0.7, 1.0);
    vec3 bgCol = baseBlue + fresnel * 0.8;

    vec3 finalColor = mix(bgCol, phongColor, stripes);
    float alpha = stripes + (1.0 - stripes) * 0.1 + power;

    gl_FragColor = vec4(finalColor, alpha);
}
