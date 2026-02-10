<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <!-- Tab 1 : Carte -->
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>
        
        <!-- Tab 2 : Liste des signalements -->
        <ion-tab-button tab="reports" href="/tabs/reports">
          <ion-icon :icon="listOutline" />
          <ion-label>Signalements</ion-label>
        </ion-tab-button>
        
        <!-- Tab 3 : Profil -->
        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { mapOutline, listOutline, personOutline } from 'ionicons/icons';
</script>