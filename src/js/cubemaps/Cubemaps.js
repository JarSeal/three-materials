import * as THREE from 'three';
import cubeMapData, { cubeMapPngs } from './cubeMapData';
import textureData from './textureData';
import ModelsLoader from '../models/ModelsLoader';

class Cubemaps {
    constructor(scene, sceneState) {
        this.scene = scene;
        this.sceneState = sceneState;
        this.cubeLoader = new THREE.CubeTextureLoader();
        this.textureLoader = new THREE.TextureLoader();

        this.ModelsLoader = new ModelsLoader(scene, sceneState);

        this._createGui(sceneState);
        this._loadObjects(scene, [0, 0, 0]);
        this.ModelsLoader.createGui(sceneState);
    }

    _updateEnvMap(newSource) {
        const path = '/images/cubemaps/' + newSource + '/';
        let urlExt = '.jpg';
        if(cubeMapPngs.includes(newSource)) urlExt = '.png';
        const urls = [ path+'posx'+urlExt, path+'negx'+urlExt, path+'posy'+urlExt, path+'negy'+urlExt, path+'posz'+urlExt, path+'negz'+urlExt ];

        this.cubeLoader.load(urls, (cubeMap) => {
            this.sceneState.curCubeMap.dispose();
            this.sceneState.curCubeMap = cubeMap;
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const ibl = blur.fromCubemap(cubeMap);
            this.sceneState.curIBL.texture.dispose();
            this.sceneState.curIBL.dispose();
            this.sceneState.curIBL = ibl;
            if(this.sceneState.settings.useIBL && !this.sceneState.envObjectEnvMap) {
                const mat = this.sceneState.curMat;
                mat.envMap = ibl.texture;
            }
            if(this.sceneState.settings.showEnvMapBackground) {
                this.scene.background = cubeMap;
            }
            if(this.sceneState.envObject) {
                // this.sceneState.envObject.material.envMap = ibl.texture;
            }
            if(this.sceneState.envObject2) {
                this.sceneState.envObject2.material.envMap = ibl.texture;
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
        let urlExt = '.jpg';
        if(cubeMapPngs.includes(this.sceneState.settings.envMapSource)) {
            urlExt = '.png';
        }
        const urls = [ path+'posx'+urlExt, path+'negx'+urlExt, path+'posy'+urlExt, path+'negy'+urlExt, path+'posz'+urlExt, path+'negz'+urlExt ];
        this.cubeLoader.load(urls, (cubeMap) => {
            this.sceneState.curCubeMap = cubeMap;
            if(this.sceneState.settings.showEnvMapBackground) {
                scene.background = cubeMap;
            }
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const ibl = blur.fromCubemap(cubeMap);
            this.sceneState.curIBL = ibl;
            if(this.sceneState.settings.envObject && this.sceneState.settings.envObject !== 'None') {
                this.ModelsLoader.loadEnv(this.sceneState.settings.envObject);
            }
            this._loadObjectMaterials(this.sceneState.settings.pbrTexture);
            const settings = this.sceneState.settings;
            const mat = new THREE.MeshStandardMaterial({
                color: this.sceneState.settings.useMatColor ? new THREE.Color(this.sceneState.settings.matColor) : null,
                map: settings.useMatMap ? this.sceneState.curMatMaps.map : null,
                bumpMap: settings.useMatBumpMap ? this.sceneState.curMatMaps.bumpMap : null,
                bumpScale: this.sceneState.settings.bumpScale,
                normalMap: settings.useMatNormalMap ? this.sceneState.curMatMaps.normalMap : null,
                envMap: this._setObjectEnvMap(this.sceneState, ibl),
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

    _setObjectEnvMap(sceneState, ibl) {
        if(sceneState.settings.useIBL) {
            if(sceneState.envObject && sceneState.envObjectEnvMap) {
                return null; // will be set in the ModelsLoader
            } else {
                return ibl.texture;
            }
        } else {
            return null;
        }
    }

    _createGui(sceneState) {
        const objectsFolder = sceneState.gui.addFolder('Object');
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

        const materialFolder = sceneState.gui.addFolder('Object Material');
        materialFolder.open();
        const keys = Object.keys(textureData);
        materialFolder.add(this.sceneState.settings, 'pbrTexture', keys).name('PBR material').onChange((value) => {
            this._loadObjectMaterials(value);
        });
        materialFolder.add(this.sceneState.settings, 'useMatColor').name('Material color').onChange((value) => {
            if(!value) {
                this.sceneState.curMat.color = new THREE.Color(0xffffff);
            } else {
                this.sceneState.curMat.color = new THREE.Color(this.sceneState.settings.matColor);
            }
            this.sceneState.curMat.needsUpdate = true;
        });
        materialFolder.addColor(this.sceneState.settings, 'matColor').name('Material color').onChange((value) => {
            this.sceneState.curMat.color = this.sceneState.settings.useMatColor
                ? new THREE.Color(value)
                : null;
            this.sceneState.curMat.needsUpdate = true;
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

        const envMapFolder = sceneState.gui.addFolder('Env Map');
        envMapFolder.open();
        envMapFolder.add(this.sceneState.settings, 'showEnvMapBackground').name('Show envmap bckgrd').onChange((value) => {
            this.scene.background = value ? this.sceneState.curCubeMap : new THREE.Color(this.sceneState.settings.sceneBackColor);
        });
        envMapFolder.add(this.sceneState.settings, 'useIBL').name('Use IBL').onChange((value) => {
            const mat = this.sceneState.curMat;
            if(value) {
                if(this.sceneState.envObject && this.sceneState.envObjectEnvMap) {
                    mat.envMap = this.sceneState.envObjectEnvMap.texture;
                    mat.envMapIntensity = 1;
                } else {
                    mat.envMap = this.sceneState.curIBL.texture;
                }
                if(this.sceneState.envObject2) {
                    this.sceneState.envObject2.material.envMap = this.sceneState.curIBL.texture;
                }
            } else {
                mat.envMap = null;
                if(this.sceneState.envObject2) this.sceneState.envObject2.material.envMap = null;
            }
        });
        envMapFolder.add(this.sceneState.settings, 'envMapSource', cubeMapData).name('Environment map').onChange((value) => {
            this._updateEnvMap(value);
        });
        envMapFolder.add(this.sceneState.settings, 'envMapIntensity', 0, 5).name('Env map intensity').onChange((value) => {
            const mat = this.sceneState.curMat;
            if(this.sceneState.envObject && this.sceneState.envObjectEnvMap) {
                mat.envMapIntensity = 1;
            } else {
                mat.envMapIntensity = value;
            }
            mat.needsUpdate = true;
            if(this.sceneState.envObject2) {
                this.sceneState.envObject2.material.envMapIntensity = value;
                this.sceneState.envObject2.material.needsUpdate = true;
            }
        });
    }
}

export default Cubemaps;