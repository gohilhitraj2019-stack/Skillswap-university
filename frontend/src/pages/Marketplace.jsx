import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Search, Tag, User, Sparkles } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function Marketplace() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('http://localhost:5050/api/skills');
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
      await axios.post(
        'http://localhost:5050/api/sessions/book',
        {
          skillId: skill.id,
          teacherId: skill.providerId,
          cost: 10,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert('Session booked successfully! 10 credits deducted.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book session');
    }
  };

  const filteredSkills = skills.filter(
    (skill) =>
      skill.title.toLowerCase().includes(search.toLowerCase()) ||
      skill.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Skill marketplace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Find the next skill to master</h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Browse curated sessions from students and experts across your university. Spend credits, learn faster, and build confidence together.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 'Python', 'Design', 'Guitar'..."
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {filteredSkills.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="group overflow-hidden border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                    <Tag className="h-3 w-3" />
                    {skill.category}
                  </div>
                  <div className="rounded-xl bg-slate-100 px-2.5 py-1 text-sm font-semibold text-foreground">10 Cr</div>
                </div>

                <CardTitle className="mt-4 text-2xl leading-tight text-foreground">{skill.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{skill.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-foreground">{skill.provider?.name || 'Skill mentor'}</span>
                  </div>

                  <Button size="icon" variant="secondary" onClick={() => handleBook(skill)} aria-label={`Book ${skill.title}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-border bg-card p-12 text-center shadow-sm">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">No matching skills found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or browse another category.</p>
        </div>
      )}
    </div>
  );
}
