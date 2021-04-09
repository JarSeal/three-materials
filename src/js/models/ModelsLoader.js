import { TextureLoader, CubeTextureLoader, PMREMGenerator } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import models from './modelsData';

class ModelsLoader {
    constructor(scene, sceneState) {
        this.scene = scene;
        this.sceneState = sceneState;
        this.envPath = '/models/environments/';
        this.loader = new GLTFLoader();
        this.textureLoader = new TextureLoader();
        this.cubeLoader = new CubeTextureLoader();
    }

    loadEnv(key) {
        if(key === 'None') return;
        const data = models[key];
        const curPath = this.envPath + key + '/';
        let diffuseMap, diffuseMap2, /*normalMap,*/ normalMap2;
        if(data.map) diffuseMap = this.textureLoader.load(curPath + data.map, m => {
            m.flipY = false;
        });
        if(data.map2) diffuseMap2 = this.textureLoader.load(curPath + data.map2, m => {
            m.flipY = false;
        });
        // if(data.normalMap) normalMap = this.textureLoader.load(curPath + data.normalMap, m => {
        //     m.flipY = false;
        // });
        if(data.normalMap2) normalMap2 = this.textureLoader.load(curPath + data.normalMap2, m => {
            m.flipY = false;
        });
        this.loader.load(curPath + data.model, (gltf) => {
            const mesh = gltf.scene.children[0];
            if(data.xRotation) mesh.rotation.x = data.xRotation;
            if(data.position) mesh.position.set(data.position[0], data.position[1], data.position[2]);
            if(diffuseMap) mesh.material.map = diffuseMap;
            // if(normalMap) mesh.material.normalMap = normalMap;
            this.sceneState.envObjectEnvMap = null;
            if(data.envMap) {
                let urlExt = '.png';
                if(data.envMapExt) urlExt = '.' + data.envMapExt;
                const path = '/images/cubemaps/' + key + '/';
                const urls = [ path+'posx'+urlExt, path+'negx'+urlExt, path+'posy'+urlExt, path+'negy'+urlExt, path+'posz'+urlExt, path+'negz'+urlExt ];
                this.cubeLoader.load(urls, (cubeMap) => {
                    const blur = new PMREMGenerator(this.sceneState.renderer);
                    this.sceneState.envObjectEnvMap = blur.fromCubemap(cubeMap);
                    if(this.sceneState.settings.useIBL) {
                        this.sceneState.curMat.envMap = this.sceneState.envObjectEnvMap.texture;
                        this.sceneState.curMat.envMapIntensity = 1;
                    }
                });
            }
            mesh.material.metalness = 0;
            mesh.material.roughness = 0.15;
            this._removeEnvObject();
            this.scene.add(mesh);
            this.sceneState.envObject = mesh;
        },
        undefined, 
        (error) => {
            console.error('Model 1', error);
        });
        if(data.model2) {
            this.loader.load(curPath + data.model2, (gltf) => {
                const mesh = gltf.scene.children[0];
                if(data.xRotation) mesh.rotation.x = data.xRotation;
                if(data.position) mesh.position.set(data.position[0], data.position[1], data.position[2]);
                if(diffuseMap2) mesh.material.map = diffuseMap2;
                if(normalMap2) mesh.material.normalMap = normalMap2;
                if(this.sceneState.settings.useIBL) mesh.material.envMap = this.sceneState.curIBL.texture;
                mesh.material.envMapIntensity = this.sceneState.settings.envMapIntensity;
                mesh.material.metalness = 0.5;
                mesh.material.roughness = 0.2;
                this._removeEnvObject('2');
                this.scene.add(mesh);
                this.sceneState.envObject2 = mesh;
            },
            undefined, 
            (error) => {
                console.error('Model 2', error);
            });
        }
    }

    _removeEnvObject(target) {
        let ext = '';
        if(target !== undefined) ext = target;
        const obj = this.sceneState['envObject' + ext];
        if(obj) {
            if(obj.material.map) obj.material.map.dispose();
            if(obj.material.normalMap) obj.material.normalMap.dispose();
            if(obj.material.envMap) obj.material.envMap.dispose();
            obj.material.dispose();
            this.scene.remove(obj);
            this.sceneState['envObject' + ext] = null;
        }
    }

    createGui(sceneState) {
        const modelKeys = Object.keys(models);
        const envObjFolder = sceneState.gui.addFolder('Env Object');
        envObjFolder.open();
        envObjFolder.add(sceneState.settings, 'showEnvObject').name('Show env object').onChange((value) => {
            if(sceneState.envObject) sceneState.envObject.visible = value;
            if(sceneState.envObject2) sceneState.envObject2.visible = value;
        });
        envObjFolder.add(sceneState.settings, 'envObject', [ 'None', ...modelKeys ]).name('Env object').onChange((value) => {
            if(value === 'None') {
                this._removeEnvObject();
                this._removeEnvObject('2');
                if(sceneState.settings.useIBL) {
                    sceneState.curMat.envMap = sceneState.curIBL.texture;
                }
            }
            this.loadEnv(value);
        });
        envObjFolder.add(sceneState.settings, 'envObjIBL').name('Env obj IBL').onChange((value) => {
            if(value) {
                if(sceneState.envObject2) sceneState.envObject2.material.envMap = sceneState.curIBL.texture;
            } else {
                if(sceneState.envObject2) sceneState.envObject2.material.envMap = null;
            }
        });
    }
}

export default ModelsLoader;