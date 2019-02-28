import components from './components';

const Load = function(container) {

    Vue.use(function(Vue) {
        Vue.prototype.$ngettext = ngettext;
        Vue.prototype.$npgettext = npgettext;
    });

    // Инициализируем Vue
    return new Vue({
        el: '#' + container,
        components: components,
        mounted() {
        	this.$gettext('App mounted');
        }
    });
};

export { Load };
