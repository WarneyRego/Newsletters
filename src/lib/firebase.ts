import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5BMDvBGNuFB4N85dwSUtd9qZGxUIwCYc",
  authDomain: "newsletter-676e0.firebaseapp.com",
  projectId: "newsletter-676e0",
  storageBucket: "newsletter-676e0.firebasestorage.app",
  messagingSenderId: "410524384961",
  appId: "1:410524384961:web:e055eabcdacc0032821e40"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export type Newsletter = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
};

const convertFirestoreDocToNewsletter = (doc: any): Newsletter => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || '',
    content: data.content || '',
    image_url: data.image_url || '',
    created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString()
  };
};

export async function fetchNewsletters() {
  try {
    const newslettersRef = collection(db, 'newsletters');
    const q = query(newslettersRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const newsletters: Newsletter[] = [];
    querySnapshot.forEach((doc) => {
      newsletters.push(convertFirestoreDocToNewsletter(doc));
    });
    
    return { data: newsletters, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function addNewsletter(newsletter: Omit<Newsletter, 'id' | 'created_at'>) {
  try {
    const newslettersRef = collection(db, 'newsletters');
    const docRef = await addDoc(newslettersRef, {
      ...newsletter,
      created_at: Timestamp.now()
    });
    
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { 
        data: convertFirestoreDocToNewsletter(docSnap), 
        error: null 
      };
    } else {
      throw new Error('Falha ao recuperar a newsletter recém-criada');
    }
  } catch (error) {
    console.error('Erro ao adicionar newsletter:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function hideNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para ocultar newsletter');
    return { error: { message: 'ID não fornecido' } };
  }


  try {
    const docRef = doc(db, 'newsletters', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Newsletter não encontrada');
      return { error: { message: 'Newsletter não encontrada' } };
    }

    const newsletter = docSnap.data();

    const hiddenTitle = `[OCULTA] ${id} ${newsletter.title}`;
    
    await updateDoc(docRef, { title: hiddenTitle });

    
    const updatedDocSnap = await getDoc(docRef);
    if (updatedDocSnap.exists()) {
      return { 
        data: convertFirestoreDocToNewsletter(updatedDocSnap), 
        error: null 
      };
    } else {
      throw new Error('Falha ao recuperar a newsletter atualizada');
    }
  } catch (error) {
    console.error('Exceção ao ocultar newsletter:', error);
    return { 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function showNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para mostrar newsletter');
    return { error: { message: 'ID não fornecido' } };
  }


  try {
    const docRef = doc(db, 'newsletters', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Newsletter não encontrada');
      return { error: { message: 'Newsletter não encontrada' } };
    }

    const newsletter = docSnap.data();

    let originalTitle = newsletter.title;
    const prefix = `[OCULTA] ${id} `;
    
    if (originalTitle.startsWith(prefix)) {
      originalTitle = originalTitle.substring(prefix.length);
    } else {
      console.warn('Título não está no formato esperado:', originalTitle);
    }
    
    await updateDoc(docRef, { title: originalTitle });

    
    const updatedDocSnap = await getDoc(docRef);
    if (updatedDocSnap.exists()) {
      return { 
        data: convertFirestoreDocToNewsletter(updatedDocSnap), 
        error: null 
      };
    } else {
      throw new Error('Falha ao recuperar a newsletter atualizada');
    }
  } catch (error) {
    console.error('Exceção ao mostrar newsletter:', error);
    return { 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function deleteNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para exclusão');
    return { error: { message: 'ID não fornecido' } };
  }


  try {
    const docRef = doc(db, 'newsletters', id);
    await deleteDoc(docRef);
    return { data: null, error: null };
  } catch (error) {
    console.error('Erro ao excluir newsletter:', error);
    return { 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: userCredential.user, error: null };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

export function subscribeToNewsletters(callback: (newsletters: Newsletter[]) => void) {
  const newslettersRef = collection(db, 'newsletters');
  const q = query(newslettersRef, orderBy('created_at', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const newsletters: Newsletter[] = [];
    querySnapshot.forEach((doc) => {
      newsletters.push(convertFirestoreDocToNewsletter(doc));
    });
    callback(newsletters);
  });
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthStateChanged(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback);
}

export { app, db, auth }; 