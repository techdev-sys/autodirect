import React from 'react';
import { Wrench, Lock, ShieldCheck, Package, Truck, ArrowRight, Search, ChevronDown, Route, Navigation, Bell, TrendingUp, Share2, MessageSquare, HelpCircle, RefreshCw, Newspaper, Cpu, Mail, Phone, MapPin } from 'lucide-react';
import RoleCard from '../components/RoleCard';

const NavDropdown = ({ label, items }) => (
    <div className="relative group">
        <button className="flex items-center space-x-1 hover:text-primary transition-colors py-2 font-bold uppercase tracking-wide">
            <span>{label}</span>
            <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
        </button>
        <div className="absolute top-full left-0 pt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50">
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                {items.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.href || '#'}
                        onClick={(e) => {
                            if (item.action) {
                                e.preventDefault();
                                item.action();
                            }
                        }}
                        className="flex items-start space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors group/item"
                    >
                        {item.icon && (
                            <div className="mt-0.5 text-blue-500 group-hover/item:text-blue-600">
                                {item.icon}
                            </div>
                        )}
                        <div>
                            <div className="text-sm font-bold text-slate-900 group-hover/item:text-primary transition-colors mb-0.5">
                                {item.label}
                            </div>
                            {item.desc && (
                                <div className="text-xs text-slate-500 font-medium leading-tight">
                                    {item.desc}
                                </div>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    </div>
);

const WelcomePage = ({ onSelectRole }) => {

    // Scroll Helper
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase">Auto<span className="text-primary">Direct</span></span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 text-sm pt-1">
                        <NavDropdown
                            label="Solutions"
                            items={[
                                { label: 'Route Optimization', desc: 'Smarter paths, lower costs', icon: <Route className="w-5 h-5" />, action: () => scrollToSection('features') },
                                { label: 'Real-time Tracking', desc: 'GPS accuracy for every load', icon: <Navigation className="w-5 h-5" />, action: () => scrollToSection('features') },
                                { label: 'Secure Payments', desc: 'Instant payouts on delivery', icon: <Lock className="w-5 h-5" />, action: () => scrollToSection('features') },
                            ]}
                        />
                        <NavDropdown
                            label="Company"
                            items={[
                                { label: 'About Us', desc: 'Our mission & vision', icon: <ShieldCheck className="w-5 h-5" />, action: () => scrollToSection('resources') },
                                { label: 'Press & Media', desc: 'Latest news from AutoDirect', icon: <Newspaper className="w-5 h-5" />, href: '#' },
                            ]}
                        />
                    </div>

                    <div className="flex items-center space-x-6">
                        <button onClick={() => window.location.href = "/track"} className="hidden sm:flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-all">
                            <Search className="w-4 h-4 mr-2" /> Track Shipment
                        </button>
                        <button
                            onClick={() => document.getElementById('get-started').scrollIntoView({ behavior: 'smooth' })}
                            className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-24 pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
                <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[100px] -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 text-center lg:text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <span className="w-2 h-2 rounded-full bg-primary mr-3 animate-ping"></span>
                            Live Logistics Network
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] lg:leading-[1]">
                            The Future of <br />
                            <span className="gradient-text">Direct Delivery.</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                            Connect directly with the world's most reliable transport network. No brokers. No delays. Just direct movement.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                            <button
                                onClick={() => document.getElementById('get-started').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-[1.5rem] font-bold text-lg shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:-translate-y-1 transition-all flex items-center justify-center group"
                            >
                                Get Started Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => window.location.href = "/track"} className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-[1.5rem] font-bold text-lg hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center">
                                Track Order
                            </button>
                        </div>

                        <div className="pt-10 flex items-center justify-center lg:justify-start space-x-10 text-slate-400 opacity-60">
                            <span className="font-black text-2xl tracking-tighter">logistics<span className="font-light">OS</span></span>
                            <span className="font-black text-2xl tracking-tighter uppercase opacity-50">Secure<span className="text-primary/50">Pay</span></span>
                        </div>
                    </div>

                    {/* Animated Visual */}
                    <div className="relative lg:h-[700px] flex items-center justify-center">
                        <div className="relative w-full max-w-lg aspect-square">
                            {/* Decorative Rings */}
                            <div className="absolute inset-0 border-[3px] border-slate-200/50 rounded-[3rem] animate-[spin_30s_linear_infinite]"></div>
                            <div className="absolute inset-[10%] border-2 border-dashed border-slate-300/30 rounded-[2.5rem] animate-[spin_20s_linear_infinite_reverse]"></div>

                            {/* Live Network Activity Card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] glass-effect rounded-[2.5rem] p-10 rotate-[-2deg] hover:rotate-0 transition-all duration-700 z-10 animate-float shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="space-y-1">
                                        <h3 className="font-black text-slate-900 text-sm tracking-widest uppercase">Network Activity</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live Updates</p>
                                    </div>
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {/* Activity Item 1 */}
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-700">Harare <span className="text-slate-300 mx-1">→</span> Bulawayo</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wide mb-1">Delivered</div>
                                            <div className="text-[10px] text-slate-400 font-medium">2m ago</div>
                                        </div>
                                    </div>

                                    {/* Activity Item 2 */}
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-700">Mutare <span className="text-slate-300 mx-1">→</span> Gweru</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide mb-1">En Route</div>
                                            <div className="text-[10px] text-slate-400 font-medium">15m ago</div>
                                        </div>
                                    </div>

                                    {/* Activity Item 3 */}
                                    <div className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-700">Vic Falls <span className="text-slate-300 mx-1">→</span> Hwange</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide mb-1">Booked</div>
                                            <div className="text-[10px] text-slate-400 font-medium">1h ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- Features Section --- */}
            <div id="features" className="py-24 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-primary font-black uppercase tracking-widest text-xs mb-2 block">Why AutoDirect?</span>
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Features built for modern logistics.</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            We bridge the gap between heavy shippers and reliable independent haulers efficiently.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-primary mb-6">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Live Load Board</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Access thousands of active shipments instantly. Filter by route, weight, and vehicle type to find the perfect match.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Partners</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Every hauler and shipper is vetted. We ensure compliance, insurance, and identity verification for peace of mind.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Dispatch</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Cut out the broker. Communicate directly with drivers, track shipments in real-time, and pay instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- About / Resources Section --- */}
            <div id="resources" className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <span className="text-primary font-black uppercase tracking-widest text-xs mb-2 block">Our Mission</span>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Empowering the supply chain.</h2>
                        <div className="space-y-6 text-slate-500 text-lg leading-relaxed">
                            <p>
                                At <strong className="text-slate-900">AutoDirect</strong>, we believe logistics should be simple, transparent, and profitable for everyone involved.
                            </p>
                            <p>
                                We provide the resources you need to succeed:
                            </p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    <span>24/7 Support for Haulers & Shippers</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    <span>Automated Invoicing & Proof of Delivery</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                    <span>Real-time Market Rate Insights</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
                            {/* Placeholder visual */}
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-5xl font-black text-white mb-2">10k+</div>
                                    <div className="text-blue-400 font-bold uppercase tracking-widest">Active Loads</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                            <p className="text-sm font-bold text-slate-800 italic">"AutoDirect changed how we move freight. It's simply faster."</p>
                            <p className="text-xs text-slate-400 mt-2 font-bold uppercase">- Global Logistics Co.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Selection (Get Started) */}
            <div id="get-started" className="py-32 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent)] pointer-events-none"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Start Your Journey</h2>
                    <p className="text-slate-400 mb-20 text-xl font-medium">Ready to transform your logistics? Choose your path below.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <button
                            onClick={() => onSelectRole('supplier')}
                            className="group p-10 rounded-[2.5rem] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                        >
                            <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Package className="w-64 h-64 -rotate-12 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-primary rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4">I am a Supplier</h3>
                                <p className="text-slate-400 mb-10 text-lg leading-relaxed font-medium">Post loads, manage complex shipments, and track your goods across the globe in real-time.</p>
                                <div className="inline-flex items-center font-bold text-primary group-hover:translate-x-2 transition-transform bg-primary/10 px-6 py-3 rounded-xl">
                                    Continue as Supplier <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => onSelectRole('hauler')}
                            className="group p-10 rounded-[2.5rem] bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                        >
                            <div className="absolute -bottom-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Truck className="w-64 h-64 -rotate-12 text-amber-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Truck className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4">I am a Hauler</h3>
                                <p className="text-slate-400 mb-10 text-lg leading-relaxed font-medium">Find high-paying loads, optimize your routes, and get paid instantly with our secure payment system.</p>
                                <div className="inline-flex items-center font-bold text-amber-500 group-hover:translate-x-2 transition-transform bg-amber-500/10 px-6 py-3 rounded-xl">
                                    Continue as Hauler <ArrowRight className="w-5 h-5 ml-2" />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Contact Contact --- */}
            <div id="contact" className="py-20 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black mb-6">We're here to help.</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                        Have questions? Need a custom logistics solution? Reach out to our team directly.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="bg-white/5 backdrop-blur border border-white/10 px-8 py-4 rounded-2xl">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                            <p className="text-xl font-bold">autodirect@gmail.com</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur border border-white/10 px-8 py-4 rounded-2xl">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                            <p className="text-xl font-bold">0781312079</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm font-medium">
                    <p>&copy; 2024 AutoDirect Logistics. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-slate-600">Privacy</a>
                        <a href="#" className="hover:text-slate-600">Terms</a>
                        <a href="#" className="hover:text-slate-600">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WelcomePage;
