import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não estão definidas!');
  console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no arquivo .env');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Verificar conexão
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erro ao conectar ao Supabase:', error);
  } else {
    console.log('Conexão com Supabase estabelecida com sucesso!');
    console.log('Status da autenticação:', data.session ? 'Usuário autenticado' : 'Usuário anônimo');
  }
});

// Função para testar operações CRUD
export async function testSupabaseOperations() {
  console.log('Testando operações CRUD no Supabase...');
  
  try {
    // Teste de leitura
    console.log('Testando leitura...');
    const readResult = await supabase
      .from('newsletters')
      .select('count');
    
    console.log('Resultado da leitura:', readResult);
    
    // Teste de inserção
    console.log('Testando inserção...');
    const insertResult = await supabase
      .from('newsletters')
      .insert({
        title: 'Teste de operação',
        content: 'Este é um teste de operação CRUD',
        image_url: 'https://example.com/test.jpg'
      })
      .select();
    
    console.log('Resultado da inserção:', insertResult);
    
    if (insertResult.data && insertResult.data.length > 0) {
      const testId = insertResult.data[0].id;
      
      // Teste de exclusão
      console.log('Testando exclusão...');
      const deleteResult = await supabase
        .from('newsletters')
        .delete()
        .match({ id: testId });
      
      console.log('Resultado da exclusão:', deleteResult);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao testar operações CRUD:', error);
    return false;
  }
}

// Função para excluir newsletter diretamente no banco de dados
export async function forceDeleteNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para exclusão forçada');
    return { error: { message: 'ID não fornecido' } };
  }

  console.log(`Tentando exclusão forçada para newsletter com ID: ${id}`);

  try {
    // Tentar todos os métodos possíveis de exclusão
    
    // Método 1: Usando .delete().eq()
    console.log('Método 1: Usando .delete().eq()');
    const method1 = await supabase
      .from('newsletters')
      .delete()
      .eq('id', id);
    
    if (!method1.error) {
      console.log('Método 1 bem-sucedido');
      return { data: null, error: null };
    }
    
    console.error('Método 1 falhou:', method1.error);
    
    // Método 2: Usando .delete().match()
    console.log('Método 2: Usando .delete().match()');
    const method2 = await supabase
      .from('newsletters')
      .delete()
      .match({ id });
    
    if (!method2.error) {
      console.log('Método 2 bem-sucedido');
      return { data: null, error: null };
    }
    
    console.error('Método 2 falhou:', method2.error);
    
    // Método 3: Usando .delete().filter()
    console.log('Método 3: Usando .delete().filter()');
    const method3 = await supabase
      .from('newsletters')
      .delete()
      .filter('id', 'eq', id);
    
    if (!method3.error) {
      console.log('Método 3 bem-sucedido');
      return { data: null, error: null };
    }
    
    console.error('Método 3 falhou:', method3.error);
    
    // Método 4: Usando .delete().in()
    console.log('Método 4: Usando .delete().in()');
    const method4 = await supabase
      .from('newsletters')
      .delete()
      .in('id', [id]);
    
    if (!method4.error) {
      console.log('Método 4 bem-sucedido');
      return { data: null, error: null };
    }
    
    console.error('Método 4 falhou:', method4.error);
    
    // Se todos os métodos falharem, retornar o último erro
    return { error: method4.error };
  } catch (e) {
    console.error('Exceção durante exclusão forçada:', e);
    return { 
      error: { 
        message: e instanceof Error ? e.message : String(e) 
      } 
    };
  }
}

// Função para excluir newsletter de forma robusta
export async function deleteNewsletter(id: string) {
  if (!id) {
    console.error('ID não fornecido para exclusão');
    return { error: { message: 'ID não fornecido' } };
  }

  console.log(`Tentando excluir newsletter com ID: ${id}`);

  try {
    // Primeiro, verificar se a newsletter existe
    const { data: checkData, error: checkError } = await supabase
      .from('newsletters')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar newsletter:', checkError);
      return { error: checkError };
    }

    if (!checkData && checkError?.code === 'PGRST116') {
      console.log('Newsletter não encontrada, pode já ter sido excluída');
      return { data: null, error: null };
    }

    // Tentar excluir usando .match() em vez de .eq()
    const { data, error } = await supabase
      .from('newsletters')
      .delete()
      .match({ id });

    if (error) {
      console.error('Erro na exclusão com match():', error);
      
      // Tentar método alternativo com .eq()
      const alternativeResult = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);
      
      if (alternativeResult.error) {
        console.error('Erro na exclusão alternativa:', alternativeResult.error);
        
        // Se ainda falhar, tentar exclusão forçada
        console.log('Tentando exclusão forçada como último recurso...');
        return await forceDeleteNewsletter(id);
      }
      
      return alternativeResult;
    }

    return { data, error: null };
  } catch (e) {
    console.error('Exceção durante exclusão:', e);
    return { 
      error: { 
        message: e instanceof Error ? e.message : String(e) 
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
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('title')
      .eq('id', id)
      .single();

    console.log('Resultado da busca:', { newsletter, fetchError });

    if (fetchError) {
      console.error('Erro ao buscar newsletter:', fetchError);
      return { error: fetchError };
    }

    if (!newsletter) {
      console.error('Newsletter não encontrada');
      return { error: { message: 'Newsletter não encontrada' } };
    }

    // Adicionar o prefixo [OCULTA] ao título
    const hiddenTitle = `[OCULTA] ${id} ${newsletter.title}`;
    console.log('Novo título com prefixo:', hiddenTitle);
    
    // Atualizar o título para marcar como oculta
    console.log('Atualizando título da newsletter...');
    const { data, error } = await supabase
      .from('newsletters')
      .update({ title: hiddenTitle })
      .eq('id', id);

    console.log('Resultado da atualização:', { data, error });

    if (error) {
      console.error('Erro ao ocultar newsletter:', error);
      return { error };
    }

    console.log('Newsletter ocultada com sucesso');
    return { data, error: null };
  } catch (e) {
    console.error('Exceção ao ocultar newsletter:', e);
    return { 
      error: { 
        message: e instanceof Error ? e.message : String(e) 
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
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletters')
      .select('title')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar newsletter:', fetchError);
      return { error: fetchError };
    }

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
    const { data, error } = await supabase
      .from('newsletters')
      .update({ title: originalTitle })
      .eq('id', id);

    if (error) {
      console.error('Erro ao mostrar newsletter:', error);
      return { error };
    }

    console.log('Newsletter mostrada com sucesso');
    return { data, error: null };
  } catch (e) {
    console.error('Exceção ao mostrar newsletter:', e);
    return { 
      error: { 
        message: e instanceof Error ? e.message : String(e) 
      } 
    };
  }
}

// Definição de tipos
export type Newsletter = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
};