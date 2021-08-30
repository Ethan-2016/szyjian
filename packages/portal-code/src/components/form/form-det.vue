<template>	
	<span class="form-line">
			<template >
                <span >{{item.name}}</span>
            </template>
            <!-- <template v-if="item.detailEnum===1">
                <span >{{item.name}}</span>
            </template>
            <template v-if="item.detailEnum===2">
                <span >{{item.name}}</span>
            </template>
			<template v-if="item.detailEnum===3">
                <span >{{item.name}}</span>
            </template>
			<template v-if="item.detailEnum===4">
                <span >{{item.name}}</span>
            </template>
			<template v-if="item.detailEnum===5">
                <span >{{item.name}}</span>
            </template>
			<template v-if="item.detailEnum===6">
                <span >{{item.name}}</span>
            </template> -->
			<template v-if="item.childrenDto && item.childrenDto.length>0">
				<form-det :formDate = "item.childrenDto" ></form-det>
			</template>
	</span>
</template>

<script>
	// import bus from '../form/bus.js'
	export default{
		name:'FormDet',
		props:{
			formDate:{
				type:Array,
				default:()=>{
					return [];
				}
			},
			activeData:{
				type:Array,
				default:()=>{
					return [];
				}
			}
		},
		data(){
			return {
				detailList:[],
			}
		},
		mounted(){
			console.log(this.formDate)
			
		},
		computed: {
			
		},
		
		methods:{
			uuid(){
				let str = Math.random().toString(32);
				str = str.substr();
				return str
			},
			dateChange(e,eItem){
				this.formDate.forEach(itemA=>{
					if(eItem.id===itemA.id){
						itemA.value = e.detail.value;
					}
				})
				bus.$emit('backDeal',eItem)
			},
			radioChange(e,eItem){
				this.formDate.forEach(itemA=>{
					if(eItem.id===itemA.id){
						itemA.value = e.detail.value;
					}else{
						itemA.value = "";
					}
				})
				eItem.value = e.detail.value;
				bus.$emit('backDeal',eItem)
			},
			checkboxChange(e,eItem){
				eItem.value = e.detail.value.length===1?e.detail.value[0]:"";
				bus.$emit('backDeal',eItem)
			},
			inputBlur(e,eItem){
				console.log(eItem)
				// if(eItem.detailEnum==='input'){
				// 	eItem.value = e.detail.value;
				// }else if(eItem.detailEnum==='checkbox_input'){
				// 	eItem.remark = e.detail.value;
				// }
				bus.$emit('backDeal',eItem)
			},
			btnTap(eItem){
				// if(eItem.type==='sign') eItem.value = eItem.optionValue;
				bus.$emit('backDeal',eItem)
			},
			
		},
		
	}
</script>

<style lang="scss" scoped>
	
</style>
