import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AddProduct from './components/addProduct/AddProduct';

export default function App() {
  // The sidebar state lives here because the page content must also move
  // (padding-left) when the sidebar opens or closes.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f3ed]">
      <Sidebar expanded={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      <div className={`pl-14 transition-all duration-200 ${sidebarOpen ? 'md:pl-56' : 'md:pl-[72px]'}`}>
        <Navbar />
        <main className="px-4 pb-16 pt-8">
          <AddProduct onBackToCatalog={() => {}} />
        </main>
      </div>
    </div>
  );
}