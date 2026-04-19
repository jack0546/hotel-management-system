'use client';
import { useState, useEffect } from 'react';
import { CalendarDays, Coffee, Users, Search, Bell, Bot, TrendingUp, CheckCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, active: 0, occupancy: 0 });

  const ROOM_TYPES = [
    "Standard Queen Room", "Family Double & Twin", "Economy Room", 
    "Ocean View King", "Honeymoon Suite", "Business Suite"
  ];

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(docs);
      
      const now = new Date();
      const activeBookings = docs.filter((b: any) => {
        const bIn = new Date(b.checkin);
        const bOut = new Date(b.checkout);
        bOut.setHours(12, 0, 0, 0); // Include the 12 PM reset policy
        return now >= bIn && now < bOut;
      });

      const totalRev = docs.reduce((acc, curr: any) => acc + (Number(curr.totalPaid) || 0), 0);
      const occupancyRate = (activeBookings.length / 6) * 100;

      setStats({ 
        revenue: totalRev, 
        active: snapshot.size, 
        occupancy: Math.round(occupancyRate) 
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-hotel-dark text-white p-6 shadow-2xl z-10 transition-all">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hotel-primary to-hotel-secondary flex items-center justify-center font-bold text-xl shadow-lg">
            H
          </div>
          <h1 className="text-xl font-bold tracking-tight">SmartHotel AI</h1>
        </div>
        
        <nav className="space-y-4">
          <SidebarItem icon={<CalendarDays />} label="Dashboard" active={activeTab==='dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Search />} label="Rooms" active={activeTab==='rooms'} onClick={() => setActiveTab('rooms')} />
          <SidebarItem icon={<Users />} label="Guests" active={activeTab==='guests'} onClick={() => setActiveTab('guests')} />
          <SidebarItem icon={<Coffee />} label="Restaurant POS" active={activeTab==='pos'} onClick={() => setActiveTab('pos')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="glass sticky top-0 z-10 flex justifying-between items-center px-10 py-4">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 transition"><Bell className="text-slate-600" /></button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-hotel-primary text-white flex items-center justify-center font-bold text-sm">A</div>
              <span className="font-medium text-slate-700 text-sm">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && <DashboardView stats={stats} />}
          {activeTab === 'rooms' && <RoomsView bookings={bookings} roomTypes={ROOM_TYPES} />}
          {activeTab === 'guests' && <GuestsView bookings={bookings} />}
          {activeTab === 'pos' && <POSView />}
        </div>

        {/* AI Assistant FAB */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-hotel-primary to-hotel-secondary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform">
          <Bot size={32} />
        </button>

        {isChatOpen && (
          <div className="fixed bottom-28 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-50">
            <div className="bg-hotel-dark p-4 text-white flex gap-3 items-center">
              <Bot />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <div className="p-4 h-64 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              <div className="bg-hotel-light text-hotel-dark p-3 rounded-lg rounded-tl-none w-11/12 text-sm">
                Hello! I can help you manage bookings, check room status, or process POS orders. How can I assist you today?
              </div>
            </div>
            <div className="p-3 border-t bg-white flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 px-3 py-2 border rounded-full text-sm outline-none focus:border-hotel-primary" />
              <button className="bg-hotel-primary text-white px-4 py-2 rounded-full text-sm font-medium">Send</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${active ? 'bg-hotel-primary text-white shadow-lg' : 'text-hotel-accent hover:bg-white/10'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

// Sub-components
function DashboardView({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Rooms" value="6" />
        <StatCard title="Occupancy Rate" value={`${stats.occupancy}%`} />
        <StatCard title="Total Revenue" value={`GHS ${stats.revenue.toLocaleString()}`} />
        <StatCard title="Total Bookings" value={stats.active.toString()} />
      </div>
      <div className="glass rounded-2xl p-6 mt-8 h-96 flex flex-col items-center justify-center shadow-sm">
        <TrendingUp size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium text-lg">Real-time Revenue Analytics Active</p>
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="glass p-6 rounded-2xl border-t-4 border-t-hotel-primary hover:-translate-y-1 transition-transform cursor-pointer">
      <h3 className="text-slate-500 font-medium text-sm mb-2">{title}</h3>
      <p className="text-4xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

function GuestsView({ bookings }: { bookings: any[] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-sm">
      <div className="p-6 border-b bg-white/50 flex justify-between items-center">
        <h3 className="font-bold text-xl text-slate-800">Live Booking Manifest</h3>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle size={14} /> Live Sync Active
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Guest</th>
              <th className="px-6 py-4 font-semibold">Room Type</th>
              <th className="px-6 py-4 font-semibold">Stay Dates</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  Waiting for live bookings from the guest portal...
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{b.guestName || 'Anonymous'}</div>
                    <div className="text-xs text-slate-400">{b.guestEmail || 'no email'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{b.roomType}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {b.checkin} to {b.checkout}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status?.includes('Unpaid') 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {b.status || 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    GHS {Number(b.totalPaid || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoomsView({ bookings, roomTypes }: { bookings: any[], roomTypes: string[] }) {
  const now = new Date();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {roomTypes.map((type, idx) => {
        const activeBooking = bookings.find((b: any) => {
          const bIn = new Date(b.checkin);
          const bOut = new Date(b.checkout);
          bOut.setHours(12, 0, 0, 0);
          return b.roomType === type && now >= bIn && now < bOut;
        });

        const isBooked = !!activeBooking;

        return (
          <div key={type} className="glass rounded-xl overflow-hidden shadow-sm group">
            <div className="h-40 bg-slate-200 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white font-bold text-xl">Unit 10{idx + 1}</span>
              </div>
              <div className={`absolute top-4 right-4 text-white text-xs font-bold px-2 py-1 rounded-md ${isBooked ? 'bg-red-500' : 'bg-green-500'}`}>
                {isBooked ? 'Occupied' : 'Ready'}
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-slate-800">{type}</h4>
              <p className="text-sm text-slate-500 mt-1">
                {isBooked ? `Guest: ${activeBooking.guestName}` : 'No current occupancy'}
              </p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                <p className="text-hotel-primary font-bold text-lg">
                  {isBooked ? 'Due out 12 PM' : 'Status: Clean'}
                </p>
                <div className={`w-3 h-3 rounded-full ${isBooked ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

function POSView() {
  return (
    <div className="flex gap-6 h-[80vh]">
      <div className="flex-1 glass rounded-2xl p-6 overflow-y-auto">
        <h3 className="font-bold text-xl mb-6">Menu Items</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="border p-4 rounded-xl hover:shadow-md cursor-pointer transition bg-white text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-3"></div>
              <h4 className="font-medium">Burger Combo {i}</h4>
              <p className="text-hotel-primary font-bold mt-1">$12.00</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-80 glass rounded-2xl p-6 flex flex-col">
        <h3 className="font-bold text-xl mb-4">Current Order</h3>
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex justify-between text-sm items-center p-2 bg-slate-50 rounded">
            <span>2x Burger Combo 1</span>
            <span className="font-bold">$24.00</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>$24.00</span>
          </div>
          <button className="w-full bg-hotel-primary text-white py-3 rounded-xl font-bold mt-4 hover:shadow-lg transition">Charge to Room</button>
          <button className="w-full bg-hotel-dark text-white py-3 rounded-xl font-bold hover:shadow-lg transition">Pay Now</button>
        </div>
      </div>
    </div>
  )
}
