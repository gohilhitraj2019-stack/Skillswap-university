import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  BookOpen, 
  User as UserIcon, 
  Wallet, 
  LogOut, 
  PlusCircle, 
  Calendar, 
  Trash2, 
  Edit3, 
  Search, 
  Shield, 
  Mail, 
  Tag, 
  Clock, 
  X,
  Award,
  ChevronDown,
  BookMarked,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'skills'
  
  // Profile dropdown menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  // Skills & Sessions state
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [bookedSessions, setBookedSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table Controls: Search, Filter, Sort, Pagination
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title_asc' | 'title_desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Admin Skills Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillFormData, setSkillFormData] = useState({ title: '', description: '', category: '' });
  const [submittingSkill, setSubmittingSkill] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when search or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, sortBy, itemsPerPage]);

  // --- Auth Session Check & Initial Fetch ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      handleLogout();
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProfileForm({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        bio: parsedUser.bio || ''
      });
    } catch {
      handleLogout();
      return;
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [allSkillsRes, mySkillsRes, sessionsRes, bookedRes, profileRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/skills'),
        axios.get('http://localhost:5000/api/user/skills', config),
        axios.get('http://localhost:5000/api/user/sessions', config),
        axios.get('http://localhost:5000/api/user/booked-skills', config),
        axios.get('http://localhost:5000/api/user/profile', config)
      ]);

      if (profileRes.status === 'rejected' && profileRes.reason?.response?.status === 401) {
        handleLogout();
        return;
      }

      if (allSkillsRes.status === 'fulfilled') setSkills(allSkillsRes.value.data);
      if (mySkillsRes.status === 'fulfilled') setMySkills(mySkillsRes.value.data);
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data);
      if (bookedRes.status === 'fulfilled') setBookedSessions(bookedRes.value.data);
      
      if (profileRes.status === 'fulfilled') {
        const freshUser = profileRes.value.data;
        setUser(freshUser);
        setProfileForm({
          name: freshUser.name || '',
          email: freshUser.email || '',
          bio: freshUser.bio || ''
        });
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- Profile CRUD: Edit Profile ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setUpdatingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/user/profile', profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setShowEditProfileModal(false);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // --- Admin Skills CRUD: Create Skill ---
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!skillFormData.title || !skillFormData.description || !skillFormData.category) return;
    setSubmittingSkill(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/skills', skillFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSkills([res.data, ...skills]);
      setMySkills([res.data, ...mySkills]);
      setShowAddModal(false);
      setSkillFormData({ title: '', description: '', category: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add skill');
    } finally {
      setSubmittingSkill(false);
    }
  };

  // --- Admin Skills CRUD: Update Skill ---
  const openEditSkillModal = (skill) => {
    setEditingSkill(skill);
    setSkillFormData({ title: skill.title, description: skill.description, category: skill.category });
  };

  const handleUpdateSkill = async (e) => {
    e.preventDefault();
    if (!editingSkill) return;
    setSubmittingSkill(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/skills/${editingSkill.id}`, skillFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSkills(skills.map(s => s.id === editingSkill.id ? res.data : s));
      setMySkills(mySkills.map(s => s.id === editingSkill.id ? res.data : s));
      setEditingSkill(null);
      setSkillFormData({ title: '', description: '', category: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update skill');
    } finally {
      setSubmittingSkill(false);
    }
  };

  // --- Admin Skills CRUD: Delete Skill ---
  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSkills(skills.filter(s => s.id !== id));
      setMySkills(mySkills.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete skill');
    }
  };

  // --- User Action: Cancel Booked Session ---
  const handleCancelSession = async (sessionId, cost) => {
    if (!window.confirm('Cancel this session booking and refund credits?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookedSessions(bookedSessions.filter(b => b.id !== sessionId));
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      const updatedCredits = (user.credits || 0) + (cost || 10);
      setUser({ ...user, credits: updatedCredits });
      localStorage.setItem('user', JSON.stringify({ ...user, credits: updatedCredits }));
      alert('Booking cancelled successfully! Credits refunded to your account.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel session');
    }
  };

  // --- Categories List ---
  const availableCategories = useMemo(() => {
    const set = new Set();
    skills.forEach(s => {
      if (s.category) set.add(s.category.trim());
    });
    return Array.from(set);
  }, [skills]);

  // --- Filtered & Sorted Skills List (For Admin Data Table) ---
  const processedSkills = useMemo(() => {
    let result = [...skills];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(s => 
        s.title?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.provider?.name?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(s => s.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [skills, search, categoryFilter, sortBy]);

  // --- Pagination Logic ---
  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedSkills.slice(start, start + itemsPerPage);
  }, [processedSkills, currentPage, itemsPerPage]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const totalPages = Math.ceil(processedSkills.length / itemsPerPage) || 1;

  // User Booked Sessions Search Filter
  const filteredBookedSessions = bookedSessions.filter(b =>
    b.skill?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.skill?.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* --- Sidebar Navigation --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 flex-shrink-0 sticky top-0 h-screen">
        <div>
          {/* App Brand Header */}
          <Link to="/" className="flex items-center gap-2.5 px-3 py-3 mb-6">
            <BookOpen className="text-purple-600 h-7 w-7" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          {/* Role Badge Header */}
          <div className="px-3 mb-4">
            <div className={`p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              <Shield className="h-4 w-4" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Student Portal'}</span>
            </div>
          </div>

          {/* Navigation Items (Cleaned up menu titles) */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'skills'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isAdmin ? <BookOpen className="h-5 w-5" /> : <BookMarked className="h-5 w-5" />}
              {isAdmin ? 'Skills' : 'My Booked Skills'}
            </button>
          </nav>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
          <Link to="/marketplace" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition-colors">
            🏪 Go to Marketplace <ArrowRight className="h-3.5 w-3.5 ml-auto" />
          </Link>
          <div className="px-3 text-[11px] text-slate-400">
            Role: <span className="font-bold text-slate-700 capitalize">{user.role}</span>
          </div>
        </div>
      </aside>

      {/* --- Main Area with Top Header & Content --- */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* --- Top Header Bar (With Right-Aligned Profile Icon Dropdown) --- */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
            {activeTab === 'dashboard' ? (isAdmin ? 'Admin Dashboard' : 'Student Dashboard') : (isAdmin ? 'Skills Management' : 'My Enrolled Skills & Sessions')}
          </div>

          {/* Right-aligned Profile Menu Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] text-purple-600 font-semibold capitalize leading-tight">{user.role}</div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowEditProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-purple-600" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- Page Body Content --- */}
        <main className="p-8 flex-grow">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {user.name}!</h1>
                <p className="text-slate-500">
                  {isAdmin ? 'System metrics, user profile, and administrative controls.' : 'Manage your enrolled sessions, credits, and learning journey.'}
                </p>
              </div>

              {/* Profile & Credits Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* User Profile Details Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-purple-600" /> {isAdmin ? 'Admin Profile' : 'Student Profile'}
                    </h2>
                    <button
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-slate-400 block text-xs">Full Name</span>
                      <span className="font-semibold text-slate-800">{user.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Email Address</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Role Privileges</span>
                      <span className="font-semibold text-slate-800 capitalize flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5 text-purple-600" /> {user.role} Account
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Account Status</span>
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> Active Member
                      </span>
                    </div>
                  </div>

                  {user.bio ? (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Bio: </span>{user.bio}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No bio provided yet. Click "Edit Profile" to add your bio.</div>
                  )}
                </div>

                {/* Credit Balance Card */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-purple-600/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-white/20 rounded-xl">
                        <Wallet className="h-6 w-6" />
                      </div>
                      <h2 className="text-lg font-medium opacity-90">Credit Balance</h2>
                    </div>
                    <div className="text-5xl font-extrabold mb-2">
                      {user.credits} <span className="text-2xl font-normal opacity-80">Cr</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-80 mt-4">
                    Earn credits by sharing your knowledge or spend them on learning new skills.
                  </p>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Booked Sessions</div>
                  <div className="text-3xl font-extrabold text-purple-600">{bookedSessions.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Your Offered Skills</div>
                  <div className="text-3xl font-extrabold text-indigo-600">{mySkills.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Available Marketplace Skills</div>
                  <div className="text-3xl font-extrabold text-slate-800">{skills.length}</div>
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" /> Upcoming Learning & Teaching Sessions
                  </h2>
                  {!isAdmin && (
                    <Link to="/marketplace" className="text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors">
                      + Book New Skill
                    </Link>
                  )}
                </div>

                {sessions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {sessions.map(session => {
                      const isLearner = session.learnerId === user.id;
                      return (
                        <div key={session.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${isLearner ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                              {isLearner ? 'Learning Session' : 'Teaching Session'}
                            </span>
                            <h4 className="font-bold text-slate-900">{session.skill?.title || 'Skill Session'}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {isLearner ? `Teacher: ${session.teacher?.name}` : `Learner: ${session.learner?.name}`}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                            <Clock className="h-3.5 w-3.5 text-purple-600" />
                            {new Date(session.scheduledAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <p className="mb-3">No upcoming sessions booked.</p>
                    <Link to="/marketplace" className="inline-flex items-center gap-2 bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-xl">
                      Explore Marketplace <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS MENU (DATA TABLE FOR ADMIN / BOOKED SKILLS FOR USER) */}
          {activeTab === 'skills' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* ADMIN VIEW: PROFESSIONAL SKILLS DATA TABLE */}
              {isAdmin ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900">Skills Management</h1>
                      <p className="text-slate-500">Manage, search, sort, and edit all skills listed across the platform.</p>
                    </div>

                    <button
                      onClick={() => {
                        setSkillFormData({ title: '', description: '', category: '' });
                        setShowAddModal(true);
                      }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all flex-shrink-0"
                    >
                      <PlusCircle className="h-5 w-5" /> Add Skill
                    </button>
                  </div>

                  {/* Filters, Search, and Sort Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-grow w-full md:w-auto">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        placeholder="Search by title, category, author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      {/* Category Filter */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Filter className="h-3.5 w-3.5 text-purple-600" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        >
                          <option value="ALL">All Categories</option>
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort Selector */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <ArrowUpDown className="h-3.5 w-3.5 text-purple-600" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white"
                        >
                          <option value="newest">Sort: Newest First</option>
                          <option value="oldest">Sort: Oldest First</option>
                          <option value="title_asc">Title (A-Z)</option>
                          <option value="title_desc">Title (Z-A)</option>
                        </select>
                      </div>

                      {/* Items Per Page Selector */}
                      <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-purple-500 focus:bg-white"
                      >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills Data Table */}
                  {loading ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400">Loading skills data...</div>
                  ) : processedSkills.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                              <th className="py-3.5 px-6">Skill Details</th>
                              <th className="py-3.5 px-6">Category</th>
                              <th className="py-3.5 px-6">Author / Provider</th>
                              <th className="py-3.5 px-6">Created Date</th>
                              <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {paginatedSkills.map(skill => (
                              <tr key={skill.id} className="hover:bg-purple-50/30 transition-colors group">
                                <td className="py-4 px-6 max-w-xs">
                                  <div className="font-bold text-slate-900 text-base">{skill.title}</div>
                                  <div className="text-slate-500 text-xs line-clamp-2 mt-0.5">{skill.description}</div>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                                    <Tag className="h-3 w-3" /> {skill.category}
                                  </span>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                  <div className="font-medium text-slate-800">{skill.provider?.name || 'Admin'}</div>
                                  <div className="text-[11px] text-slate-400">ID: {skill.providerId?.substring(0, 8)}...</div>
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-slate-500 text-xs">
                                  {skill.createdAt ? new Date(skill.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEditSkillModal(skill)}
                                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                                      title="Edit skill details"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSkill(skill.id)}
                                      className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                                      title="Delete skill"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Bar Footer */}
                      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
                        <div>
                          Showing <span className="font-bold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, processedSkills.length)}</span> of <span className="font-bold text-slate-900">{processedSkills.length}</span> skills
                        </div>

                        {/* Page Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-8 w-8 rounded-xl font-bold text-xs transition-colors ${
                                currentPage === page
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium text-slate-600">No skills match your filters.</p>
                      <button
                        onClick={() => { setSearch(''); setCategoryFilter('ALL'); }}
                        className="mt-2 text-xs font-semibold text-purple-600 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* USER (STUDENT) VIEW: MY BOOKED SKILLS & SESSIONS ONLY (NO CRUD) */
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-900">My Booked Skills & Sessions</h1>
                      <p className="text-slate-500">View and manage all skills you have booked for learning.</p>
                    </div>

                    <Link
                      to="/marketplace"
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all flex-shrink-0"
                    >
                      <Sparkles className="h-5 w-5" /> Browse Marketplace
                    </Link>
                  </div>

                  {/* Search Bar for Booked Skills */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 shadow-xs"
                      placeholder="Search your booked skills..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Booked Skills List Display (No CRUD buttons, view & cancel only) */}
                  {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading your booked skills...</div>
                  ) : filteredBookedSessions.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredBookedSessions.map(session => (
                        <div key={session.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                <Tag className="h-3 w-3" /> {session.skill?.category || 'Skill'}
                              </span>
                              <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                ✓ Session Booked (10 Cr)
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 text-lg mb-1">{session.skill?.title || 'Booked Skill Session'}</h3>
                            <p className="text-sm text-slate-600 mb-4">{session.skill?.description || 'Enrolled session from Marketplace.'}</p>
                            
                            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600 mb-4">
                              <div><span className="font-semibold text-slate-800">Teacher: </span>{session.teacher?.name} ({session.teacher?.email})</div>
                              <div><span className="font-semibold text-slate-800">Scheduled Date: </span>{new Date(session.scheduledAt).toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                            <span className="text-xs text-slate-400 font-medium">Session ID: {session.id.substring(0, 8)}...</span>
                            <button
                              onClick={() => handleCancelSession(session.id, session.cost)}
                              className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel Booking (Refund 10 Cr)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
                      <BookMarked className="h-14 w-14 mx-auto text-purple-300" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">No Booked Skills Yet</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                          You haven't enrolled in any skill sessions. Explore the Skill Marketplace to use your credits and learn from peers!
                        </p>
                      </div>
                      <Link
                        to="/marketplace"
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all"
                      >
                        Explore Marketplace <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-purple-600" /> Edit Profile
            </h3>
            <p className="text-xs text-slate-500 mb-6">Update your account name, email, and bio.</p>

            {profileError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Bio</label>
                <textarea
                  placeholder="Tell others about yourself..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 h-24"
                  value={profileForm.bio}
                  onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN ADD SKILL MODAL --- */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-4">Add New Skill</h3>

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Skill Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern React & Next.js"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={skillFormData.title}
                  onChange={e => setSkillFormData({...skillFormData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Development"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={skillFormData.category}
                  onChange={e => setSkillFormData({...skillFormData, category: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  required
                  placeholder="Describe the topics and key takeaways for this skill..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 h-28"
                  value={skillFormData.description}
                  onChange={e => setSkillFormData({...skillFormData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSkill}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submittingSkill ? 'Creating...' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN EDIT SKILL MODAL --- */}
      {editingSkill && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingSkill(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900 mb-4">Edit Skill</h3>

            <form onSubmit={handleUpdateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Skill Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={skillFormData.title}
                  onChange={e => setSkillFormData({...skillFormData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Category</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  value={skillFormData.category}
                  onChange={e => setSkillFormData({...skillFormData, category: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 h-28"
                  value={skillFormData.description}
                  onChange={e => setSkillFormData({...skillFormData, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSkill}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {submittingSkill ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
