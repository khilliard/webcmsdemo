<template>
	<div>
		<!-- Edit player form popup -->
		<v-dialog v-model="editPopup" max-width="600">
			<template v-slot:activator="{ on }">
				<div @click="initPopup" v-on="on">
					<!-- slot contains presentation markup/display -->
					<slot></slot>
				</div>
			</template>
			<!-- player edit (update/delete) form -->
			<v-card outline>
				<v-card-title>
					Edit Player Definition
				</v-card-title>
				<v-card-text>
					<v-form>
						<v-text-field v-model="name" label="Name" />
						<v-text-field v-model="location" label="Location" />
						<v-text-field
							v-model="assignedPresentation"
							label="Assigned presentation"
							readonly
						/>
						<v-text-field
							v-model="assignedSchedule"
							label="Assigned schedule"
							readonly
						/>
						<v-row>
							<v-col cols="4" sm="2">
								<v-btn
									class="primary"
									@click="updatePlayer"
									:disabled="name.length == 0 || waiting"
									>Update</v-btn
								>
							</v-col>
							<v-col cols="4" sm="2">
								<v-btn class="red" @click="confirmPopup = true">Delete</v-btn>
							</v-col>
							<v-col cols="4" sm="2">
								<v-btn @click="editPopup = false">Close</v-btn>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- Player delete confirm popup -->
		<v-dialog v-model="confirmPopup" max-width="250">
			<v-card outline>
				<v-card-title>Are you sure?</v-card-title>
				<v-card-text>
					<v-form>
						<v-btn color="red" :disabled="waiting" @click="deletePlayer"
							>Yes</v-btn
						>
						<v-btn class="ml-3" @click="confirmPopup = false">Cancel</v-btn>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import firebaseApp from "@/firebase"

export default {
	name: "PlayerEditControl",
	props: ["player"],

	data() {
		return {
			editPopup: false,
			name: "",
			location: "",
			authcode: "",
			confirmPopup: false,
			waiting: false,
			assignedPresentation: "Not assigned",
			assignedSchedule: "Not assigned"
		}
	},

	computed: {
		playerData() {
			return this.player.data()
		}
	},

	methods: {
		// initialize form field on popup display
		initPopup() {
			this.name = this.playerData.name
			this.location = this.playerData.location
			this.authcode = this.playerData.authcode
			this.waiting = false
			// Retrieve (any) presentation assigned to this player
			const data = this.player.data()
			if (data.assignedTo) {
				firebaseApp.retrieveDocument(data.assignedTo).then(presentation => {
					this.assignedPresentation = presentation.data().name
				})
			}
			// retrieve (any) schedule assigned to this player
			console.log(`player assigned schedule: ${data.schedule}`)
			if (data.schedule) {
				firebaseApp.retrieveDocument(data.schedule).then(schedule => {
					this.assignedSchedule = schedule.data().name
				})
			}
		},
		// update player document on firestore database
		async updatePlayer() {
			console.log(
				`updating player - name: ${this.name}, location: ${this.location}`
			)
			this.waiting = true
			try {
				await firebaseApp.updateDocument(this.player, {
					name: this.name,
					location: this.location
				})
			} catch (error) {
				console.log("***** detected error", error)
			} finally {
				this.editPopup = false
				this.waiting = false
			}
		},
		// delete player document on firestore database
		async deletePlayer() {
			console.log("deleting player")
			this.waiting = true
			try {
				await firebaseApp.deleteDocument(this.player)
				console.log("media player successfully deleted")
			} catch (error) {
				console.log("***** detected error", error)
			} finally {
				this.confirmPopup = false
				this.waiting = true
			}
		}
	}
}
</script>
