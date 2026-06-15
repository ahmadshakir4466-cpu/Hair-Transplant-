import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, CheckCircle2, Clock, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState({
    upcoming: 0,
    pending: 0,
    completed: 0,
    activeServices: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch counts
        const { count: pendingCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: upcomingCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'confirmed'])
          .gte('appointment_date', today);

        const { count: completedCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .neq('name', '__UI_SETTINGS__');

        // Fetch today's appointments
        const { data: recent } = await supabase
          .from('appointments')
          .select('*, service:services(name)')
          .gte('appointment_date', today)
          .in('status', ['pending', 'confirmed'])
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5);

        setStats({
          upcoming: upcomingCount || 0,
          pending: pendingCount || 0,
          completed: completedCount || 0,
          activeServices: servicesCount || 0
        });

        if (recent) setRecentAppointments(recent);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Upcoming Appointments', value: stats.upcoming, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Pending Requests', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed Visits', value: stats.completed, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Services', value: stats.activeServices, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const formatApptDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back. Here's what's happening at the clinic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Schedule</h2>
            <Link to="/admin/appointments" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-100">
            {recentAppointments.length > 0 ? (
              recentAppointments.map(appt => (
                <div key={appt.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-600">
                      <span className="text-sm font-bold">{appt.start_time.substring(0,5)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{appt.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>{appt.service?.name}</span>
                        <span>•</span>
                        <span className="font-medium">{formatApptDate(appt.appointment_date)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${
                      appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No upcoming appointments scheduled.
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-8 text-white flex flex-col items-start justify-center shadow-lg shadow-teal-900/20">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <p className="text-teal-100 mb-8 max-w-xs">
             Need to manage schedule availability or add a new service?
          </p>
          <div className="space-y-3 w-full">
            <Link to="/admin/services" className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-3 text-left font-medium">
              Manage Services
            </Link>
            <Link to="/admin/hours" className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-3 text-left font-medium">
              Update Business Hours
            </Link>
            <Link to="/admin/blocked-dates" className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl px-4 py-3 text-left font-medium">
              Manage Blocked Dates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
