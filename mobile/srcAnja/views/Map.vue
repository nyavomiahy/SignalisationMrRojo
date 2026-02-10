<template>
  <ion-page>
    <!-- Header avec boutons -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Signalements Routiers</ion-title>
        
        <!-- Bouton filtre avancé -->
        <ion-buttons slot="start">
          <ion-button id="filter-trigger">
            <ion-icon :icon="filter" slot="start" />
            Filtres
          </ion-button>
        </ion-buttons>
        
        <!-- Boutons droite -->
        <ion-buttons slot="end">
          <ion-button @click="centerOnMyLocation">
            <ion-icon :icon="locate" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-no-padding">
      <!-- Badge utilisateur et infos filtre -->
      <div class="filter-info" v-if="currentUser">
        <ion-chip color="primary" @click="toggleMyPoints">
          <ion-icon :icon="person" slot="start" />
          <ion-label>{{ currentUser.username }}</ion-label>
          <ion-badge color="secondary" v-if="currentUser.name_type === 'Manager'">
            Manager
          </ion-badge>
          <ion-icon :icon="chevronDown" slot="end" />
        </ion-chip>
        
        <!-- Indicateur de filtres actifs -->
        <div v-if="activeFilters.length > 0" class="active-filters">
          <ion-chip v-for="filter in activeFilters" :key="filter" color="medium" @click="clearFilter(filter)">
            <ion-label>{{ filter }}</ion-label>
            <ion-icon :icon="closeCircle" />
          </ion-chip>
          <ion-button size="small" fill="clear" @click="clearAllFilters">
            Tout effacer
          </ion-button>
        </div>
      </div>
      
      <!-- Carte -->
      <div id="map-container"></div>
      
      <!-- Bouton pour ajouter un signalement -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="startAddReport">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
      
      <!-- Popover pour les filtres -->
      <ion-popover trigger="filter-trigger" :dismiss-on-select="false">
        <ion-content class="ion-padding">
          <ion-list>
            <!-- Filtre par type -->
            <ion-item>
              <ion-label>Type d'affichage</ion-label>
              <ion-select 
                v-model="filterType" 
                placeholder="Tous"
                @ionChange="applyFilters"
              >
                <ion-select-option value="all">Tous les signalements</ion-select-option>
                <ion-select-option value="mine">Mes signalements</ion-select-option>
                <ion-select-option value="recent">Récents (7 derniers jours)</ion-select-option>
              </ion-select>
            </ion-item>
            
            <!-- Filtre par statut -->
            <ion-item>
              <ion-label>Statut</ion-label>
              <ion-select 
                v-model="filterStatus" 
                placeholder="Tous statuts"
                multiple
                @ionChange="applyFilters"
              >
                <ion-select-option value="nouveau">Nouveau</ion-select-option>
                <ion-select-option value="en_cours">En cours</ion-select-option>
                <ion-select-option value="termine">Terminé</ion-select-option>
                <ion-select-option value="available">Disponible</ion-select-option>
                <ion-select-option value="occupied">Occupé</ion-select-option>
              </ion-select>
            </ion-item>
            
            <!-- Filtre par entreprise -->
            <ion-item>
              <ion-label>Entreprise</ion-label>
              <ion-select 
                v-model="filterEntreprise" 
                placeholder="Toutes entreprises"
                @ionChange="applyFilters"
              >
                <ion-select-option value="">Toutes</ion-select-option>
                <ion-select-option 
                  v-for="entreprise in entreprises" 
                  :key="entreprise.id" 
                  :value="entreprise.id"
                >
                  {{ entreprise.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            
            <!-- Filtre par date -->
            <ion-item>
              <ion-label>Date</ion-label>
              <ion-select 
                v-model="filterDate" 
                placeholder="Toutes dates"
                @ionChange="applyFilters"
              >
                <ion-select-option value="">Toutes dates</ion-select-option>
                <ion-select-option value="today">Aujourd'hui</ion-select-option>
                <ion-select-option value="week">Cette semaine</ion-select-option>
                <ion-select-option value="month">Ce mois</ion-select-option>
              </ion-select>
            </ion-item>
            
            <!-- Boutons d'action -->
            <ion-item>
              <ion-button slot="end" fill="clear" @click="resetFilters">
                Réinitialiser
              </ion-button>
              <ion-button slot="end" @click="applyFilters">
                Appliquer
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
      
      <!-- Modal pour ajouter un signalement -->
      <ion-modal 
        :is-open="showAddReportModal" 
        @didDismiss="cancelAddReport"
        :initial-breakpoint="0.8"
        :breakpoints="[0, 0.8, 1]"
      >
        <ion-content>
          <ion-toolbar>
            <ion-title>Nouveau Signalement</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="cancelAddReport">
                <ion-icon :icon="close" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
          
          <ion-list class="ion-padding">
            <ion-item>
              <ion-label position="stacked">Lieu</ion-label>
              <ion-input :value="newReport.locationName" readonly />
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Surface (m²)</ion-label>
              <ion-input 
                v-model="newReport.surface" 
                type="number" 
                min="1" 
                step="1" 
                placeholder="Ex: 1200" 
              />
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Budget estimé (€)</ion-label>
              <ion-input 
                v-model="newReport.budget" 
                type="number" 
                min="1" 
                step="100" 
                placeholder="Ex: 10000" 
              />
            </ion-item>
            
            <ion-item>
              <ion-label>Entreprise</ion-label>
              <ion-select 
                v-model="newReport.entrepriseId" 
                placeholder="Sélectionner"
                interface="action-sheet"
              >
                <ion-select-option 
                  v-for="entreprise in entreprises" 
                  :key="entreprise.id" 
                  :value="entreprise.id"
                >
                  {{ entreprise.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Nom du site</ion-label>
              <ion-input 
                v-model="newReport.siteName" 
                type="text" 
                placeholder="Ex: Site A, Route principale"
              />
            </ion-item>
          </ion-list>
          
          <div class="ion-padding">
            <ion-button 
              expand="block" 
              @click="submitReport" 
              :disabled="!isReportValid"
              color="primary"
            >
              Créer le signalement
            </ion-button>
            
            <ion-button 
              expand="block" 
              fill="clear" 
              @click="cancelAddReport"
              class="ion-margin-top"
            >
              Annuler
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
      
      <!-- Modal de confirmation -->
      <ion-modal :is-open="showConfirmationModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>Confirmation</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="ion-text-center">
            <ion-icon :icon="checkmarkCircle" size="large" color="success" />
            <h2>Signalement créé !</h2>
            <p>Votre signalement a été enregistré avec succès.</p>
            <ion-button 
              expand="block" 
              @click="closeConfirmationModal"
              class="ion-margin-top"
              color="success"
            >
              OK
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFab,
  IonFabButton,
  IonChip,
  IonLabel,
  IonModal,
  IonItem,
  IonInput,
  IonText,
  IonList,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonBadge,
  IonPopover,
  toastController,
  alertController,
  loadingController,
  modalController
} from '@ionic/vue';
import { 
  add, 
  locate, 
  filter, 
  person, 
  close,
  checkmarkCircle,
  chevronDown,
  closeCircle
} from 'ionicons/icons';
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Services
import { getCurrentLocation, ANTANANARIVO_CENTER } from '@/services/locationService';
import { getCurrentUserFromStorage, type AppUser } from '@/services/userService';
import { 
  createPoint, 
  getAllPoints, 
  getMyPoints,
  getAllEntreprises 
} from '@/services/pointService';

// Variables réactives
let map: L.Map | null = null;
let clickMarker: L.Marker | null = null;
const currentUser = ref<AppUser | null>(null);
const showAddReportModal = ref(false);
const showConfirmationModal = ref(false);

// Variables pour les filtres
const filterType = ref('all'); // all, mine, recent
const filterStatus = ref<string[]>([]);
const filterEntreprise = ref('');
const filterDate = ref('');

// Données pour le nouveau signalement
const newReport = ref({
  lat: 0,
  lng: 0,
  locationName: '',
  surface: '',
  budget: '',
  entrepriseId: '',
  siteName: ''
});

// Liste des entreprises
const entreprises = ref<Array<{id: string, name: string}>>([
  { id: '1', name: 'Colas' },
  { id: '2', name: 'Buildlab' },
  { id: '3', name: 'Voirie Tana' },
  { id: '4', name: 'Municipalité' }
]);

// Validation du formulaire
const isReportValid = computed(() => {
  return (
    newReport.value.surface &&
    newReport.value.budget &&
    newReport.value.entrepriseId &&
    newReport.value.siteName &&
    parseInt(newReport.value.surface) > 0 &&
    parseInt(newReport.value.budget) > 0
  );
});

// Filtres actifs pour affichage
const activeFilters = computed(() => {
  const filters = [];
  
  if (filterType.value !== 'all') {
    filters.push(filterType.value === 'mine' ? 'Mes signalements' : 'Récents');
  }
  
  if (filterStatus.value.length > 0) {
    filters.push(`${filterStatus.value.length} statut(s)`);
  }
  
  if (filterEntreprise.value) {
    const entreprise = entreprises.value.find(e => e.id === filterEntreprise.value);
    if (entreprise) {
      filters.push(entreprise.name);
    }
  }
  
  if (filterDate.value) {
    filters.push(filterDate.value === 'today' ? 'Aujourd\'hui' : 
                filterDate.value === 'week' ? 'Cette semaine' : 'Ce mois');
  }
  
  return filters;
});

// Icône pour les marqueurs
const createMarkerIcon = (isMine: boolean = false, status: string = 'nouveau') => {
  let color = '#ff3b30'; // Rouge par défaut (nouveau)
  
  if (isMine) {
    color = '#007aff'; // Bleu pour mes points
  } else {
    switch(status) {
      case 'occupied':
        color = '#ff9500'; // Orange pour occupé
        break;
      case 'available':
        color = '#34c759'; // Vert pour disponible
        break;
      case 'en_cours':
        color = '#5856d6'; // Violet pour en cours
        break;
      case 'termine':
        color = '#8e8e93'; // Gris pour terminé
        break;
    }
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Initialiser la carte
const initMap = async () => {
  try {
    const pos = await getCurrentLocation();
    map = L.map('map-container').setView([pos.coords.latitude, pos.coords.longitude], 15);
  } catch {
    map = L.map('map-container').setView(ANTANANARIVO_CENTER, 13);
  }
  
  // Couche OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  // Gérer les clics sur la carte
  map.on('click', async (e: L.LeafletMouseEvent) => {
    if (!currentUser.value) {
      showToast('Veuillez vous connecter pour ajouter un signalement', 'warning');
      return;
    }
    
    // Nettoyer le marqueur précédent
    if (clickMarker) {
      map?.removeLayer(clickMarker);
      clickMarker = null;
    }
    
    // Ajouter un marqueur temporaire
    clickMarker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon: createMarkerIcon(true),
      zIndexOffset: 1000
    }).addTo(map!);
    
    // Récupérer le nom du lieu
    const locationName = await getLocationName(e.latlng.lat, e.latlng.lng);
    
    // Préparer les données pour le modal
    newReport.value = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      locationName: locationName,
      surface: '',
      budget: '',
      entrepriseId: '',
      siteName: ''
    };
    
    // Afficher le modal
    showAddReportModal.value = true;
  });
  
  // Charger les points existants
  loadPoints();
};

// Charger les points avec filtres
const loadPoints = async () => {
  if (!map) return;
  
  console.log('🗺️ Chargement des points avec filtres...');
  console.log('Filtres:', {
    type: filterType.value,
    status: filterStatus.value,
    entreprise: filterEntreprise.value,
    date: filterDate.value
  });
  
  // Nettoyer les marqueurs existants (sauf le marqueur de clic)
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker && layer !== clickMarker) {
      map?.removeLayer(layer);
    }
  });
  
  try {
    let result;
    
    // D'abord charger les données de base
    if (filterType.value === 'mine') {
      result = await getMyPoints();
    } else {
      result = await getAllPoints();
    }
    
    if (result.success && result.points) {
      // Appliquer les filtres supplémentaires
      let filteredPoints = result.points;
      
      // Filtrer par statut
      if (filterStatus.value.length > 0) {
        filteredPoints = filteredPoints.filter((point: any) => 
          filterStatus.value.includes(point.status || 'nouveau')
        );
      }
      
      // Filtrer par entreprise
      if (filterEntreprise.value) {
        filteredPoints = filteredPoints.filter((point: any) => 
          point.id_entreprise === filterEntreprise.value
        );
      }
      
      // Filtrer par date
      if (filterDate.value) {
        const now = new Date();
        filteredPoints = filteredPoints.filter((point: any) => {
          if (!point.createdAt) return false;
          
          let pointDate;
          try {
            pointDate = point.createdAt.toDate ? point.createdAt.toDate() : new Date(point.createdAt);
          } catch {
            return false;
          }
          
          const diffTime = Math.abs(now.getTime() - pointDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          switch(filterDate.value) {
            case 'today':
              return diffDays <= 1;
            case 'week':
              return diffDays <= 7;
            case 'month':
              return diffDays <= 30;
            default:
              return true;
          }
        });
      }
      
      // Filtrer pour les récents (si type = recent)
      if (filterType.value === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        filteredPoints = filteredPoints.filter((point: any) => {
          if (!point.createdAt) return false;
          
          try {
            const pointDate = point.createdAt.toDate ? point.createdAt.toDate() : new Date(point.createdAt);
            return pointDate >= sevenDaysAgo;
          } catch {
            return false;
          }
        });
      }
      
      console.log(`📍 ${filteredPoints.length} points après filtrage`);
      
      // Afficher les points
      filteredPoints.forEach((point: any) => {
        const isMine = currentUser.value && point.userId === currentUser.value.id;
        addMarkerToMap(point, isMine);
      });
      
      // Afficher un toast si aucun point
      if (filteredPoints.length === 0) {
        showToast('Aucun signalement correspondant aux filtres', 'warning');
      }
      
    } else {
      console.error('❌ Erreur chargement points:', result.error);
      if (result.error) {
        showToast(result.error, 'danger');
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement points:', error);
    showToast('Erreur lors du chargement des points', 'danger');
  }
};

// Ajouter un marqueur à la carte (même fonction qu'avant)
const addMarkerToMap = (point: any, isMine: boolean = false) => {
  if (!map) return;
  
  const marker = L.marker([point.latitude, point.longitude], {
    icon: createMarkerIcon(isMine, point.status)
  }).addTo(map);
  
  // Trouver le nom de l'entreprise
  const entreprise = entreprises.value.find(e => e.id === point.id_entreprise);
  const entrepriseName = entreprise ? entreprise.name : point.id_entreprise || 'Inconnue';
  
  // Formater la date
  let dateFormatted = 'Date inconnue';
  if (point.createdAt) {
    try {
      if (point.createdAt.toDate) {
        const date = point.createdAt.toDate();
        dateFormatted = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (point.createdAt instanceof Date) {
        dateFormatted = point.createdAt.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.log('⚠️ Erreur formatage date:', error);
    }
  }
  
  // Contenu du popup
  const popupContent = `
    <div style="min-width: 250px; padding: 10px; font-family: sans-serif;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${isMine ? '#007aff' : '#ff3b30'};
          margin-right: 8px;
        "></div>
        <strong style="color: ${isMine ? '#007aff' : '#333'};">
          ${point.nameplace || 'Signalement'} 
          ${isMine ? '<small style="color: #007aff;">(À moi)</small>' : ''}
        </strong>
      </div>
      
      <div style="font-size: 13px; color: #555;">
        <div style="margin-bottom: 4px;">
          <span>📍 ${point.latitude?.toFixed(4) || '0'}, ${point.longitude?.toFixed(4) || '0'}</span>
        </div>
        <div style="margin-bottom: 4px;">
          <span>📏 <strong>${point.surface || '0'} m²</strong></span>
        </div>
        <div style="margin-bottom: 4px;">
          <span>💰 <strong>${point.budget || '0'} €</strong></span>
        </div>
        <div style="margin-bottom: 4px;">
          <span>🏢 ${entrepriseName}</span>
        </div>
        <div style="margin-bottom: 4px;">
          <span>👤 ${point.userName || 'Utilisateur'}</span>
        </div>
        <div style="margin-bottom: 4px;">
          <span>📊 Statut: <strong>${point.status || 'nouveau'}</strong></span>
        </div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">
          <small style="color: #777;">📅 ${dateFormatted}</small>
        </div>
      </div>
    </div>
  `;
  
  marker.bindPopup(popupContent);
  
  // Ouvrir au survol
  marker.on('mouseover', () => {
    marker.openPopup();
  });
  
  marker.on('mouseout', () => {
    marker.closePopup();
  });
  
  // Ouvrir au clic
  marker.on('click', () => {
    marker.openPopup();
  });
};

const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
    );
    const data = await response.json();
    if (data.address) {
      const addr = data.address;
      return [
        addr.road,
        addr.suburb,
        addr.city || addr.town || addr.village
      ].filter(Boolean).join(', ') || `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
    return `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch {
    return `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};

// Fonctions pour les filtres
const applyFilters = () => {
  console.log('Application des filtres');
  loadPoints();
};

const resetFilters = () => {
  filterType.value = 'all';
  filterStatus.value = [];
  filterEntreprise.value = '';
  filterDate.value = '';
  loadPoints();
};

const clearFilter = (filterName: string) => {
  // Logique pour effacer un filtre spécifique
  // (À implémenter selon vos besoins)
  loadPoints();
};

const clearAllFilters = () => {
  resetFilters();
};

const toggleMyPoints = () => {
  filterType.value = filterType.value === 'mine' ? 'all' : 'mine';
  applyFilters();
};

// Actions utilisateur
const centerOnMyLocation = async () => {
  if (!map) return;
  
  try {
    const pos = await getCurrentLocation();
    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
    showToast('Position centrée sur votre localisation', 'success');
  } catch (error) {
    showToast('Veuillez activer la localisation', 'warning');
  }
};

const startAddReport = () => {
  if (!currentUser.value) {
    showToast('Veuillez vous connecter pour ajouter un signalement', 'warning');
    return;
  }
  
  showToast('Cliquez sur la carte pour sélectionner un emplacement', 'info');
};

const cancelAddReport = () => {
  showAddReportModal.value = false;
  
  // Nettoyer le marqueur de clic
  if (clickMarker && map) {
    map.removeLayer(clickMarker);
    clickMarker = null;
  }
  
  // Réinitialiser le formulaire
  newReport.value = {
    lat: 0,
    lng: 0,
    locationName: '',
    surface: '',
    budget: '',
    entrepriseId: '',
    siteName: ''
  };
};

const submitReport = async () => {
  if (!isReportValid.value || !currentUser.value) return;
  
  const loading = await loadingController.create({
    message: 'Création du signalement...',
    spinner: 'crescent',
    duration: 3000
  });
  
  await loading.present();
  
  try {
    const pointData = {
      latitude: newReport.value.lat,
      longitude: newReport.value.lng,
      surface: parseInt(newReport.value.surface),
      budget: parseInt(newReport.value.budget),
      id_entreprise: newReport.value.entrepriseId,
      nameplace: newReport.value.siteName
    };
    
    console.log('📝 Données du point à créer:', pointData);
    
    const result = await createPoint(pointData);
    
    if (result.success) {
      await loading.dismiss();
      cancelAddReport();
      
      // Afficher la modal de confirmation
      showConfirmationModal.value = true;
      
      // Recharger les points après un délai
      setTimeout(() => {
        loadPoints();
      }, 1000);
      
    } else {
      throw new Error(result.error || 'Erreur inconnue lors de la création');
    }
  } catch (error: any) {
    console.error('❌ Erreur création signalement:', error);
    await loading.dismiss();
    
    showToast(error.message || 'Impossible de créer le signalement', 'danger');
  }
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
};

// Helper function pour afficher des toasts
const showToast = async (message: string, color: 'success' | 'danger' | 'warning' | 'medium' | 'info' = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top'
  });
  await toast.present();
  return toast;
};

// Initialisation
onMounted(async () => {
  console.log('🗺️ Initialisation Map.vue...');
  
  // Initialiser la carte
  await initMap();
  
  // Vérifier si déjà connecté au démarrage
  currentUser.value = getCurrentUserFromStorage();
  console.log('👤 Utilisateur au démarrage:', currentUser.value);
  
  if (currentUser.value) {
    console.log('✅ Utilisateur déjà connecté, chargement des données...');
    
    // Charger les entreprises
    try {
      const entreprisesResult = await getAllEntreprises();
      if (entreprisesResult.success && entreprisesResult.entreprises) {
        entreprises.value = entreprisesResult.entreprises.map(e => ({
          id: e.id,
          name: e.entreprise_name
        }));
        console.log('🏢 Entreprises chargées:', entreprises.value);
      }
    } catch (error) {
      console.error('⚠️ Erreur chargement entreprises:', error);
    }
    
    // Charger les points
    await loadPoints();
  } else {
    console.log('ℹ️ Aucun utilisateur connecté, affichage des points publics');
    await loadPoints();
  }
  
  onUnmounted(() => {
    if (map) {
      map.remove();
      map = null;
      console.log('🗺️ Carte nettoyée');
    }
  });
});

// Watch pour debug
watch(currentUser, (newVal) => {
  console.log('👁️ currentUser changé:', newVal);
}, { immediate: true });
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.filter-info {
  position: absolute;
  top: 70px;
  left: 10px;
  z-index: 1000;
  max-width: 90%;
}

.filter-info ion-chip {
  backdrop-filter: blur(10px);
  background: rgba(var(--ion-color-primary-rgb), 0.9);
  cursor: pointer;
}

.active-filters {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.active-filters ion-chip {
  font-size: 12px;
  height: 24px;
}

/* Styles pour les popups */
:deep(.leaflet-popup-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
}

:deep(.leaflet-popup-tip) {
  background: white;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-marker-icon) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.leaflet-marker-icon:hover) {
  transform: scale(1.1);
}

/* Ajustements pour mobile */
@media (max-width: 768px) {
  .filter-info {
    top: 60px;
    left: 5px;
  }
  
  .filter-info ion-chip {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .active-filters {
    max-width: 300px;
  }
  
  :deep(.leaflet-popup) {
    max-width: 280px !important;
  }
  
  :deep(.leaflet-popup-content) {
    font-size: 13px;
  }
}

/* Animation pour la modal */
:deep(.modal-wrapper) {
  border-radius: 16px 16px 0 0;
}

/* Style pour le bouton FAB */
ion-fab-button {
  --background: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary-shade);
  --background-hover: var(--ion-color-primary-tint);
  --border-radius: 50%;
  --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.4);
  --size: 56px;
}

ion-fab-button:disabled {
  --background: var(--ion-color-medium);
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0.5;
}
</style>