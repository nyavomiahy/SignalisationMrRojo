<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Avatar et infos -->
      <div class="profile-header ion-text-center ion-margin-bottom">
        <ion-avatar class="profile-avatar">
          <ion-icon :icon="personCircle" />
        </ion-avatar>
        <h2>{{ user?.username || 'Utilisateur' }}</h2>
        <p>{{ user?.email || 'Email non disponible' }}</p>
        <ion-badge v-if="user?.name_type" color="secondary">
          {{ user.name_type }}
        </ion-badge>
        <p class="member-since">
          <small>Membre depuis {{ formatDate(user?.createdAt) }}</small>
        </p>
      </div>
      
      <!-- Statistiques -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Statistiques</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col class="ion-text-center">
                <h3>{{ stats.total || 0 }}</h3>
                <p>Signalements totaux</p>
              </ion-col>
              <ion-col class="ion-text-center">
                <h3>{{ stats.mine || 0 }}</h3>
                <p>Mes signalements</p>
              </ion-col>
              <ion-col class="ion-text-center">
                <h3>{{ stats.active || 0 }}</h3>
                <p>En cours</p>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      
      <!-- Derniers signalements -->
      <ion-card v-if="recentReports.length > 0" class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>Mes derniers signalements</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list lines="none">
            <ion-item v-for="report in recentReports" :key="report.id">
              <ion-avatar slot="start" :style="{ background: getStatusColor(report.status) }">
                <ion-icon :icon="getStatusIcon(report.status)" color="light" />
              </ion-avatar>
              <ion-label>
                <h3>{{ report.nameplace || 'Sans nom' }}</h3>
                <p>{{ formatDate(report.createdAt) }}</p>
                <ion-badge :color="getStatusBadgeColor(report.status)">
                  {{ getStatusLabel(report.status) }}
                </ion-badge>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      
      <!-- Actions -->
      <ion-list class="ion-margin-top">
        <ion-item button @click="editProfile">
          <ion-icon :icon="createOutline" slot="start" color="primary" />
          <ion-label>Modifier le profil</ion-label>
        </ion-item>
        <ion-item button @click="changePassword">
          <ion-icon :icon="lockClosedOutline" slot="start" color="primary" />
          <ion-label>Changer le mot de passe</ion-label>
        </ion-item>
        <ion-item button @click="showLogoutConfirm" color="danger">
          <ion-icon :icon="logOutOutline" slot="start" />
          <ion-label>Déconnexion</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid,
  IonRow, IonCol, IonList, IonItem, IonLabel, IonIcon, IonBadge,
  alertController, toastController
} from '@ionic/vue';
import {
  personCircle, createOutline, lockClosedOutline, logOutOutline,
  alertCircleOutline, timeOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUserFromStorage, logoutUserFirestore } from '@/services/userService';
import { getMyPoints, getAllPoints } from '@/services/pointService';

const router = useRouter();
const user = ref<any>(null);
const stats = ref({ total: 0, mine: 0, active: 0 });
const recentReports = ref<any[]>([]);

const loadUserData = async () => {
  user.value = getCurrentUserFromStorage();
  
  if (!user.value) {
    // Rediriger vers le login si pas connecté
    router.push('/login');
    return;
  }
  
  // Charger les statistiques
  try {
    // Mes signalements
    const myResult = await getMyPoints();
    if (myResult.success && myResult.points) {
      stats.value.mine = myResult.points.length;
      stats.value.active = myResult.points.filter((p: any) => 
        p.status === 'en_cours' || p.status === 'nouveau'
      ).length;
      
      // Récents (5 derniers)
      recentReports.value = myResult.points
        .sort((a: any, b: any) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);
    }
    
    // Tous les signalements
    const allResult = await getAllPoints();
    if (allResult.success && allResult.points) {
      stats.value.total = allResult.points.length;
    }
  } catch (error) {
    console.error('Erreur chargement statistiques:', error);
  }
};

// Fonctions pour les statuts
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'nouveau': '#ff3b30',
    'en_cours': '#5856d6',
    'termine': '#8e8e93'
  };
  return colors[status] || '#8e8e93';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    'nouveau': alertCircleOutline,
    'en_cours': timeOutline,
    'termine': checkmarkCircleOutline
  };
  return icons[status] || alertCircleOutline;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    '1': 'Nouveau',
    '11': 'En cours',
    '21': 'Terminé'
  };
  return labels[status] || status;
};

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    '1': 'danger',
    '11': 'primary',
    '21': 'medium'
  };
  return colors[status] || 'medium';
};

// Formatage date
const formatDate = (date: any) => {
  if (!date) return 'Date inconnue';
  
  try {
    let d;
    if (date.toDate) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      return 'Date invalide';
    }
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Date invalide';
  }
};

// Actions
const editProfile = () => {
  const toast = toastController.create({
    message: 'Fonctionnalité à venir',
    duration: 2000,
    color: 'warning'
  });
};

const changePassword = () => {
  const toast = toastController.create({
    message: 'Fonctionnalité à venir',
    duration: 2000,
    color: 'warning'
  });
};

const showLogoutConfirm = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnexion',
        handler: () => {
          logout();
        }
      }
    ]
  });
  
  await alert.present();
};

const logout = () => {
  logoutUserFirestore();
  
  // Afficher un toast
  toastController.create({
    message: 'Déconnexion réussie',
    duration: 2000,
    color: 'success'
  });
  

};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-header {
  padding: 20px 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
  background: var(--ion-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar ion-icon {
  font-size: 60px;
  color: white;
}

.member-since {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin-top: 5px;
}

ion-col h3 {
  font-size: 2rem;
  margin: 10px 0 5px 0;
  color: var(--ion-color-primary);
}

ion-list ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}
</style>