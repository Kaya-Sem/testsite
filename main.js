import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

class modelState {
    currentFloor = 0;
    minFloor = -1;
    maxFloor = 2;
}

const globalModelState = new modelState();
updateActiveButton(0);

// Modify keydown event to update buttons too
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
        clippingPlane.constant += 1;
        globalModelState.currentFloor = Math.min(
            globalModelState.currentFloor + 1,
            2,
        );
    } else if (event.key === "ArrowDown") {
        clippingPlane.constant -= 1;
        globalModelState.currentFloor = Math.max(
            -1,
            globalModelState.currentFloor - 1,
        );
    } else {
        return; // Exit early if no relevant key is pressed
    }

    console.info(`Updated Clipping Plane: ${clippingPlane.constant}`);

    updateActiveButton(globalModelState.currentFloor);

    renderer.render(scene, camera);
});

// Function to update active button
function updateActiveButton(floor) {
    const buttons = document.querySelectorAll(".verdiep_selector_button");

    buttons.forEach((button) => {
        if (button.getAttribute("data-floor") === String(floor)) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });

    console.info(`Geselecteerde verdieping: ${floor}`);
    const indicator_paragraph = document.getElementById(
        "selected_floor_indicator",
    );
    indicator_paragraph.textContent = `Geselecteerde verdieping: ${floor}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".verdiep_selector_button");

    buttons.forEach((button) => {
        button.addEventListener("click", handleButtonClickEvent);
    });
});

function handleButtonClickEvent(event) {
    const selectedFloor = event.target.getAttribute("data-floor");

    globalModelState.currentFloor = parseInt(selectedFloor, 10);
    updateActiveButton(selectedFloor);
}

/* THREE JS SETUP */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.localClippingEnabled = true; // Enable global clipping

document.querySelector(".canvas-container").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 20, 100);
controls.update();

const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// Lighting
const light = new THREE.AmbientLight(0x404040, 100);
scene.add(light);
light.position.set(0, 20, 20);

// GLOBAL CLIPPING PLANE (Will be updated dynamically)
const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0); // Start at Y=0

// Load GLTF Model
const loader = new GLTFLoader();
loader.load(
    "school/scene.gltf",
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Compute model's bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Model Center:", center);
        console.log("Model Size:", size);

        // Set clipping plane to cut at model's halfway point
        clippingPlane.constant = center.y; // Clipping in Y direction

        // Apply clipping plane to all materials in the model
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.clippingPlanes = [clippingPlane];
                child.material.clipShadows = true;
                child.material.needsUpdate = true; // Ensure materials update
            }
        });
    },
    undefined,
    function (error) {
        console.error("An error occurred while loading the model:", error);
    },
);

// Animation Loop
function animate() {
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Handle Window Resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
