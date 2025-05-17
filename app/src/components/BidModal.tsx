import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

interface Bid {
  amount: number;
  productId: string;
  bidderId: string;
  bidderEmail: string;
  createdAt: any;
  status: 'active' | 'accepted' | 'rejected';
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, productId, productTitle }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { currentUser } = useAuth();

  const handleSubmitBid = async () => {
    if (!currentUser) {
      setToastMessage('Please sign in to place a bid');
      setShowToast(true);
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setToastMessage('Please enter a valid bid amount');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      const bid: Bid = {
        amount,
        productId,
        bidderId: currentUser.uid,
        bidderEmail: currentUser.email || '',
        createdAt: serverTimestamp(),
        status: 'active'
      };

      await addDoc(collection(db, 'bids'), bid);
      setToastMessage('Bid placed successfully!');
      setShowToast(true);
      onClose();
    } catch (error) {
      console.error('Error placing bid:', error);
      setToastMessage('Failed to place bid');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Place a Bid</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="ion-padding">
            <h2>{productTitle}</h2>
            <p>Enter your bid amount below:</p>
          </div>

          <IonItem>
            <IonLabel position="stacked">Bid Amount ($)</IonLabel>
            <IonInput
              type="number"
              value={bidAmount}
              onIonChange={e => setBidAmount(e.detail.value!)}
              placeholder="Enter amount"
            />
          </IonItem>

          <div className="ion-padding">
            <IonButton expand="block" onClick={handleSubmitBid} disabled={loading}>
              Place Bid
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={onClose}>
              Cancel
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={loading} message="Placing bid..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </>
  );
};

export default BidModal; 