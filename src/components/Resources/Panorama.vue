<template>
  <div>
    <h1>这里实现全景图dome</h1>
  </div>
</template>

<script>
// import THREE from 'three-js';

export default {
  components: {
  },
  name: 'Panorama',
  data () {
    return {

    };
  },
  created () {
    this.init();
  },
  methods: {
    init () {
      // const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
      // const textures = [
      //   'https://img.alicdn.com/imgextra/i3/O1CN01LsO1Bk20QbKpFTUQr_!!6000000006844-0-tps-1500-1500.jpg',
      //   'https://img.alicdn.com/imgextra/i3/O1CN01uTWCLc1XOCOuA92H0_!!6000000002913-0-tps-1500-1500.jpg',
      //   'https://img.alicdn.com/imgextra/i4/O1CN016lU3YJ1JdrJuFTcWt_!!6000000001052-0-tps-1500-1500.jpg',
      //   'https://img.alicdn.com/imgextra/i2/O1CN01nYe2Mn1ohkmBVyKpp_!!6000000005257-0-tps-1500-1500.jpg',
      //   'https://img.alicdn.com/imgextra/i4/O1CN014TNffn1nlaTfA98Fg_!!6000000005130-0-tps-1500-1500.jpg',
      //   'https://img.alicdn.com/imgextra/i1/O1CN01sS5m781ya6JgLSaVk_!!6000000006594-0-tps-1500-1500.jpg',
      // ];
      // const materials = [];
      // const textureLoader = new THREE.TextureLoader();
      // for (let i = 0; i < 6; i++) {
      //   materials.push(
      //     new THREE.MeshBasicMaterial({ map: textureLoader.load(textures[i]) })
      //   );
      // }
      // const skyBox = new THREE.Mesh(geometry, materials);
      // skyBox.geometry.scale(1, 1, -1);
      // camera.position.z = 0.01; // 将相机放在里面
      // const controls = new OrbitControls(camera, renderer.domElement);
      // controls.enableZoom = false; // 禁用放大
      // controls.enablePan = false; // 禁用双指缩放
      // controls.enableDamping = true; // 开启阻尼效果
      // controls.rotateSpeed = -0.25; // 旋转方向取反，使内部拖拽旋转方向一致
    }
  }
};
</script>

<style scoped>

</style>
