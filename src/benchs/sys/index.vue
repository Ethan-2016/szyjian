<template>
    <div id="content">
        <top-bar></top-bar>
        <div class="child-content" :style="{height:childHeight}">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    // import Watermark from '@/utils/watermark';
    import topBar from "@/components/Topbar3/index.vue";
    import saFooter from "@/components/Footer/index.vue";
    export default {
        components: {
            topBar,
            saFooter
        },
        data() {
            return {
                childHeight:'calc(100% - 48px)',
            }
        },
        computed: {},
        created: function() {
            
        },
        mounted: function(){
            
        },
        watch: {
           
        }
    }
</script>

<style lang="scss" scoped>
    #content {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: #f3f7fa;
    }
    .child-content{
        width: 100%;
    }
    
</style>
