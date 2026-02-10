<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item class="input-item">
          <ion-label position="stacked">Email</ion-label>
          <ion-input 
            v-model="email" 
            type="email"
            placeholder="Votre email"
          />
        </ion-item>

        <ion-item class="input-item">
          <ion-label position="stacked">Mot de passe</ion-label>
          <ion-input 
            v-model="password" 
            type="password"
            placeholder="Votre mot de passe"
          />
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top login-button" @click="login">
        Se connecter
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonButton,
  toastController
} from '@ionic/vue';

import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginUserWithFirestore } from '@/services/userService';

const email = ref('');
const password = ref('');
const router = useRouter();
const route = useRoute();

const login = async () => {
  try {
    const user = await loginUserWithFirestore(
      email.value,
      password.value
    );

    // ✅ SI ON EST ICI → LOGIN OK
    console.log('Utilisateur connecté:', user);

    const redirect = route.query.redirect || '/tabs/map';
    router.replace(redirect as string);

    const toast = await toastController.create({
      message: `Bienvenue ${user.username}`,
      duration: 1500,
      color: 'success'
    });
    toast.present();

  } catch (error) {
    const toast = await toastController.create({
      message: 'Email ou mot de passe incorrect',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
};

</script>

<style scoped>
/* Fix pour mobile - labels stacked au lieu de floating */
.input-item {
  margin-bottom: 16px;
}

.input-item ion-label {
  margin-bottom: 8px !important;
  font-weight: 500;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.input-item ion-input {
  --padding-top: 12px;
  --padding-bottom: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 8px;
  margin-top: 4px;
  font-size: 16px; /* Important pour éviter le zoom sur iOS */
}

.input-item ion-input::part(native) {
  padding: 12px;
}

/* Focus state */
.input-item ion-input:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.1);
}

.login-button {
  margin-top: 24px;
  height: 48px;
  font-weight: 600;
  font-size: 16px;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .input-item ion-label {
    font-size: 13px;
  }
  
  .input-item ion-input {
    font-size: 16px; /* Garde 16px minimum pour éviter zoom iOS */
  }
  
  .login-button {
    height: 50px;
    font-size: 16px;
  }
}
</style>