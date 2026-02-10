<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list>
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input v-model="email" type="email" />
        </ion-item>

        <ion-item>
          <ion-label position="floating">Mot de passe</ion-label>
          <ion-input v-model="password" type="password" />
        </ion-item>
      </ion-list>

      <ion-button expand="block" class="ion-margin-top" @click="login">
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
