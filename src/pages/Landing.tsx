import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Zap, Leaf, ShieldCheck, MessageSquare, Wallet, Star, Phone, MapPin,
  Users, Gauge, CheckCircle2, ArrowRight, Bike, Car, Navigation, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Live Matching",
    desc: "Post a ride and get real-time bids from nearby EV riders within seconds. No endless waiting.",
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "100% Eco-Friendly",
    desc: "Every trip runs on electric power — EV Cars, eBikes & CNG autos. Ride green, breathe clean.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Verified & Secure",
    desc: "KYC-verified riders and customers, live trip tracking, and in-app ratings keep every ride safe.",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "In-Call Voice Chat",
    desc: "Talk to your rider or passenger directly inside the app with built-in WebRTC voice calling.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Live Messaging",
    desc: "Share pickup details, landmarks and ETA with a smooth real-time chat for every trip.",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Fair, Transparent Fares",
    desc: "Customers set the fare, riders bid competitively. Track earnings and stats on your dashboard.",
  },
];

const vehicles = [
  { icon: <Car className="w-7 h-7" />, name: "EV Car", seats: "1–4 seats", range: "BDT 40–80", note: "Comfortable family & group rides" },
  { icon: <Bike className="w-7 h-7" />, name: "eBike", seats: "1–2 seats", range: "BDT 20–40", note: "Quick city hops & shortcuts" },
  { icon: <Navigation className="w-7 h-7" />, name: "CNG Auto", seats: "1–3 seats", range: "BDT 30–60", note: "Affordable 3-wheeler trips" },
];

const steps = [
  { n: "01", title: "Post or Accept", desc: "Customers post a ride with fare & seats. Riders browse live nearby requests and place a bid." },
  { n: "02", title: "Match & Connect", desc: "Customer accepts the best bid. Both sides get live chat, voice call and trip tracking." },
  { n: "03", title: "Ride & Earn", desc: "Complete the trip, rate each other, and riders watch earnings update on their dashboard." },
];

const stats = [
  { value: "3", label: "Green vehicle types" },
  { value: "100%", label: "Electric powered" },
  { value: "< 5 min", label: "Avg. match time" },
  { value: "24/7", label: "Live support" },
];

const testimonials = [
  { name: "Ayesha R.", role: "Daily Commuter", text: "I post my office ride each morning and always get a fair bid within minutes. The voice call makes meeting my rider effortless.", rating: 5 },
  { name: "Tanvir A.", role: "EV Rider", text: "Earnings are transparent and the live request map means I'm never driving empty. Best part is how quick trips get matched.", rating: 5 },
  { name: "Mitu S.", role: "Student", text: "Cheaper than other apps and I love that it's all electric. The eBike option is perfect for my short campus trips.", rating: 5 },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <span className="text-white font-black text-sm">EV</span>
          </div>
          <span className="font-extrabold text-lg text-slate-800 tracking-tight">EV Ride</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#vehicles" className="hover:text-emerald-600 transition-colors">Vehicles</a>
          <a href="#how" className="hover:text-emerald-600 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Reviews</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">Log in</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-colors">
            Get Started
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setOpen(v => !v)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 space-y-3">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">Features</a>
          <a href="#vehicles" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">Vehicles</a>
          <a href="#how" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">How it works</a>
          <a href="#testimonials" onClick={() => setOpen(false)} className="block text-sm font-semibold text-slate-600">Reviews</a>
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700">Log in</Link>
            <Link to="/signup" className="flex-1 text-center px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-28 lg:pt-36 pb-20 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/70 via-white to-white" />
      <div className="absolute -top-24 -right-24 -z-10 w-[28rem] h-[28rem] rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 -z-10 w-[24rem] h-[24rem] rounded-full bg-teal-200/30 blur-3xl" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
            <Leaf size={14} /> Bangladesh's Green Ride-Sharing
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Ride electric.<br />
            <span className="text-emerald-600">Save the planet.</span><br />
            Pay less.
          </h1>
          <p className="mt-6 text-lg text-slate-500 font-medium max-w-xl">
            EV Ride connects riders and passengers through a live bidding marketplace for EV Cars, eBikes and CNG autos — fast matching, fair fares, and zero emissions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/signup" className="px-7 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-colors text-center">
              Book a Ride
            </Link>
            <Link to="/signup" className="px-7 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:border-emerald-300 hover:text-emerald-700 transition-colors text-center">
              Become a Rider
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500 font-semibold">
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> No surge pricing</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> KYC verified users</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Live voice & chat</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="relative">
          <div className="glass rounded-[2.5rem] p-7 lg:p-9 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live request</p>
                <p className="font-bold text-slate-800">IUB → Mirpur, Dhaka</p>
              </div>
              <span className="ml-auto px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase">Bidding</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Rakib H.", veh: "EV Car", fare: 60, rating: "4.9" },
                { name: "Sadia K.", veh: "eBike", fare: 35, rating: "5.0" },
                { name: "Nayeem R.", veh: "CNG Auto", fare: 48, rating: "4.8" },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{b.name}</p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{b.veh}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-500"><Star size={12} fill="currentColor" /> {b.rating}</span>
                    <span className="font-black text-slate-800">BDT {b.fare}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your offer</span>
              <span className="text-2xl font-black text-emerald-600">BDT 50</span>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 hidden lg:flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Gauge size={18} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matched in</p>
              <p className="font-black text-slate-800 text-sm">2 min 14s</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl lg:text-4xl font-black text-emerald-600">{s.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center mb-14">
      <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">{eyebrow}</p>
      <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
      {sub && <p className="mt-4 text-slate-500 font-medium">{sub}</p>}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading eyebrow="Why EV Ride" title="Everything you need for a smarter, greener trip" sub="Built for both passengers and riders — from the first tap to the final fare." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group p-7 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Vehicles() {
  return (
    <section id="vehicles" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading eyebrow="Choose your ride" title="Three clean ways to move" sub="Pick the vehicle that fits your trip — every option is electric and eco-friendly." />
        <div className="grid md:grid-cols-3 gap-6">
          {vehicles.map((v, i) => (
            <motion.div key={v.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative p-8 rounded-3xl bg-white border border-slate-100 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-50 opacity-60" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 mb-6">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800">{v.name}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">{v.note}</p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v.seats}</span>
                  <span className="font-black text-emerald-600">{v.range}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading eyebrow="How it works" title="From request to ride in three steps" />
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative p-8 rounded-3xl bg-white border border-slate-100">
              <span className="text-5xl font-black text-emerald-100">{s.n}</span>
              <h3 className="text-xl font-bold text-slate-800 mt-2 mb-3">{s.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-emerald-300"><ArrowRight size={28} /></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <SectionHeading eyebrow="Loved by riders & passengers" title="What our community says" />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-7 rounded-3xl bg-white border border-slate-100">
              <div className="flex gap-1 text-amber-400 mb-4">
                {Array.from({ length: t.rating }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{t.name[0]}</div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 lg:px-14 py-14 text-center">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <h2 className="relative text-3xl lg:text-4xl font-black text-white tracking-tight">Ready to ride the green way?</h2>
          <p className="relative mt-4 text-slate-300 font-medium max-w-xl mx-auto">Join thousands of passengers and riders across Dhaka moving cleaner, faster and cheaper with EV Ride.</p>
          <div className="relative mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-7 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-900/40 hover:bg-emerald-400 transition-colors">Get Started Free</Link>
            <Link to="/login" className="px-7 py-4 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors">I already have an account</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-black text-sm">EV</span>
            </div>
            <span className="font-extrabold text-lg text-slate-800">EV Ride</span>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xs">Bangladesh's electric ride-sharing marketplace. Move green, pay less, earn more.</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</p>
          <ul className="space-y-2 text-sm text-slate-500 font-medium">
            <li><a href="#features" className="hover:text-emerald-600">Features</a></li>
            <li><a href="#vehicles" className="hover:text-emerald-600">Vehicles</a></li>
            <li><a href="#how" className="hover:text-emerald-600">How it works</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company</p>
          <ul className="space-y-2 text-sm text-slate-500 font-medium">
            <li><a href="#testimonials" className="hover:text-emerald-600">Reviews</a></li>
            <li><Link to="/signup" className="hover:text-emerald-600">Become a Rider</Link></li>
            <li><Link to="/login" className="hover:text-emerald-600">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Get the app</p>
          <p className="text-sm text-slate-500 font-medium mb-3">Start riding in minutes.</p>
          <Link to="/signup" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors">Create Account</Link>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} EV Ride. All rights reserved.</p>
          <p>Made for a cleaner Dhaka.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Vehicles />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
