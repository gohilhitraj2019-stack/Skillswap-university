import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Tag, User, ArrowRight } from 'lucide-react';

export default function Marketplace() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/skills');
        setSkills(res.data);
      } catch (err) {
        console.error(err);
        console.error('Failed to fetch skills');
      }
    };
    fetchSkills();
  }, []);

  const handleBook = async (skill) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book a session');
      return;
    }
    
    try {
      await axios.post('http://localhost:5000/api/sessions/book', {
        skillId: skill.id,
        teacherId: skill.providerId,
        cost: 10,
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Session booked successfully! 10 credits deducted.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book session');
    }
  };

  const filteredSkills = skills.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Skill Marketplace</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Find the perfect peer to teach you the skills you need. Spend your credits to learn.</p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg transition-shadow"
          placeholder="Search for 'Python', 'Guitar', 'Design'..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map(skill => (
          <div key={skill.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wide">
                <Tag className="h-3 w-3" /> {skill.category}
              </span>
              <span className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">10 Cr</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{skill.title}</h3>
            <p className="text-slate-600 mb-6 flex-grow">{skill.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <span className="font-medium text-slate-700">{skill.provider.name}</span>
              </div>
              <button 
                onClick={() => handleBook(skill)}
                className="flex items-center justify-center h-10 w-10 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                title="Book Session"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredSkills.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-xl">No skills found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
