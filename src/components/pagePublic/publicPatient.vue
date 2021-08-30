<!--
 * @Autor: Linbaochang
 * @Date: 2021-05-07 14:26:12
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-07-20 15:13:40
-->
<template>
  <div class="public-patient">
    <iframe :src="patientUrl" frameborder="0"></iframe>
  </div>
</template>

<script>
import IcuSysPara from '@/benchs/icis/api/icuSysPara';

export default {
  name: 'publicPatient',
  data() {
    return {
      patientUrl: 'http://10.10.251.121:9080/hthcdr2/do?module=sys&action=Login&method=gotoHtcdr2&pid=',
      // activePatientCard: {},
    };
  },
  created() {
    this.$nextTick(() => this.get360URL());
  },
  methods: {
    get360URL() {
      IcuSysPara.get360URL({
        inHostNum: JSON.parse(localStorage.getItem('activePatientCard')).inHosNum,
      }).then(res => {
        if (res.code == 200) {
          this.patientUrl = res.data;
        } else {
          this.$message({
            type: 'error',
            message: res.msg,
          });
        }
      });
    },
  },
  beforeMount() {
    // this.activePatientCard = JSON.parse(localStorage.getItem('activePatientCard'));
    // this.patientUrl = this.patientUrl.replace(/\pid=/, `pid=${this.activePatientCard.patientId}`);
  },
};
</script>
<style lang="scss">
.public-patient {
  width: 100%;
  height: calc(100vh - 80px);
  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>
