<template>
  <ion-page>
    <!-- Header avec boutons -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Signalements Routiers</ion-title>
        
        <!-- Filtre mes points -->
        <ion-buttons slot="start">
          <ion-button @click="toggleMyPoints" v-if="currentUser">
            <ion-icon :icon="filter" />
            {{ showOnlyMyPoints ? 'Tous' : 'Mes' }}
          </ion-button>
        </ion-buttons>
        
        <!-- Boutons droite -->
        <ion-buttons slot="end">
          <ion-button @click="centerOnMyLocation">
            <ion-icon :icon="locate" />
          </ion-button>
          
          <ion-button @click="toggleLogin" v-if="!currentUser">
            <ion-icon :icon="logIn" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    
    <ion-content :fullscreen="true" class="ion-no-padding">
      <!-- Badge utilisateur -->
      <div v-if="currentUser" class="user-badge">
        <ion-chip color="primary">
          <ion-icon :icon="person" slot="start" />
          <ion-label>{{ currentUser.username || currentUser.email }}</ion-label>
          <ion-badge color="secondary" v-if="currentUser.name_type === 'Manager'">
            Manager
          </ion-badge>
        </ion-chip>
      </div>

      <!-- Carte -->
      <div id="map-container"></div>

      <!-- Bouton pour ajouter un signalement -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="startAddReport" :disabled="!currentUser">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <!-- Modal de connexion -->
      <ion-modal
        :is-open="showLoginModal"
        @didDismiss="closeLoginModal"
        :initial-breakpoint="0.6"
        :breakpoints="[0, 0.6, 1]"
        ref="loginModal"
      >
        <ion-content class="ion-padding">
          <ion-toolbar>
            <ion-title>Connexion</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeLoginModal">
                <ion-icon :icon="close" />
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
          
          <div class="login-content">
            <!-- Logo -->
            <div class="login-logo ion-text-center">
              <ion-icon :icon="personCircle" size="large" color="primary" />
              <h3>Bienvenue</h3>
              <p class="ion-text-center ion-text-wrap">
                Connectez-vous pour gérer les signalements
              </p>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="doLogin" class="ion-margin-top">
              <ion-list lines="full">
                <ion-item :class="{ 'ion-invalid': loginErrors.email }">
                  <ion-label position="floating">Email</ion-label>
                  <ion-input
                    v-model="loginEmail"
                    type="email"
                    placeholder="email@example.com"
                    :disabled="isLoggingIn"
                    required
                    @input="clearError('email')"
                    autocomplete="email"
                  />
                  <ion-note slot="error" v-if="loginErrors.email">
                    {{ loginErrors.email }}
                  </ion-note>
                </ion-item>
                
                <ion-item :class="{ 'ion-invalid': loginErrors.password }">
                  <ion-label position="floating">Mot de passe</ion-label>
                  <ion-input
                    v-model="loginPassword"
                    type="password"
                    placeholder="••••••"
                    :disabled="isLoggingIn"
                    required
                    @input="clearError('password')"
                    autocomplete="current-password"
                  />
                  <ion-note slot="error" v-if="loginErrors.password">
                    {{ loginErrors.password }}
                  </ion-note>
                </ion-item>
              </ion-list>

              <!-- Bouton de connexion -->
              <ion-button
                expand="block"
                type="submit"
                class="ion-margin-top"
                :disabled="isLoggingIn || !loginEmail || !loginPassword"
                color="primary"
              >
                <ion-spinner v-if="isLoggingIn" name="crescent" slot="start" />
                <ion-icon v-else :icon="logIn" slot="start" />
                Se connecter
              </ion-button>

              <!-- Message d'erreur -->
              <div v-if="loginError" class="error-message ion-text-center ion-margin-top">
                <ion-text color="danger">
                  <p>{{ loginError }}</p>
                </ion-text>
              </div>
            </form>
          </div>
        </ion-content>
      </ion-modal>

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
            
 <ion-item>
  <ion-label position="stacked">Photo du site (optionnel)</ion-label>
  
  <!-- Affichage de l'image sélectionnée -->
  <div v-if="newReport.imagePreview" class="image-preview">
    <img :src="newReport.imagePreview" alt="Aperçu" />
    <ion-button size="small" @click="removeImage" fill="clear" color="danger">
      <ion-icon :icon="close" slot="icon-only" />
    </ion-button>
  </div>
  
  <!-- Boutons de sélection -->
  <div class="image-buttons" style="display: flex; gap: 8px; margin-top: 10px;">
    <ion-button size="small" @click="openCamera" expand="block">
      <ion-icon :icon="camera" slot="start" />
      Caméra
    </ion-button>
    
    <ion-button size="small" @click="openGallery" expand="block">
      <ion-icon :icon="images" slot="start" />
      Galerie
    </ion-button>
  </div>
  
  <!-- Input file caché -->
  <input
    type="file"
    accept="image/*"
    ref="fileInput"
    style="display: none;"
    @change="onFileSelected"
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
  logIn,
  logOut,
  close,
  personCircle,
  checkmarkCircle
} from 'ionicons/icons';
import { onMounted, ref, onUnmounted, computed, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDocs, query, where } from 'firebase/firestore';
import { collections } from '@/firebase/config';

// Services
import { getCurrentLocation, ANTANANARIVO_CENTER } from '@/services/locationService';
import {
  loginUserWithFirestore,
  logoutUserFirestore,
  getCurrentUserFromStorage,
  type AppUser
} from '@/services/userService';
import {
  createPoint,
  createPointWithImage,
  getAllPoints,
  getMyPoints,
  getAllEntreprises
} from '@/services/pointService';

import { useRouter } from 'vue-router';
import { camera, images } from 'ionicons/icons';


const router = useRouter();


const fileInput = ref<HTMLInputElement>();

// Variables réactives
let map: L.Map | null = null;
let clickMarker: L.Marker | null = null;
const currentUser = ref<AppUser | null>(null);
const showOnlyMyPoints = ref(false);
const showLoginModal = ref(false);
const showAddReportModal = ref(false);
const showConfirmationModal = ref(false);
const isLoggingIn = ref(false);

// Login form
const loginEmail = ref('');
const loginPassword = ref('');
const loginError = ref('');
const loginErrors = ref({ email: '', password: '' });

// Données pour le nouveau signalement

const newReport = ref({
  lat: 0,
  lng: 0,
  locationName: '',
  surface: '',
  budget: '',
  entrepriseId: '',
  siteName: '',
  imageFile: null as File | null,
  imagePreview: '' // Ajout pour l'aperçu
});

const reportImageInput = ref<HTMLInputElement>();

const triggerCamera = () => {
  if (reportImageInput.value) {
    reportImageInput.value.setAttribute('capture', 'environment');
    reportImageInput.value.click();
  }
};
const triggerGallery = () => {
  if (reportImageInput.value) {
    reportImageInput.value.removeAttribute('capture');
    reportImageInput.value.click();
  }
};
const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    newReport.value.imageFile = target.files[0];
  }
};

// Liste des entreprises
const entreprises = ref<Array<{ id: string; name: string }>>([
  { id: '1', name: 'Colas' },
  { id: '2', name: 'Buildlab' }
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

const askLoginBeforeAdd = async () => {
  const alert = await alertController.create({
    header: 'Connexion requise',
    message: 'Veuillez vous connecter pour ajouter un signalement.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Continuer',
        handler: () => {
          router.push({
            path: '/login',
            query: { redirect: '/tabs/map' }
          });
        }
      }
    ]
  });

  await alert.present();
};

// Icône pour les marqueurs
const createMarkerIcon = (isMine: boolean = false, status: string = '1') => {
  let color = '#ff3b30'; // Rouge par défaut (nouveau)
  
  if (isMine) {
    color = '#007aff'; // Bleu pour mes points
  } else {
    switch (status) {
      case 'occupied':
        color = '#ff9500'; // Orange pour occupé
        break;
      case 'available':
        color = '#34c759'; // Vert pour disponible
        break;
      case '11':
        color = '#5856d6'; // Violet pour en cours
        break;
      case '21':
        color = '#8e8e93'; // Gris pour terminé
        break;
    }
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      cursor: pointer;
    "></div>`,
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
  await askLoginBeforeAdd();
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


const statusFilter = ref('all'); // 'all', '1', '11', '21'
// Charger les points
const loadPoints = async () => {
  console.log('🚀 Chargement points avec filtres:', {
    showOnlyMyPoints: showOnlyMyPoints.value,
    statusFilter: statusFilter.value,
    currentUser: currentUser.value ? {
      id: currentUser.value.id,
      uid: currentUser.value.uid,
      email: currentUser.value.email
    } : 'Non connecté'
  });
  
  try {
    const result = await loadPointsForFilter(showOnlyMyPoints.value, statusFilter.value);
    
    if (result.success && result.points) {
      console.log('✅ Points chargés:', result.points);
      
      // Ajouter chaque point à la carte
      result.points.forEach((point: any) => {
        const userId = currentUser.value?.uid || currentUser.value?.uid;
        const isMine = point.userId === userId;
        console.log(`📍 Point ${point.nameplace || 'sans-nom'}: userId=${point.userId}, isMine=${isMine}`);
        addMarkerToMap(point, isMine);
      });
      
      console.log(`📍 ${result.points.length} points ajoutés à la carte`);
      
      // Afficher un toast si aucun point
      if (result.points.length === 0) {
        const message = showOnlyMyPoints.value 
          ? 'Vous n\'avez pas encore créé de signalements'
          : 'Aucun signalement à afficher avec ces filtres';
        showToast(message, 'warning', 2000);
      }
    } else {
      console.error('❌ Erreur chargement points:', result.error);
      showToast(result.error || 'Erreur lors du chargement', 'danger');
    }
  } catch (error: any) {
    console.error('❌ Erreur chargement points:', error);
    showToast('Erreur lors du chargement des points', 'danger');
  }
};

// Fonction utilitaire pour récupérer l'image base64 d'un point
async function getBase64ForPoint(pointId: string): Promise<string | null> {
  const q = query(collections.image_point, where('id_point', '==', pointId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const data = snap.docs[0].data();
    return data.base64 || null;
  }
  return null;
}

// Ajouter un marqueur à la carte
const addMarkerToMap = async (point: any, isMine: boolean = false) => {
  if (!map) return;
  
  const marker = L.marker([point.latitude, point.longitude], {
    icon: createPinEmojiMarker(point.status, isMine)
  }).addTo(map);
  
  // Trouver le nom de l'entreprise
  const entreprise = entreprises.value.find(e => e.id === point.id_entreprise);
  const entrepriseName = entreprise ? entreprise.name : 'Inconnue';
  
  // Formater la date
  let dateFormatted = 'Date inconnue';
  if (point.createdAt) {
    try {
      if (point.createdAt.toDate) {
        dateFormatted = point.createdAt.toDate().toLocaleDateString('fr-FR');
      } else if (point.createdAt instanceof Date) {
        dateFormatted = point.createdAt.toLocaleDateString('fr-FR');
      }
    } catch (error) {
      console.log('Erreur formatage date:', error);
    }
  }

  // Récupérer l'image base64 du point
  let imageHtml = '';
  const base64 = await getBase64ForPoint(point.id);
  if (base64) {
    imageHtml = `<img src="${base64}" alt="photo" style="max-width:100%;max-height:120px;margin-top:8px;border-radius:8px;" />`;
  }
  
  // Contenu du popup
  const popupContent = `<div style="min-width: 250px; padding: 10px; font-family: sans-serif;">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <div style="
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${isMine ? '#007aff' : '#ff3b30'};
        margin-right: 8px;
      "></div>
      <strong style="color: ${isMine ? '#007aff' : '#333'}">
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
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">
        <small style="color: #777;">📅 ${dateFormatted}</small>
      </div>
      ${imageHtml}
    </div>
  </div>`;
  
  marker.bindPopup(popupContent);
  
  // Ouvrir au survol
  marker.on('mouseover', () => {
    marker.openPopup();
  });
  marker.on('mouseout', () => {
    marker.closePopup();
  });
};

const createPinEmojiMarker = (
  status: string,
  isMine: boolean
) => {
  let emoji = '🚧';
  let bgColor = '#ff3b30'; // rouge = nouveau

  if (isMine) {
    emoji = '👤';
    bgColor = '#007aff'; // bleu
  } else {
    switch (status) {
      case '1': // nouveau
        emoji = '🚧';
        bgColor = '#ff3b30';
        break;
      case '11': // en cours
        emoji = '🛠️';
        bgColor = '#ff9500';
        break;
      case '21': // terminé
        emoji = '✅';
        bgColor = '#34c759';
        break;
    }
  }

  return L.divIcon({
    className: 'pin-marker',
    html: `
      <div class="pin" style="background:${bgColor}">
        <span>${emoji}</span>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -42]
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
      return (
        [addr.road, addr.suburb, addr.city || addr.town || addr.village]
          .filter(Boolean)
          .join(', ') || `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      );
    }
    return `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  } catch {
    return `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
};

// Actions utilisateur
const centerOnMyLocation = async () => {
  if (!map) return;
  try {
    const pos = await getCurrentLocation();
    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
  } catch (error) {
    showToast('Veuillez activer la localisation', 'warning');
  }
};

const toggleMyPoints = () => {
  if (!currentUser.value) {
    showLoginModal.value = true;
    return;
  }
  showOnlyMyPoints.value = !showOnlyMyPoints.value;
  showToast(
    showOnlyMyPoints.value
      ? 'Affichage de vos signalements uniquement'
      : 'Affichage de tous les signalements',
    'success'
  );
  loadPoints();
};

const startAddReport = () => {
  if (!currentUser.value) {
    showLoginModal.value = true;
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
    siteName: '',
    imageFile: null
  };
  if (reportImageInput.value) reportImageInput.value.value = '';
};

const submitReport = async () => {
  if (!isReportValid.value || !currentUser.value) return;
  
  const loading = await loadingController.create({
    message: 'Création du signalement...',
    spinner: 'crescent'
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
    
    console.log('📤 Envoi des données...');
    console.log('📷 Image file:', newReport.value.imageFile ? 'Présente' : 'Absente');
    
    // Appeler le service avec ou sans image
    let result;
    if (newReport.value.imageFile) {
      result = await createPointWithImage(pointData, newReport.value.imageFile);
    } else {
      result = await createPoint(pointData);
    }
    
    await loading.dismiss();
    
    if (result.success) {
      showToast('Signalement créé avec succès!', 'success');
      
      // Nettoyer le formulaire
      cancelAddReport();
      
      // Afficher la confirmation
      showConfirmationModal.value = true;
      
      // Recharger les points
      setTimeout(() => {
        loadPoints();
      }, 1000);
    } else {
      throw new Error(result.error || 'Erreur lors de la création');
    }
    
  } catch (error: any) {
    await loading.dismiss();
    console.error('❌ Erreur:', error);
    showToast(error.message || 'Impossible de créer le signalement', 'danger');
  }
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
};

// Fonctions d'authentification
const clearError = (field: string) => {
  if (loginErrors.value[field as keyof typeof loginErrors.value]) {
    loginErrors.value[field as keyof typeof loginErrors.value] = '';
  }
  if (loginError.value) {
    loginError.value = '';
  }
};

const validateLoginForm = () => {
  let isValid = true;
  loginErrors.value = { email: '', password: '' };
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!loginEmail.value) {
    loginErrors.value.email = 'Email requis';
    isValid = false;
  } else if (!emailRegex.test(loginEmail.value)) {
    loginErrors.value.email = 'Format email invalide';
    isValid = false;
  }
  
  // Validation mot de passe
  if (!loginPassword.value) {
    loginErrors.value.password = 'Mot de passe requis';
    isValid = false;
  }
  
  return isValid;
};

const fillTestCredentials = (type: 'manager' | 'user') => {
  if (type === 'manager') {
    loginEmail.value = 'olona@example.com';
    loginPassword.value = '123456';
  } else {
    loginEmail.value = 'mario@example.com';
    loginPassword.value = 'abcdef';
  }
  clearError('email');
  clearError('password');
  loginError.value = '';
};

const toggleLogin = () => {
  console.log('Ouvrir modal login');
  showLoginModal.value = true;
};

const closeLoginModal = () => {
  console.log('Fermer modal login');
  showLoginModal.value = false;
  loginError.value = '';
  loginErrors.value = { email: '', password: '' };
  loginEmail.value = '';
  loginPassword.value = '';
};

const doLogin = async () => {
  console.log('Début connexion');

  if (!validateLoginForm()) return;

  isLoggingIn.value = true;
  loginError.value = '';

  try {
    const result = await loginUserWithFirestore(
      loginEmail.value,
      loginPassword.value
    );

    console.log('Résultat login:', result);

    // ✅ CAS CORRECT
    if (result && result.success && result.user) {
      currentUser.value = result.user;

      showToast(`Bienvenue ${result.user.username || result.user.email}`, 'success');

      closeLoginModal();
      loadPoints();
    } else {
      loginError.value = result?.error || 'Identifiants incorrects';
      showToast(loginError.value, 'danger');
    }
  } catch (error: any) {
    console.error('Erreur login:', error);
    loginError.value = error.message || 'Erreur de connexion';
    showToast(loginError.value, 'danger');
  } finally {
    isLoggingIn.value = false;
  }
};


const logout = async () => {
  try {
    const result = logoutUserFirestore();
    if (result.success) {
      currentUser.value = null;
      showOnlyMyPoints.value = false;
      showToast('Déconnecté avec succès', 'medium');
      // Recharger les points
      loadPoints();
    }
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    showToast('Erreur lors de la déconnexion', 'danger');
  }
};

const getMarkerIconByStatus = (
  status: string,
  isMine: boolean
): L.Icon => {
  let iconUrl = '/assets/markers/marker-new.png';

  if (isMine) {
    iconUrl = '/assets/markers/marker-mine.png';
  } else {
    switch (status) {
      case '1': // nouveau
        iconUrl = '/assets/markers/marker-new.png';
        break;
      case '11': // en cours
        iconUrl = '/assets/markers/marker-progress.png';
        break;
      case '21': // terminé
        iconUrl = '/assets/markers/marker-done.png';
        break;
    }
  }

  return L.icon({
    iconUrl,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40]
  });
};

const loadPointsForFilter = async (myPoints: boolean, status: string) => {
  try {
    console.log('🔍 Chargement avec filtres:', { myPoints, status });
    
    // Si on veut "Mes signalements" mais pas d'utilisateur connecté
    if (myPoints && !currentUser.value) {
      console.log('⚠️ Utilisateur non connecté pour "Mes signalements"');
      showToast('Veuillez vous connecter pour voir vos signalements', 'warning');
      return { success: true, points: [] };
    }
    
    let result;
    if (myPoints) {
      console.log('🔍 Chargement de MES signalements...');
      console.log('👤 ID utilisateur:', currentUser.value?.uid || currentUser.value?.id);
      
      result = await getMyPoints();
      
      if (result.success && result.points) {
        // Vérifier que les points appartiennent bien à l'utilisateur
        const userId = currentUser.value?.uid || currentUser.value?.id;
        console.log('🔍 Vérification propriété - User ID:', userId);
        
        result.points = result.points.filter((point: any) => {
          const isMine = point.userId === userId;
          console.log(`Point ${point.id || 'sans-id'}: userId=${point.userId}, isMine=${isMine}`);
          return isMine;
        });
      }
    } else {
      console.log('🔍 Chargement de TOUS les signalements...');
      result = await getAllPoints();
    }
    
    if (!result.success) {
      console.error('❌ Erreur chargement:', result.error);
      return result;
    }
    
    // Appliquer le filtre par statut
    let filteredPoints = result.points || [];
    if (status !== 'all') {
      filteredPoints = filteredPoints.filter((p: any) => p.status === status);
    }
    
    console.log(`📊 Résultats: ${filteredPoints.length} points après filtres`);
    
    // Nettoyer la carte avant d'ajouter les nouveaux marqueurs
    if (map) {
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer !== clickMarker) {
          map.removeLayer(layer);
        }
      });
    }
    
    return { success: true, points: filteredPoints };
  } catch (error: any) {
    console.error('❌ Erreur dans loadPointsForFilter:', error);
    return { success: false, error: error.message };
  }
};

// Helper function pour afficher des toasts
const showToast = async (
  message: string,
  color: 'success' | 'danger' | 'warning' | 'medium' | 'info' = 'success'
) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top'
  });
  await toast.present();
};

// Initialisation
onMounted(async () => {
  console.log('Initialisation Map.vue');
  
  // Initialiser la carte
  initMap();
  
  // Vérifier si déjà connecté au démarrage
  currentUser.value = getCurrentUserFromStorage();
  console.log('Utilisateur au démarrage:', currentUser.value);
  
  if (currentUser.value) {
    console.log('Utilisateur déjà connecté, chargement des données...');
    // Charger les entreprises
    try {
      const entreprisesResult = await getAllEntreprises();
      if (entreprisesResult.success && entreprisesResult.entreprises) {
        entreprises.value = entreprisesResult.entreprises.map(e => ({
          id: e.id,
          name: e.entreprise_name
        }));
        console.log('Entreprises chargées:', entreprises.value);
      }
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
    // Charger les points
    loadPoints();
  }
  
  onUnmounted(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
});

// Watch pour debug
watch(currentUser, (newVal) => {
  console.log('currentUser changé:', newVal);
});

watch(showLoginModal, (newVal) => {
  console.log('showLoginModal changé:', newVal);
});


const openCamera = () => {
  if (!fileInput.value) return;
  
  // Pour mobile, on utilise capture
  fileInput.value.setAttribute('capture', 'environment');
  fileInput.value.accept = 'image/*';
  fileInput.value.click();
};

const openGallery = () => {
  if (!fileInput.value) return;
  
  fileInput.value.removeAttribute('capture');
  fileInput.value.accept = 'image/*';
  fileInput.value.click();
};

// Gérer la sélection de fichier
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('L\'image est trop volumineuse (max 5MB)', 'danger');
      return;
    }
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image', 'danger');
      return;
    }
    
    // Sauvegarder le fichier
    newReport.value.imageFile = file;
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      newReport.value.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    showToast('Image sélectionnée', 'success');
  }
};

// Supprimer l'image
const removeImage = () => {
  newReport.value.imageFile = null;
  newReport.value.imagePreview = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

</script>





<style scoped>
#map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}


.user-badge {
  position: absolute;
  top: 70px;
  left: 10px;
  z-index: 1000;
  pointer-events: none;
}

.user-badge ion-chip {
  backdrop-filter: blur(10px);
  background: rgba(var(--ion-color-primary-rgb), 0.9);
}

/* Styles pour la modal de connexion */
.login-content {
  padding: 0 16px;
}

.login-logo {
  padding: 20px 0;
}

.login-logo h3 {
  margin: 10px 0 5px 0;
  font-weight: 600;
  font-size: 1.4rem;
}

.login-logo p {
  color: var(--ion-color-medium);
  font-size: 14px;
  line-height: 1.4;
}

.credentials {
  margin: 15px 0;
  text-align: left;
  padding: 12px;
  background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 8px;
  font-size: 14px;
}

.error-message {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.2);
  margin-top: 15px;
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
  .user-badge {
    top: 60px;
    left: 5px;
  }
  
  .user-badge ion-chip {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .login-content {
    padding: 0 8px;
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
:deep(.emoji-marker) {
  font-size: 26px;
  text-align: center;
  line-height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
  cursor: pointer;
  transition: transform 0.2s ease;
}

:deep(.emoji-marker:hover) {
  transform: scale(1.2);
}

:deep(.pin-marker) {
  background: transparent;
}

:deep(.pin) {
  width: 36px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.35);
}

:deep(.pin span) {
  transform: rotate(45deg);
  position: absolute;
  top: 6px;
  left: 6px;
  width: 24px;
  height: 24px;
  text-align: center;
  font-size: 18px;
  line-height: 24px;
}

:deep(.pin-marker:hover .pin) {
  transform: rotate(-45deg) scale(1.15);
}

/* Amélioration de la barre de filtre */
.filter-bar {
  position: absolute;
  top: 70px;
  left: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.98);
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.1);
  transition: all 0.3s ease;
}

/* Animation au survol */
.filter-bar:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

/* Styles pour les segments améliorés */
.filter-bar ion-segment {
  --background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 12px;
  padding: 4px;
  height: 44px;
}

.filter-bar ion-segment-button {
  --border-radius: 10px;
  --background-checked: var(--ion-color-primary);
  --color-checked: white;
  --color: var(--ion-color-medium);
  --indicator-height: 0;
  height: 36px;
  min-height: 36px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-bar ion-segment-button:hover {
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.1);
}

.filter-bar ion-segment-button::part(indicator) {
  height: 100%;
  border-radius: 10px;
}

.filter-bar ion-label {
  font-size: 14px;
  font-weight: 500;
}

/* Style pour les boutons de statut avec couleurs */
.filter-bar ion-segment-button[value="all"] {
  --background-checked: var(--ion-color-medium);
}

.filter-bar ion-segment-button[value="1"] {
  --background-checked: #ff3b30; /* Rouge pour Nouveau */
}

.filter-bar ion-segment-button[value="11"] {
  --background-checked: #5856d6; /* Violet pour En cours */
}

.filter-bar ion-segment-button[value="21"] {
  --background-checked: #34c759; /* Vert pour Terminé */
}

/* Indicateur actif */
.filter-bar ion-segment-button.segment-button-checked {
  font-weight: 600;
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .filter-bar {
    left: 5px;
    right: 5px;
    top: 65px;
    padding: 10px;
  }
  
  .filter-bar ion-label {
    font-size: 13px;
  }
  
  .filter-bar ion-segment {
    height: 40px;
  }
  
  .filter-bar ion-segment-button {
    height: 32px;
    min-height: 32px;
  }

  /* Dans le style scoped */
.image-preview {
  margin: 10px 0;
  position: relative;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 2px solid var(--ion-color-light);
}

.image-preview ion-button {
  position: absolute;
  top: -8px;
  right: -8px;
  --background: var(--ion-color-danger);
  --color: white;
  --padding-start: 4px;
  --padding-end: 4px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  --border-radius: 50%;
  width: 32px;
  height: 32px;
}

.image-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.image-buttons ion-button {
  flex: 1;
  min-width: 120px;
}
}


</style>