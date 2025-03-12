// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5BMDvBGNuFB4N85dwSUtd9qZGxUIwCYc",
  authDomain: "newsletter-676e0.firebaseapp.com",
  projectId: "newsletter-676e0",
  storageBucket: "newsletter-676e0.firebasestorage.app",
  messagingSenderId: "410524384961",
  appId: "1:410524384961:web:e055eabcdacc0032821e40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Definição de tipos
export type Newsletter = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
};

// Função para converter documento do Firestore para o tipo Newsletter
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

// Função para buscar todas as newsletters
export async function fetchNewsletters() {
  try {
    console.log('Buscando newsletters do Firebase...');
    const newslettersRef = collection(db, 'newsletters');
    const q = query(newslettersRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const newsletters: Newsletter[] = [];
    querySnapshot.forEach((doc) => {
      newsletters.push(convertFirestoreDocToNewsletter(doc));
    });
    
    console.log(`${newsletters.length} newsletters encontradas`);
    return { data: newsletters, error: null };
  } catch (error) {
    console.error('Erro ao buscar newsletters:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

// Função para adicionar uma nova newsletter
export async function addNewsletter(newsletter: Omit<Newsletter, 'id' | 'created_at'>) {
  try {
    console.log('Adicionando nova newsletter:', newsletter);
    const newslettersRef = collection(db, 'newsletters');
    const docRef = await addDoc(newslettersRef, {
      ...newsletter,
      created_at: Timestamp.now()
    });
    
    console.log('Newsletter adicionada com ID:', docRef.id);
    
    // Buscar o documento recém-criado para retornar com o formato correto
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

// Função para ocultar newsletter em vez de excluir
export async function hideNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para ocultar newsletter');
    return { error: { message: 'ID não fornecido' } };
  }

  console.log(`Ocultando newsletter com ID: ${id}`);

  try {
    // Primeiro, buscar a newsletter para obter o título atual
    console.log('Buscando newsletter para ocultar...');
    const docRef = doc(db, 'newsletters', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Newsletter não encontrada');
      return { error: { message: 'Newsletter não encontrada' } };
    }

    const newsletter = docSnap.data();
    console.log('Newsletter encontrada:', newsletter);

    // Adicionar o prefixo [OCULTA] ao título
    const hiddenTitle = `[OCULTA] ${id} ${newsletter.title}`;
    console.log('Novo título com prefixo:', hiddenTitle);
    
    // Atualizar o título para marcar como oculta
    console.log('Atualizando título da newsletter...');
    await updateDoc(docRef, { title: hiddenTitle });

    console.log('Newsletter ocultada com sucesso');
    
    // Buscar o documento atualizado para retornar
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

// Função para mostrar newsletter oculta
export async function showNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para mostrar newsletter');
    return { error: { message: 'ID não fornecido' } };
  }

  console.log(`Mostrando newsletter com ID: ${id}`);

  try {
    // Primeiro, buscar a newsletter para obter o título atual
    console.log('Buscando newsletter para restaurar...');
    const docRef = doc(db, 'newsletters', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Newsletter não encontrada');
      return { error: { message: 'Newsletter não encontrada' } };
    }

    const newsletter = docSnap.data();
    console.log('Newsletter encontrada:', newsletter);

    // Remover o prefixo [OCULTA] do título
    let originalTitle = newsletter.title;
    const prefix = `[OCULTA] ${id} `;
    
    if (originalTitle.startsWith(prefix)) {
      originalTitle = originalTitle.substring(prefix.length);
      console.log('Título original extraído:', originalTitle);
    } else {
      console.warn('Título não está no formato esperado:', originalTitle);
    }
    
    // Atualizar o título para remover a marcação de oculta
    console.log('Atualizando título da newsletter...');
    await updateDoc(docRef, { title: originalTitle });

    console.log('Newsletter restaurada com sucesso');
    
    // Buscar o documento atualizado para retornar
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

// Função para excluir newsletter
export async function deleteNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para exclusão');
    return { error: { message: 'ID não fornecido' } };
  }

  console.log(`Excluindo newsletter com ID: ${id}`);

  try {
    const docRef = doc(db, 'newsletters', id);
    await deleteDoc(docRef);
    console.log('Newsletter excluída com sucesso');
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

// Função para autenticação
export async function loginWithEmail(email: string, password: string) {
  try {
    console.log('Tentando login com email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login bem-sucedido:', userCredential.user);
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

// Função para logout
export async function logout() {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
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

// Função para configurar listener de tempo real
export function subscribeToNewsletters(callback: (newsletters: Newsletter[]) => void) {
  console.log('Configurando listener de tempo real para newsletters...');
  const newslettersRef = collection(db, 'newsletters');
  const q = query(newslettersRef, orderBy('created_at', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const newsletters: Newsletter[] = [];
    querySnapshot.forEach((doc) => {
      newsletters.push(convertFirestoreDocToNewsletter(doc));
    });
    console.log(`Recebidas ${newsletters.length} newsletters em tempo real`);
    callback(newsletters);
  });
}

// Função para verificar o estado atual da autenticação
export function getCurrentUser() {
  return auth.currentUser;
}

// Função para adicionar listener de mudanças na autenticação
export function onAuthStateChanged(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback);
}

export { app, db, auth }; 