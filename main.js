const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let normalizedMouseY = 0;

window.addEventListener('mousemove', (event) => {
    let mouseY = event.clientY;  
    normalizedMouseY = mouseY / window.innerHeight;  
});

let cube;
let sky;

async function init() {
    cube = await initCube();
    sky = await initSky();
    animate();
}

init();

function animate() {
    requestAnimationFrame(animate);
    
    if(cube)
    {
        cube.material.uniforms.time.value = performance.now() * 0.001;
        cube.rotation.x += 0.05*normalizedMouseY;
        cube.rotation.y += 0.05*normalizedMouseY;
    }

    renderer.render(scene, camera);
}

async function initCube() {

    const geometry = new THREE.TorusGeometry();

    const material = await loadTigerMaterial();

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    return cube;
}

async function initSky() {

    const vertexShaderSource = await loadShader('shaders/skybox.vertex.glsl');
    const fragmentShaderSource = await loadShader('shaders/skybox.fragment.glsl');

    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader : vertexShaderSource,
        fragmentShader : fragmentShaderSource,
        side: THREE.BackSide,
        uniforms: {
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
    });

    const skyGeometry = new THREE.SphereGeometry(500, 60, 40);

    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    return sky;
}

function loadShader(url) {
    return fetch(url)
      .then(response => response.text())
      .catch(error => {
        console.error('Error loading shader:', error);
        return '';
    });
}

async function loadPhongMaterial() {
    const vertexShaderSource = await loadShader('shaders/phong.vertex.glsl');
    const fragmentShaderSource = await loadShader('shaders/phong.fragment.glsl');

    const material = new THREE.ShaderMaterial({
        vertexShader : vertexShaderSource,
        fragmentShader : fragmentShaderSource,
        uniforms: {
            lightPosition: { value: new THREE.Vector3(5, 5, 5) },
            ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) }, 
            diffuseColor: { value: new THREE.Color(0.7, 0.7, 0.7) }, 
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, 
            shininess: { value: 100.0 } 
        }
    });

    return material;
}

async function loadTigerMaterial() {
    const vertexShaderSource = await loadShader('shaders/tiger.vertex.glsl');
    const fragmentShaderSource = await loadShader('shaders/tiger.fragment.glsl');

    const material = new THREE.ShaderMaterial({
        vertexShader : vertexShaderSource,
        fragmentShader : fragmentShaderSource,
        uniforms: {
            lightPosition: { value: new THREE.Vector3(5, 5, 5) },
            ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) }, 
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 100.0 }, 
            baseColor: { value: new THREE.Color(0.02, 0.02, 0.05) }, 
            outerStripeColor: { value: new THREE.Color(0.1, 0.6, 0.8) },
            innerStripeColor: { value: new THREE.Color(1.0, 0.95, 0.8) },
            time: { value: 0.0 },
        }
    });

    return material;
}