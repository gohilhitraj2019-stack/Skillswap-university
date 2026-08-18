import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Coins } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          SkillSwap is now live in beta
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          Exchange Skills. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            Empower Your Future.
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
          The credit-based peer-to-peer learning platform for students. Learn what you need, teach what you know, and build your community without spending a dime.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link to="/marketplace" className="px-8 py-4 bg-purple-600 text-white rounded-full font-semibold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/50 flex items-center gap-2 group">
            Explore Skills
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
            Join the Community
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">A seamless ecosystem for collaborative education.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Teach to Earn</h3>
              <p className="text-slate-600 leading-relaxed">Share your knowledge with peers. For every session you teach, you earn valuable learning credits.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Coins className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Credit System</h3>
              <p className="text-slate-600 leading-relaxed">No real money involved. Our transparent credit wallet keeps track of your educational currency.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-14 w-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Learn for Free</h3>
              <p className="text-slate-600 leading-relaxed">Spend your earned credits to book 1-on-1 sessions with experts in skills you want to master.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
