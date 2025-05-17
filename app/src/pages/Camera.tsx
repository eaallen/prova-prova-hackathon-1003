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
    IonChip,
} from '@ionic/react';
import { camera, cloudCircle } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getVertexAI, GenerativeModel } from 'firebase/vertexai';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

interface ProductDetails {
    images: string[];
    keywords: string[];
    sellerId: string;
    createdAt: any;
    status: 'active' | 'sold' | 'expired';
}

const CameraPage: React.FC = () => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const { currentUser } = useAuth();
    const history = useHistory();

    useEffect(() => {
        if (!currentUser) {
            setToastMessage('Please sign in to access the camera');
            setShowToast(true);
            history.push('/profile');
            return;
        }
        // Only open camera if user is authenticated
    }, [currentUser]);

    const takePicture = async () => {
        console.log("takePicture");
        try {
            setLoading(true);
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
            });

            if (image.dataUrl) {
                console.log("image.dataUrl", image);
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

    // Analyze image with Vertex AI
    const analyzeImage = async (file: File) => {
        console.log("imageBase64", file);
        try {
            const vertexAI = getVertexAI();
            const model = new GenerativeModel(vertexAI, { model: "gemini-2.0-flash-001" });

            const prompt = "Analyze this image and provide relevant keywords for an auction listing. Focus on the item's type, condition, brand, and key features. Format the response as a comma-separated list of keywords.";

            const result = await model.generateContent([
                prompt,
                await fileToGenerativePart(file)
            ]);

            const response = await result.response;
            const text = response.text();
            
            // Parse the response into keywords
            const extractedKeywords = text
                .split(',')
                .map(keyword => keyword.trim())
                .filter(keyword => keyword.length > 0);

            setKeywords(extractedKeywords);
            return extractedKeywords;
        } catch (error) {
            console.error('Error analyzing image:', error);
            setToastMessage('Failed to analyze image');
            setShowToast(true);
            return [];
        }
    };

    const createProductDetails = async (imageUrl: string, keywords: string[]) => {
        if (!currentUser) return null;

        try {
            const productDetails: ProductDetails = {
                images: [imageUrl],
                keywords: keywords,
                sellerId: currentUser.uid,
                createdAt: serverTimestamp(),
                status: 'active'
            };

            const docRef = await addDoc(collection(db, 'product_details'), productDetails);
            console.log('Product details created with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error creating product details:', error);
            setToastMessage('Failed to create product details');
            setShowToast(true);
            return null;
        }
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
            
            // get the key words from the image
            const extractedKeywords = await analyzeImage(file);
            console.log('Extracted keywords:', extractedKeywords);

            // Create a reference to the file location in Firebase Storage
            const storageRef = ref(storage, `photos/${filename}`);
            
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            console.log('Photo uploaded successfully:', downloadURL);
            setToastMessage('Photo uploaded successfully!');
            setShowToast(true);

            // Create product details in Firestore
            const productId = await createProductDetails(downloadURL, extractedKeywords);
            if (productId) {
                setToastMessage('Product details created successfully!');
                setShowToast(true);
            }

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

                            {keywords.length > 0 && (
                                <div className="ion-margin-vertical">
                                    <h3>Detected Keywords:</h3>
                                    <div className="ion-padding">
                                        {keywords.map((keyword, index) => (
                                            <IonChip key={index} color="primary">
                                                {keyword}
                                            </IonChip>
                                        ))}
                                    </div>
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
                                    Upload & Analyze
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

async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise: Promise<string> = new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }
  

export default CameraPage; 