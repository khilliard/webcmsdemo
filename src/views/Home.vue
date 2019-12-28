<template>
  <v-container>
    <!-- display presentations header -->
    <v-row class="mt-n3" align="center">
      <div class="pl-1">Uploaded Presentations:</div>
      <v-spacer />
      <presentation-upload />
    </v-row>
    <v-row>
      <!-- display retrieved presentations -->
      <div class="list-container">
        <presentation
          v-for="presentation in presentations"
          :presentation="presentation"
          :key="presentation.id"
        />
      </div>
      <div class="ml-2 mt-1">
        Click
        <span class="amber--text">UPLOAD</span> to upload file to CMS
      </div>
    </v-row>
  </v-container>
</template>

<script>
import firebaseApp from "@/firebase";
import { mapState, mapGetters } from "vuex";
import Presentation from "@/components/presentation/Presentation";
import PresentationUpload from "@/components/presentation/PresentationUpload";

export default {
  name: "Home",
  components: {
    Presentation,
    PresentationUpload
  },

  computed: {
    ...mapGetters(["presentations"])
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
