import React, { useState, useEffect } from 'react';
import { Clock, Download, Filter, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TimeLog = () => {
  const { user, isAdmin } = useAuth();
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    user_id: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadTimeLogs();
    if (isAdmin) {
      loadUsers();
    }
  }, []);

  const loadTimeLogs = async () => {
    try {
      const response = await ApiService.getTimeLogs(filters);
      setTimeLogs(response.time_logs);
    } catch (error) {
      console.error('Error loading time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await ApiService.getUsers();
      setUsers(response.users.filter(u => u.role === 'va'));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);

      const response = await fetch(`/api/time-logs/export?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'time_logs.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export time logs');
      }
    } catch (error) {
      console.error('Error exporting time logs:', error);
      alert('Failed to export time logs');
    }
  };

  const applyFilters = () => {
    setLoading(true);
    loadTimeLogs();
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Clock In', 'Clock Out', 'Total Hours'];
    const csvData = timeLogs.map(log => [
      log.date,
      isAdmin ? `${log.user?.first_name} ${log.user?.last_name}` : `${user.first_name} ${user.last_name}`,
      log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : 'Not clocked in',
      log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : 'Not clocked out',
      log.total_hours || '0'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
        <h1 className="text-3xl font-bold turma-brand-text flex items-center">
          <Clock className="mr-3 h-8 w-8" />
          Time Logs
        </h1>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={handleExport} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2">Team Member</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={filters.user_id}
                  onChange={(e) => handleFilterChange('user_id', e.target.value)}
                >
                  <option value="">All team members</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={applyFilters} variant="primary">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Log Records</CardTitle>
        </CardHeader>
        <CardContent>
          {timeLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Date</th>
                    {isAdmin && <th className="text-left p-3 font-medium">Name</th>}
                    <th className="text-left p-3 font-medium">Clock In</th>
                    <th className="text-left p-3 font-medium">Clock Out</th>
                    <th className="text-left p-3 font-medium">Total Hours</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(log.date)}</td>
                      {isAdmin && (
                        <td className="p-3">
                          {log.user?.first_name} {log.user?.last_name}
                        </td>
                      )}
                      <td className="p-3">{formatTime(log.clock_in)}</td>
                      <td className="p-3">{formatTime(log.clock_out)}</td>
                      <td className="p-3">{log.total_hours || '0'} hours</td>
                      <td className="p-3">
                        {log.clock_in && log.clock_out ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Complete
                          </span>
                        ) : log.clock_in ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Not Started
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No time logs found for the selected criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeLog;

