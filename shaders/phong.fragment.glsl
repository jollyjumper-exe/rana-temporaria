// Fragment shader for Phong lighting
uniform vec3 lightPosition;  // Position of the light
uniform vec3 ambientColor;   // Ambient light color
uniform vec3 diffuseColor;   // Diffuse light color
uniform vec3 specularColor;  // Specular reflection color
uniform float shininess;     // Shininess factor

varying vec3 vNormal;        // Interpolated normal vector from vertex shader
varying vec3 vPosition;      // Interpolated position from vertex shader

void main() {
    vec3 normal = normalize(vNormal);              // Normalize normal vector
    vec3 lightDir = normalize(lightPosition - vPosition); // Light direction
    vec3 viewDir = normalize(cameraPosition - vPosition); // View direction

    // Ambient lighting
    vec3 ambient = ambientColor;

    // Diffuse lighting (Lambertian reflection)
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular reflection (Phong reflection model)
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    // Combine ambient, diffuse, and specular components
    vec3 color = ambient + diffuse + specular;

    gl_FragColor = vec4(color, 1.0); // Set final color
}
