import React, { useState, useEffect } from 'react';
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
  IonList,
  IonImg,
  IonChip,
  IonBadge,
  IonAccordion,
  IonAccordionGroup,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { logoGoogle, timeOutline, cashOutline, personOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface ProductDetails {
  id: string;
  images: string[];
  keywords: string[];
  sellerId: string;
  createdAt: any;
  status: 'active' | 'sold' | 'expired';
}

interface Bid {
  id: string;
  amount: number;
  productId: string;
  bidderId: string;
  bidderEmail: string;
  createdAt: any;
  status: 'active' | 'accepted' | 'rejected';
}

const Profile: React.FC = () => {
  const { currentUser, logout, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userListings, setUserListings] = useState<ProductDetails[]>([]);
  const [receivedBids, setReceivedBids] = useState<Bid[]>([]);

  const fetchUserData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Fetch user's listings
      const listingsRef = collection(db, 'product_details');
      const listingsQuery = query(
        listingsRef,
        where('sellerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listings: ProductDetails[] = [];
      listingsSnapshot.forEach((doc) => {
        listings.push({ id: doc.id, ...doc.data() } as ProductDetails);
      });
      setUserListings(listings);

      // Fetch bids for user's listings
      const bidsRef = collection(db, 'bids');
      const bidsQuery = query(
        bidsRef,
        where('productId', 'in', listings.map(l => l.id)),
        orderBy('amount', 'desc')
      );
      const bidsSnapshot = await getDocs(bidsQuery);
      const bids: Bid[] = [];
      bidsSnapshot.forEach((doc) => {
        bids.push({ id: doc.id, ...doc.data() } as Bid);
      });
      setReceivedBids(bids);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setToastMessage('Failed to load user data');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

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

  const getBidsForProduct = (productId: string) => {
    return receivedBids
      .filter(bid => bid.productId === productId)
      .sort((a, b) => b.amount - a.amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Listings</IonTitle>
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

            <IonAccordionGroup>
              {userListings.map((listing) => {
                const productBids = getBidsForProduct(listing.id);
                const highestBid = productBids[0]?.amount || 0;
                const bidCount = productBids.length;

                return (
                  <IonAccordion key={listing.id}>
                    <IonItem slot="header" color="light">
                      <IonLabel>
                        <h2>{listing.keywords[0] || 'Untitled Product'}</h2>
                        <p>Listed on: {formatDate(listing.createdAt)}</p>
                      </IonLabel>
                      <IonBadge slot="end" color="primary">
                        {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
                      </IonBadge>
                    </IonItem>

                    <div className="ion-padding" slot="content">
                      <IonGrid>
                        <IonRow>
                          <IonCol size="12" sizeMd="6">
                            {listing.images[0] && (
                              <IonImg
                                src={listing.images[0]}
                                alt="Product"
                                style={{ height: '200px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                            )}
                          </IonCol>
                          <IonCol size="12" sizeMd="6">
                            <div className="ion-padding">
                              <h3>Product Details</h3>
                              <div className="ion-padding-vertical">
                                {listing.keywords.map((keyword, index) => (
                                  <IonChip key={index} color="primary" className="ion-margin-end ion-margin-bottom">
                                    {keyword}
                                  </IonChip>
                                ))}
                              </div>
                              <IonItem>
                                <IonIcon icon={cashOutline} slot="start" />
                                <IonLabel>
                                  <h3>Highest Bid</h3>
                                  <p>${highestBid.toFixed(2)}</p>
                                </IonLabel>
                              </IonItem>
                              <IonItem>
                                <IonIcon icon={timeOutline} slot="start" />
                                <IonLabel>
                                  <h3>Listed On</h3>
                                  <p>{formatDate(listing.createdAt)}</p>
                                </IonLabel>
                              </IonItem>
                            </div>
                          </IonCol>
                        </IonRow>

                        <IonRow>
                          <IonCol size="12">
                            <div className="ion-padding">
                              <h3>Bid History</h3>
                              {productBids.length > 0 ? (
                                <IonList>
                                  {productBids.map((bid) => (
                                    <IonItem key={bid.id}>
                                      <IonIcon icon={personOutline} slot="start" />
                                      <IonLabel>
                                        <h2>${bid.amount.toFixed(2)}</h2>
                                        <p>From: {bid.bidderEmail}</p>
                                        <p>Placed on: {formatDate(bid.createdAt)}</p>
                                      </IonLabel>
                                      <IonBadge
                                        color={
                                          bid.status === 'active'
                                            ? 'success'
                                            : bid.status === 'accepted'
                                            ? 'primary'
                                            : 'danger'
                                        }
                                      >
                                        {bid.status}
                                      </IonBadge>
                                    </IonItem>
                                  ))}
                                </IonList>
                              ) : (
                                <IonText color="medium">
                                  <p>No bids received yet</p>
                                </IonText>
                              )}
                            </div>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </div>
                  </IonAccordion>
                );
              })}
            </IonAccordionGroup>

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