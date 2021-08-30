<template>
  <div class="public-patient360">
    <iframe
      :src="patientUrl"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
  </div>
</template>

<script>
import Management from "@/benchs/sanesthesia/api/saManagement";

export default {
  name: "publicPatient360",
  props: {
    operId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      patientUrl: "", //http://10.10.251.121:9080/hthcdr2/do?module=sys&action=Login&method=gotoHtcdr2&pid=
    };
  },
  watch: {
    operId(newVal, oldVal) {
      if (newVal != oldVal) {
        this.hT360URL();
      }
    },
  },
  created() {
    this.hT360URL();
  },
  methods: {
    hT360URL() {
      Management.hT360URL(this.operId).then((res) => {
        if (res.code == 200) {
          this.patientUrl = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg,
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.public-patient360 {
  height: 700px;
}
</style>
