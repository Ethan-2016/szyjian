<template>
  <div></div>
</template>

<script>
// import { userManager } from '@/components/oidc';
import oidc from 'oidc-client';
import { userManager } from '@/components/oidc';

export default {
  name: 'OidcCallback',
  methods: {
  },
  mounted() {
    userManager
      .signinRedirectCallback()
      .then(user => {
        // window.location = "/";
        window.location = "/";
      })
      .catch(err => {
        // console.error(err);
      })
  }
}
</script>