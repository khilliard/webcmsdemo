<template>
	<div>
		<v-card class="card-item" dense outline tile>
			<player-edit-control :player="player">
				<div
					:class="{
						onlineState: isOnline,
						offlineState: isOffline,
						unregisteredState: isUnregistered
					}"
				>
					<div class="pl-2 pr-l py-1">
						{{ playerData.name }}
						<span v-if="playerData.location">
							/ {{ playerData.location }}&nbsp;
						</span>
						<span v-html="playerInfo"></span>
					</div>
				</div>
			</player-edit-control>
		</v-card>
	</div>
</template>

<script>
import firebaseApp from "@/firebase"
import PlayerEditControl from "@/components/player/PlayerEditControl"

export default {
	name: "Player",
	components: {
		PlayerEditControl
	},

	props: ["player"],

	data() {
		return {
			// editPopup: false,
			// name: "",
			// location: "",
			// authcode: "",
			// confirmPopup: false
		}
	},

	computed: {
		playerData() {
			return this.player.data()
		},
		playerInfo() {
			// create player info display text based on current state
			if (!this.playerData.state || this.playerData.state === "unregistered") {
				return `: Unregistered, auth code: <span style="color: #FFC107;">${this.playerData.authcode}</span>`
			} else {
				return `: <span style="text-transform: capitalize;">${this.playerData.state}</span>`
			}
		},
		isOnline() {
			return this.playerData.state === "online"
		},
		isOffline() {
			return this.playerData.state === "offline"
		},
		isUnregistered() {
			return !this.playerData.state || this.playerData.state === "unregistered"
		}
	},

	methods: {
		// displayEditForm() {
		// 	this.name = this.playerData.name
		// 	this.location = this.playerData.location
		// 	this.authcode = this.playerData.authcode
		// 	this.editPopup = true
		// },
		// async updatePlayer() {
		// 	console.log(
		// 		`updating player - name: ${this.name}, location: ${this.location}`
		// 	)
		// 	try {
		// 		await firebaseApp.updateDocument(this.player, {
		// 			name: this.name,
		// 			location: this.location
		// 		})
		// 	} catch (error) {
		// 		console.log("***** detected error", error)
		// 	} finally {
		// 		this.editPopup = false
		// 	}
		// },
		// async deletePlayer() {
		// 	console.log("deleting player")
		// 	try {
		// 		await firebaseApp.deleteDocument(this.player)
		// 		console.log("media player successfully deleted")
		// 	} catch (error) {
		// 		console.log("***** detected error", error)
		// 	} finally {
		// 		this.confirmPopup = false
		// 	}
		// }
	}
}
</script>

<style scoped>
.card-item {
	margin-bottom: 2px;
	cursor: pointer;
	width: 100%;
}
.card-item:hover {
	background: var(--item-hover-highlight);
	/* color: black; */
}
.onlineState {
	border-left: 6px var(--primary-color) solid;
}
.offlineState {
	border-left: 6px red solid;
}
.unregisteredState {
	border-left: 6px #ffc107 solid;
}
</style>
