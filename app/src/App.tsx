import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { camera, list, person } from 'ionicons/icons';
import Camera from './pages/Camera';
import ProductList from './pages/ProductList';
import Profile from './pages/Profile';
import { useAuth } from './contexts/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const ProtectedRoute: React.FC<{ component: React.ComponentType<any> }> = ({ component: Component }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Component /> : <Redirect to="/profile" />;
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/camera">
              <ProtectedRoute component={Camera} />
            </Route>
            <Route exact path="/products">
              <ProductList />
            </Route>
            <Route exact path="/profile">
              <Profile />
            </Route>
            <Route exact path="/">
              <Redirect to="/products" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="products" href="/products">
              <IonIcon icon={list} />
              <IonLabel>Listings</IonLabel>
            </IonTabButton>
            <IonTabButton tab="camera" href="/camera">
              <IonIcon icon={camera} />
              <IonLabel>Add Item</IonLabel>
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={person} />
              <IonLabel>Profile</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
