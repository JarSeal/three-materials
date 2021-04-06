import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import * as Stats from './vendor/stats.min.js';

import Cubemaps from './cubemaps/Cubemaps';

class Root {
    constructor() {
        this.sceneState = {};

        // Setup renderer [START]
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor('#000000');
        const screenSize = this.getScreenResolution();
        renderer.setSize(screenSize.x, screenSize.y);
        renderer.domElement.id = 'main-stage';
        document.body.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.sceneState.renderer = renderer;
        // Setup renderer [/END]

        // Setup scene and basic lights [START]
        const scene = new THREE.Scene();
        const hemi = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.15);
        hemi.position.set(0, 32, 0);
        scene.add(hemi);
        scene.add(new THREE.AmbientLight(0xffffff, 0));
        this.axesHelper = new THREE.AxesHelper(10);
        scene.add(this.axesHelper); // Helper
        this.scene = scene;
        // Setup scene and basic lights [/END]

        // Setup camera and aspect ratio [START]
        this.aspectRatio = screenSize.x / screenSize.y;
        const camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 0.1, 200);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();
        this.controls = controls;
        this.camera = camera;
        this.sceneState.camera = camera;
        // Setup camera and aspect ratio [/END]

        // Setup debug statisctics [START]
        const createStats = () => {
            const s = new Stats();
            s.setMode(0);
            return s;
        };
        this.stats = createStats();
        this.stats.domElement.id = 'debug-stats-wrapper';
        document.body.appendChild(this.stats.domElement);
        // Setup debug statisctics [/END]

        // Other setup [START]
        this.sceneState.clock = new THREE.Clock(),
        this.sceneState.resizeFns = [this.resize],
        this.sceneState.getScreenResolution = this.getScreenResolution;
        this.sceneState.defaultSettings = {
            showStats: true,
            showAxesHelper: true,
            showEnvMapBackground: true,
            sceneBackColor: '#000000',
            useHemiLight: true,
            hemiLightIntensity: 0.15,
            useAmbiLight: true,
            ambiLightIntensity: 0.5,
            curMaterialPreviewObjects: 'SphereAndPlane2',
            curMaterialSide: 'DoubleSide',
            useIBL: true,
            aoMapIntensity: 0.5,
        };
        this.sceneState.settings = { ...this.sceneState.defaultSettings };
        this._setupLights();
        this._initResizer();
        // Other setup [/END]

        // GUI setup [START]
        const gui = new GUI();
        // gui.close();
        const sceneAndDebugFolder = gui.addFolder('Scene and Debug');
        sceneAndDebugFolder.add(this.sceneState.settings, 'showStats').name('Show stats').onChange((value) => {
            document.getElementById('debug-stats-wrapper').style.display = value ? 'block' : 'none';
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'showAxesHelper').name('Show axes helper').onChange((value) => {
            this.axesHelper.visible = value;
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'showEnvMapBackground').name('Show envmap bckgrd').onChange((value) => {
            scene.background = value ? this.sceneState.curCubeMap : new THREE.Color(this.sceneState.settings.sceneBackColor);
        });
        sceneAndDebugFolder.addColor(this.sceneState.settings, 'sceneBackColor').name('Scene back color').onChange((value) => {
            if(!this.sceneState.settings.showEnvMapBackground) {
                scene.background = new THREE.Color(value);
            }
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'useHemiLight').name('Use Hemi light').onChange((value) => {
            this.scene.children[0].visible = value;
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'hemiLightIntensity', 0, 2).name('Hemi light intensity').onChange((value) => {
            this.scene.children[0].intensity = value;
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'useAmbiLight').name('Use Ambi light').onChange((value) => {
            console.log(this.scene);
            this.scene.children[1].visible = value;
        });
        sceneAndDebugFolder.add(this.sceneState.settings, 'ambiLightIntensity', 0, 2).name('Ambi light intensity').onChange((value) => {
            this.scene.children[1].intensity = value;
        });
        this.sceneState.gui = gui;
        // GUI setup [/END]

        this.runApp(scene, camera);
    }

    runApp(scene, camera) {

        // Main app logic [START]
        camera.position.set(1, 1, 10);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Init Cubemaps
        new Cubemaps(scene, this.sceneState);

        this.resize(this.sceneState, this.renderer);
        this.renderLoop();
    }

    renderLoop = () => {
        requestAnimationFrame(this.renderLoop);
        // const delta = this.sceneState.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
        if(this.sceneState.settings.showStats) this.stats.update(); // Debug statistics
    }

    resize(sceneState, renderer) {
        const reso = sceneState.getScreenResolution();
        const width = reso.x;
        const height = reso.y;
        const pixelRatio = window.devicePixelRatio || 1;
        document.getElementsByTagName('body')[0].style.width = width + 'px';
        document.getElementsByTagName('body')[0].style.height = height + 'px';
        sceneState.camera.aspect = width / height;
        sceneState.camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(pixelRatio);
    }

    _initResizer() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                let i;
                const fns = this.sceneState.resizeFns,
                    fnsLength = fns.length;
                for(i=0; i<fnsLength; i++) {
                    fns[i](
                        this.sceneState,
                        this.renderer,
                        this.scene,
                        this.camera
                    );
                }
            }, 500);
        });
    }

    getScreenResolution() {
        return {
            x: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            y: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    }

    _setupLights() {
        this.scene.children[0].visible = this.sceneState.settings.useHemiLight;
        this.scene.children[0].intensity = this.sceneState.settings.hemiLightIntensity;
        this.scene.children[1].visible = this.sceneState.settings.useAmbiLight;
        this.scene.children[1].intensity = this.sceneState.settings.ambiLightIntensity;
    }
}

new Root();