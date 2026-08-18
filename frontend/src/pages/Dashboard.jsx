import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, LogOut, PlusCircle, Book, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillData, setSkillData] = useState({ title: '', description: '', category: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/skills', skillData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddSkill(false);
      setSkillData({ title: '', description: '', category: '' });
      alert('Skill added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add skill');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
          <p className="text-slate-500">Manage your skills, sessions, and credits.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-600/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-medium opacity-90">Credit Balance</h2>
          </div>
          <div className="text-5xl font-extrabold">{user.credits} <span className="text-2xl font-normal opacity-80">Cr</span></div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Your Offered Skills</h2>
            <button 
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="flex items-center gap-2 text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Skill
            </button>
          </div>
          
          {showAddSkill && (
            <form onSubmit={handleAddSkill} className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="grid gap-4">
                <input type="text" placeholder="Skill Title (e.g., React Basics)" className="w-full px-4 py-2 border rounded-xl" required value={skillData.title} onChange={e => setSkillData({...skillData, title: e.target.value})} />
                <input type="text" placeholder="Category (e.g., Web Development)" className="w-full px-4 py-2 border rounded-xl" required value={skillData.category} onChange={e => setSkillData({...skillData, category: e.target.value})} />
                <textarea placeholder="Describe what you can teach..." className="w-full px-4 py-2 border rounded-xl h-24" required value={skillData.description} onChange={e => setSkillData({...skillData, description: e.target.value})} />
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-medium">Publish Skill</button>
              </div>
            </form>
          )}

          <div className="text-center py-8 text-slate-400">
            <Book className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>You haven't listed any skills yet.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" /> Upcoming Sessions
        </h2>
        <div className="text-center py-12 text-slate-400">
          <p>No upcoming sessions booked.</p>
        </div>
      </div>
    </div>
  );
}
