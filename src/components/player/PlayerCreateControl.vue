<template>
	<div>
		<!-- Popup dialog used to display player create form -->
		<v-dialog v-model="createPopup" max-width="600">
			<template v-slot:activator="{ on }">
				<!-- Popup create form dialog on button click -->
				<v-btn color="amber" text @click="initPopup" v-on="on">Create</v-btn>
			</template>
			<!-- Player create form -->
			<v-card outline>
				<v-card-title class="color: primary;">
					Media Player Definition
				</v-card-title>
				<v-divider />
				<v-card-text>
					<!-- Actual player create form -->
					<v-form>
						<v-text-field v-model="name" autofocus label="Media player name" />
						<v-text-field v-model="location" label="Location (optional)" />
						<v-text-field
							v-model="authcode"
							readonly
							label="Player authentication code"
						/>
						<v-btn
							class="primary"
							:disabled="!isValid || waiting"
							@click="createPlayer"
							>Create</v-btn
						>
						<v-btn class="ml-3" @click="createPopup = false">Close</v-btn>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- Display after player created message -->
		<v-snackbar
			v-model="playerCreated"
			color="primary"
			multi-line
			:timeout="10000"
			top
		>
			<span>
				Click item to edit. Use authcode to register media player with CMS.
			</span>
			<v-btn text dark class="ml-3 black" @click="playerCreated = false">
				Close
			</v-btn>
		</v-snackbar>
	</div>
</template>

<script>
import firebaseApp from "@/firebase"

export default {
	name: "PlayerCreateControl",

	data() {
		return {
			name: "",
			location: "",
			authcode: "",
			createPopup: false,
			playerCreated: false,
			waiting: false
		}
	},

	computed: {
		isValid() {
			const name = this.name.trim()
			return name.length > 0
		}
	},

	methods: {
		// Generate random code used to register/authenticate/identify media players
		genAuthCode() {
			const authcode = window.crypto
				.getRandomValues(new Uint32Array(1))[0]
				.toString(16)
				.toUpperCase()
			console.log(`generated auth code: {authcode}`)
			return authcode
		},
		// Initialize form field data
		initPopup() {
			this.name = ""
			this.location = ""
			this.authcode = this.genAuthCode()
			this.waiting = false
		},
		createPlayer() {
			console.log(
				`creating media player - name: ${this.name}, auth: ${this.authcode}, location: ${this.location}`
			)
			this.waiting = true
			try {
				// Create new player document on firestore database
				firebaseApp.addDocument("players", {
					name: this.name,
					location: this.location,
					authcode: this.authcode
				})
				// Display after create message
				this.playerCreated = true
			} catch (error) {
				console.log("detected error adding player to firestore database", error)
			} finally {
				this.createPopup = false
				this.waiting = false
			}
		}
	}
}
</script>
