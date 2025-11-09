import AdminLayout from '@/components/admin/AdminLayout'
import StatsCard from '@/components/admin/StatsCard'
import RevenueChart from '@/components/admin/RevenueChart'
import CalendarWidget from '@/components/admin/CalendarWidget'
import BookingTable from '@/components/admin/BookingTable'

export default function AdminDashboard(){
  const stats = [
    { icon:'💰', title:'Total Revenue', value:'฿818,003,345', hint:'Update November 1, 2024' },
    { icon:'🏠', title:'Total Room', value:'3,345', hint:'Update November 1, 2024' },
    { icon:'🛏', title:'Available Room', value:'3,345', hint:'Update November 1, 2024' },
    { icon:'📥', title:'New Booking', value:'3,345', hint:'Update November 1, 2024' },
  ];
  const data = [
    {label:'Jan', value: 45},
    {label:'Feb', value: 20},
    {label:'Mar', value: 70},
    {label:'Apr', value: 50},
    {label:'May', value: 35},
    {label:'Jun', value: 60},
  ];

  const bookings = [
    { id: 901928, guest: 'Dianne Russel', date: 'Oct 21, 2024', room: 105, amount: 2500, type: 'Deluxe', status: 'Complete', avatar: 'https://i.pravatar.cc/40?img=1' },
    { id: 901928, guest: 'Jenny Wilson',  date: 'Oct 21, 2024', room: 104, amount: 2500, type: 'Deluxe', status: 'Canceled', avatar: 'https://i.pravatar.cc/40?img=2' },
    { id: 901928, guest: 'Brooklyn Simmons', date: 'Oct 21, 2024', room: 103, amount: 2500, type: 'Deluxe', status: 'Canceled', avatar: 'https://i.pravatar.cc/40?img=3' },
    { id: 901928, guest: 'Dianne Russell', date: 'Oct 21, 2024', room: 102, amount: 2500, type: 'Deluxe', status: 'Complete', avatar: 'https://i.pravatar.cc/40?img=4' },
    { id: 901928, guest: 'Kristin Watson', date: 'Oct 21, 2024', room: 101, amount: 2500, type: 'Deluxe', status: 'Complete', avatar: 'https://i.pravatar.cc/40?img=5' },
    { id: 901928, guest: 'Annette Black', date: 'Oct 21, 2024', room: 100, amount: 2500, type: 'Deluxe', status: 'Canceled', avatar: 'https://i.pravatar.cc/40?img=6' },
    { id: 901928, guest: 'Theresa Webb', date: 'Oct 21, 2024', room: 99, amount: 2500, type: 'Deluxe', status: 'Complete', avatar: 'https://i.pravatar.cc/40?img=7' },
    { id: 901928, guest: 'Devon Lane', date: 'Oct 21, 2024', room: 98, amount: 2500, type: 'Deluxe', status: 'Complete', avatar: 'https://i.pravatar.cc/40?img=8' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <h1 className="text-3xl font-semibold mb-1">Welcome, Watt</h1>
      <p className="text-gray-500 mb-4">Welcome to Banana, Manage your hotel booking data with us</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {stats.map((s,i)=>(<StatsCard key={i} {...s}/>))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2"><RevenueChart data={data}/></div>
        <div><CalendarWidget monthLabel="November, 2024" /></div>
      </div>

      <BookingTable items={bookings} onSeeAll={()=>{ window.location.href='/admin/bookings'; }} />
    </AdminLayout>
  )
}
