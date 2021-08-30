<template>
    <div class="sz-select"
        :id="guid"
        :style="{
            width,
            'min-height': height
        }">
        <!--  
          :remote-method="remoteMethod"
         -->
        <el-select
          ref="elSelect"
          v-model="temp"
          :size="size"
          :filterable="filterable"
          :allow-create="allowCreate"
          :remote="remote"
          :remote-method="remoteMethod"
          :disabled="disabled"
          :clearable="clearable"
          :multiple="multiple"
          :reserve-keyword="reserveKeyword"
          :automatic-dropdown="automaticDropdown"
          :placeholder="placeholder"
          :value-key="valueKey"
          :style="{
            'height': height,
            'width': '100%'
          }"
          @change="change"
          @focus="focus"
          @blur="blur"
          @visible-change="visibleChange"
            >
            <slot></slot>
        </el-select>
    </div>
</template>
<script>
export default {
    props: {
        value: {
          type: String | Boolean | Number
        },
        width: {
            default: "300px",
            type: String
        },
        height: {
            default: "32px",
            type: String
        },
        firstLoad: {
          default: true,
          type: Boolean
        },
        disabled: {
          default: false,
          type: Boolean
        },
        allowCreate: {
          default: false,
          type: Boolean
        },
        clearable: {
          default: false,
          type: Boolean
        },
        placeholder: {
          default: "请输入关键字",
          type: String
        },
        automaticDropdown: {
          default: false,
          type: Boolean
        },
        reserveKeyword: {
          default: false,
          type: Boolean
        },
        multiple: {
          default: false,
          type: Boolean
        },
        remote: {
          default: false,
          type: Boolean
        },
        allowCreate: {
          default: false,
          type: Boolean
        },
        filterable: {
          default: false,
          type: Boolean
        },
        customizeable: {
          default: false,
          type: Boolean
        },
        options: {
          default: function(){
            return []
          },
          type: Array
        },
        size: {
          default: 'small',
          type: String
        },
        valueKey: {
          default: 'value',
          type: String
        },
        customizeCodeName: {
          default: 'customize',
          type: String
        },
        customizeLabel: {
          type: String | Boolean | Number
        },
        remoteMethod: {
          default: function(){
            return ()=>{

            }
          },
          type: Function
        }
    },
    watch: {
        value: {
          handler(newVal, oldVal){
            this.temp = newVal
            if(this.customizeCodeName == newVal){
              this.temp = this.customizeLabel;
            }
            // if(this.$refs.elSelect && !this.getCurVal){
            //   this.$refs.elSelect.visible = true;
            // }
          },
          immediate: true,
          deep: true
        }
    },
    computed: {
        guid() {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (
                S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()
            );
        },
    },
    data() {
      return {
        selecting: false,
        getCurVal: false,
        loading: false,
        temp: '',
        inputNode: null
      }
    },
    mounted() {
      if(this.filterable && this.customizeable && this.allowCreate){
        if(this.multiple){
          this.inputNode = document.getElementById(this.guid).getElementsByClassName('el-select__tags')[0].getElementsByClassName('el-select__input')[0];
        }else{
          this.inputNode = document.getElementById(this.guid).getElementsByClassName('el-input__inner')[0];
        }
        this.inputNode.addEventListener("input", this.inputMethod)
      }
    },
    destroyed () {
      this.inputNode.removeEventListener("input", this.inputMethod)
    },
    methods: {
      // remoteMethod(query) {
      //   if (this.firstLoad || query !== '' ) {
      //     this.loading = true;
      //     setTimeout(() => {
      //       this.loading = false;
      //       this.options = this.list.filter(item => {
      //         return item.label.toLowerCase()
      //           .indexOf(query.toLowerCase()) > -1;
      //       });
      //     }, 200);
      //   } else {
      //     this.options = [];
      //   }
      // },
      focus(flag){
        // console.log('focus------->', this.inputNode.value, this.inputNode.placeholder)
        // this.remoteMethod(this.value);
        this.$emit('focus')
        this.$refs.elSelect.visible = true;
      },
      blur(flag){
        // console.log('blur------->', this.inputNode.value, this.inputNode.placeholder)
      },
      change(val){
        this.$emit('input', val);
        this.$emit('change', val)
        this.selecting = false;
        if(this.filterable && this.customizeable && this.allowCreate){
          setTimeout(()=>{
            this.$refs.elSelect.visible = false;
          })
        }
      },
      visibleChange(flag){
        let selectionStart = this.inputNode.selectionStart
        let selectionEnd = this.inputNode.selectionEnd
        if(flag){ //相当于聚焦
          if(this.filterable && this.customizeable && this.allowCreate){
            this.selecting = true;
            this.getCurVal = false
            setTimeout(()=>{
                if(!this.multiple && this.inputNode.placeholder != this.placeholder){
                  this.inputNode.value = this.inputNode.placeholder
                }
                setTimeout(()=>{
                  this.inputNode.selectionStart = selectionStart
                  this.inputNode.selectionEnd = selectionEnd
                }, 0)
            })
          }
        } else {
          if(this.filterable && this.customizeable && this.allowCreate){
            if(this.selecting){
              if(this.multiple){
                let arr = [...this.value]
                arr.push(this.inputNode.value)
                this.$refs.elSelect.selected = arr;
                this.$emit('input', arr)
                this.temp = arr
              }else{
                this.$emit('input', this.inputNode.value)
                this.$emit('change', this.inputNode.value, this.customizeCodeName)
                this.temp = this.inputNode.value
              }
              this.getCurVal = true;
            }
            setTimeout(()=>{
              this.inputNode.removeAttribute("readonly")
            })
          }
        }
      },
      inputMethod(e){
        this.$refs.elSelect.visible = true;
      }
    }
  }
</script>

<style lang="scss" scoped>
    .sz-select{
        position: relative;
        overflow: hidden;
        .sz-select__tags{
            position: relative;
            line-height: normal;
            white-space: normal;
            z-index: 1;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            input{
                flex-grow: 1;
                border: none;
                outline: none;
                padding: 0;
                margin-left: 15px;
                color: #666;
                font-size: 14px;
                appearance: none;
                height: 28px;
                width: 100%;
                background-color: transparent;
                background-color: #f5f5f5;
            }
        }
    }
</style>