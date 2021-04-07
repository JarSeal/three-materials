import * as THREE from 'three';
import cubeMapData from './cubeMapData.js';
import textureData from './textureData.js';

class Cubemaps {
    constructor(scene, sceneState) {
        this.scene = scene;
        this.sceneState = sceneState;
        this.cubeLoader = new THREE.CubeTextureLoader();
        this.textureLoader = new THREE.TextureLoader();

        // const defaultMapPath = '/images/cubemaps/LancelottiChapel/';

        this._loadObjects(scene, [0, 0, 0]);
        this._createGui(sceneState);
    }

    // _loadCubemaps(path) {
    //     // const urls = [ path+'posx_256.jpg', path+'negx_256.jpg', path+'posy_256.jpg', path+'negy_256.jpg', path+'posz_256.jpg', path+'negz_256.jpg' ];
    //     const urls = [ path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg' ];
    //     return this.loader.load(urls);
    // }

    _updateEnvMap(newSource) {
        const path = '/images/cubemaps/' + newSource + '/';
        const urls = [ path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg' ];

        this.cubeLoader.load(urls, (cubeMap) => {
            this.sceneState.curCubeMap.dispose();
            this.sceneState.curCubeMap = cubeMap;
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const ibl = blur.fromCubemap(cubeMap);
            this.sceneState.curIBL.texture.dispose();
            this.sceneState.curIBL.dispose();
            this.sceneState.curIBL = ibl;
            if(this.sceneState.settings.useIBL) {
                const mat = this.sceneState.curMat;
                mat.envMap = ibl.texture;
            }
            if(this.sceneState.settings.showEnvMapBackground) {
                this.scene.background = cubeMap;
            }
        });
    }

    _loadObjectMaterials(newMaterial) {
        const path = '/images/textures/' + newMaterial + '/';
        const materialData = textureData[this.sceneState.settings.pbrTexture];
        let size = '';
        if(materialData.sizes.includes(this.sceneState.settings.textureSize)) {
            size = materialData.sizes.indexOf(this.sceneState.settings.textureSize) === 0 ? '' : '_' + this.sceneState.settings.textureSize;
        } else {
            this.sceneState.settings.textureSize = materialData.sizes[0];
        }
        this._disposeTextures();
        this.sceneState.curMatMaps = {
            map: null,
            bumpMap: null,
            metalnessMap: null,
            normalMap: null,
            roughnessMap: null,
            aoMap: null,
        };
        if(materialData.map) {
            this.sceneState.curMatMaps.map = this.textureLoader.load(path + materialData.map + size + '.' + materialData.ext);
        }
        if(materialData.bumpMap) {
            this.sceneState.curMatMaps.bumpMap = this.textureLoader.load(path + materialData.bumpMap + size + '.' + materialData.ext);
        }
        if(materialData.metalnessMap) {
            this.sceneState.curMatMaps.metalnessMap = this.textureLoader.load(path + materialData.metalnessMap + size + '.' + materialData.ext);
        }
        if(materialData.normalMap) {
            this.sceneState.curMatMaps.normalMap = this.textureLoader.load(path + materialData.normalMap + size + '.' + materialData.ext);
        }
        if(materialData.roughnessMap) {
            this.sceneState.curMatMaps.roughnessMap = this.textureLoader.load(path + materialData.roughnessMap + size + '.' + materialData.ext);
        }
        if(materialData.aoMap) {
            this.sceneState.curMatMaps.aoMap = this.textureLoader.load(path + materialData.aoMap + size + '.' + materialData.ext);
        }
        if(this.sceneState.curMat) {
            const mat = this.sceneState.curMat;
            const settings = this.sceneState.settings;
            mat.map = settings.useMatMap ? this.sceneState.curMatMaps.map : null;
            mat.bumpMap = settings.useMatBumpMap ? this.sceneState.curMatMaps.bumpMap : null;
            mat.metalnessMap = settings.useMatMetalnessMap ? this.sceneState.curMatMaps.metalnessMap : null;
            mat.normalMap = settings.useMatNormalMap ? this.sceneState.curMatMaps.normalMap : null;
            mat.roughnessMap = settings.useMatRoughnessMap ? this.sceneState.curMatMaps.roughnessMap : null;
            mat.aoMap = settings.useMatAoMap ? this.sceneState.curMatMaps.aoMap : null;
        }
    }

    _disposeTextures() {
        if(!this.sceneState.curMatMaps) return;
        if(this.sceneState.curMatMaps.map) this.sceneState.curMatMaps.map.dispose();
        if(this.sceneState.curMatMaps.bumpMap) this.sceneState.curMatMaps.bumpMap.dispose();
        if(this.sceneState.curMatMaps.metalnessMap) this.sceneState.curMatMaps.metalnessMap.dispose();
        if(this.sceneState.curMatMaps.normalMap) this.sceneState.curMatMaps.normalMap.dispose();
        if(this.sceneState.curMatMaps.roughnessMap) this.sceneState.curMatMaps.roughnessMap.dispose();
        if(this.sceneState.curMatMaps.aoMap) this.sceneState.curMatMaps.aoMap.dispose();
    }

    _loadObjects(scene, pos) {
        const path = '/images/cubemaps/' + this.sceneState.settings.envMapSource + '/';
        const urls = [ path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg' ];
        this.cubeLoader.load(urls, (cubeMap) => {
            this.sceneState.curCubeMap = cubeMap;
            if(this.sceneState.settings.showEnvMapBackground) {
                scene.background = cubeMap;
            }
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const ibl = blur.fromCubemap(cubeMap);
            this.sceneState.curIBL = ibl;
            this._loadObjectMaterials(this.sceneState.settings.pbrTexture);
            const settings = this.sceneState.settings;
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xcccccc),
                map: settings.useMatMap ? this.sceneState.curMatMaps.map : null,
                bumpMap: settings.useMatBumpMap ? this.sceneState.curMatMaps.bumpMap : null,
                bumpScale: this.sceneState.settings.bumpScale,
                normalMap: settings.useMatNormalMap ? this.sceneState.curMatMaps.normalMap : null,
                envMap: this.sceneState.settings.useIBL ? ibl.texture : null,
                envMapIntensity: this.sceneState.settings.envMapIntensity,
                metalness: this.sceneState.settings.metalness,
                metalnessMap: settings.useMatMetalnessMap ? this.sceneState.curMatMaps.metalnessMap : null,
                roughness: this.sceneState.settings.roughness,
                roughnessMap: settings.useMatRoughnessMap ? this.sceneState.curMatMaps.roughnessMap : null,
                side: this.sceneState.settings.curMaterialSide === 'FrontSide'
                    ? THREE.FrontSide
                    : this.sceneState.settings.curMaterialSide === 'BackSide'
                        ? THREE.BackSide
                        : THREE.DoubleSide,
                aoMap: settings.useMatAoMap ? this.sceneState.curMatMaps.aoMap : null,
                aoMapIntensity: this.sceneState.settings.aoMapIntensity,
            });

            const curSetting = this.sceneState.settings.curMaterialPreviewObjects;

            const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1);
            boxGeo.attributes.uv2 = boxGeo.attributes.uv;
            const boxMesh = new THREE.Mesh(boxGeo, mat);
            boxMesh.position.set(pos[0], pos[1], pos[2]);
            boxMesh.visible = curSetting === 'Box' || curSetting === 'BoxAndPlane1' || curSetting === 'BoxAndPlane2';
            scene.add(boxMesh);

            const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
            sphereGeo.attributes.uv2 = sphereGeo.attributes.uv;
            const sphereMesh = new THREE.Mesh(sphereGeo, mat);
            sphereMesh.position.set(pos[0], pos[1], pos[2]);
            sphereMesh.visible = curSetting === 'Sphere' || curSetting === 'SphereAndPlane1' || curSetting === 'SphereAndPlane2';
            scene.add(sphereMesh);

            const planeGeo = new THREE.PlaneBufferGeometry(5, 5, 1);
            planeGeo.attributes.uv2 = planeGeo.attributes.uv;
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
        envMapFolder.add(this.sceneState.settings, 'envMapSource', cubeMapData).name('Environment map').onChange((value) => {
            this._updateEnvMap(value);
        });
        envMapFolder.add(this.sceneState.settings, 'envMapIntensity', 0, 5).name('Env map intensity').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.envMapIntensity = value;
            mat.needsUpdate = true;
        });

        const materialFolder = sceneState.gui.addFolder('Material');
        materialFolder.open();
        const keys = Object.keys(textureData);
        materialFolder.add(this.sceneState.settings, 'pbrTexture', keys).name('PBR material').onChange((value) => {
            this._loadObjectMaterials(value);
        });
        materialFolder.add(this.sceneState.settings, 'useMatMap').name('Use map (color)').onChange((value) => {
            this.sceneState.curMat.map = value ? this.sceneState.curMatMaps.map : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'useMatBumpMap').name('Use bump map').onChange((value) => {
            this.sceneState.curMat.bumpMap = value ? this.sceneState.curMatMaps.bumpMap : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'bumpScale', 0, 3).name('Bump scale').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.bumpScale = value;
            mat.needsUpdate = true;
        });        
        materialFolder.add(this.sceneState.settings, 'useMatMetalnessMap').name('Use metalness map').onChange((value) => {
            this.sceneState.curMat.metalnessMap = value ? this.sceneState.curMatMaps.metalnessMap : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'metalness', 0, 3).name('Metalness').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.metalness = value;
            mat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'useMatNormalMap').name('Use normal map').onChange((value) => {
            this.sceneState.curMat.normalMap = value ? this.sceneState.curMatMaps.normalMap : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'useMatRoughnessMap').name('Use roughness map').onChange((value) => {
            this.sceneState.curMat.roughnessMap = value ? this.sceneState.curMatMaps.roughnessMap : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'roughness', 0, 3).name('Roughness').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.roughness = value;
            mat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'useMatAoMap').name('Use AO map').onChange((value) => {
            this.sceneState.curMat.aoMap = value ? this.sceneState.curMatMaps.aoMap : null;
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.add(this.sceneState.settings, 'aoMapIntensity', 0, 3).name('AO map intensity').onChange((value) => {
            const mat = this.sceneState.curMat;
            mat.aoMapIntensity = value;
            mat.needsUpdate = true;
        });
    }
}

export default Cubemaps;