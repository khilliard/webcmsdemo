<template>
  <!-- DateField is a custom input control to be used in forms for date selection -->
  <!-- It supports v-model binding, selected date value is output to parent component -->
  <v-menu v-model="datePopup" transition="scale-transition" offset-y>
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="formattedDate"
        readonly
        clearable
        prepend-icon="mdi-calendar-range"
        :label="label"
        @click="initPopup"
        v-on="on"
      />
    </template>
    <v-date-picker v-model="date" width="290" color="amber darken-2">
      <v-spacer></v-spacer>
      <v-btn @click="datePopup = false">Cancel</v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "DateField",
  props: ["value", "label"],

  data() {
    return {
      datePopup: false,
      currDate: null
    };
  },

  computed: {
    ////////////////////////////////////////////////////////////////////////////////////////////
    // Created writable computed "date" property used for 2-way binding for date picker.			//
    // When the user selects a date the picker will "write" the value to "date", triggering		//
    // the date "set" method. This method outputs the select to value to the parent						//
    // component (which has a v-model binding to this component) and closes the picker menu.	//
    ////////////////////////////////////////////////////////////////////////////////////////////
    date: {
      get: function() {
        // initialize date to current date, strip out time component
        return this.currDate;
      },
      // called by date picker when user selects a date (via v-model 2-way binding to "date")
      set: function(dateValue) {
        this.currDate = dateValue;
        // output selected date to parent which has v-model 2-way binding to this component
        this.$emit("input", dateValue);
        this.datePopup = false;
      }
    },
    formattedDate() {
      return this.value ? new Date(this.value).toDateString() : null;
    }
  },

  methods: {
    initPopup() {
      // initialize to today's date, stripping out time component
      this.currDate = this.value
        ? this.value
        : new Date().toISOString().split("T")[0];
    }
  }
};
</script>
