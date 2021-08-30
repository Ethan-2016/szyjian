<template>
  <div class="apply-content">
    <div class="title">日间申请</div>
    <el-form :model="ruleForm" size="small" :rules="rules" ref="ruleForm" :inline="true" label-width="120px">
      <div class="info-box">
        <div class="info-title">就诊信息</div>
        <div class="info-content">
            <el-form-item label="病人姓名：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手机号码：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="身份证号：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="性别：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="年龄(岁)：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="就诊日期：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="就诊科室：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="就诊医生：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="入院病区：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手术科室：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="入院诊断：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="嘱托：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="预交金(元)：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
        </div>
      </div>
      <div class="info-box">
        <div class="info-title">手术信息</div>
        <div class="info-content">
            <el-form-item label="主切医生" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手机号码：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="执行手术：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="执行麻醉：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="拟行麻醉：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="麻醉医生：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="麻醉医生电话：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="发送手术室：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="侧别：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="体位：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="术前诊断：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="切口等级：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="特殊感染：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="特殊要求：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="部位1：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="部位2：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="备血：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="指导医生：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手术1助：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手术2助：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="手术3助：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="常服抗凝药：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="常服抗凝药：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="其它：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="需术前停药：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="术前诊断2：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="术前诊断3：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="术前诊断4：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="植入物：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="植入物说明：" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
        </div>
      </div>

    </el-form>

    <div class="footer-btns">
      <el-button size="small" type="primary">保存</el-button>
      <el-button size="small" type="primary">申请</el-button>
      <el-button size="small" type="primary">预约</el-button>
      <el-button size="small">撤销</el-button>
      <el-button size="small" type="primary" plain>入院通知书</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ruleForm: {
        name: ''
      },
      rules: {
        name: [
          {required: true, message: '请输入病人姓名', trigger:'blur'}
        ]
      }
    };
  },
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.apply-content{
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 20px;
}
.title{
  background-color: #42CDA4;
  height: 35px;
  width: 120px;
  line-height: 35px;
  text-align: center;
  color: #fff;
  margin-bottom: 20px;
}
.info-box{
  border: 1px solid #DCDCDC;
  margin-bottom: 30px;
  .info-title{
    background-color: #F8F8F8;
    border-bottom: 1px solid #DCDCDC;
    padding: 0 15px;
    height: 49px;
    line-height: 49px;
    color: #595757;
    font-weight: 400;
  }
  .info-content{
    padding: 20px;
  }
}
.footer-btns{
  text-align: center;
}
</style>
