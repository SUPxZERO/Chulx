import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function AppShell() { 
    return (
        <div className="flex flex-col min-h-screen pb-16 md:pb-0">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    ); 
}