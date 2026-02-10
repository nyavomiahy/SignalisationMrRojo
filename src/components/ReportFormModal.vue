<!-- src/components/ReportFormModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @didDismiss="closeModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>Nouveau Signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="close" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Emplacement -->
      <div class="location-section">
        <ion-item lines="none">
          <ion-icon :icon="location" slot="start" color="primary" />
          <ion-label class="ion-text-wrap">
            <h3>{{ locationName }}</h3>
            <p>Lat: {{ position.lat.toFixed(6) }} | Lng: {{ position.lng.toFixed(6) }}</p>
          </ion-label>
        </ion-item>
      </div>
      
      <!-- Formulaire en 3 champs seulement -->
      <ion-list>
        <!-- Surface -->
        <ion-item>
          <ion-label position="stacked">
            <ion-text color="primary">Surface (m²) *</ion-text>
          </ion-label>
          <ion-input 
            v-model="form.surface" 
            type="number" 
            placeholder="Ex: 2.5"
            min="0.1"
            step="0.1"
            required
            @keyup.enter="focusNext('budget')"
          >
            <ion-text slot="end" color="medium">m²</ion-text>
          </ion-input>
        </ion-item>
        
        <!-- Budget -->
        <ion-item>
          <ion-label position="stacked">
            <ion-text color="primary">Budget estimé (€) *</ion-text>
          </ion-label>
          <ion-input 
            v-model="form.budget" 
            type="number" 
            placeholder="Ex: 1500"
            min="1"
            required
            @keyup.enter="focusNext('company')"
            ref="budgetInput"
          >
            <ion-text slot="end" color="medium">€</ion-text>
          </ion-input>
        </ion-item>
        
        <!-- Entreprise -->
        <ion-item>
          <ion-label position="stacked">
            <ion-text color="primary">Entreprise *</ion-text>
          </ion-label>
          <ion-select 
            v-model="form.company" 
            placeholder="Choisir une entreprise"
            interface="action-sheet"
            required
          >
            <ion-select-option value="Municipalité d'Antananarivo">
              Municipalité d'Antananarivo
            </ion-select-option>
            <ion-select-option value="Voirie Tana">
              Voirie Tana
            </ion-select-option>
            <ion-select-option value="Eau Madagascar">
              Eau Madagascar
            </ion-select-option>
            <ion-select-option value="JIRAMA">
              JIRAMA
            </ion-select-option>
            <ion-select-option value="Entreprise privée">
              Entreprise privée
            </ion-select-option>
            <ion-select-option value="Autre">
              Autre
            </ion-select-option>
          </ion-select>
        </ion-item>
        
        <!-- Si "Autre" est choisi -->
        <ion-item v-if="form.company === 'Autre'">
          <ion-input 
            v-model="form.customCompany" 
            placeholder="Nom de l'entreprise"
            @keyup.enter="submitForm"
            ref="companyInput"
          />
        </ion-item>

        <!-- Image (optionnel) -->
        <ion-item>
          <ion-label position="stacked">
            <ion-text color="medium">Photo (optionnel)</ion-text>
          </ion-label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            @change="onImageSelected"
            ref="imageInput"
            class="image-input"
          />
          <ion-text slot="helper" v-if="form.image" color="success">
            ✓ Image sélectionnée
          </ion-text>
        </ion-item>
      </ion-list>
      
      <!-- Bouton d'envoi -->
      <div class="submit-section">
        <ion-button 
          expand="block" 
          @click="submitForm" 
          :disabled="!isFormValid || isSubmitting"
          class="ion-margin-top"
        >
          <ion-icon :icon="checkmark" slot="start" />
          {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText
} from '@ionic/vue';
import { close, location, checkmark } from 'ionicons/icons';
import { ref, watch, computed, nextTick } from 'vue';
import { getLocationName } from '@/services/geocodingService';

// Props
const props = defineProps<{
  isOpen: boolean;
  position: {
    lat: number;
    lng: number;
  };
}>();

// Événements
const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  'submit': [data: any];
}>();

// Références pour le focus
const budgetInput = ref();
const companyInput = ref();
const imageInput = ref<HTMLInputElement>();

// Données du formulaire (3 champs seulement + image)
const form = ref({
  surface: '',
  budget: '',
  company: 'Municipalité d\'Antananarivo',
  customCompany: '',
  image: null as File | null
});

// État de soumission
const isSubmitting = ref(false);

// Nom du lieu
const locationName = ref('Localisation...');

// Validation
const isFormValid = computed(() => {
  const hasSurface = form.value.surface && parseFloat(form.value.surface) > 0;
  const hasBudget = form.value.budget && parseFloat(form.value.budget) > 0;
  const hasCompany = form.value.company;
  
  if (form.value.company === 'Autre') {
    return hasSurface && hasBudget && form.value.customCompany.trim() !== '';
  }
  
  return hasSurface && hasBudget && hasCompany;
});

// Fermer le modal
const closeModal = () => {
  emit('update:isOpen', false);
  resetForm();
};

// Réinitialiser le formulaire
const resetForm = () => {
  form.value = {
    surface: '',
    budget: '',
    company: 'Municipalité d\'Antananarivo',
    customCompany: '',
    image: null
  };
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

// Focus sur le champ suivant
const focusNext = async (field: 'budget' | 'company') => {
  await nextTick();
  
  if (field === 'budget' && budgetInput.value) {
    budgetInput.value.$el.setFocus();
  } else if (field === 'company' && companyInput.value) {
    companyInput.value.$el.setFocus();
  }
};

// Gérer la sélection d'image
const onImageSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    form.value.image = files[0];
    console.log('📷 Image sélectionnée:', files[0].name);
  }
};

// Récupérer le nom du lieu
const fetchLocationName = async () => {
  try {
    const name = await getLocationName(props.position.lat, props.position.lng);
    locationName.value = name || 'Emplacement sélectionné';
  } catch {
    locationName.value = `Position: ${props.position.lat.toFixed(4)}, ${props.position.lng.toFixed(4)}`;
  }
};

// Soumettre le formulaire
const submitForm = () => {
  if (!isFormValid.value) return;
  
  const reportData = {
    position: props.position,
    locationName: locationName.value,
    surface: parseFloat(form.value.surface),
    budget: parseFloat(form.value.budget),
    company: form.value.company === 'Autre' ? form.value.customCompany : form.value.company,
    timestamp: new Date().toISOString(),
    status: 'nouveau',
    image: form.value.image // Ajouter l'image au données
  };
  
  emit('submit', reportData);
  closeModal();
};

// Watchers
watch(() => props.position, fetchLocationName, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm();
    fetchLocationName();
  }
});
</script>

<style scoped>
.location-section {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.location-section h3 {
  margin: 0 0 4px 0;
  font-size: 1.1em;
  font-weight: 600;
}

.location-section p {
  margin: 0;
  font-size: 0.9em;
  color: var(--ion-color-medium);
  font-family: monospace;
}

.submit-section {
  margin-top: 32px;
}

/* Style des inputs */
ion-input, ion-select {
  --padding-start: 0;
  --inner-padding-end: 0;
}

/* Animation de focus */
ion-item.item-has-focus {
  --background-focused: var(--ion-color-primary-tint);
  --border-color: var(--ion-color-primary);
}

/* Style de l'input fichier */
.image-input {
  display: block;
  width: 100%;
  padding: 8px 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1em;
}

.image-input::file-selector-button {
  padding: 8px 16px;
  margin-right: 8px;
  background: var(--ion-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
</style>