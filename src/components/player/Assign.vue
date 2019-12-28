<template>
	<!-- Allow user to assign a player to a schedule or presention -->
	<div>
		<v-dialog v-model="assignPopup" max-width="450">
			<template v-slot:activator="{ on }">
				<v-btn color="amber" text outlined @click="initPopup" v-on="on"
					>Assign</v-btn
				>
			</template>
			<div>
				<v-card outlined>
					<v-card-title class="primary">
						Assigned Media Players
					</v-card-title>
					<v-card-text>
						<p class="assign-title">
							Select players assigned to
							<span class="amber--text">{{ name }}</span>
						</p>
						<!-- list all players and their checked state -->
						<div class="player-select" v-for="map in playerMap" :key="map.id">
							<v-checkbox v-model="map.checkState" :label="map.name">
							</v-checkbox>
						</div>
					</v-card-text>
					<v-card-actions class="mb-2">
						<v-btn
							color="primary"
							:loading="waiting"
							:disabled="waiting"
							@click="assignPlayers"
							>Assign</v-btn
						>
						<v-btn class="ml-3" @click="assignPopup = false">Cancel</v-btn>
					</v-card-actions>
				</v-card>
			</div>
		</v-dialog>
	</div>
</template>

<script>
import firebaseApp from "@/firebase"
import { mapState } from "vuex"

export default {
	name: "Assign",

	props: ["presentation", "schedule", "color"],

	data() {
		return {
			assignPopup: false,
			playerMap: [],
			waiting: false
		}
	},

	computed: {
		...mapState(["players"]),
		// extract schedule or presentation name
		name() {
			return this.schedule
				? this.schedule.data().name
				: this.presentation.data().name
		}
	},

	methods: {
		initPopup() {
			this.playerMap = this.players.map(player => {
				let data = player.data()
				let pmap = {
					player,
					name: data.name,
					id: player.id,
					// set check state true if assigned to this presentation, else set false
					checkState: this.isChecked(data),
					startingCheckState: this.isChecked(data)
				}
				return pmap
			})
		},
		// determine if player assignment state is checked or not
		isChecked(data) {
			if (this.schedule) {
				// check if player assigned to schedule
				return data.schedule
					? data.schedule == this.schedule.ref.path
						? true
						: false
					: false
			} else {
				// check if player assigned to presentation
				return data.assignedTo
					? data.assignedTo == this.presentation.ref.path
						? true
						: false
					: false
			}
		},
		// Update any changed media player presentation assignments
		async assignPlayers() {
			console.log("updating any changed player assignments")
			this.playerMap.forEach(map => {
				const player = map.player
				const data = player.data()
				// Check if player's assignment state changed
				if (map.checkState != map.startingCheckState) {
					// check if player now assigned to presentation/schedule, else clear existing assignment
					if (this.schedule) {
						data.schedule = map.checkState ? this.schedule.ref.path : null
					} else {
						data.assignedTo = map.checkState ? this.presentation.ref.path : null
					}
					this.waiting = true
					console.log("updating player data:", data)
					try {
						firebaseApp.updateDocument(player, data)
					} catch (error) {
						console.log(
							"***** error, unable to update player assignment",
							error
						)
					} finally {
						this.waiting = false
					}
				}
				this.assignPopup = false
			})
		}
	}
}
</script>

<style scoped>
.assign-title {
	margin-top: 10px;
	margin-bottom: -10px;
}
.player-select {
	height: 1.5em;
}
</style>
