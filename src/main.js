import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"

import firebaseApp from "./firebase"
import vuetify from "./plugins/vuetify"

Vue.config.productionTip = false

var vueRoot

let initialized = false
// method used to create root vue instance
const createVueInstance = () => {
	console.log("creating root vue instance")
	vueRoot = new Vue({
		router,
		store,
		vuetify,
		render: h => h(App)
	}).$mount("#app")
}

// Initialize firebase subscription/listeners then create vue root instance
firebaseApp.startup().then(() => {
	console.log("firebase initialized, create vue root instance")
	createVueInstance()
})
