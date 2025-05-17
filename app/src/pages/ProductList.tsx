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
} from '@ionic/react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import BidModal from '../components/BidModal';

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
      return;
    }
    setSelectedProduct(product);
    setIsBidModalOpen(true);
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          <h1>Active Listings</h1>
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
                    <IonButton
                      expand="block"
                      onClick={() => handleBidClick(product)}
                      disabled={product.sellerId === currentUser?.uid}
                    >
                      {product.sellerId === currentUser?.uid ? 'Your Listing' : 'Place Bid'}
                    </IonButton>
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