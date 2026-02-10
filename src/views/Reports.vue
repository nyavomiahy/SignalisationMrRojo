<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mes Signalements</ion-title>
        
        <!-- Filtres en haut -->
        <ion-buttons slot="start">
          <ion-button @click="toggleFilter('all')" :color="currentFilter === 'all' ? 'primary' : 'medium'">
            Tous
          </ion-button>
          <ion-button @click="toggleFilter('mine')" :color="currentFilter === 'mine' ? 'primary' : 'medium'">
            Mes
          </ion-button>
        </ion-buttons>
        
        <!-- Filtre par statut -->
        <ion-buttons slot="end">
          <ion-button id="status-filter">
            <ion-icon :icon="filter" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Liste des signalements -->
      <div v-if="filteredReports.length === 0" class="empty-state ion-text-center ion-padding">
        <ion-icon :icon="documentTextOutline" size="large" color="medium" />
        <h3>Aucun signalement trouvé</h3>
        <p v-if="currentFilter === 'mine'">
          Vous n'avez pas encore créé de signalements.
        </p>
        <p v-else>
          Aucun signalement ne correspond aux filtres.
        </p>
      </div>
      
      <ion-list v-else>
        <ion-item v-for="report in filteredReports" :key="report.id" lines="full">
          <!-- Cercle de statut -->
          <ion-avatar slot="start" :style="{ background: getStatusColor(report.status) }">
            <ion-icon :icon="getStatusIcon(report.status)" color="light" />
          </ion-avatar>
          
          <ion-label>
            <h2>{{ report.nameplace || report.siteName || 'Sans nom' }}</h2>
            <p class="location-text">
              <ion-icon :icon="locationOutline" size="small" />
              {{ formatLocation(report) }}
            </p>
            <p class="details-text">
              {{ formatDate(report.createdAt) }} • 
              {{ report.surface || 0 }} m² • 
              {{ report.budget || 0 }} €
            </p>
            <div class="badges-container">
              <ion-badge :color="getStatusBadgeColor(report.status)">
                {{ getStatusLabel(report.status) }}
              </ion-badge>
              <ion-badge color="light" v-if="report.id_entreprise">
                {{ getEntrepriseName(report.id_entreprise) }}
              </ion-badge>
              <ion-badge color="tertiary" v-if="report.isMine">
                À moi
              </ion-badge>
            </div>
          </ion-label>
          
          <!-- Boutons d'action en colonne à droite -->
          <div slot="end" class="action-buttons">
            <ion-button 
              size="small" 
              fill="clear" 
              @click="viewOnMap(report)"
              title="Voir sur la carte"
            >
              <ion-icon slot="icon-only" :icon="mapOutline" color="secondary" />
            </ion-button>
            
            <ion-button 
              size="small" 
              fill="clear" 
              @click="viewReportDetails(report)"
              title="Voir détails"
            >
              <ion-icon slot="icon-only" :icon="eyeOutline" color="primary" />
            </ion-button>
          </div>
        </ion-item>
      </ion-list>
      
      <!-- Popover pour filtre par statut -->
      <ion-popover trigger="status-filter" :dismiss-on-select="true">
        <ion-content>
          <ion-list>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('all')">
              <ion-label>Tous les statuts</ion-label>
              <ion-badge slot="end" color="medium">{{ reports.length }}</ion-badge>
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('1')">
              <ion-avatar slot="start" style="background: #ff3b30; width: 12px; height: 12px;" />
              <ion-label>Nouveau</ion-label>
              <ion-badge slot="end" color="danger">{{ countByStatus('1') }}</ion-badge>
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('11')">
              <ion-avatar slot="start" style="background: #5856d6; width: 12px; height: 12px;" />
              <ion-label>En cours</ion-label>
              <ion-badge slot="end" color="primary">{{ countByStatus('11') }}</ion-badge>
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('21')">
              <ion-avatar slot="start" style="background: #8e8e93; width: 12px; height: 12px;" />
              <ion-label>Terminé</ion-label>
              <ion-badge slot="end" color="medium">{{ countByStatus('21') }}</ion-badge>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
      
      <!-- Badge filtre actif -->
      <div v-if="statusFilter !== 'all'" class="active-filter-badge">
        <ion-chip color="primary" @click="clearStatusFilter">
          Filtre: {{ getStatusLabel(statusFilter) }}
          <ion-icon :icon="closeCircle" @click.stop="clearStatusFilter" />
        </ion-chip>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonList, IonItem, IonLabel, IonBadge, IonAvatar, IonText,
  IonPopover, IonChip, toastController, alertController
} from '@ionic/vue';
import {
  filter, locationOutline, documentTextOutline,
  alertCircleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline,
  mapOutline, closeCircle, eyeOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllPoints, getMyPoints } from '@/services/pointService';
import { getCurrentUserFromStorage } from '@/services/userService';

const router = useRouter();

const currentFilter = ref<'all' | 'mine'>('mine');
const statusFilter = ref<string>('all');
const reports = ref<any[]>([]);
const currentUser = ref<any>(null);

const entreprises = ref<Array<{id: string, name: string}>>([
  { id: '1', name: 'Colas' },
  { id: '2', name: 'Buildlab' },
  { id: '3', name: 'Voirie Tana' },
  { id: '4', name: 'Municipalité' }
]);

const loadReports = async () => {
  try {
    currentUser.value = getCurrentUserFromStorage();
    
    let result;
    if (currentFilter.value === 'mine' && currentUser.value) {
      result = await getMyPoints();
    } else {
      result = await getAllPoints();
    }
    
    if (result.success && result.points) {
      reports.value = result.points.map((point: any, index: number) => {
        const userId = currentUser.value?.uid || currentUser.value?.id;
        const isMine = userId && point.userId === userId;

        // Convertir latitude et longitude en nombre
        const lat = Number(point.latitude || point.lat || 0);
        const lng = Number(point.longitude || point.lng || 0);

        return {
          ...point,
          id: point.id || `point-${index}`,
          siteName: point.nameplace || point.siteName,
          locationName: point.locationName || getDefaultLocation({ latitude: lat, longitude: lng }),
          isMine,
          latitude: lat,
          longitude: lng
        };
      });

      reports.value.sort((a, b) => getDateValue(b.createdAt).getTime() - getDateValue(a.createdAt).getTime());
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement signalements:', error);
  }
};

const getDateValue = (date: any): Date => {
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  if (date?.seconds) return new Date(date.seconds * 1000);
  return new Date(0);
};

const formatLocation = (report: any) => {
  if (report.locationName) return report.locationName;
  const lat = Number(report.latitude);
  const lng = Number(report.longitude);
  if (!isNaN(lat) && !isNaN(lng)) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  return 'Localisation inconnue';
};

const getDefaultLocation = (point: any) => {
  const lat = Number(point.latitude);
  const lng = Number(point.longitude);
  if (!isNaN(lat) && !isNaN(lng)) return `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  return 'Localisation inconnue';
};

const filteredReports = computed(() => {
  let filtered = reports.value;
  if (statusFilter.value !== 'all') filtered = filtered.filter(r => r.status === statusFilter.value);
  if (currentFilter.value === 'mine') filtered = filtered.filter(r => r.isMine);
  return filtered;
});

const countByStatus = (status: string) => {
  let filtered = reports.value;
  if (currentFilter.value === 'mine') filtered = filtered.filter(r => r.isMine);
  return filtered.filter(r => r.status === status).length;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    '1': '#ff3b30', '11': '#5856d6', '21': '#8e8e93',
    'nouveau': '#ff3b30','en_cours': '#5856d6','termine': '#8e8e93'
  };
  return colors[status] || '#8e8e93';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    '1': alertCircleOutline, '11': timeOutline, '21': checkmarkCircleOutline,
    'nouveau': alertCircleOutline,'en_cours': timeOutline,'termine': checkmarkCircleOutline
  };
  return icons[status] || alertCircleOutline;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    '1': 'Nouveau','11': 'En cours','21': 'Terminé',
    'nouveau': 'Nouveau','en_cours': 'En cours','termine': 'Terminé'
  };
  return labels[status] || status;
};

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    '1': 'danger','11': 'primary','21': 'medium',
    'nouveau': 'danger','en_cours': 'primary','termine': 'medium'
  };
  return colors[status] || 'medium';
};

const formatDate = (date: any) => {
  const d = getDateValue(date);
  if (isNaN(d.getTime()) || d.getTime() === 0) return 'Date inconnue';
  const diffHours = Math.floor((new Date().getTime() - d.getTime()) / (1000*60*60));
  if (diffHours < 24) return diffHours === 0 ? "À l'instant" : `Il y a ${diffHours}h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const toggleFilter = (type: 'all' | 'mine') => {
  currentFilter.value = type;
  statusFilter.value = 'all';
  loadReports();
};

const setStatusFilter = (status: string) => { statusFilter.value = status; };
const clearStatusFilter = () => { statusFilter.value = 'all'; };
const getEntrepriseName = (id: string) => entreprises.value.find(e => e.id === id)?.name || `Entreprise ${id}`;

const viewOnMap = async (report: any) => {
  const locationData = { latitude: report.latitude, longitude: report.longitude, zoom: 16, reportId: report.id, reportName: report.nameplace || report.siteName || 'Signalement' };
  localStorage.setItem('selectedReportLocation', JSON.stringify(locationData));
  router.push('/tabs/map');
  const toast = await toastController.create({ message: `Redirection vers la carte pour ${locationData.reportName}`, duration: 2000, color: 'success' });
  await toast.present();
};

const viewReportDetails = (report: any) => { console.log('Voir détails:', report); };
const editReport = async (report: any) => {
  if (!report.isMine) { 
    const toast = await toastController.create({ message: 'Vous ne pouvez modifier que vos propres signalements', duration: 2000, color: 'warning' });
    await toast.present(); return;
  }
  console.log('Modifier:', report);
};
const deleteReport = async (report: any) => {
  if (!report.isMine) { 
    const toast = await toastController.create({ message: 'Vous ne pouvez supprimer que vos propres signalements', duration: 2000, color: 'warning' });
    await toast.present(); return;
  }
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message: `Voulez-vous vraiment supprimer "${report.nameplace || report.siteName}" ?`,
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { text: 'Supprimer', role: 'destructive', handler: () => performDelete(report) }
    ]
  });
  await alert.present();
};

const performDelete = async (report: any) => {
  console.log('Suppression:', report);
  const toast = await toastController.create({ message: 'Signalement supprimé', duration: 2000, color: 'success' });
  await toast.present();
  loadReports();
};

onMounted(() => { loadReports(); });
</script>

<style scoped>
.empty-state {
  height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-state ion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--ion-color-medium);
  margin: 0.5rem 0;
}

.empty-state p {
  color: var(--ion-color-medium-shade);
  max-width: 80%;
  margin: 0 auto;
}

ion-avatar[slot="start"] {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
}

ion-item-sliding {
  margin-bottom: 1px;
  --border-color: var(--ion-color-light-shade);
}

ion-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --min-height: 80px;
}

ion-label h2 {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1rem;
}

.location-text {
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location-text ion-icon {
  margin-right: 4px;
}

.details-text {
  color: var(--ion-color-medium-shade);
  font-size: 0.8rem;
  margin: 4px 0;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

ion-badge {
  margin: 2px 0;
  font-size: 0.7rem;
  padding: 3px 6px;
}

.active-filter-badge {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.active-filter-badge ion-chip {
  --background: var(--ion-color-primary);
  --color: white;
  font-size: 0.9rem;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.active-filter-badge ion-chip ion-icon {
  margin-left: 8px;
  font-size: 1rem;
}

/* Animation pour les items */
ion-item-sliding {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Style pour le bouton Voir sur la carte */
ion-item-option[color="secondary"] {
  --background: var(--ion-color-secondary);
  --background-activated: var(--ion-color-secondary-shade);
  --color: white;
}

/* Style pour le popover de filtre */
ion-popover ion-item {
  --min-height: 44px;
}

ion-popover ion-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
}
</style>
