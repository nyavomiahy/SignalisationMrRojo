<template>
  <ion-page>
    <ion-header>
  <ion-toolbar>
    <ion-title>Signalements Routiers</ion-title>

    <!-- Badge à droite -->
    <div class="user-badge" v-if="currentUser">
      <ion-chip color="primary">
        <ion-icon :icon="person" slot="start" />
        <ion-label>{{ currentUser.username || currentUser.email }}</ion-label>
        <ion-badge color="secondary" v-if="currentUser.name_type === 'Manager'">
          Manager
        </ion-badge>
      </ion-chip>
    </div>

    <!-- Boutons à droite -->
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



    <ion-content >

      <!-- <div v-if="currentUser" class="user-badge">
        <ion-chip color="primary">
          <ion-icon :icon="person" slot="start" />
          <ion-label>{{ currentUser.username || currentUser.email }}</ion-label>
          <ion-badge color="secondary" v-if="currentUser.name_type === 'Manager'">
            Manager
          </ion-badge>
        </ion-chip>
      </div> -->

      <div id="map-container"></div>

      <div class="map-footer" v-if="currentUser">
        <div class="map-filters">
          <div class="filter-chip" :class="{ active: !showOnlyMyPoints }" @click="showAllPoints">
            <ion-icon :icon="globe"></ion-icon>
            <span>Tous</span>
          </div>

          <div class="filter-chip" :class="{ active: showOnlyMyPoints }" @click="showMyPoints">
            <ion-icon :icon="person"></ion-icon>
            <span>Mes signalements</span>
          </div>
        </div>

        <ion-fab-button @click="startAddReport" :disabled="!currentUser">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </div>
      <!-- <div class="map-filters" v-if="currentUser">
        <div class="filter-chip" :class="{ active: !showOnlyMyPoints }" @click="showAllPoints">
          <ion-icon :icon="globe"></ion-icon>
          <span>Tous</span>
        </div>

        <div class="filter-chip" :class="{ active: showOnlyMyPoints }" @click="showMyPoints">
          <ion-icon :icon="person"></ion-icon>
          <span>Mes signalements</span>
        </div>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="startAddReport" :disabled="!currentUser">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab> -->

      <div class="details-overlay" :class="{ visible: selectedReport !== null }" @click="closeDetails"></div>

      <div class="details-panel" :class="{ open: selectedReport !== null, fullscreen: isPanelFullscreen }"
        v-if="selectedReport" @touchstart="startDrag" @touchmove="handleDrag" @touchend="endDrag" @mousedown="startDrag"
        @mousemove="handleDrag" @mouseup="endDrag" @mouseleave="endDrag">
        <!-- Handle pour glisser -->
        <div class="details-handle" @click="togglePanelHeight">
          <div class="handle-bar"></div>
        </div>

        <div class="details-content" :style="{ height: panelHeight + 'px' }">
          <div class="details-header">
            <div class="details-title">
              <h3>{{ selectedReport.siteName || 'Signalement routier' }}</h3>
              <div class="details-subtitle">
                <ion-icon :icon="locationOutline"></ion-icon>
                <span>{{ selectedReport.locationName }}</span>
              </div>
            </div>
            <button class="details-close" @click="closeDetails">
              <ion-icon :icon="close"></ion-icon>
            </button>
          </div>

          <!-- Photos -->
          <div class="details-photos" v-if="selectedReport.images && selectedReport.images.length > 0">
            <div class="photo-item" v-for="(image, index) in selectedReport.images" :key="index">
              <img :src="image" :alt="`Photo ${index + 1}`" />
            </div>
          </div>

          <!-- Informations -->
          <div class="details-info">
            <div class="info-item">
              <div class="info-label">Statut</div>
              <div class="info-value">
                <span class="status-badge" :class="getStatusClass(selectedReport.status)">
                  {{ getStatusLabel(selectedReport.status) }}
                </span>
              </div>
            </div>

            <div class="info-item" v-if="selectedReport.surface">
              <div class="info-label">Surface</div>
              <div class="info-value">{{ selectedReport.surface }} m²</div>
            </div>

            <div class="info-item" v-if="selectedReport.budget">
              <div class="info-label">Budget</div>
              <div class="info-value">{{ formatBudget(selectedReport.budget) }}</div>
            </div>

            <div class="info-item" v-if="selectedReport.entrepriseName">
              <div class="info-label">Entreprise</div>
              <div class="info-value">{{ selectedReport.entrepriseName }}</div>
            </div>

            <div class="info-item" v-if="selectedReport.createdAt">
              <div class="info-label">Date</div>
              <div class="info-value">{{ selectedReport.createdAt }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal de connexion -->
      <ion-modal :is-open="showLoginModal" @didDismiss="closeLoginModal" :initial-breakpoint="0.6"
        :breakpoints="[0, 0.6, 1]" ref="loginModal">
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
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input v-model="loginEmail" type="email" placeholder="email@example.com" :disabled="isLoggingIn"
                    required @input="clearError('email')" autocomplete="email" />
                  <ion-note slot="error" v-if="loginErrors.email">
                    {{ loginErrors.email }}
                  </ion-note>
                </ion-item>

                <ion-item :class="{ 'ion-invalid': loginErrors.password }">
                  <ion-label position="stacked">Mot de passe</ion-label>
                  <ion-input v-model="loginPassword" type="password" placeholder="••••••" :disabled="isLoggingIn"
                    required @input="clearError('password')" autocomplete="current-password" />
                  <ion-note slot="error" v-if="loginErrors.password">
                    {{ loginErrors.password }}
                  </ion-note>
                </ion-item>
              </ion-list>

              <!-- Bouton de connexion -->
              <ion-button expand="block" type="submit" class="ion-margin-top"
                :disabled="isLoggingIn || !loginEmail || !loginPassword" color="primary">
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
      <ion-modal :is-open="showAddReportModal" @didDismiss="cancelAddReport" :initial-breakpoint="0.8"
        :breakpoints="[0, 0.8, 1]">
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
              <ion-input v-model="newReport.surface" type="number" min="1" step="1" placeholder="Ex: 1200" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Budget estimé (Ar)</ion-label>
              <ion-input v-model="newReport.budget" type="number" min="1" step="100" placeholder="Ex: 10000" />
            </ion-item>

            


            <ion-item>
              <ion-label>Entreprise</ion-label>
              <ion-select v-model="newReport.entrepriseId" placeholder="Sélectionner" interface="action-sheet">
                <ion-select-option v-for="entreprise in entreprises" :key="entreprise.id" :value="entreprise.id">
                  {{ entreprise.name }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Nom du site</ion-label>
              <ion-input v-model="newReport.siteName" type="text" placeholder="Ex: Site A, Route principale" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Photo du site (optionnel)</ion-label>

              <div v-if="newReport.imagePreviews.length" class="image-preview">
                <img v-for="(img, index) in newReport.imagePreviews" :key="index" :src="img"
                  style="width:80px;height:80px;object-fit:cover;border-radius:6px;margin-right:6px;" />
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

              <input type="file" accept="image/*" multiple ref="fileInput" style="display: none;"
                @change="onFileSelected" />
            </ion-item>
          </ion-list>

          <div class="ion-padding">
            <ion-button expand="block" @click="submitReport" :disabled="!isReportValid" color="primary">
              Créer le signalement
            </ion-button>

            <ion-button expand="block" fill="clear" @click="cancelAddReport" class="ion-margin-top">
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
            <ion-button expand="block" @click="closeConfirmationModal" class="ion-margin-top" color="success">
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
  IonSpinner,
  IonBadge,
  toastController,
  alertController,
  loadingController
} from '@ionic/vue';
import {
  add,
  locate,
  person,
  logIn,
  close,
  personCircle,
  checkmarkCircle,
  globe,
  locationOutline,
  camera,
  images
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
  getCurrentUserFromStorage,
  type AppUser
} from '@/services/userService';
import {
  createPoint,
  getAllPoints,
  getMyPoints,
  getAllEntreprises
} from '@/services/pointService';
import { uploadPointImageBase64 } from '@/services/imageService';
import { useRouter } from 'vue-router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

// Panneau de détails
const selectedReport = ref<any>(null);

// Login form
const loginEmail = ref('');
const loginPassword = ref('');
const loginError = ref('');
const loginErrors = ref({ email: '', password: '' });


// Ajouter ces variables dans la section des variables réactives
const isPanelFullscreen = ref(false);
const panelHeight = ref(0);
const isDragging = ref(false);
const startY = ref(0);
const startHeight = ref(0);

// Calculer la hauteur initiale (50% de l'écran)
const calculateInitialHeight = () => {
  const screenHeight = window.innerHeight;
  return Math.floor(screenHeight * 0.5); // 50% de l'écran
};

const calculateFullHeight = () => {
  const screenHeight = window.innerHeight;
  return Math.floor(screenHeight * 0.85); // 85% pour laisser un peu d'espace
};

// Fonctions pour le glissement
const startDrag = (e: any) => {
  isDragging.value = true;
  startY.value = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  startHeight.value = panelHeight.value;
  e.preventDefault();
};

const handleDrag = (e: any) => {
  if (!isDragging.value) return;

  const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  const deltaY = startY.value - currentY;
  let newHeight = startHeight.value + deltaY;

  // Limites min et max
  const minHeight = Math.floor(window.innerHeight * 0.3);
  const maxHeight = calculateFullHeight();

  if (newHeight < minHeight) newHeight = minHeight;
  if (newHeight > maxHeight) newHeight = maxHeight;

  panelHeight.value = newHeight;
  e.preventDefault();
};

const endDrag = () => {
  if (!isDragging.value) return;

  isDragging.value = false;

  // Déterminer si on doit basculer en fullscreen ou pas
  const screenHeight = window.innerHeight;
  const halfHeight = Math.floor(screenHeight * 0.5);

  if (panelHeight.value > halfHeight * 1.2) { // Si > 60% de l'écran
    isPanelFullscreen.value = true;
    panelHeight.value = calculateFullHeight();
  } else {
    isPanelFullscreen.value = false;
    panelHeight.value = halfHeight;
  }
};

const togglePanelHeight = () => {
  if (isPanelFullscreen.value) {
    // Revenir à 50%
    isPanelFullscreen.value = false;
    panelHeight.value = calculateInitialHeight();
  } else {
    // Passer en fullscreen
    isPanelFullscreen.value = true;
    panelHeight.value = calculateFullHeight();
  }
};

// Modifier closeDetails pour réinitialiser
const closeDetails = () => {
  selectedReport.value = null;
  isPanelFullscreen.value = false;
};

// Mettre à jour panelHeight quand selectedReport change
watch(selectedReport, (newVal) => {
  if (newVal) {
    // Attendre un tick pour que le DOM soit mis à jour
    setTimeout(() => {
      panelHeight.value = calculateInitialHeight();
    }, 50);
  }
});

// Données pour le nouveau signalement
const newReport = ref({
  lat: 0,
  lng: 0,
  locationName: '',
  surface: '',
  budget: '',
  entrepriseId: '',
  siteName: '',
  imageFiles: [] as File[],
  imagePreviews: [] as string[]
});

// Liste des entreprises
const entreprises = ref<Array<{ id: string; name: string }>>([
  { id: '1', name: 'Colas' },
  { id: '2', name: 'Buildlab' }
]);

// Validation du formulaire
const isReportValid = computed(() => {
  return (
    newReport.value.surface &&
    newReport.value.budget &&          // ✅ AJOUT
    newReport.value.entrepriseId &&
    newReport.value.siteName &&
    parseInt(newReport.value.surface) > 0 &&
    parseInt(newReport.value.budget) > 0 
    // ✅ AJOUT
  );
});


const getCurrentStatus = async (pointId: string | number) => {
  try {

    // NEW STRUCTURE
    const statusQ = query(
      collections.status_point,
      where("id_point", "==", Number(pointId))
    );

    const statusSnap = await getDocs(statusQ);

    if (!statusSnap.empty) {
      const sorted = statusSnap.docs
        .map(d => d.data())
        .sort(
          (a: any, b: any) =>
            getDateValue(b.updated_at || b.created_at).getTime() -
            getDateValue(a.updated_at || a.created_at).getTime()
        );

      return sorted[0].status;
    }

    // OLD STRUCTURE
    const statutQ = query(
      collections.statut_point,
      where("id_point", "==", String(pointId))
    );

    const statutSnap = await getDocs(statutQ);

    if (!statutSnap.empty) {
      const sorted = statutSnap.docs
        .map(d => d.data())
        .sort(
          (a: any, b: any) =>
            getDateValue(b.date).getTime() -
            getDateValue(a.date).getTime()
        );

      return sorted[0].status;
    }

    return "1";

  } catch (e) {
    console.error("Erreur status:", e);
    return "1";
  }
};

const getDateValue = (date: any): Date => {
  if (!date) return new Date(0);
  if (date?.toDate) return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === "string" || typeof date === "number") return new Date(date);
  if (date?.seconds) return new Date(date.seconds * 1000);
  return new Date(0);
};


const getStatusClass = (status: string) => {
  switch (status) {
    case '1': return 'nouveau';
    case '11': return 'en-cours';
    case '21': return 'termine';
    default: return '';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case '1': return 'Nouveau';
    case '11': return 'En cours';
    case '21': return 'Terminé';
    default: return 'Inconnu';
  }
};

const formatBudget = (budget: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(budget);
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
};

// FONCTIONS POUR LES FILTRES
const showAllPoints = () => {
  showOnlyMyPoints.value = false;
  loadPoints();
};

const showMyPoints = () => {
  showOnlyMyPoints.value = true;
  loadPoints();
};

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
const createPinEmojiMarker = (status: string, isMine: boolean) => {
  let emoji = '🚧';
  let bgColor = '#ff3b30';

  if (isMine) {
    emoji = '👤';
    bgColor = '#007aff';
  } else {
    switch (status) {
      case '1':
        emoji = '🚧';
        bgColor = '#ff3b30';
        break;
      case '11':
        emoji = '🛠️';
        bgColor = '#ff9500';
        break;
      case '21':
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

// Initialiser la carte
const initMap = async () => {
  try {
    const pos = await getCurrentLocation();
    map = L.map('map-container').setView([pos.coords.latitude, pos.coords.longitude], 15);
  } catch {
    map = L.map('map-container').setView(ANTANANARIVO_CENTER, 13);
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  map.on('click', async (e: L.LeafletMouseEvent) => {
    if (!currentUser.value) {
      await askLoginBeforeAdd();
      return;
    }

    if (clickMarker) {
      map?.removeLayer(clickMarker);
      clickMarker = null;
    }

    clickMarker = L.marker([e.latlng.lat, e.latlng.lng], {
      icon: createPinEmojiMarker('1', true),
      zIndexOffset: 1000
    }).addTo(map!);

    const locationName = await getLocationName(e.latlng.lat, e.latlng.lng);

    newReport.value = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      locationName: locationName,
      surface: '',
      budget: '',
      entrepriseId: '',
      siteName: '',
      imageFiles: [],
      imagePreviews: []
    };

    showAddReportModal.value = true;
  });

  loadPoints();
};

async function getImagesForPoint(pointId: string): Promise<string[]> {
  const q = query(collections.image_point, where('id_point', '==', pointId));
  const snap = await getDocs(q);

  const images: string[] = [];
  snap.forEach(doc => {
    const data = doc.data();
    if (data.base64) images.push(data.base64);
  });

  return images;
}

const addMarkerToMap = async (point: any, isMine: boolean = false) => {
  if (!map) return;

  const lat = parseFloat(point.latitude) || 0;
  const lng = parseFloat(point.longitude) || 0;

  console.log('📍 Ajout marqueur:', {
    id: point.id,
    lat: lat,
    lng: lng,
    nameplace: point.nameplace,
    id_entreprise: point.id_entreprise,
    typeIdEntreprise: typeof point.id_entreprise,
    entreprisesDisponibles: entreprises.value
  });

  const marker = L.marker([lat, lng], {
    icon: createPinEmojiMarker(point.status, isMine)
  }).addTo(map);
  let entrepriseName = 'Inconnue';

  if (point.id_entreprise) {
    const entrepriseIdStr = String(point.id_entreprise);

    // Chercher par ID string
    let entreprise = entreprises.value.find(e => String(e.id) === entrepriseIdStr);

    // Si non trouvé, chercher par correspondance partielle
    if (!entreprise) {
      entreprise = entreprises.value.find(e =>
        e.id.toString().includes(entrepriseIdStr) ||
        entrepriseIdStr.includes(e.id.toString())
      );
    }

    // Si toujours non trouvé, essayer de convertir en nombre
    if (!entreprise) {
      const entrepriseIdNum = parseInt(point.id_entreprise);
      if (!isNaN(entrepriseIdNum)) {
        entreprise = entreprises.value.find(e =>
          parseInt(e.id) === entrepriseIdNum
        );
      }
    }

    if (entreprise) {
      entrepriseName = entreprise.name;
      console.log('✅ Entreprise trouvée:', entrepriseName);
    } else {
      console.log('❌ Entreprise non trouvée pour ID:', point.id_entreprise);
      console.log('📋 Liste des entreprises disponibles:', entreprises.value);
    }
  }

  // Formater la date
  let dateFormatted = 'Date inconnue';
  if (point.createdAt) {
    try {
      // Gérer le Timestamp Firestore (seconds=1768898522, nanoseconds=699000000)
      if (point.createdAt.seconds !== undefined) {
        // C'est un Timestamp Firestore
        const date = new Date(point.createdAt.seconds * 1000);
        dateFormatted = date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (point.createdAt.toDate) {
        // Méthode toDate() disponible
        dateFormatted = point.createdAt.toDate().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (point.createdAt instanceof Date) {
        dateFormatted = point.createdAt.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (typeof point.createdAt === 'string') {
        dateFormatted = new Date(point.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.log('⚠️ Erreur formatage date:', error, point.createdAt);
    }
  }

  marker.on('click', async () => {
    console.log('📍 Marqueur cliqué:', point.id);



    try {
      // Récupérer les images (optionnel)
      let images = [];
      try {
        images = await getImagesForPoint(point.id);
      } catch (error) {
        console.log('⚠️ Pas d\'images pour ce point:', error);
      }

      // Créer l'objet pour le volet de détails
      selectedReport.value = {
        id: point.id,
        siteName: point.nameplace || 'Signalement routier',
        locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        surface: point.surface || 0,
        budget: point.budget || 0,
        entrepriseName: entrepriseName, // Utiliser le nom trouvé
        status: point.status || '1',
        createdAt: dateFormatted, // Utiliser la date formatée
        images: images
      };

      console.log('📋 Données chargées pour le volet:', selectedReport.value);

      // Centrer la carte sur le marqueur
      map?.panTo([lat, lng], {
        animate: true,
        duration: 0.3
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      showToast('Erreur lors du chargement des détails', 'danger');
    } finally {
      await loading.dismiss();
    }
  });
};

const loadPoints = async () => {
  try {

    let result;

    if (showOnlyMyPoints.value && currentUser.value) {
      result = await getMyPoints();

      if (result.success && result.points) {
        const userId = currentUser.value?.uid || currentUser.value?.id;
        result.points = result.points.filter((p: any) => p.userId === userId);
      }

    } else {
      result = await getAllPoints();
    }

    if (!result?.success || !result?.points) return;

    /* ========= ENRICHIR AVEC STATUS ========= */
    const enriched = await Promise.all(
      result.points.map(async (point: any) => {

        const status = await getCurrentStatus(point.id || point.id_point);

        return {
          ...point,
          status: String(status)
        };
      })
    );

    enriched.sort(
      (a: any, b: any) =>
        getDateValue(b.createdAt).getTime() -
        getDateValue(a.createdAt).getTime()
    );

    if (map) {
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer !== clickMarker) {
          map.removeLayer(layer);
        }
      });
    }

    enriched.forEach((point: any) => {
      const userId = currentUser.value?.uid || currentUser.value?.id;
      const isMine = point.userId === userId;
      addMarkerToMap(point, isMine);
    });

  } catch (error) {
    console.error("❌ loadPoints:", error);
  }
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

const startAddReport = () => {
  if (!currentUser.value) {
    showLoginModal.value = true;
    return;
  }
  showToast('Cliquez sur la carte pour sélectionner un emplacement', 'info');
};

const cancelAddReport = () => {
  showAddReportModal.value = false;
  if (clickMarker && map) {
    map.removeLayer(clickMarker);
    clickMarker = null;
  }
  newReport.value = {
    lat: 0,
    lng: 0,
    locationName: '',
    surface: '',
    budget: '',
    entrepriseId: '',
    siteName: '',
    imageFiles: [],
    imagePreviews: []
  };
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
      budget: parseInt(newReport.value.budget),  // ✅ AJOUT
      id_entreprise: newReport.value.entrepriseId,
      nameplace: newReport.value.siteName,
      status: '1'
    };


    let result;
    if (newReport.value.imageFiles.length > 0) {
      const pointResult = await createPoint(pointData);
      if (!pointResult.success) throw new Error(pointResult.error);

      const pointId = pointResult.pointId;
      for (const file of newReport.value.imageFiles) {
        await uploadPointImageBase64(file, pointId);
      }
      result = { success: true };
    } else {
      result = await createPoint(pointData);
    }

    await loading.dismiss();

    if (result.success) {
      showToast('Signalement créé avec succès!', 'success');
      cancelAddReport();
      showConfirmationModal.value = true;
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!loginEmail.value) {
    loginErrors.value.email = 'Email requis';
    isValid = false;
  } else if (!emailRegex.test(loginEmail.value)) {
    loginErrors.value.email = 'Format email invalide';
    isValid = false;
  }

  if (!loginPassword.value) {
    loginErrors.value.password = 'Mot de passe requis';
    isValid = false;
  }

  return isValid;
};

const toggleLogin = () => {
  showLoginModal.value = true;
};

const closeLoginModal = () => {
  showLoginModal.value = false;
  loginError.value = '';
  loginErrors.value = { email: '', password: '' };
  loginEmail.value = '';
  loginPassword.value = '';
};

const doLogin = async () => {
  if (!validateLoginForm()) return;

  isLoggingIn.value = true;
  loginError.value = '';

  try {
    const result = await loginUserWithFirestore(
      loginEmail.value,
      loginPassword.value
    );

    if (result && result.success && result.user) {
      currentUser.value = result.user;
      showToast(`Bienvenue ${result.user.username || result.user.email}`, 'success');
      closeLoginModal();

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
        console.error('Erreur chargement entreprises:', error);
      }

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

const openCamera = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64, // base64 pour upload
      source: CameraSource.Camera
    });

    if (!photo || !photo.base64String) return;

    // Créer un "File" à partir du base64
    const byteString = atob(photo.base64String);
    const arrayBuffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }
    const file = new File([arrayBuffer], `photo_${Date.now()}.jpg`, {
      type: 'image/jpeg'
    });

    newReport.value.imageFiles.push(file);
    newReport.value.imagePreviews.push(`data:image/jpeg;base64,${photo.base64String}`);
  } catch (error) {
    console.error('Erreur ouverture caméra:', error);
    showToast('Impossible d\'ouvrir la caméra', 'danger');
  }
};


const base64ToBlob = (base64: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
};


const openGallery = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    if (!photo || !photo.base64String) return;

    const base64Data = 'data:image/jpeg;base64,' + photo.base64String;
    newReport.value.imagePreviews.push(base64Data);

    const blob = base64ToBlob(base64Data);
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    newReport.value.imageFiles.push(file);

  } catch (err) {
    console.error('Gallery error:', err);
  }
};


const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  newReport.value.imageFiles = [];
  newReport.value.imagePreviews = [];

  Array.from(target.files).forEach(file => {
    newReport.value.imageFiles.push(file);
    const reader = new FileReader();
    reader.onload = e => {
      newReport.value.imagePreviews.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });

  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const showToast = async (
  message: string,
  color: 'success' | 'danger' | 'warning' | 'medium' | 'info' = 'success',
  duration: number = 2000
) => {
  const toast = await toastController.create({
    message,
    duration,
    color,
    position: 'top'
  });
  await toast.present();
};

// Initialisation
onMounted(async () => {
  console.log('Initialisation Map.vue');

  initMap();

  currentUser.value = getCurrentUserFromStorage();
  console.log('Utilisateur au démarrage:', currentUser.value);

  if (currentUser.value) {
    try {
      const entreprisesResult = await getAllEntreprises();
      if (entreprisesResult.success && entreprisesResult.entreprises) {
        entreprises.value = entreprisesResult.entreprises.map(e => ({
          id: e.id,
          name: e.entreprise_name
        }));
      }
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
    loadPoints();
  }

  onUnmounted(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
});

watch(currentUser, (newVal) => {
  console.log('currentUser changé:', newVal);
});
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.user-badge {
  display: flex;
  align-items: center;
  margin-right: 10px; /* espace avec les boutons */
}


.user-badge ion-chip {
  backdrop-filter: blur(10px);
  background: blue;
}

/* Styles pour le footer de la carte */
.map-footer {
  position: fixed;
  bottom: env(safe-area-inset-bottom, 16px); /* 16px comme fallback si env() non supporté */
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(163, 162, 162, 0.9);
}


/* Ajustement des filtres */
.map-filters {
  display: flex;
  gap: 8px;
}

.filter-chip {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 16px;
  background: #7d7c7c;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}

.filter-chip.active {
  background: #0e4107;
  color: white;
}

ion-fab-button {
  position: static; /* laisse le bouton dans le footer */
}


/* ----- PANNEAU DE DÉTAILS EN BAS ----- */
.details-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow:
    0 -2px 16px rgba(0, 0, 0, 0.1),
    0 -4px 32px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 70vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.details-panel.open {
  transform: translateY(0);
}

.details-handle {
  width: 40px;
  height: 4px;
  background: #DADCE0;
  border-radius: 2px;
  margin: 12px auto 8px;
  cursor: grab;
}

.details-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
}

.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0 16px;
  border-bottom: 1px solid #F0F0F0;
}

.details-title {
  flex: 1;
}

.details-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #202124;
}

.details-subtitle {
  font-size: 13px;
  color: #5F6368;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.details-close {
  padding: 8px;
  background: #F8F9FA;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.details-close ion-icon {
  font-size: 20px;
  color: #5F6368;
}

.details-photos {
  margin: 16px -16px;
  overflow-x: auto;
  display: flex;
  gap: 8px;
  padding: 0 16px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.details-photos::-webkit-scrollbar {
  display: none;
}

.photo-item {
  flex: 0 0 280px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  scroll-snap-align: start;
  position: relative;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-info {
  margin-top: 16px;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  flex: 0 0 110px;
  font-size: 13px;
  color: #5F6368;
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #202124;
  font-weight: 400;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.nouveau {
  background: #FEE;
  color: #C5221F;
}

.status-badge.en-cours {
  background: #E8EAFF;
  color: #5E35B1;
}

.status-badge.termine {
  background: #E6F4EA;
  color: #137333;
}

.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.details-overlay.visible {
  opacity: 1;
  pointer-events: all;
}

/* ----- LOGIN MODAL ----- */
.login-content {
  padding: 0 16px;
}

.login-content ion-item {
  margin-bottom: 16px;
}

.login-content ion-label {
  margin-bottom: 8px !important;
  font-weight: 500;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.login-content ion-input {
  --padding-top: 14px;
  --padding-bottom: 14px;
  --padding-start: 14px;
  --padding-end: 14px;
  border: 1.5px solid var(--ion-color-light-shade);
  border-radius: 10px;
  margin-top: 6px;
  font-size: 16px !important;
}

.login-content ion-input:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.1);
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

.error-message {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.2);
  margin-top: 15px;
}


/* ----- MARKERS ----- */
:deep(.pin-marker) {
  background: transparent;
}

:deep(.pin) {
  width: 36px;
  height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
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

/* ----- FAB BUTTON ----- */
ion-fab-button {
  --background: #1A73E8;
  --background-activated: #1557B0;
  --background-hover: #1E88E5;
  --box-shadow:
    0 2px 8px rgba(26, 115, 232, 0.3),
    0 4px 16px rgba(26, 115, 232, 0.2);
  --border-radius: 50%;
  --size: 56px;
}

ion-fab-button:disabled {
  --background: #DADCE0;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.6;
}

/* ----- IMAGES ----- */
.image-preview {
  margin: 10px 0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.image-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.image-buttons ion-button {
  flex: 1;
  min-width: 120px;
}

/* ----- RESPONSIVE ----- */
@media (max-width: 768px) {
  

  

  .map-filters {
    top: 60px;
    padding: 4px;
    gap: 6px;
  }

  .filter-chip {
    padding: 6px 12px;
    font-size: 13px;
  }

  .filter-chip ion-icon {
    font-size: 16px;
  }

  .login-content {
    padding: 0 12px;
  }

  .login-content ion-label {
    font-size: 13px;
  }

  .details-panel {
    max-height: 75vh;
  }

  .details-title h3 {
    font-size: 16px;
  }

  .photo-item {
    flex: 0 0 240px;
    height: 160px;
  }

  .info-label {
    flex: 0 0 90px;
    font-size: 12px;
  }

  .info-value {
    font-size: 13px;
  }

  ion-fab-button {
    --size: 52px;
  }
}

:deep(.modal-wrapper) {
  border-radius: 16px 16px 0 0;
}

/* ----- PANNEAU DE DÉTAILS GLISSANT ----- */
.details-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow:
    0 -2px 16px rgba(0, 0, 0, 0.1),
    0 -4px 32px rgba(0, 0, 0, 0.08);
  z-index: 2000;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  touch-action: none;
  /* Important pour le glissement */
}

.details-panel.open {
  transform: translateY(0);
}

.details-panel.fullscreen {
  border-radius: 0;
}

/* Handle amélioré pour le glissement */
.details-handle {
  padding: 12px 0 8px;
  cursor: grab;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.details-handle:active {
  cursor: grabbing;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #DADCE0;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.details-handle:hover .handle-bar {
  background: #9AA0A6;
  width: 60px;
  height: 5px;
}

/* Contenu avec hauteur dynamique */
.details-content {
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px 24px;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  transition: height 0.2s ease;
}

.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0 16px;
  border-bottom: 1px solid #F0F0F0;
  flex-shrink: 0;
}

.details-title {
  flex: 1;
}

.details-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #202124;
}

.details-subtitle {
  font-size: 13px;
  color: #5F6368;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.details-close {
  padding: 8px;
  background: #F8F9FA;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  margin-left: 8px;
}

.details-close ion-icon {
  font-size: 20px;
  color: #5F6368;
}

.details-photos {
  margin: 16px -16px;
  overflow-x: auto;
  display: flex;
  gap: 8px;
  padding: 0 16px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.details-photos::-webkit-scrollbar {
  display: none;
}

.photo-item {
  flex: 0 0 280px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  scroll-snap-align: start;
  position: relative;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details-info {
  margin-top: 16px;
}

.info-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  flex: 0 0 110px;
  font-size: 13px;
  color: #5F6368;
  font-weight: 500;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #202124;
  font-weight: 400;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.nouveau {
  background: #FEE;
  color: #C5221F;
}

.status-badge.en-cours {
  background: #E8EAFF;
  color: #5E35B1;
}

.status-badge.termine {
  background: #E6F4EA;
  color: #137333;
}

.details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.details-overlay.visible {
  opacity: 1;
  pointer-events: all;
}



/* Animation de glissement */
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(100%);
  }
}
</style>