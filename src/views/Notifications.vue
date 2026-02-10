<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <ion-list v-if="notifications.length">

        <ion-item
          v-for="notif in notifications"
          :key="notif.id"
          :class="{ unread: !notif.read }"
          @click="openNotification(notif)"
        >
          <ion-label>
            <h3>{{ notif.title }}</h3>
            <p>Statut: {{ notif.statusLabel }}</p>
            <p>Entreprise: {{ notif.entreprise }}</p>
            <small>{{ notif.date }}</small>
          </ion-label>
        </ion-item>

      </ion-list>

      <ion-text v-else color="medium">
        Aucune notification
      </ion-text>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonText
} from '@ionic/vue';

import { ref, onMounted } from 'vue';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db, collections, StatusPoint } from '@/firebase/config';
import { getCurrentUserFromStorage } from '@/services/userService';

const currentUser = ref(getCurrentUserFromStorage());
const notifications = ref<any[]>([]);
const readMap = ref<Record<string, boolean>>({});
const entreprises = ref<any[]>([]); // Charger si nécessaire

onMounted(() => {
  if (!currentUser.value) return;

  loadReads();
  loadNotifications();
});

/* ===== Traduire le statut ===== */
function getStatusLabel(status: string) {
  switch (status) {
    case '1': return 'Nouveau';
    case '11': return 'En cours';
    case '21': return 'Terminé';
    default: return 'Inconnu';
  }
}

/* ===== Formater la date ===== */
function formatDate(timestamp: any) {
  if (!timestamp) return 'Date inconnue';

  try {
    let date: Date;
    if (timestamp.seconds !== undefined) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date invalide';
  }
}

/* ===== Nom entreprise ===== */
function getEntrepriseName(id_entreprise: any) {
  if (!id_entreprise) return 'Inconnue';
  const e = entreprises.value.find(e => String(e.id) === String(id_entreprise));
  return e ? e.name : 'Inconnue';
}

/* ===== Charger lectures ===== */
function loadReads() {
  const q = query(
    collections.notification_read,
    where("user_id", "==", currentUser.value.uid)
  );

  onSnapshot(q, snap => {
    const map: Record<string, boolean> = {};
    snap.docs.forEach(d => {
      map[d.data().statut_point_id] = true;
    });
    readMap.value = map;
  });
}

/* ===== Charger notifications ===== */
function loadNotifications() {
  const userPointsQ = query(
    collections.user_point,
    where("id_user", "==", currentUser.value.uid)
  );

  onSnapshot(userPointsQ, snap => {
    const pointIds = snap.docs.map(d => d.data().id_point);
    const all: any[] = [];

    pointIds.forEach(pointId => {
      const statusQ = query(
        collections.status_point,
        where("id_point", "==", Number(pointId))
      );

      onSnapshot(statusQ, statusSnap => {
        statusSnap.docs.forEach(docSnap => {
          const data = docSnap.data() as StatusPoint;

          if (data.status === "1") return;

          all.push({
            id: docSnap.id,
            title: `Point #${pointId}`,
            statusLabel: getStatusLabel(data.status),
            date: formatDate(data.updated_at),
            entreprise: getEntrepriseName(data.id_entreprise),
            read: readMap.value[docSnap.id] ?? false,
            raw: data
          });
        });

        notifications.value = all.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
    });
  });
}

/* ===== Click notification ===== */
async function openNotification(notif: any) {
  if (!notif.read) {
    await addDoc(collection(db, "notification_read"), {
      user_id: currentUser.value.uid,
      statut_point_id: notif.id,
      read_at: new Date()
    });
    notif.read = true; // mettre à jour l'UI immédiatement
  }
}
</script>

<style scoped>
.unread {
  font-weight: bold;
  border-left: 4px solid var(--ion-color-primary);
  background: rgba(var(--ion-color-primary-rgb), 0.08);
}
</style>
