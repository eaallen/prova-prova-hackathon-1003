import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonChip,
  IonLoading,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonButton,
  RefresherEventDetail,
  IonText,
  IonIcon,
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import BidModal from '../components/BidModal';
import { useHistory } from 'react-router-dom';

interface ProductDetails {
  id: string;
  images: string[];
  keywords: string[];
  sellerId: string;
  createdAt: any;
  status: 'active' | 'sold' | 'expired';
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const history = useHistory();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'product_details');
      const q = query(
        productsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const productsList: ProductDetails[] = [];
      
      querySnapshot.forEach((doc) => {
        productsList.push({
          id: doc.id,
          ...doc.data()
        } as ProductDetails);
      });

      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToastMessage('Failed to load products');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchProducts();
    event.detail.complete();
  };

  const handleBidClick = (product: ProductDetails) => {
    if (!currentUser) {
      setToastMessage('Please sign in to place a bid');
      setShowToast(true);
      history.push('/profile');
      return;
    }
    if (product.sellerId === currentUser.uid) {
      setToastMessage('You cannot bid on your own listing');
      setShowToast(true);
      return;
    }
    setSelectedProduct(product);
    setIsBidModalOpen(true);
  };

  const handleDeleteListing = async (productId: string) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const productRef = doc(db, 'product_details', productId);
      await updateDoc(productRef, {
        status: 'expired'
      });
      
      setToastMessage('Listing removed successfully');
      setShowToast(true);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error removing listing:', error);
      setToastMessage('Failed to remove listing');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          <h1>Active Listings</h1>
          {!currentUser && (
            <IonText color="medium">
              <p>Sign in to place bids on items</p>
            </IonText>
          )}
        </div>

        <IonGrid>
          <IonRow>
            {products.map((product) => (
              <IonCol size="12" sizeMd="6" sizeLg="4" key={product.id}>
                <IonCard>
                  {product.images[0] && (
                    <IonImg
                      src={product.images[0]}
                      alt="Product"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <IonCardHeader>
                    <IonCardTitle>
                      {product.keywords[0] || 'Untitled Product'}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="ion-padding-vertical">
                      {product.keywords.map((keyword, index) => (
                        <IonChip key={index} color="primary" className="ion-margin-end ion-margin-bottom">
                          {keyword}
                        </IonChip>
                      ))}
                    </div>
                    {product.sellerId === currentUser?.uid ? (
                      <div className="ion-padding-vertical">
                        <IonButton
                          expand="block"
                          color="danger"
                          onClick={() => handleDeleteListing(product.id)}
                          disabled={loading}
                        >
                          <IonIcon slot="start" icon={trashOutline} />
                          Remove Listing
                        </IonButton>
                      </div>
                    ) : (
                      <IonButton
                        expand="block"
                        onClick={() => handleBidClick(product)}
                        disabled={product.sellerId === currentUser?.uid}
                      >
                        Place Bid
                      </IonButton>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {selectedProduct && (
          <BidModal
            isOpen={isBidModalOpen}
            onClose={() => {
              setIsBidModalOpen(false);
              setSelectedProduct(null);
            }}
            productId={selectedProduct.id}
            productTitle={selectedProduct.keywords[0] || 'Untitled Product'}
          />
        )}

        <IonLoading isOpen={loading} message="Loading products..." />
        
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

export default ProductList; 