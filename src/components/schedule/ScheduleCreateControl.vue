<template>
	<!-- This is a custom input control used to create/edit presentation schedules -->
	<div>
		<v-dialog v-model="createPopup" max-width="600">
			<template v-slot:activator="{ on }">
				<!-- If passed a schedule in props then allow user editing -->
				<span
					v-if="schedule"
					style="display: block;"
					@click="initPopup"
					v-on="on"
				>
					<slot>
						<!-- enclosed (parent) schedule content -->
					</slot>
				</span>
				<!-- Otherwise support new schedule creation -->
				<v-btn
					v-else
					color="amber"
					text
					@click="initPopup"
					:disabled="presentations.length == 0"
					v-on="on"
					>Create</v-btn
				>
			</template>
			<v-card outlined>
				<v-card-title class="primary mb-2"
					>{{ schedule ? "Update" : "Create" }} Schedule</v-card-title
				>
				<v-card-text>
					<v-form ref="scheduleCreateForm" v-model="valid">
						<v-text-field
							v-model="name"
							label="Schedule description"
							validate-on-blur
							:rules="nameRules"
						/>
						<v-select
							v-model="selectedPresentationID"
							label="Scheduled presentation"
							item-text="name"
							item-value="id"
							validate-on-blur
							:rules="selectRules"
							:items="presentationList"
						>
						</v-select>
						<v-row>
							<v-col cols="12" sm="6">
								<time-field v-model="startTime" label="Start time" />
							</v-col>
							<v-col cols="12" sm="6">
								<time-field v-model="endTime" label="End time" />
							</v-col>
						</v-row>
						<v-row>
							<v-col cols="12" sm="6">
								<date-field v-model="startDate" label="Start date (optional)" />
							</v-col>
							<v-col cols="12" sm="6">
								<date-field v-model="endDate" label="End date (optional)" />
							</v-col>
						</v-row>
						<v-row class="mb-3">
							<v-col cols="5" sm="2">
								<v-btn
									color="primary"
									:disabled="!isValid"
									:loading="waiting"
									@click="createSchedule"
									>{{ schedule ? "Update" : "Create" }}</v-btn
								>
							</v-col>
							<v-col v-if="schedule" cols="5" sm="2">
								<v-btn color="red" @click="confirmPopup = true">Delete</v-btn>
							</v-col>
							<v-col cols="5" sm="2" class="ml-2--xs">
								<v-btn @click="createPopup = false">Cancel</v-btn>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
			</v-card>
		</v-dialog>
		<!-- schedule delete confirm popup -->
		<v-dialog v-model="confirmPopup" max-width="250">
			<v-card outline>
				<v-card-title>Are you sure?</v-card-title>
				<v-card-text>
					<v-form>
						<v-btn
							color="red"
							:loading="waiting"
							:disabled="waiting"
							@click="deleteSchedule"
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
import { mapState, mapGetters } from "vuex"
import firebaseApp from "@/firebase"
import DateField from "@/components/UI/DateField"
import TimeField from "@/components/UI/TimeField"

export default {
	name: "ScheduleCreateControl",
	components: {
		DateField,
		TimeField
	},

	props: ["schedule"],

	data() {
		return {
			name: "",
			valid: false,
			createPopup: false,
			startDate: null,
			endDate: null,
			startTime: null,
			endTime: null,
			selectedPresentationID: null,
			nameRules: [v => !!v || "A description is required"],
			selectRules: [v => !!v || "Select presentation to schedule for display"],
			waiting: false,
			confirmPopup: false
		}
	},

	computed: {
		...mapGetters(["presentations"]),
		...mapState(["players"]),
		presentationList() {
			return this.presentations.map(presentation => ({
				name: presentation.data().name,
				id: presentation.id
			}))
		},
		isValid() {
			let result =
				this.valid &&
				this.startTime &&
				this.startTime.length > 0 &&
				this.endTime &&
				this.endTime.length &&
				!this.waiting
			return result
		},
		scheduleData() {
			return this.schedule && this.schedule.data()
		}
	},

	methods: {
		// initialize schedule data, either null state or to existing schedule
		initPopup() {
			this.name = this.schedule ? this.scheduleData.name : ""
			if (this.schedule) {
				const presentation = this.presentations.find(
					presentation =>
						presentation.ref.path === this.scheduleData.presentation
				)
				console.log(
					"selected presentation",
					presentation.data().name,
					presentation.id
				)
				this.selectedPresentationID = presentation.id
			}
			this.startDate = this.schedule ? this.scheduleData.startDate : null
			this.endDate = this.schedule ? this.scheduleData.endDate : null
			this.startTime = this.schedule ? this.scheduleData.startTime : null
			this.endTime = this.schedule ? this.scheduleData.endTime : null
		},
		// create and save presentation schedule
		async createSchedule() {
			this.waiting = true
			let today = new Date()
			const year = today.getFullYear()
			// if no start date entered then default to "today", stripping off time component
			const startDate = this.startDate
				? this.startDate
				: today.toISOString().split("T")[0]
			// if no end date entered then default to 1-year from "today"
			const endDate = this.endDate
				? this.endDate
				: new Date(today.setFullYear(year + 1)).toISOString().split("T")[0]
			const presentation = this.presentations.find(
				presentation => presentation.id === this.selectedPresentationID
			)
			const scheduleDoc = {
				name: this.name,
				presentation: presentation.ref.path,
				startTime: this.startTime,
				endTime: this.endTime,
				startDate,
				endDate
			}
			console.log("schedule doc:", scheduleDoc)
			try {
				// create or update schedule in firestore database
				this.schedule
					? await firebaseApp.updateDocument(this.schedule, scheduleDoc)
					: await firebaseApp.addDocument("schedules", scheduleDoc)
			} catch (error) {
				console.log("detected error creating schedule", error)
			} finally {
				this.createPopup = false
				this.waiting = false
			}
		},

		//////////////////////////////////////////////////////////////
		// Delete presentation schedule 														//
		// Will have to undo any player assigned to this schedule 	//
		//////////////////////////////////////////////////////////////
		async deleteSchedule() {
			this.waiting = true
			const schedulePath = this.schedule.ref.path
			try {
				await firebaseApp.deleteDocument(this.schedule)
				const promises = []
				// check all players schedule assignments
				this.players.forEach(player => {
					let data = player.data()
					// check if player assigned to (soon to be) deleted schedule
					if (data.schedule == schedulePath) {
						console.log(`removing assigned schedule from player '${data.name}'`)
						// undo assignment
						data.schedule = null
						promises.push(firebaseApp.updateDocument(player, data))
					}
				})
				await Promise.all(promises)
			} catch (error) {
				console.log("detected error deleting schedule", error)
			} finally {
				this.confirmPopup = false
				this.createPopup = false
				this.waiting = false
			}
		}
	}
}
</script>
