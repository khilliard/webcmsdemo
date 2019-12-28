<template>
	<v-app>
		<v-navigation-drawer v-model="navPanel" app mobile-break-point="1024">
			<v-list>
				<v-subheader class="amber--text mb-2">CMS Menu</v-subheader>
				<v-list-item
					v-for="link in navLinks"
					link
					:to="link.route"
					:key="link.text"
				>
					<v-list-item-icon>
						<v-icon class="white--text">{{ link.icon }}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title v-text="link.text"></v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
		<v-app-bar app color="black" dark>
			<v-app-bar-nav-icon @click="navPanel = !navPanel"></v-app-bar-nav-icon>
			<div class="d-flex align-center">
				<span>WebCMS</span>
			</div>

			<v-spacer></v-spacer>

			<v-btn v-if="isLoggedIn" text @click="logout">
				<span class="mr-2">Logout</span>
				<v-icon>mdi-logout</v-icon>
			</v-btn>
		</v-app-bar>

		<v-content>
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
import firebaseApp from "@/firebase"
import { mapGetters } from "vuex"

export default {
	name: "App",

	components: {},

	data: () => ({
		//
		unsubscribes: [],
		navPanel: false,
		navLinks: [
			{
				icon: "mdi-file-document-box-multiple",
				text: "Presentations",
				route: "/"
			},
			{
				icon: "mdi-tablet-cellphone",
				text: "Media Players",
				route: "/players"
			},
			{ icon: "mdi-clock-outline", text: "Schedules", route: "/schedules" },
			{ icon: "mdi-information", text: "About", route: "/about" }
		]
	}),

	computed: {
		...mapGetters(["isLoggedIn"])
	},

	methods: {
		logout() {
			console.log("logging out of firebase")
			firebaseApp.auth.signOut()
		}
	}
}
</script>
