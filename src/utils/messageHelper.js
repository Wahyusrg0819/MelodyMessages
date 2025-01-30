import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';

export const sendMessage = async (messageData) => {
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const searchMessagesByRecipient = async (recipientName) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('recipient', '==', recipientName),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

export const subscribeToMessages = (callback) => {
  const q = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}; 