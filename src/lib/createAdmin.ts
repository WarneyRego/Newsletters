import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "./firebase";

/**
 * Função para criar um usuário administrador no Firebase Authentication
 * 
 * @param name Nome do administrador
 * @param email Email do administrador
 * @param password Senha do administrador
 * @returns Objeto com resultado da operação
 */
export async function createAdminUser(name: string, email: string, password: string) {
  try {
    console.log(`Criando usuário administrador: ${name} (${email})`);
    
    // Inicializar o Auth
    const auth = getAuth(app);
    
    // Criar o usuário com email e senha
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o perfil do usuário com o nome
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    console.log('Usuário administrador criado com sucesso:', userCredential.user);
    
    return { 
      success: true, 
      user: userCredential.user,
      error: null 
    };
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error);
    return { 
      success: false, 
      user: null,
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
} 