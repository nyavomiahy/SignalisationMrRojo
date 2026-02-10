<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!currentUser">
        <ion-text color="medium">Connectez-vous pour voir vos notifications.</ion-text>
      </div>
      <div v-else>
        <ion-list v-if="notifications.length">
          <ion-item v-for="notif in notifications" :key="notif.id">
            <ion-label>
              <h3>{{ notif.title }}</h3>
              <p>{{ notif.message }}</p>
              <small>{{ notif.date }}</small>
            </ion-label>
          </ion-item>
        </ion-list>
        <div v-else>
          <ion-text color="medium">Aucune notification pour l’instant.</ion-text>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonText } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { getCurrentUserFromStorage } from '@/services/userService';
import { db, collections } from '@/firebase/config';
import { getDocs, query, where, orderBy } from 'firebase/firestore';

const currentUser = ref(getCurrentUserFromStorage());
const notifications = ref<Array<{ id: string; title: string; message: string; date: string }>>([]);

const fetchNotifications = async () => {
  if (!currentUser.value) return;
  // Récupérer tous les points de l'utilisateur
  const userPointSnapshot = await getDocs(query(collections.user_point, where('id_user', '==', currentUser.value.uid)));
  const pointIds = userPointSnapshot.docs.map(doc => doc.data().id_point);
  if (!pointIds.length) return;
  // Pour chaque point, récupérer les statuts
  const allNotifs: any[] = [];
  for (const pointId of pointIds) {
    const statutsSnapshot = await getDocs(query(collections.statut_point, where('id_point', '==', pointId), orderBy('date', 'desc')));
    statutsSnapshot.forEach(doc => {
      const data = doc.data();
      allNotifs.push({
        id: doc.id,
        title: `Signalement #${pointId}`,
        message: `Statut changé: ${data.status}`,
        date: data.date?.toDate ? data.date.toDate().toLocaleString() : ''
      });
    });
  }
  // Trier toutes les notifications par date décroissante
  notifications.value = allNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

onMounted(fetchNotifications);
</script>
