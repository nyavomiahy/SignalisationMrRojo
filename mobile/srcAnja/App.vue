<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
</script>
<style>
@import "leaflet/dist/leaflet.css";


/* Corrige l'icône manquante de Leaflet */
.leaflet-default-icon-path {
  background-image: url(https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png);
}
</style>