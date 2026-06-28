// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [allLapses, setAllLapses] = useState([]); // Guardar todas as recaídas para calcular o streak

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [lapseNote, setLapseNote] = useState('');
  const [lapseLoading, setLapseLoading] = useState(false);

  async function fetchData() {
    if (!user) return;
    try {
      const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const habitsSnapshot = await getDocs(habitsQuery);
      const habitsList = habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHabits(habitsList);

      const lapsesQuery = query(collection(db, 'lapses'), where('userId', '==', user.uid));
      const lapsesSnapshot = await getDocs(lapsesQuery);
      const lapsesList = lapsesSnapshot.docs.map(doc => doc.data());
      setAllLapses(lapsesList); // Salva para o cálculo de streak

      const daysOfWeekMap = {
        0: { name: 'Dom', count: 0 }, 1: { name: 'Seg', count: 0 }, 2: { name: 'Ter', count: 0 },
        3: { name: 'Qua', count: 0 }, 4: { name: 'Qui', count: 0 }, 5: { name: 'Sex', count: 0 },
        6: { name: 'Sáb', count: 0 },
      };

      lapsesList.forEach(lapse => {
        if (lapse.timestamp) {
          const date = new Date(lapse.timestamp.seconds * 1000);
          const dayIndex = date.getDay();
          if (daysOfWeekMap[dayIndex]) {
            daysOfWeekMap[dayIndex].count += 1;
          }
        }
      });

      setChartData(Object.values(daysOfWeekMap));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  // FUNÇÃO NOVA: Deletar uma meta do Firestore
  async function handleDeleteHabit(habitId) {
    if (!window.confirm("Tem certeza que deseja deletar essa meta?")) return;

    try {
      await deleteDoc(doc(db, 'habits', habitId));
      alert("Meta removida com sucesso.");
      fetchData(); // Atualiza a tela
    } catch (error) {
      console.error("Erro ao deletar meta:", error);
      alert("Erro ao deletar.");
    }
  }

  // FUNÇÃO NOVA: Lógica matemática para calcular o streak de dias limpos
  function getStreak(habit) {
    // Filtra as recaídas específicas desta meta
    const habitLapses = allLapses.filter(l => l.habitId === habit.id && l.timestamp);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (habitLapses.length === 0) {
      // Se nunca recaiu, o streak é desde o dia que criou a meta
      if (!habit.createdAt) return 0;
      const dataCriacao = new Date(habit.createdAt.seconds * 1000);
      dataCriacao.setHours(0, 0, 0, 0);
      const diferencaTempo = Math.abs(hoje - dataCriacao);
      return Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
    }

    // Acha a recaída mais recente convertendo os timestamps
    const timestamps = habitLapses.map(l => l.timestamp.seconds * 1000);
    const ultimaRecaidaData = new Date(Math.max(...timestamps));
    ultimaRecaidaData.setHours(0, 0, 0, 0);

    const diferencaTempo = Math.abs(hoje - ultimaRecaidaData);
    const diferencaDias = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

    return diferencaDias;
  }

  async function handleCreateHabit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'habits'), {
        title: title,
        description: description,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setTitle(''); setDescription(''); fetchData();
      alert('Meta criada com sucesso! 🎯');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function handleRegisterLapse(e) {
    e.preventDefault();
    if (!selectedHabit) return;
    setLapseLoading(true);
    try {
      await addDoc(collection(db, 'lapses'), {
        habitId: selectedHabit.id,
        habitTitle: selectedHabit.title,
        userId: user.uid,
        note: lapseNote,
        timestamp: serverTimestamp()
      });
      setIsModalOpen(false); setSelectedHabit(null); setLapseNote(''); fetchData();
      alert(`Registro computado. Força na jornada! 💪`);
    } catch (error) {
      console.error(error);
    }
    setLapseLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Gráfico */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold text-blue-400 mb-1">Feedback Adaptativo 📊</h2>
          <p className="text-gray-400 text-xs mb-6">Identifique quais dias da semana exigem maior atenção.</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#4b5563', color: '#fff' }} cursor={{ fill: '#374151', opacity: 0.2 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Recaídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Criar Meta */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-blue-400 mb-4">Nova Meta</h2>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">O que quer controlar?</label>
                <input type="text" required placeholder="Ex: Uso do Instagram" className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Descrição</label>
                <textarea placeholder="Ex: Limitar tempo de tela." rows="2" className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition">{loading ? 'Criando...' : 'Criar Meta'}</button>
            </form>
          </div>

          {/* Listar Metas */}
          <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
            <h2 className="text-lg font-bold text-blue-400 mb-4">Minhas Metas Ativas</h2>
            {habits.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">Nenhuma meta ativa cadastrada. 🎯</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="bg-gray-750 p-4 border border-gray-700 rounded-lg flex flex-col justify-between relative group">
                    
                    {/* Botão de Deletar no canto superior direito */}
                    <button 
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-sm font-bold p-1 transition"
                      title="Deletar Meta"
                    >
                      ✕
                    </button>

                    <div>
                      <div className="flex justify-between items-start pr-4 mb-1">
                        <h3 className="text-base font-semibold text-white">{habit.title}</h3>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">{habit.description || "Sem descrição."}</p>
                      
                      {/* EXIBIÇÃO DO STREAK */}
                      <div className="inline-flex items-center space-x-1 bg-orange-500/10 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full mb-4">
                        <span>🔥 {getStreak(habit)} {getStreak(habit) === 1 ? 'dia' : 'dias'} de streak</span>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white font-medium py-1.5 px-3 rounded border border-amber-600/30 text-xs transition"
                      onClick={() => { setSelectedHabit(habit); setIsModalOpen(true); }}
                    >
                      ⚠️ Registrar Recaída
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Recaída */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-amber-500 mb-2">Registrar Deslize</h3>
            <p className="text-sm text-gray-400 mb-4">Meta selecionada: <span className="text-white font-semibold">{selectedHabit?.title}</span>.</p>
            <form onSubmit={handleRegisterLapse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">O que aconteceu? (Opcional)</label>
                <textarea placeholder="Ex: Cansaço da rotina..." rows="3" className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-amber-500 resize-none" value={lapseNote} onChange={(e) => setLapseNote(e.target.value)} />
              </div>
              <div className="flex space-x-3 justify-end text-sm font-medium">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-700 text-gray-200 py-2 px-4 rounded">Cancelar</button>
                <button type="submit" disabled={lapseLoading} className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded">
                  {lapseLoading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}