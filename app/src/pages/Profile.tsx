import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { currentUser, logout, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      setToastMessage('Successfully signed in with Google');
      setShowToast(true);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setToastMessage('Failed to sign in with Google');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {currentUser ? (
          <>
            <div className="ion-text-center ion-padding">
              {currentUser.photoURL && (
                <IonAvatar style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                  <img src={currentUser.photoURL} alt="Profile" />
                </IonAvatar>
              )}
              <h2 className="ion-margin-top">{currentUser.displayName || 'User'}</h2>
              <p>{currentUser.email}</p>
            </div>

            <IonItem>
              <IonLabel>
                <h2>Account Details</h2>
                <p>Email: {currentUser.email}</p>
                {currentUser.displayName && <p>Name: {currentUser.displayName}</p>}
              </IonLabel>
            </IonItem>

            <IonButton expand="block" onClick={logout} className="ion-margin-top">
              Logout
            </IonButton>
          </>
        ) : (
          <div className="ion-text-center ion-padding">
            <h2>Welcome to Snap Purchases</h2>
            <p>Sign in to manage your listings and profile</p>
            
            <IonButton
              expand="block"
              color="light"
              className="ion-margin-top"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <IonIcon slot="start" icon={logoGoogle} />
              Sign in with Google
            </IonButton>
          </div>
        )}

        <IonLoading isOpen={loading} message="Please wait..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile; 