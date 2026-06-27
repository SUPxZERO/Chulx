import { Link } from 'react-router-dom';

export default function Dashboard() { 
    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Welcome to Chulx</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/companions" className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-gold-500 transition-colors">
                    <h2 className="text-xl font-bold text-gold-400 mb-2">Find an Ambassador</h2>
                    <p className="text-slate-400">Browse our directory of verified cultural ambassadors.</p>
                </Link>
            </div>
        </div>
    ); 
}