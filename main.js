const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

init();

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

let normalizedMouseY = 0;

window.addEventListener('mousemove', (event) => {
    let mouseY = event.clientY;  
    normalizedMouseY = mouseY / window.innerHeight;  
  });

animate();

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.05*normalizedMouseY;
    cube.rotation.y += 0.05*normalizedMouseY;

    renderer.render(scene, camera);
}

async function init() {
    const vertexShaderSource = await loadShader('shaders/skybox.vertex.glsl');
    const fragmentShaderSource = await loadShader('shaders/skybox.fragment.glsl');

    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader : vertexShaderSource,
        fragmentShader : fragmentShaderSource,
        side: THREE.BackSide,
        uniforms: {
          resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } // Set resolution uniform
        }
      });

    const skyGeometry = new THREE.SphereGeometry(1000, 60, 40);
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

function loadShader(url) {
    return fetch(url)
      .then(response => response.text())
      .catch(error => {
        console.error('Error loading shader:', error);
        return '';
      });
  }