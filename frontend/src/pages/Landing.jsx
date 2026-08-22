import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Coins, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const featureCards = [
	{
		icon: GraduationCap,
		title: 'Teach to Earn',
		description:
			'Share your expertise and turn your knowledge into credits that fuel your next learning milestone.',
		accent: 'bg-blue-100 text-blue-700',
	},
	{
		icon: Coins,
		title: 'Credit System',
		description:
			'Every skill exchange is tracked transparently, making your academic growth rewarding and measurable.',
		accent: 'bg-violet-100 text-violet-700',
	},
	{
		icon: BookOpen,
		title: 'Learn for Free',
		description:
			'Use your earned credits to access one-on-one sessions with peers and mentors across campus.',
		accent: 'bg-pink-100 text-pink-700',
	},
];

const stats = [
	{ label: 'Students onboarded', value: '2.4K+' },
	{ label: 'Skills exchanged', value: '800+' },
	{ label: 'Credits rewarded', value: '18K' },
];

export default function Landing() {
	return (
		<div className="relative overflow-hidden">
			<div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),transparent_45%)]" />

			<section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
				<div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
					<div>
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
							<span className="flex h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_0_4px_rgba(139,92,246,0.12)]" />
							<span>SkillSwap is now live in beta</span>
						</div>

						<h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
							<span>Exchange skills.</span>
							<span className="mt-2 block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
								Build your future.
							</span>
						</h1>

						<p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
							Discover a modern peer-to-peer learning marketplace where students
							share expertise, earn credits, and grow together through practical
							collaboration.
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button size="lg" asChild>
								<Link to="/marketplace" className="flex items-center gap-2">
									Explore Skills
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>

							<Button variant="outline" size="lg" asChild>
								<Link to="/login">Join the community</Link>
							</Button>
						</div>

						<div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
							{stats.map((stat) => (
								<div
									key={stat.label}
									className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm"
								>
									<div className="text-2xl font-semibold tracking-tight text-foreground">
										{stat.value}
									</div>
									<div className="mt-1 text-xs text-muted-foreground">
										{stat.label}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="relative">
						<div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-100 via-white to-sky-100 blur-2xl" />

						<Card className="overflow-hidden border-violet-100 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
							<CardHeader className="border-b border-border bg-slate-50/80">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
											Live marketplace
										</p>
										<CardTitle className="mt-2 text-2xl">
											Session overview
										</CardTitle>
									</div>
									<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
										<Sparkles className="h-5 w-5" />
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-5 p-6">
								<div className="rounded-2xl border border-border bg-slate-50/90 p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">
												Available sessions this week
											</p>
											<p className="mt-2 text-3xl font-semibold text-foreground">
												46
											</p>
										</div>
										<div className="rounded-xl bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
											+18%
										</div>
									</div>
								</div>

								<div className="space-y-3">
									{[
										{
											name: 'UI Design',
											mentor: 'Aisha',
											credits: '10 Cr',
											tone: 'bg-violet-100 text-violet-700',
										},
										{
											name: 'Python Bootcamp',
											mentor: 'Rohan',
											credits: '12 Cr',
											tone: 'bg-blue-100 text-blue-700',
										},
										{
											name: 'Public Speaking',
											mentor: 'Nia',
											credits: '8 Cr',
											tone: 'bg-amber-100 text-amber-700',
										},
									].map((skill) => (
										<div
											key={skill.name}
											className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
										>
											<div>
												<div className="font-medium text-foreground">
													{skill.name}
												</div>
												<div className="text-sm text-muted-foreground">
													with {skill.mentor}
												</div>
											</div>
											<div
												className={`rounded-full px-2.5 py-1 text-xs font-semibold ${skill.tone}`}
											>
												{skill.credits}
											</div>
										</div>
									))}
								</div>

								<div className="flex items-center justify-between rounded-2xl border border-violet-100 bg-violet-50 p-4">
									<div>
										<div className="text-sm text-violet-700">
											Community trust score
										</div>
										<div className="mt-1 text-xl font-semibold text-violet-900">
											4.9 / 5
										</div>
									</div>
									<ShieldCheck className="h-8 w-8 text-violet-700" />
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<section className="border-y border-border bg-card/50">
				<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
					<div className="mx-auto mb-12 max-w-2xl text-center">
						<p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
							How it works
						</p>
						<h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							A modern learning loop built for students
						</h2>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{featureCards.map((feature) => {
							const Icon = feature.icon;
							return (
								<Card
									key={feature.title}
									className="group border-border/80 bg-background/80 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
								>
									<CardHeader>
										<div
											className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}
										>
											<Icon className="h-5 w-5" />
										</div>
										<CardTitle>{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base leading-7 text-muted-foreground">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div className="rounded-[2rem] border border-border bg-gradient-to-r from-violet-600 to-indigo-600 p-[1px] shadow-[0_24px_64px_rgba(109,90,244,0.18)]">
					<div className="rounded-[calc(2rem-1px)] bg-slate-950 px-6 py-10 text-white sm:px-10">
						<div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
							<div>
								<p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200">
									Ready to grow?
								</p>
								<h3 className="mt-3 text-3xl font-semibold tracking-tight">
									Start exchanging knowledge today.
								</h3>
							</div>
							<Button
								variant="secondary"
								size="lg"
								asChild
								className="bg-white text-slate-900 hover:bg-slate-100"
							>
								<Link to="/login" className="flex items-center gap-2">
									Get started
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
