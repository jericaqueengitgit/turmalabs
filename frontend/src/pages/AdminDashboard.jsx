import React, { useState, useEffect } from 'react';
import { Users, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    total_hours_today: 0,
    active_users_today: 0,
    clocked_in_now: 0
  });
  const [recentEODReports, setRecentEODReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryResponse, eodResponse, usersResponse] = await Promise.all([
        ApiService.request('/time-logs/summary'),
        ApiService.getEODReports({ limit: 5 }),
        ApiService.getUsers()
      ]);

      setSummary(summaryResponse);
      setRecentEODReports(eodResponse.eod_reports.slice(0, 5));
      setUsers(usersResponse.users);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold turma-brand-text">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_hours_today}</div>
            <p className="text-xs text-muted-foreground">
              Across all team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active_users_today}</div>
            <p className="text-xs text-muted-foreground">
              Team members who clocked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Working</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.clocked_in_now}</div>
            <p className="text-xs text-muted-foreground">
              Team members online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'va').length}</div>
            <p className="text-xs text-muted-foreground">
              Virtual assistants
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent EOD Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent EOD Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEODReports.length > 0 ? (
              <div className="space-y-4">
                {recentEODReports.map((report) => (
                  <div key={report.id} className="border-l-4 border-accent pl-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {report.user?.first_name} {report.user?.last_name}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {report.tasks_completed}
                    </p>
                    {(report.blockers || report.issues || report.support_needed) && (
                      <div className="flex items-center mt-2 text-orange-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs">Needs attention</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No EOD reports yet today.</p>
            )}
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.filter(u => u.role === 'va').map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">
                      {user.first_name} {user.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {user.assigned_client || 'No client assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              ))}
              {users.filter(u => u.role === 'va').length === 0 && (
                <p className="text-muted-foreground">No team members yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

