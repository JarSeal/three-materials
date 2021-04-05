import * as THREE from 'three';

class Cubemaps {
    constructor(scene, sceneState) {
        this.sceneState = sceneState;
        this.loader = new THREE.CubeTextureLoader();
        
        // const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1);
        // const boxMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        // const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        // boxMesh.position.set(0, 0.5, 0);
        // scene.add(boxMesh);

        const defaultMapPath = '/images/cubemaps/LancelottiChapel/';
        scene.background = this.loadCubemaps(defaultMapPath);

        this.loadSphere(scene, [0, 0, 0], defaultMapPath);
    }

    loadCubemaps(path) {
        const urls = [
            path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg'
        ];
        return this.loader.load(urls);
    }

    loadSphere(scene, pos, path) {
        const urls = [
            path+'posx.jpg', path+'negx.jpg', path+'posy.jpg', path+'negy.jpg', path+'posz.jpg', path+'negz.jpg'
        ];
        this.loader.load(urls, (cubeMap) => {
            const blur = new THREE.PMREMGenerator(this.sceneState.renderer);
            const test = blur.fromCubemap(cubeMap);
            console.log(blur, test, cubeMap);
            const sphereMat = new THREE.MeshStandardMaterial({
                map: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_albedo.png'),
                normalMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Normal-ogl.png'),
                envMap: test.texture,
                metalness: 0.2,
                // metalnessMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Metallic.png'),
                // roughnessMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2_Roughness.png'),
                roughness: 0.2,
                aoMap: new THREE.TextureLoader().load('/images/textures/concrete2/concrete2-ao.png'),
            });
            const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.set(pos[0], pos[1], pos[2]);
            scene.add(sphere);
            sphere.material.needsUpdate = true;
        });
    }
}

export default Cubemaps;