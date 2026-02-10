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
// Dans les imports d'icônes, ajoutez :

import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonList, IonItem, IonLabel, IonBadge, IonAvatar, IonText,
  IonItemSliding, IonItemOptions, IonItemOption, IonPopover, IonChip,
  toastController, alertController
} from '@ionic/vue';
import {
  filter, locationOutline, documentTextOutline, createOutline, trashOutline,
  alertCircleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline,
  mapOutline, closeCircle, eyeOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllPoints, getMyPoints } from '@/services/pointService';
import { getCurrentUserFromStorage } from '@/services/userService';

const router = useRouter();

// Renommer filter pour éviter conflit avec l'icon
const currentFilter = ref<'all' | 'mine'>('mine'); // Par défaut "Mes"
const statusFilter = ref<string>('all');
const reports = ref<any[]>([]);
const currentUser = ref<any>(null);

// Liste des entreprises (devrait venir de votre service)
const entreprises = ref<Array<{id: string, name: string}>>([
  { id: '1', name: 'Colas' },
  { id: '2', name: 'Buildlab' },
  { id: '3', name: 'Voirie Tana' },
  { id: '4', name: 'Municipalité' }
]);

// Charger les signalements
const loadReports = async () => {
  try {
    currentUser.value = getCurrentUserFromStorage();
    
    console.log('📋 Chargement des signalements, filtre:', currentFilter.value);
    console.log('👤 Utilisateur:', currentUser.value?.uid);
    
    let result;
    if (currentFilter.value === 'mine' && currentUser.value) {
      console.log('🔍 Chargement de MES signalements...');
      result = await getMyPoints();
    } else {
      console.log('🔍 Chargement de TOUS les signalements...');
      result = await getAllPoints();
    }
    
    console.log('📊 Résultat chargement:', result);
    
    if (result.success && result.points) {
      // Ajouter un id unique si manquant et formater les données
      reports.value = result.points.map((point: any, index: number) => {
        console.log(`Point ${index}:`, point);
        
        // Vérifier si c'est un signalement de l'utilisateur courant
        const userId = currentUser.value?.uid || currentUser.value?.id;
        const isMine = userId && point.userId === userId;
        
        return {
          ...point,
          id: point.id || `point-${index}`,
          // Compatibilité avec l'ancien nom de champ
          siteName: point.nameplace || point.siteName,
          locationName: point.locationName || getDefaultLocation(point),
          isMine: isMine,
          // Assurer que latitude/longitude existent
          latitude: point.latitude || point.lat,
          longitude: point.longitude || point.lng
        };
      });
      
      // Trier par date (le plus récent d'abord)
      reports.value.sort((a, b) => {
        const dateA = getDateValue(a.createdAt);
        const dateB = getDateValue(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log(`✅ ${reports.value.length} signalements chargés`);
      
    } else {
      console.error('❌ Erreur chargement:', result.error);
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement signalements:', error);
  }
};

// Helper pour obtenir une Date depuis différents formats
const getDateValue = (date: any): Date => {
  try {
    if (date?.toDate) {
      return date.toDate();
    } else if (date instanceof Date) {
      return date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date);
    } else if (date?.seconds) {
      return new Date(date.seconds * 1000);
    }
    return new Date(0); // Date par défaut
  } catch {
    return new Date(0);
  }
};

// Formater la localisation
const formatLocation = (report: any) => {
  if (report.locationName) {
    return report.locationName;
  }
  
  // Sinon, utiliser les coordonnées
  if (report.latitude && report.longitude) {
    return `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`;
  }
  
  return 'Localisation inconnue';
};

// Fonction pour obtenir le nom de l'entreprise
const getEntrepriseName = (entrepriseId: string) => {
  const entreprise = entreprises.value.find(e => e.id === entrepriseId);
  return entreprise ? entreprise.name : `Entreprise ${entrepriseId}`;
};

// Fonction par défaut pour la localisation
const getDefaultLocation = (point: any) => {
  if (point.latitude && point.longitude) {
    return `Position (${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)})`;
  }
  return 'Localisation inconnue';
};

// Filtrage par statut
const filteredReports = computed(() => {
  let filtered = reports.value;
  
  // Filtrer par statut
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(report => report.status === statusFilter.value);
  }
  
  // Si filtre "mine", ne montrer que les signalements de l'utilisateur
  if (currentFilter.value === 'mine') {
    filtered = filtered.filter(report => report.isMine);
  }
  
  return filtered;
});

// Compter les signalements par statut
const countByStatus = (status: string) => {
  let filtered = reports.value;
  
  // Si filtre "mine", ne compter que les signalements de l'utilisateur
  if (currentFilter.value === 'mine') {
    filtered = filtered.filter(report => report.isMine);
  }
  
  return filtered.filter(report => report.status === status).length;
};

// Fonctions pour les statuts
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    '1': '#ff3b30',      // Nouveau
    '11': '#5856d6',     // En cours
    '21': '#8e8e93',     // Terminé
    'nouveau': '#ff3b30',
    'en_cours': '#5856d6',
    'termine': '#8e8e93',
    'available': '#34c759',
    'occupied': '#ff9500'
  };
  return colors[status] || '#8e8e93';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    '1': alertCircleOutline,      // Nouveau
    '11': timeOutline,            // En cours
    '21': checkmarkCircleOutline, // Terminé
    'nouveau': alertCircleOutline,
    'en_cours': timeOutline,
    'termine': checkmarkCircleOutline,
    'available': checkmarkCircleOutline,
    'occupied': closeCircleOutline
  };
  return icons[status] || alertCircleOutline;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    '1': 'Nouveau',
    '11': 'En cours',
    '21': 'Terminé',
    'nouveau': 'Nouveau',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'available': 'Disponible',
    'occupied': 'Occupé'
  };
  return labels[status] || status;
};

const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    '1': 'danger',
    '11': 'primary',
    '21': 'medium',
    'nouveau': 'danger',
    'en_cours': 'primary',
    'termine': 'medium',
    'available': 'success',
    'occupied': 'warning'
  };
  return colors[status] || 'medium';
};

// Formatage date amélioré
const formatDate = (date: any) => {
  const d = getDateValue(date);
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime()) || d.getTime() === 0) {
    return 'Date inconnue';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Si moins de 24 heures, montrer "il y a X heures"
  if (diffHours < 24) {
    return diffHours === 0 ? "À l'instant" : `Il y a ${diffHours}h`;
  }
  
  // Sinon, formater la date
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Actions
const toggleFilter = (type: 'all' | 'mine') => {
  currentFilter.value = type;
  statusFilter.value = 'all'; // Réinitialiser le filtre de statut
  loadReports();
};

const setStatusFilter = (status: string) => {
  statusFilter.value = status;
};

const clearStatusFilter = () => {
  statusFilter.value = 'all';
};

// Fonction pour voir sur la carte - CORRECTION PRINCIPALE
const viewOnMap = async (report: any) => {
  console.log('📍 Voir sur la carte:', report);
  
  // Stocker les coordonnées du signalement à afficher sur la carte
  const locationData = {
    latitude: report.latitude || report.lat,
    longitude: report.longitude || report.lng,
    zoom: 16, // Zoom pour bien voir le point
    reportId: report.id,
    reportName: report.nameplace || report.siteName || 'Signalement'
  };
  
  // Sauvegarder dans localStorage pour que la carte le récupère
  localStorage.setItem('selectedReportLocation', JSON.stringify(locationData));
  
  // Rediriger vers la page de la carte
  router.push('/tabs/map');
  
  // Afficher un message
  const toast = await toastController.create({
    message: `Redirection vers la carte pour ${locationData.reportName}`,
    duration: 2000,
    color: 'success'
  });
  await toast.present();
};

const viewReportDetails = (report: any) => {
  console.log('Voir détails:', report);
  // Vous pourriez naviguer vers une page de détails
  // router.push(`/report/${report.id}`);
};

const editReport = async (report: any) => {
  if (!report.isMine) {
    const toast = await toastController.create({
      message: 'Vous ne pouvez modifier que vos propres signalements',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  
  console.log('Modifier:', report);
  // Modal d'édition ou navigation
};

const deleteReport = async (report: any) => {
  if (!report.isMine) {
    const toast = await toastController.create({
      message: 'Vous ne pouvez supprimer que vos propres signalements',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message: `Voulez-vous vraiment supprimer "${report.nameplace || report.siteName}" ?`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          performDelete(report);
        }
      }
    ]
  });
  
  await alert.present();
};

const performDelete = async (report: any) => {
  console.log('Suppression:', report);
  // Implémenter la suppression via votre service
  // await deletePoint(report.id);
  
  const toast = await toastController.create({
    message: 'Signalement supprimé',
    duration: 2000,
    color: 'success'
  });
  await toast.present();
  
  // Recharger la liste
  loadReports();
};

onMounted(() => {
  loadReports();
});
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