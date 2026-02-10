<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="reports" href="/tabs/reports">
          <ion-icon :icon="listOutline" />
          <ion-label>Signalements</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="notifications" href="/tabs/notifications">
          <ion-icon :icon="notificationsOutline" />
          <ion-label>Notifications</ion-label>

          <!-- 🔴 Point rouge simple -->
          <span v-if="hasUnread" class="dot"></span>

        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar, IonTabButton, IonTabs,
  IonLabel, IonIcon, IonPage, IonRouterOutlet
} from '@ionic/vue';

import { mapOutline, listOutline, personOutline, notificationsOutline } from 'ionicons/icons';

import { ref, computed, onMounted } from 'vue';
import { db, collections } from '@/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getCurrentUserFromStorage } from '@/services/userService';

const currentUser = ref(getCurrentUserFromStorage());

const readMap = ref<Record<string, boolean>>({});
const statutIds = ref<string[]>([]);

onMounted(() => {
  if (!currentUser.value) return;

  // Charger lectures
  const readQ = query(
    collection(db, "notification_read"),
    where("user_id", "==", currentUser.value.uid)
  );

  onSnapshot(readQ, snap => {
    const map: Record<string, boolean> = {};
    snap.docs.forEach(d => {
      map[d.data().statut_point_id] = true;
    });
    readMap.value = map;
  });

  // Charger statuts user
  const userPointsQ = query(
    collections.user_point,
    where("id_user", "==", currentUser.value.uid)
  );

  onSnapshot(userPointsQ, snap => {
    const pointIds = snap.docs.map(d => d.data().id_point);

    pointIds.forEach(pointId => {
      const statutsQ = query(
        collections.statut_point,
        where("id_point", "==", pointId)
      );

      onSnapshot(statutsQ, statSnap => {
        statutIds.value = statSnap.docs.map(d => d.id);
      });
    });
  });
});

const hasUnread = computed(() => {
  return statutIds.value.some(id => !readMap.value[id]);
});
</script>

<style scoped>
.dot {
  position: absolute;
  top: 6px;
  right: 14px;
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
}
</style>
