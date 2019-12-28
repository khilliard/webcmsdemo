<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <!-- Allow tabbed selection of user login or signup for service -->
        <v-tabs v-model="activeLoginTab" grow background-color="primary">
          <v-tab>Login</v-tab>
          <v-tab>Signup</v-tab>
          <v-tab-item :value="0">
            <signin />
          </v-tab-item>
          <v-tab-item :value="1">
            <signup />
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import firebaseApp from "@/firebase"
import Signin from "@/components/auth/Signin";
import Signup from "@/components/auth/Signup";

export default {
  name: "Login",
  components: {
    signin: Signin,
    signup: Signup
  },

  data: () => ({
    activeLoginTab: 0
  })
};
</script>
