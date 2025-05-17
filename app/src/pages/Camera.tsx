import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonLoading,
    IonToast,
    IonFab,
    IonFabButton,
} from '@ionic/react';
import { camera, cloudCircle } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CameraPage: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        // Automatically open camera when component mounts
        takePicture();
    }, []);

    const takePicture = async () => {
        try {
            setLoading(true);
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
            });

            if (image.dataUrl) {
                setPhoto(image.dataUrl);
            }
        } catch (error) {
            console.error('Error taking picture:', error);
            setToastMessage('Failed to take picture');
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    // Convert data URL to File
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], filename, { type: mime });
    };

    const uploadPhoto = async () => {
        if (!photo || !currentUser) return;

        try {
            setLoading(true);
            
            // Create a unique filename using timestamp and user ID
            const timestamp = new Date().getTime();
            const filename = `${currentUser.uid}_${timestamp}.jpg`;
            
            // Convert data URL to File
            const file = dataURLtoFile(photo, filename);
            
            // Create a reference to the file location in Firebase Storage
            const storageRef = ref(storage, `photos/${filename}`);
            
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log('Photo uploaded successfully:', downloadURL);
            setToastMessage('Photo uploaded successfully!');
            setShowToast(true);

            // Here you can add code to create an auction with the photo URL
            // For example: createAuction(downloadURL);

        } catch (error) {
            console.error('Error uploading photo:', error);
            setToastMessage('Failed to upload photo');
            setShowToast(true);
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
                            <div className="ion-text-center">
                                <h2>Take a Photo</h2>
                                <p>Capture an item you want to sell</p>
                            </div>

                            {photo && (
                                <div className="ion-margin-vertical">
                                    <IonImg src={photo} alt="Captured photo" />
                                </div>
                            )}

                            {photo && (
                                <IonButton
                                    expand="block"
                                    onClick={uploadPhoto}
                                    disabled={loading}
                                    className="ion-margin-top"
                                >
                                    <IonIcon slot="start" icon={cloudCircle} />
                                    Upload
                                </IonButton>
                            )}
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={loading} message="Please wait..." />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                />

                {/* Floating action button for quick photo retake */}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={takePicture} disabled={loading}>
                        <IonIcon icon={camera} />
                    </IonFabButton>
                </IonFab>

            </IonContent>
        </IonPage>
    );
};

export default CameraPage; 