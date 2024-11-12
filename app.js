let scene;
let camera;
let renderer;

function navigateToMap() {
    window.location.href = 'map.html';
}


function main() {
    const canvas = document.querySelector('#c');

    // Initialize scene
    scene = new THREE.Scene();

    // Initialize camera with higher y position and pointing slightly downward
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 2);  // Move camera up along the y-axis
    camera.lookAt(0, 0.8, 0);        // Look at the center of the scene
    scene.add(camera);

    // Initialize renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    // Create Earth geometry and material
    const earthgeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const earthmaterial = new THREE.MeshPhongMaterial({
        roughness: 1,
        metalness: 0,
        map: new THREE.TextureLoader().load('texture/earthmap1k.jpg'),
        bumpMap: new THREE.TextureLoader().load('texture/earthbump.jpg'),
        bumpScale: 0.3,
    });
    const earthmesh = new THREE.Mesh(earthgeometry, earthmaterial);
    scene.add(earthmesh);

    // Ambient light
    const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientlight);

    // Point light
    const pointlight = new THREE.PointLight(0xffffff, 0.9);
    pointlight.position.set(5, 3, 5);
    scene.add(pointlight);

    // Clouds
    const cloudgeometry = new THREE.SphereGeometry(0.63, 32, 32);
    const cloudmaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('texture/earthCloud.png'),
        transparent: true
    });
    const cloudmesh = new THREE.Mesh(cloudgeometry, cloudmaterial);
    scene.add(cloudmesh);

    // Background stars
    const stargeometry = new THREE.SphereGeometry(80, 64, 64);
    const starmaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('texture/galaxy.png'),
        side: THREE.BackSide
    });
    const starmesh = new THREE.Mesh(stargeometry, starmaterial);
    scene.add(starmesh);

    // Animation function
    const animate = () => {
        requestAnimationFrame(animate);
        earthmesh.rotation.y -= 0.0015;
        cloudmesh.rotation.y += 0.0015;
        starmesh.rotation.y += 0.0005;
        render();
    };

    const render = () => {
        renderer.render(scene, camera);
    };

    animate();
}

window.onload = main;
