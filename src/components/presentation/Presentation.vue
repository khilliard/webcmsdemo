<template>
	<div>
		<v-card class="px-2 py-0 card-item" dense outline tile>
			<v-row class="pl-1" align="center">
				<v-col cols="8" sm="10">
					<!-- display presentation with edit control features -->
					<presentation-edit-control :presentation="presentation">
						{{ presentationData.name }}
					</presentation-edit-control>
				</v-col>
				<v-col class="py-0 text-right" cols="4" sm="2" justify-self="start">
					<!-- player  assignment control -->
					<assign :presentation="presentation" />
				</v-col>
			</v-row>
		</v-card>
	</div>
</template>

<script>
import firebaseApp from "@/firebase"
import Assign from "@/components/player/Assign"
import PresentationEditControl from "@/components/presentation/PresentationEditControl"

export default {
	name: "Presentation",
	components: {
		Assign,
		PresentationEditControl
	},

	props: ["presentation"],

	computed: {
		presentationData() {
			// retrieve resource data from firestore document object
			return this.presentation.data()
		},
		fileName() {
			// extract file's basename from full pathname
			return this.presentationData.filePath.split("/").pop()
		}
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
</style>
