// src/pages/History.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function History() {
  const { user } = useAuth();
  const [lapses, setLapses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLapses() {
      if (!user) return;
      try {
        // Criamos uma consulta filtrando as recaídas do usuário logado
        const q = query(
          collection(db, 'lapses'), 
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const lapsesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Ordenando manualmente por data decrescente (mais recente primeiro)
        // Fazemos isso no código para evitar a necessidade de criar índices compostos no Firebase por enquanto
        lapsesList.sort((a, b) => {
          const dateA = a.timestamp?.seconds || 0;
          const dateB = b.timestamp?.seconds || 0;
          return dateB - dateA;
        });

        setLapses(lapsesList);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLapses();
  }, [user]);

  // Função auxiliar para formatar a data do Firestore para o padrão BR
  function formatLapseDate(timestamp) {
    if (!timestamp) return 'Data indefinida';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      
      <main className="max-w-3xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-100 mb-2">Histórico de Recaídas</h2>
        <p className="text-gray-400 text-sm mb-6">Confira os seus registros cronológicos para entender os momentos de vulnerabilidade.</p>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Carregando histórico...</p>
        ) : lapses.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
            Nenhuma recaída registrada até agora. Ótimo trabalho, continue firme! 🔥
          </div>
        ) : (
          <div className="space-y-4">
            {lapses.map((lapse) => (
              <div 
                key={lapse.id} 
                className="bg-gray-800 border-l-4 border-amber-500 rounded-r-lg p-5 border border-y-gray-700 border-r-gray-700 shadow-md transition hover:bg-gray-750"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                  <span className="font-semibold text-lg text-white">
                    {lapse.habitTitle || 'Meta Desconhecida'}
                  </span>
                  <span className="text-xs font-mono bg-amber-500/10 text-amber-400 py-1 px-2.5 rounded-full mt-1 sm:mt-0 w-fit">
                    ⏰ {formatLapseDate(lapse.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm italic bg-gray-900/40 p-3 rounded border border-gray-700/50 mt-2">
                  {lapse.note ? `"${lapse.note}"` : "Nenhuma observação informada."}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}