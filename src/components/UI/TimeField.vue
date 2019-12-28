<template>
  <!-- TimeField is a custom input control to be used in forms for time selection -->
  <!-- It supports v-model binding, selected time value is output to parent component -->
  <v-menu
    v-model="timePopup"
    :close-on-content-click="false"
    min-width="290"
    width="290"
    transition="scale-transition"
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="value"
        readonly
        clearable
        prepend-icon="mdi-clock-outline"
        :label="label"
        @click="initPopup"
        v-on="on"
      />
    </template>
    <v-time-picker
      v-model="time"
      min-width="290"
      width="290"
      color="amber darken-2"
      @change="setTime"
    >
      <v-spacer></v-spacer>
      <div class="time-cancel">
        <v-btn @click="timePopup = false">Cancel</v-btn>
      </div>
    </v-time-picker>
  </v-menu>
</template>

<script>
export default {
  name: "TimeField",
  props: ["value", "label"],

  data() {
    return {
      timePopup: false,
      time: null
    };
  },

  methods: {
    initPopup() {
      // initialize to today's date, stripping out time component
      this.time = this.value;
    },
    setTime() {
      // support parent component v-model output binding
      this.$emit("input", this.time);
      this.timePopup = false;
    }
  }
};
</script>

<style scoped>
.time-cancel {
  width: 100%;
  text-align: center;
}
</style>
