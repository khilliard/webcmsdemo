<template>
	<v-container>
		<!-- Display presentations header -->
		<v-row class="mt-n3" align="center">
			<div class="pl-1">Media players:</div>
			<v-spacer />
			<!-- Allow user to create new player -->
			<player-create-control />
		</v-row>
		<v-row>
			<!-- Display registered media players -->
			<div class="list-container">
				<player v-for="player in players" :player="player" :key="player.id" />
			</div>
			<div class="ml-2 mt-1">
				Click
				<span class="amber--text">CREATE</span> to create media player
			</div>
		</v-row>
	</v-container>
</template>

<script>
import Player from "@/components/player/Player"
import PlayerCreateControl from "@/components/player/PlayerCreateControl"
import { mapState } from "vuex"
import firebaseApp from "@/firebase"

export default {
	name: "Players",
	components: {
		Player,
		PlayerCreateControl
	},

	data: () => ({
		name: "",
		location: "",
		authcode: "",
		createPopup: false,
		playerCreated: false
	}),

	computed: {
		...mapState(["players"])
	},

	methods: {}
}
</script>

<style scoped>
.list-container {
	width: 100%;
	height: calc(100vh - 170px);
	border: 2px #444;
	border-style: inset;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
