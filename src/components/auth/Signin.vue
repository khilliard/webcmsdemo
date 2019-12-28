<template>
	<v-card outlined>
		<v-card-text>
			<v-form ref="loginForm" v-model="valid" :lazy-validation="true">
				<v-text-field
					v-model="email"
					:rules="emailRules"
					validate-on-blur
					type="email"
					label="Email"
					required
				/>
				<v-text-field
					v-model="password"
					:rules="passwordRules"
					validate-on-blur
					type="password"
					label="Password"
					required
				/>
				<v-btn
					class="mt-2 primary"
					@click="submit('login')"
					:loading="loginWaiting"
					:disabled="loginWaiting"
					color="indigo"
					>Login</v-btn
				>
			</v-form>
			<div class="mt-3 red--text">{{ errorMsg }}</div>
		</v-card-text>
	</v-card>
</template>

<script>
import firebaseApp from "@/firebase"

export default {
	name: "Signin",

	data: () => ({
		email: "",
		password: "",
		// password form input validation rules
		passwordRules: [
			v => !!v || "Password is required",
			v => (v && v.length >= 6) || "Password must be at least 6 characters"
		],
		// email form input validation rules
		emailRules: [
			v => !!v || "E-mail is required",
			v => /.+@.+\..+/.test(v) || "Enter a valid email address"
		],
		valid: false,
		errorMsg: "",
		loginWaiting: false,
		activeLoginTab: 0
	}),

	methods: {
		async submit(method) {
			// ensure login/signup form has required and valid inputs
			if (this.$refs.loginForm.validate()) {
				console.log("form validated")
				this.errorMsg = ""
				try {
					this.loginWaiting = true
					// log user into firestore
					await firebaseApp.login(this.email, this.password)
					console.log("user signup/authentication successful")
					// redirect to home page
					this.$router.push("/")
				} catch (error) {
					// catch any firestore auth errors
					console.log(`login error: ${error.message}`)
					this.loginWaiting = false
					this.$refs.loginForm.reset()
					this.errorMsg = "CMS login failed, please retry"
				}
			} else {
				console.log("form not valid")
			}
		}
	}
}
</script>
