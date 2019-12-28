<template>
  <v-container>
    <!-- display schedules header -->
    <v-row class="mt-n3" align="center">
      <div class="pl-1">Scheduled presentations:</div>
      <v-spacer />
      <schedule-create-control />
    </v-row>
    <v-row>
      <!-- display retrieved schedules -->
      <div class="list-container">
        <schedule v-for="schedule in schedules" :schedule="schedule" :key="schedule.id" />
      </div>
      <div class="ml-2 mt-1">
        Click
        <span class="amber--text">CREATE</span> to schedule presentation
      </div>
    </v-row>
  </v-container>
</template>

<script>
import Schedule from "@/components/schedule/Schedule";
import ScheduleCreateControl from "@/components/schedule/ScheduleCreateControl";

import { mapState, mapGetters } from "vuex";

export default {
  name: "Schedules",
  components: {
    Schedule,
    ScheduleCreateControl
  },

  data() {
    return {};
  },

  computed: {
    // ...mapState(["presentations", "appState"]),
    ...mapGetters(["schedules"])
  }
};
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
