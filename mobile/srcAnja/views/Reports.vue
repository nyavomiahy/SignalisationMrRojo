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
      <div v-if="reports.length === 0" class="ion-text-center ion-padding">
        <ion-icon :icon="documentTextOutline" size="large" color="medium" />
        <p>Aucun signalement</p>
      </div>
      
      <ion-list v-else>
        <ion-item-sliding v-for="report in filteredReports" :key="report.id">
          <ion-item :detail="true" @click="viewReportDetails(report)">
            <!-- Cercle de statut -->
            <ion-avatar slot="start" :style="{ background: getStatusColor(report.status) }">
              <ion-icon :icon="getStatusIcon(report.status)" color="light" />
            </ion-avatar>
            
            <ion-label>
              <h2>{{ report.nameplace || report.siteName || 'Sans nom' }}</h2>
              <p>
                <ion-icon :icon="locationOutline" size="small" />
                {{ formatLocation(report) }}
              </p>
              <p>
                <ion-text color="medium">
                  {{ formatDate(report.createdAt) }} • 
                  {{ report.surface || 0 }} m² • 
                  {{ report.budget || 0 }} €
                </ion-text>
              </p>
              <div>
                <ion-badge :color="getStatusBadgeColor(report.status)">
                  {{ getStatusLabel(report.status) }}
                </ion-badge>
                <ion-badge color="light" v-if="report.id_entreprise">
                  {{ getEntrepriseName(report.id_entreprise) }}
                </ion-badge>
              </div>
            </ion-label>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="editReport(report)">
              <ion-icon slot="icon-only" :icon="createOutline" />
            </ion-item-option>
            <ion-item-option color="danger" @click="deleteReport(report)">
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      
      <!-- Popover pour filtre par statut -->
      <ion-popover trigger="status-filter" :dismiss-on-select="true">
        <ion-content>
          <ion-list>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('all')">
              Tous les statuts
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('nouveau')">
              <ion-avatar slot="start" style="background: #ff3b30; width: 12px; height: 12px;" />
              Nouveau
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('en_cours')">
              <ion-avatar slot="start" style="background: #5856d6; width: 12px; height: 12px;" />
              En cours
            </ion-item>
            <ion-item :button="true" :detail="false" @click="setStatusFilter('termine')">
              <ion-avatar slot="start" style="background: #8e8e93; width: 12px; height: 12px;" />
              Terminé
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonContent, IonList, IonItem, IonLabel, IonBadge, IonAvatar, IonText,
  IonItemSliding, IonItemOptions, IonItemOption, IonPopover
} from '@ionic/vue';
import {
  filter, locationOutline, documentTextOutline, createOutline, trashOutline,
  alertCircleOutline, timeOutline, checkmarkCircleOutline, closeCircleOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import { getAllPoints, getMyPoints } from '@/services/pointService';
import { getCurrentUserFromStorage } from '@/services/userService';

// Renommer filter pour éviter conflit avec l'icon
const currentFilter = ref<'all' | 'mine'>('all');
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
    console.log('👤 Utilisateur:', currentUser.value?.id);
    
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
        const isMine = currentUser.value && point.userId === currentUser.value.id;
        
        return {
          ...point,
          id: point.id || `point-${index}`,
          // Compatibilité avec l'ancien nom de champ
          siteName: point.nameplace || point.siteName,
          locationName: point.locationName || getDefaultLocation(point),
          isMine: isMine
        };
      });
      
      console.log(`✅ ${reports.value.length} signalements chargés`);
      console.log('Exemple de signalement:', reports.value[0]);
      
    } else {
      console.error('❌ Erreur chargement:', result.error);
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement signalements:', error);
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

// Fonctions pour les statuts
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
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
  if (!date) return 'Date inconnue';
  
  try {
    let d;
    if (date.toDate) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      d = new Date(date);
    } else {
      return 'Date invalide';
    }
    
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur formatage date:', error, date);
    return 'Date invalide';
  }
};

// Actions
const toggleFilter = (type: 'all' | 'mine') => {
  currentFilter.value = type;
  loadReports();
};

const setStatusFilter = (status: string) => {
  statusFilter.value = status;
};

const viewReportDetails = (report: any) => {
  console.log('Voir détails:', report);
  // Navigation vers page détails ou afficher modal
};

const editReport = (report: any) => {
  console.log('Modifier:', report);
  // Modal d'édition
};

const deleteReport = async (report: any) => {
  console.log('Supprimer:', report);
  // Confirmation et suppression
};

onMounted(() => {
  loadReports();
});
</script>

<style scoped>
ion-avatar[slot="start"] {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

ion-item-sliding {
  margin-bottom: 1px;
}

ion-item {
  --padding-start: 8px;
  --inner-padding-end: 8px;
}

ion-label h2 {
  font-weight: 600;
  margin-bottom: 4px;
}

ion-label p {
  margin: 4px 0;
}

ion-badge {
  margin-right: 4px;
  margin-top: 4px;
}
</style>