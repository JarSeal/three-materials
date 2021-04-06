import * as THREE from 'three';

class Cubemaps {
    constructor(scene, sceneState) {
        this.sceneState = sceneState;
        this.loader = new THREE.CubeTextureLoader();

        // const defaultMapPath = '/images/cubemaps/LancelottiChapel/';

        this._loadObjects(scene, [0, 0, 0]);
        this._createGui(sceneState);
    }

    _loadCubemaps(path) {
        // const urls = [ path+'posx_256.jpg', path+'negx_256.jpg', path+'posy_256.jpg', path+'negy_256.jpg', path+'posz_256.jpg', path+'negz_256.jpg' ];
        const urls = [ path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg' ];
        return this.loader.load(urls);
    }

    _loadObjects(scene, pos) {
        const path = '/images/cubemaps/Teide/';
        const urls = [ path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg' ];
        this.loader.load(urls, (cubeMap) => {
            this.sceneState.curCubeMap = cubeMap;
            if(this.sceneState.settings.showEnvMapBackground) {
                scene.background = cubeMap;
            }
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const ibl = blur.fromCubemap(cubeMap);
            this.sceneState.curIBL = ibl;
            const mat = new THREE.MeshStandardMaterial({
                map: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_albedo_512.png'),
                normalMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Normal-ogl_512.png'),
                envMap: this.sceneState.settings.useIBL ? ibl.texture : null,
                metalness: 0.15,
                // metalnessMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Metallic.png'),
                // roughnessMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Roughness.png'),
                roughness: 0.45,
                side: this.sceneState.settings.curMaterialSide === 'FrontSide'
                    ? THREE.FrontSide
                    : this.sceneState.settings.curMaterialSide === 'BackSide'
                        ? THREE.BackSide
                        : THREE.DoubleSide,
                aoMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2-ao_512.png'),
                aoMapIntensity: this.sceneState.settings.aoMapIntensity,
            });

            const curSetting = this.sceneState.settings.curMaterialPreviewObjects;

            const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1);
            const boxMesh = new THREE.Mesh(boxGeo, mat);
            boxMesh.position.set(pos[0], pos[1], pos[2]);
            boxMesh.visible = curSetting === 'Box' || curSetting === 'BoxAndPlane1' || curSetting === 'BoxAndPlane2';
            scene.add(boxMesh);

            const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
            const sphereMesh = new THREE.Mesh(sphereGeo, mat);
            sphereMesh.position.set(pos[0], pos[1], pos[2]);
            sphereMesh.visible = curSetting === 'Sphere' || curSetting === 'SphereAndPlane1' || curSetting === 'SphereAndPlane2';
            scene.add(sphereMesh);

            const planeGeo = new THREE.PlaneBufferGeometry(5, 5, 1);
            const planeMesh = new THREE.Mesh(planeGeo, mat);
            planeMesh.position.set(pos[0], pos[1], pos[2]);
            if(curSetting === 'Plane1' || curSetting === 'BoxAndPlane1' || curSetting === 'SphereAndPlane1') {
                planeMesh.rotation.x = Math.PI / -2;
            }
            planeMesh.visible = curSetting === 'Plane1' || curSetting === 'Plane2' || curSetting === 'BoxAndPlane1' || curSetting === 'BoxAndPlane2' || curSetting === 'SphereAndPlane1' || curSetting === 'SphereAndPlane2';
            scene.add(planeMesh);

            this.sceneState.matPrevObjects = {
                box: boxMesh,
                sphere: sphereMesh,
                plane: planeMesh,
            };
            this.sceneState.curMat = mat;
        });
    }

    _createGui(sceneState) {
        const objectsFolder = sceneState.gui.addFolder('Object(s)');
        objectsFolder.add(this.sceneState.settings, 'curMaterialPreviewObjects', [ 'None', 'Box', 'Sphere', 'Plane1', 'Plane2', 'BoxAndPlane1', 'BoxAndPlane2', 'SphereAndPlane1', 'SphereAndPlane2' ]).name('Mat prev object(s)').onChange((value) => {
            this.sceneState.matPrevObjects.box.visible = value === 'Box' || value === 'BoxAndPlane1' || value === 'BoxAndPlane2';
            this.sceneState.matPrevObjects.sphere.visible = value === 'Sphere' || value === 'SphereAndPlane1' || value === 'SphereAndPlane2';
            this.sceneState.matPrevObjects.plane.visible = value === 'Plane1' || value === 'Plane2' || value === 'BoxAndPlane1' || value === 'BoxAndPlane2' || value === 'SphereAndPlane1' || value === 'SphereAndPlane2';
            if(value === 'Plane1' ||  value === 'BoxAndPlane1' || value === 'SphereAndPlane1') {
                this.sceneState.matPrevObjects.plane.rotation.x = Math.PI / -2;
            } else {
                this.sceneState.matPrevObjects.plane.rotation.x = 0;
            }
        });
        objectsFolder.add(this.sceneState.settings, 'curMaterialSide', [ 'FrontSide', 'BackSide', 'DoubleSide' ]).name('Mat side rendering').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.side = value === 'FrontSide'
                ? THREE.FrontSide
                : value === 'BackSide'
                    ? THREE.BackSide
                    : THREE.DoubleSide;
            mat.needsUpdate = true;
        });

        const envMapFolder = sceneState.gui.addFolder('Env Map');
        envMapFolder.open();
        envMapFolder.add(this.sceneState.settings, 'useIBL').name('Use IBL').onChange((value) => {
            const mat = this.sceneState.curMat;
            if(value) {
                mat.envMap = this.sceneState.curIBL.texture;
            } else {
                mat.envMap = null;
            }
        });

        const materialFolder = sceneState.gui.addFolder('Material');
        materialFolder.add(this.sceneState.settings, 'aoMapIntensity', 0, 1).name('AO map intensity').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.aoMapIntensity = value;
            mat.needsUpdate = true;
        });
    }
}

export default Cubemaps;