<template>
	<!-- Custom control used to edit/update presentation -->
	<div>
		<!-- presentation edit form popup -->
		<v-dialog v-model="editPopup" max-width="600">
			<template v-slot:activator="{ on }">
				<span style="display: block;" @click="initPopup" v-on="on">
					<slot>
						<!-- enclosed (parent) presentation content -->
					</slot>
				</span>
			</template>
			<v-card outline>
				<v-card-title class="primary mb-3">Edit Presentation</v-card-title>
				<v-card-text>
					<!-- presentation edit form -->
					<v-form>
						<v-text-field
							v-model="name"
							label="Presentation name"
							autofocus
							required
						/>
						<v-text-field
							:value="fileName"
							readonly
							label="Uploaded presentation file"
							prepend-icon="mdi-file-document-outline"
						/>
						<v-row>
							<v-col cols="4" sm="2">
								<v-btn
									class="mr-2 mb-3"
									color="primary"
									:disabled="waiting"
									@click="updatePresentation"
									>Update</v-btn
								>
							</v-col>
							<v-col cols="4" sm="2">
								<v-btn
									class="mr-2 mb-3"
									color="red"
									:disabled="waiting"
									@click="confirmPopup = true"
									>Delete</v-btn
								>
							</v-col>
							<v-col cols="4" sm="2">
								<!-- allow user to assign player(s) to this presentation -->
								<assign :presentation="presentation" />
							</v-col>
							<v-col cols="4" sm="2">
								<v-btn class="mb-3" @click="editPopup = false">Close</v-btn>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- delete presentation confirm popup -->
		<v-dialog v-model="confirmPopup" max-width="250">
			<v-card outline>
				<v-card-title>Are you sure?</v-card-title>
				<v-card-text>
					<v-form>
						<v-btn color="red" :disabled="waiting" @click="deletePresentation"
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
import { mapState } from "vuex"
import Assign from "@/components/player/Assign"

export default {
	name: "PresentationEditControl",
	props: ["presentation"],

	components: {
		Assign
	},

	data() {
		return {
			editPopup: false,
			name: "",
			confirmPopup: false,
			waiting: false
		}
	},

	computed: {
		...mapState(["players", "schedules"]),
		presentationData() {
			// retrieve resource data from firestore document object
			return this.presentation.data()
		},
		fileName() {
			// extract basename from file pathname
			return this.presentationData.filePath.split("/").pop()
		}
	},

	methods: {
		initPopup() {
			this.name = this.presentationData.name
			console.log(`presentation path: ${this.presentation.ref.path}`)
		},
		async updatePresentation() {
			console.log(`changing presentation name to ${this.name}`)
			this.waiting = true
			try {
				await firebaseApp.updateDocument(this.presentation, {
					name: this.name
				})
			} catch (error) {
				console.log("detected error updating presentation name", error)
			} finally {
				this.editPopup = false
				this.waiting = false
			}
		},

		////////////////////////////////////////////////////////////////////
		// Deleting presentation 																					//
		// Will have to undo any player assignment to this presentation 	//
		// Will have to delete any schedule linked to this presentation 	//
		////////////////////////////////////////////////////////////////////
		async deletePresentation() {
			console.log(
				`deleting presentation - name: ${this.presentationData.name}, id: ${this.presentation.id}`
			)
			this.waiting = true
			const presentationPath = this.presentation.ref.path
			try {
				// delete uploaded presentation file from firebase storage
				console.log("removing uploaded file from firestore storage")
				await firebaseApp.deleteFile(this.presentationData.filePath)
				// delete associated presentation resource object from firestore database
				console.log("file delete completed")
				await firebaseApp.deleteDocument(this.presentation)
				const promises = []
				// check each player for presentation assignment
				this.players.forEach(player => {
					let data = player.data()
					// check if player assigned to this (soon to be) deleted presentation
					if (data.assignedTo == presentationPath) {
						console.log(
							`removing assigned presentation from player '${data.name}'`
						)
						// undo assignment
						data.assignedTo = null
						promises.push(firebaseApp.updateDocument(player, data))
					}
				})
				// check each schedule for presentation links
				this.schedules.forEach(schedule => {
					let data = schedule.data()
					// check if schedule linked to (soon to be) deleted presentation
					if (data.presentation == presentationPath) {
						// going to delete schedule, so first check player schedule assignments
						this.players.forEach(player => {
							const playerData = player.data()
							// check if player assigned to schedule
							if (playerData.schedule == schedule.ref.path) {
								// undo schedule assignment
								playerData.schedule = null
								promises.push(firebaseApp.updateDocument(player, playerData))
							}
						})
						// delete linked schedule
						promises.push(firebaseApp.deleteDocument(schedule))
					}
				})
				// wait for all the async firestore database updates/deletes to complete
				await Promise.all(promises)
			} catch (error) {
				console.log("detected error deleting presentation", error)
			} finally {
				this.editPopup = false
				this.waiting = false
				this.confirmPopup = false
			}
		}
	}
}
</script>
