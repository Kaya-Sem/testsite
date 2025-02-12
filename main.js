import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';





document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".verdiep_selector_button");

    buttons.forEach((button) => {
        button.addEventListener("click", (event) => {
            // Verwijder de "active" klasse van alle knoppen
            buttons.forEach((btn) => btn.classList.remove("active"));

            // Voeg de "active" klasse toe aan de aangeklikte knop
            event.target.classList.add("active");

            // Haal de verdieping op en voer een functie uit
            const selectedFloor = event.target.getAttribute("data-floor");
            handleButtonClick(selectedFloor);
        });
    });
});

// Voorbeeldfunctie die de geselecteerde verdieping afhandelt
function handleButtonClick(floor) {
    console.log(`Geselecteerde verdieping: ${floor}`);
}




/* THREE JS */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set scene background to white
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.querySelector('.canvas-container').appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 20, 100);
controls.update();

const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// add light
const light = new THREE.AmbientLight(0x404040, 100);
scene.add(light);
light.position.set(0,20,20);

// Load 3D model
const loader = new GLTFLoader();
loader.load("school/scene.gltf", function (gltf) {
    const model = gltf.scene;
    scene.add(model);
}, undefined, function (error) {
    console.error('An error occurred while loading the model:', error);
});

function animate() {
    camera.position.y = Math.max(camera.position.y, 0);
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Fix for resizing issue
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
