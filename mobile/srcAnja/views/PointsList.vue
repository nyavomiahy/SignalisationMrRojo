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
          
          <ion-button @click="logout" v-if="currentUser">
            <ion-icon :icon="logOut" />
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
              
              <!-- Compte de test -->
              <ion-card color="light" class="ion-margin-top">
                <ion-card-content class="ion-text-center">
                  <ion-text color="medium">
                    <small>Comptes de test disponibles</small>
                  </ion-text>
                  <div class="credentials">
                    <div>
                      <strong>Manager:</strong><br>
                      <small>olona@example.com / 123456</small>
                    </div>
                    <div class="ion-margin-top">
                      <strong>Utilisateur:</strong><br>
                      <small>mario@example.com / abcdef</small>
                    </div>
                  </div>
                  <ion-button 
                    expand="block" 
                    fill="outline" 
                    size="small" 
                    class="ion-margin-top"
                    @click="fillTestCredentials('manager')"
                  >
                    Remplir Manager
                  </ion-button>
                  <ion-button 
                    expand="block" 
                    fill="outline" 
                    size="small" 
                    class="ion-margin-top"
                    @click="fillTestCredentials('user')"
                  >
                    Remplir Utilisateur
                  </ion-button>
                </ion-card-content>
              </ion-card>
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
  loadingController
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
import { onMounted, ref, onUnmounted, computed, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Services
import { getCurrentLocation, ANTANANARIVO_CENTER } from '@/services/locationService';
import { 
  loginUserWithFirestore, 
  logoutUserFirestore, 
  getCurrentUserFromStorage,
  type AppUser,
  quickLogin 
} from '@/services/userService';
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
const showOnlyMyPoints = ref(false);
const showLoginModal = ref(false);
const showAddReportModal = ref(false);
const showConfirmationModal = ref(false);
const isLoggingIn = ref(false);

// Login form
const loginEmail = ref('');
const loginPassword = ref('');
const loginError = ref('');
const loginErrors = ref({
  email: '',
  password: ''
});

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
      showLoginModal.value = true;
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

// Charger les points
const loadPoints = async () => {
  if (!map) return;
  
  console.log('🗺️ Chargement des points sur la carte...');
  
  // Nettoyer les marqueurs existants (sauf le marqueur de clic)
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker && layer !== clickMarker) {
      map?.removeLayer(layer);
    }
  });
  
  try {
    let result;
    
    if (showOnlyMyPoints.value && currentUser.value) {
      console.log('🔍 Chargement de MES points uniquement...');
      result = await getMyPoints();
    } else {
      console.log('🔍 Chargement de TOUS les points...');
      result = await getAllPoints();
    }
    
    console.log('📊 Résultat chargement points:', result);
    
    if (result.success && result.points) {
      console.log(`📍 ${result.points.length} points à afficher`);
      
      result.points.forEach((point: any) => {
        const isMine = currentUser.value && point.userId === currentUser.value.id;
        addMarkerToMap(point, isMine);
      });
      
      // Afficher un toast si aucun point
      if (result.points.length === 0) {
        if (showOnlyMyPoints.value) {
          showToast('Aucun signalement personnel à afficher', 'warning');
        } else {
          showToast('Aucun signalement disponible', 'info');
        }
      } else {
        console.log(`✅ ${result.points.length} points chargés sur la carte`);
      }
      
      // Charger les entreprises si nécessaire
      if (entreprises.value.length <= 2) { // Seulement si on a les valeurs par défaut
        try {
          const entreprisesResult = await getAllEntreprises();
          if (entreprisesResult.success && entreprisesResult.entreprises) {
            entreprises.value = entreprisesResult.entreprises.map(e => ({
              id: e.id,
              name: e.entreprise_name
            }));
            console.log(`🏢 ${entreprises.value.length} entreprises chargées`);
          }
        } catch (error) {
          console.error('⚠️ Erreur chargement entreprises:', error);
        }
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

// Ajouter un marqueur à la carte
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
  showToast('Identifiants remplis, cliquez sur "Se connecter"', 'info');
};

const toggleLogin = () => {
  console.log('🔓 Ouverture modal login');
  showLoginModal.value = true;
};

const closeLoginModal = () => {
  console.log('🔒 Fermeture modal login');
  showLoginModal.value = false;
  loginError.value = '';
  loginErrors.value = { email: '', password: '' };
  loginEmail.value = '';
  loginPassword.value = '';
};

const doLogin = async () => {
  console.log('🔑 Début processus de connexion...');
  console.log('📧 Email:', loginEmail.value);
  console.log('🔑 Password:', '*'.repeat(loginPassword.value.length));
  
  if (!validateLoginForm()) {
    console.log('❌ Validation formulaire échouée');
    return;
  }
  
  isLoggingIn.value = true;
  loginError.value = '';
  
  try {
    console.log('🌐 Appel service d\'authentification...');
    const result = await loginUserWithFirestore(loginEmail.value, loginPassword.value);
    
    console.log('📨 Résultat authentification:', result);
    
    if (result.success && result.user) {
      currentUser.value = result.user;
      console.log('✅ Utilisateur connecté avec succès:', currentUser.value);
      
      // Afficher un toast de bienvenue
      await showToast(
        `Bienvenue ${result.user.username} !`,
        'success'
      );
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        closeLoginModal();
      }, 500);
      
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
      
      // Recharger les points
      await loadPoints();
      
    } else {
      loginError.value = result.error || 'Erreur de connexion inconnue';
      console.error('❌ Échec connexion:', loginError.value);
      await showToast(loginError.value, 'danger');
    }
  } catch (error: any) {
    console.error('🚨 Erreur login:', error);
    loginError.value = 'Erreur technique: ' + error.message;
    await showToast(loginError.value, 'danger');
  } finally {
    isLoggingIn.value = false;
    console.log('🏁 Fin processus de connexion');
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
    console.error('❌ Erreur déconnexion:', error);
    showToast('Erreur lors de la déconnexion', 'danger');
  }
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

// Test rapide de connexion (pour débogage)
const quickTestLogin = async (type: 'manager' | 'user') => {
  console.log('🚀 Connexion rapide test:', type);
  const user = quickLogin(type);
  currentUser.value = user;
  
  showToast(`Connexion test: ${user.username}`, 'success');
  
  // Charger les données
  loadPoints();
  
  // Charger les entreprises
  try {
    const entreprisesResult = await getAllEntreprises();
    if (entreprisesResult.success && entreprisesResult.entreprises) {
      entreprises.value = entreprisesResult.entreprises.map(e => ({
        id: e.id,
        name: e.entreprise_name
      }));
    }
  } catch (error) {
    console.error('⚠️ Erreur chargement entreprises:', error);
  }
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

watch(showLoginModal, (newVal) => {
  console.log('👁️ showLoginModal changé:', newVal);
});
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
</style>