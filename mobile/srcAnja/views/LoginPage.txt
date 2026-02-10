<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="login-container">
        <!-- Logo -->
        <div class="logo-section ion-text-center ion-margin-top">
          <ion-icon :icon="map" size="large" color="primary" />
          <h1>Signalements Routiers</h1>
          <p class="ion-text-center">
            Connectez-vous pour accéder à l'application
          </p>
        </div>
        
        <!-- Formulaire -->
        <form @submit.prevent="doLogin" class="login-form ion-margin-top">
          <ion-list lines="full">
            <ion-item>
              <ion-label position="floating">Email</ion-label>
              <ion-input 
                v-model="email" 
                type="email" 
                placeholder="votre@email.com"
                :disabled="isLoading"
                required
              />
            </ion-item>
            
            <ion-item>
              <ion-label position="floating">Mot de passe</ion-label>
              <ion-input 
                v-model="password" 
                type="password" 
                placeholder="••••••"
                :disabled="isLoading"
                required
              />
            </ion-item>
          </ion-list>
          
          <!-- Bouton -->
          <ion-button 
            expand="block" 
            type="submit" 
            class="ion-margin-top"
            :disabled="isLoading || !email || !password"
            color="primary"
          >
            <ion-spinner v-if="isLoading" name="crescent" slot="start" />
            Se connecter
          </ion-button>
          
          <!-- Message d'erreur -->
          <div v-if="errorMessage" class="error-message ion-text-center ion-margin-top">
            <ion-text color="danger">
              <p>{{ errorMessage }}</p>
            </ion-text>
          </div>
          
          <!-- Comptes de test (optionnel) -->
          
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonButton,
  IonSpinner,
  IonList,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  toastController
} from '@ionic/vue';
import { map } from 'ionicons/icons';

// Importez votre service d'authentification
import { loginUserWithFirestore } from '@/services/userService';

const router = useRouter();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const doLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // Utiliser le vrai service d'authentification
    const result = await loginUserWithFirestore(email.value, password.value);
    
    if (result.success && result.user) {
      // Afficher un message de succès
      const toast = await toastController.create({
        message: `Bienvenue ${result.user.username} !`,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      // Rediriger vers les tabs
      router.push('/tabs/map');
    } else {
      errorMessage.value = result.error || 'Identifiants incorrects';
    }
  } catch (error: any) {
    console.error('Erreur login:', error);
    errorMessage.value = 'Erreur de connexion. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-section h1 {
  margin: 15px 0 10px 0;
  font-size: 1.8rem;
  color: var(--ion-color-primary);
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-message {
  padding: 12px;
  border-radius: 8px;
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid rgba(var(--ion-color-danger-rgb), 0.2);
}

.credentials {
  margin: 15px 0;
  text-align: left;
  padding: 12px;
  background: rgba(var(--ion-color-light-rgb), 0.5);
  border-radius: 8px;
  font-size: 14px;
}
</style>