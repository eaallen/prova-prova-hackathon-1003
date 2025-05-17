import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/react';
import { logoGoogle } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      history.push('/home');
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      history.push('/home');
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="6" sizeLg="4">
              <h2 className="ion-text-center">Login to Snap Purchases</h2>
              {error && <IonText color="danger">{error}</IonText>}
              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={e => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={e => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>
                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </IonButton>
              </form>
              
              <div className="ion-text-center ion-margin-top">
                <IonText color="medium">Or</IonText>
              </div>

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

              <IonButton
                expand="block"
                fill="clear"
                onClick={() => history.push('/signup')}
              >
                Don't have an account? Sign up
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login; 