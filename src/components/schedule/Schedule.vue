<template>
	<v-card class="px-2 py-0 card-item" dense outline tile>
		<v-row class="pl-1" align="center">
			<v-col cols="8" sm="10">
				<!-- display schedule with edit control features -->
				<schedule-create-control :schedule="schedule">
					<span class="schedule-content">{{ scheduleData.name }}</span>
				</schedule-create-control>
			</v-col>
			<v-col class="py-0 text-right" cols="4" sm="2">
				<!-- player assignment control -->
				<assign :schedule="schedule" />
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
import ScheduleCreateControl from "@/components/schedule/ScheduleCreateControl"
import Assign from "@/components/player/Assign"

export default {
	name: "Schedule",
	props: ["schedule"],

	components: {
		ScheduleCreateControl,
		Assign
	},

	data() {
		return {}
	},

	computed: {
		scheduleData() {
			return this.schedule.data()
		}
	}
}
</script>

<style scoped>
.schedule-content {
	display: inline-block;
	width: 100%;
}
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
