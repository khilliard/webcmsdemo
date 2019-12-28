import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home"
import Players from "@/views/Players"
import Schedules from "@/views/Schedules"
import Login from "@/views/Login"
import store from "@/store"
import firebaseApp from "@/firebase"

Vue.use(VueRouter)

const routes = [
	{
		path: "/",
		name: "home",
		component: Home,
		meta: { requiresAuth: true }
	},
	{
		path: "/players",
		name: "players",
		component: Players,
		meta: { requiresAuth: true }
	},
	{
		path: "/schedules",
		name: "schedules",
		component: Schedules
	},
	{
		path: "/login",
		name: "login",
		component: Login
	},
	{
		path: "/about",
		name: "about",
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () =>
			import(/* webpackChunkName: "about" */ "../views/About.vue")
	}
]

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes
})

router.beforeEach((to, from, next) => {
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (store.state.user) {
			// check if user has been logged on "too long"
			const today = new Date()
			const lastLogin = new Date(
				Date.parse(store.state.user.metadata.lastSignInTime)
			)
			const loginTime = Math.floor((today - lastLogin) / (60000 * 60))
			// check if user has been logged in too long
			if (loginTime > 3) {
				console.log(
					`user has been logged in ${loginTime} hours, forcing user out`
				)
				firebaseApp.auth.signOut()
			}
			next()
		} else {
			console.log(
				`route ${to.name} requires authentication, redirecting to ${to.fullPath}`
			)
			next("/login")
		}
	} else {
		next()
	}
})

export default router
