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

window.addEventListener('click', () => {
    currentMaterialIndex = (currentMaterialIndex + 1) % materialsList.length;
    cube.material = materialsList[currentMaterialIndex].material;
});

let cube;
let sky;

const materialsList = [];
let currentMaterialIndex = 0;

async function init() {
    cube = await initCube();
    sky = await initSky();

    materialsList.push(await loadUnlitMaterial());
    materialsList.push(await loadPhongMaterial());
    materialsList.push(await loadTigerMaterial());
    materialsList.push(await loadWaterMaterial());
    materialsList.push(await loadWireframeMaterial());
    materialsList.push(await loadCartoonMaterial());

    cube.material = materialsList[currentMaterialIndex].material;

    animate();
}

init();

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    if (cube) {
        const current = materialsList[currentMaterialIndex];
        if (current.update) current.update(current.material.uniforms, time, normalizedMouseY);

        cube.rotation.x += 0.05 * normalizedMouseY;
        cube.rotation.y += 0.05 * normalizedMouseY;
    }

    renderer.render(scene, camera);
}

async function initCube() {
    const geometry = new THREE.TorusGeometry();
    const { material } = await loadUnlitMaterial();  // Initial material

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    return cube;
}

async function initSky() {
    const vertexShaderSource = await loadShader('shaders/skybox.vertex.glsl');
    const fragmentShaderSource = await loadShader('shaders/skybox.fragment.glsl');

    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
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

function createMaterialEntry(material, update = null) {
    return { material, update };
}

async function loadPhongMaterial() {
    const vertexShader = await loadShader('shaders/phong.vertex.glsl');
    const fragmentShader = await loadShader('shaders/phong.fragment.glsl');

    const uniforms = {
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
        diffuseColor: { value: new THREE.Color(0.7, 0.7, 0.7) },
        specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        shininess: { value: 100.0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    return createMaterialEntry(material);
}

async function loadTigerMaterial() {
    const vertexShader = await loadShader('shaders/tiger.vertex.glsl');
    const fragmentShader = await loadShader('shaders/tiger.fragment.glsl');

    const uniforms = {
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
        specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        shininess: { value: 100.0 },
        diffuseColor: { value: new THREE.Color(0.02, 0.02, 0.05) },
        outerStripeColor: { value: new THREE.Color(0.1, 0.6, 0.8) },
        innerStripeColor: { value: new THREE.Color(1.0, 0.95, 0.8) },
        time: { value: 0.0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    return createMaterialEntry(material, (uniforms, time) => {
        uniforms.time.value = time;
    });
}

async function loadWaterMaterial() {
    const vertexShader = await loadShader('shaders/water.vertex.glsl');
    const fragmentShader = await loadShader('shaders/water.fragment.glsl');

    const uniforms = {
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
        diffuseColor: { value: new THREE.Color(0.0, 0.7, 0.9) },
        specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        shininess: { value: 100.0 },
        time: { value: 0.0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    return createMaterialEntry(material, (uniforms, time) => {
        uniforms.time.value = time;
    });
}

async function loadWireframeMaterial() {
    const vertexShader = await loadShader('shaders/wireframe.vertex.glsl');
    const fragmentShader = await loadShader('shaders/wireframe.fragment.glsl');

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: true,
        side: THREE.DoubleSide,  // or FrontSide if you want only the front
        //blending: THREE.NormalBlending,
        uniforms: {
            color: { value: new THREE.Color(0.0, 1.0, 0.0) },
            power: { value: 0.0 },
            lightPosition: { value: new THREE.Vector3(5, 5, 5) },
            ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
            diffuseColor: { value: new THREE.Color(0.7, 0.0, 0.0) },
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 100.0 }
        }
    });

    return createMaterialEntry(material, (uniforms, time, power) => {
        uniforms.power.value = power;
    });
}

async function loadUnlitMaterial() {
    const vertexShader = await loadShader('shaders/unlit.vertex.glsl');
    const fragmentShader = await loadShader('shaders/unlit.fragment.glsl');

    const uniforms = {
        color: { value: new THREE.Color(0.0, 1.0, 0.0) }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    return createMaterialEntry(material);
}

async function loadCartoonMaterial() {
    const vertexShader = await loadShader('shaders/cartoon.vertex.glsl');
    const fragmentShader = await loadShader('shaders/cartoon.fragment.glsl');

    const uniforms = {
        lightPosition: { value: new THREE.Vector3(5, 5, 5) },
        ambientColor: { value: new THREE.Color(0.2, 0.2, 0.2) },
        diffuseColor: { value: new THREE.Color(1.0, 0.5, 0.1) },
        specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        shininess: { value: 100.0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    return createMaterialEntry(material);
}
