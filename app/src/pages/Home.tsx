import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Welcome to Snap Purchases!</h2>
        <p>Start by taking a photo of an item you want to sell.</p>
      </IonContent>
    </IonPage>
  );
};

export default Home; 