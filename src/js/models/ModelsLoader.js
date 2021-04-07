import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import models from './modelsData';

class ModelsLoader {
    constructor(scene, sceneState) {
        this.scene = scene;
        this.sceneState = sceneState;
        this.envPath = '/models/environments/';
        this.loader = new GLTFLoader();
        this.textureLoader = new TextureLoader();
    }

    loadEnv(key) {
        const data = models[key];
        const curPath = this.envPath + key + '/';
        let diffuseMap, diffuseMap2, normalMap, normalMap2;
        if(data.map) diffuseMap = this.textureLoader.load(curPath + data.map, m => {
            m.flipY = false;
        });
        if(data.map2) diffuseMap2 = this.textureLoader.load(curPath + data.map2, m => {
            m.flipY = false;
        });
        if(data.normalMap) normalMap = this.textureLoader.load(curPath + data.normalMap, m => {
            m.flipY = false;
        });
        if(data.normalMap2) normalMap2 = this.textureLoader.load(curPath + data.normalMap2, m => {
            m.flipY = false;
        });
        this.loader.load(curPath + data.model, (gltf) => {
            const mesh = gltf.scene.children[0];
            if(data.xRotation) mesh.rotation.x = data.xRotation;
            if(data.position) mesh.position.set(data.position[0], data.position[1], data.position[2]);
            if(diffuseMap) mesh.material.map = diffuseMap;
            // if(normalMap) mesh.material.normalMap = normalMap;
            // mesh.material.envMap = this.sceneState.curIBL.texture;
            mesh.material.metalness = 0;
            mesh.material.roughness = 0.15;
            if(this.sceneState.envObject) {
                if(this.sceneState.envObject.material.map) this.sceneState.envObject.material.map.dispose();
                if(this.sceneState.envObject.material.normalMap) this.sceneState.envObject.material.normalMap.dispose();
                this.sceneState.envObject.material.dispose();
                this.scene.remove(this.sceneState.envObject);
            }
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
                mesh.material.envMap = this.sceneState.curIBL.texture;
                mesh.material.metalness = 0.5;
                mesh.material.roughness = 0.2;
                if(this.sceneState.envObject2) {
                    if(this.sceneState.envObject2.material.map) this.sceneState.envObject.material.map.dispose();
                    if(this.sceneState.envObject2.material.normalMap) this.sceneState.envObject.material.normalMap.dispose();
                    this.sceneState.envObject2.material.dispose();
                    this.scene.remove(this.sceneState.envObject2);
                }
                this.scene.add(mesh);
                this.sceneState.envObject2 = mesh;
            },
            undefined, 
            (error) => {
                console.error('Model 2', error);
            });
        }
    }
}

export default ModelsLoader;