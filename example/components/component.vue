<template>
    <div class="blackout show" v-if="isShow" @click="isShow = false">
        <div class="popup show" @click.stop>
            <div class="popup__close" @click="isShow = false"><i class="icon icon-close-big"></i></div>
            <div class="popup__head">{{subject}}</div>
            <div class="popup__wrapper">
                <p>{{msg}}</p>
                <a @click="isShow = false" class="btn btn--accent">{{$gettext('Close')}}</a>
            </div>
        </div>
    </div>
</template>

<script>
// Стандатрное инфомационное окно
export default
{
    data: function() {
        return {
            msg: 'Text message',
            subject: 'Header'
        };
    },
    mounted: function() {
        console.log(this.$gettext('Start'))
    }
};
</script>
