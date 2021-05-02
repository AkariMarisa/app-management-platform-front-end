<template>
    <div class="home">
        <div class="form-box">
            <div style="margin-bottom: 20px;">欢迎使用XXX分发平台</div>
            <InputText class="p-inputtext-lg" type="text" v-model="userName" placeholder="请输入用户名" style="margin-bottom: 20px;border-radius: 10px" />
            <InputText class="p-inputtext-lg" type="text" v-model="passwd" placeholder="请输入密码" style="margin-bottom: 20px;border-radius: 10px" />
            <Button label="登 录" @click="toLogin" class="p-button-raised p-button-rounded" />
        </div>
    </div>
</template>
<script>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
export default {
    components: { Button, InputText },
    name: 'Login',
    data() {
        return {
            data: {
                userName: '',
                passwd: ''
            }
        }
    },
    methods: {
        toLogin() {

        }
    }
}
</script>
<style>
.home {
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
.form-box {
    width: 300px;
    text-align: center;
    box-shadow: rgba(33, 33, 33, 0.2) 5px 5px 10px 10px;
    border-radius: 30px;
    padding: 20px;
}
</style>