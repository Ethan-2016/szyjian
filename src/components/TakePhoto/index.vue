<template>
  <div class="take-photo-component" :style="{'width':width + 'px', 'height':height+'px'}">
    <video ref="video" :width="width" :height="height" autoplay style="width= 100%; height= 100%; object-fit: fill"></video>
    <canvas ref="canvas" :width="width" :height="height" v-show="taked"></canvas>
  </div>
</template>

<script>
export default {
  name: 'TakePhoto',
  props: {
    width: {
      default: 300
    },
    height: {
      default: 400
    }
  },
  data() {
    return {
      video: null,
      track: '',
      taked: false
    }
  },
  methods: {
    init(call) {
      this.taked = false;
      this.video = this.$refs.video;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true},
          stream => {
            this.track = stream.getTracks()[0];
            try {
              this.video.src = window.URL.createObjectURL(stream);
            } catch (e) {
              this.video.srcObject = stream;
            }
            this.video.onloadedmetadata = e => {
              this.video.play();
              call(true);
            }
          },
          err => {
            let error = err + "";
            if (error.indexOf("not found") > -1) {
              call(false, "未发现媒体设备，请连接摄像头，或使用账号密码登录");
            } else {
              call(false, "使用媒体设备请求被用户或系统拒绝，请打开允许使用摄像头设置");
            }
          }
        );
      } else {
        call(false, "当前浏览器不支持打开媒体设备，请更换Chrome或Opera浏览器");
      }
    },
    takePhoto(call) {
      let canvas = this.$refs.canvas;
      let context2d = canvas.getContext('2d');
      context2d.fillStyle = '#ffffff';
      context2d.fillRect(0, 0, this.width, this.height);
      context2d.drawImage(this.video, 0, 0, this.width, this.height);
      let image_data = canvas.toDataURL('image/png');
      this.taked = true;
      call(true, image_data);
      if (null != this.track) {
        this.track.stop(); // 关闭摄像头
      }
    },
    destroyed() {
      if (null !== this.track) {
        this.track.stop();
      }
    }
  }
}
</script>

<style scoped>
canvas {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
}
.take-photo-component {
  position: relative;
  margin: 0 auto;
  text-align: center;
}
</style>