import React, { useState, useEffect } from 'react';
import { FileText, Send, Eye, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import ApiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EODReport = () => {
  const { user, isAdmin } = useAuth();
  const [todayReport, setTodayReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tasks_completed: '',
    blockers: '',
    issues: '',
    support_needed: ''
  });
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    user_id: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
    if (isAdmin) {
      loadUsers();
    }
  }, []);

  const loadData = async () => {
    try {
      if (!isAdmin) {
        const todayResponse = await ApiService.getTodayEODReport();
        setTodayReport(todayResponse.eod_report);
        
        if (todayResponse.eod_report) {
          setFormData({
            tasks_completed: todayResponse.eod_report.tasks_completed || '',
            blockers: todayResponse.eod_report.blockers || '',
            issues: todayResponse.eod_report.issues || '',
            support_needed: todayResponse.eod_report.support_needed || ''
          });
        }
      }
      
      const reportsResponse = await ApiService.getEODReports(filters);
      setAllReports(reportsResponse.eod_reports);
    } catch (error) {
      console.error('Error loading EOD reports:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await ApiService.submitEODReport(formData);
      await loadData();
      alert('EOD report submitted successfully!');
    } catch (error) {
      console.error('Error submitting EOD report:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    loadData();
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);

      const response = await fetch(`/api/eod-reports/export?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'eod_reports.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export EOD reports');
      }
    } catch (error) {
      console.error('Error exporting EOD reports:', error);
      alert('Failed to export EOD reports');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Tasks Completed', 'Blockers', 'Issues', 'Support Needed'];
    const csvData = allReports.map(report => [
      report.date,
      isAdmin ? `${report.user?.first_name} ${report.user?.last_name}` : `${user.first_name} ${user.last_name}`,
      report.tasks_completed,
      report.blockers || '',
      report.issues || '',
      report.support_needed || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eod-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <FileText className="mr-3 h-8 w-8" />
          EOD Reports
        </h1>
        {isAdmin && (
          <Button onClick={handleExport} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>
              {todayReport ? 'Update Today\'s Report' : 'Submit Today\'s Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ✅ Tasks Completed *
                </label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={formData.tasks_completed}
                  onChange={(e) => handleInputChange('tasks_completed', e.target.value)}
                  placeholder="List the tasks you completed today..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ❌ Blockers
                </label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={formData.blockers}
                  onChange={(e) => handleInputChange('blockers', e.target.value)}
                  placeholder="Any blockers that prevented you from completing tasks..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ⚠️ Issues
                </label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={formData.issues}
                  onChange={(e) => handleInputChange('issues', e.target.value)}
                  placeholder="Any issues or problems encountered..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  🙋 Support Needed
                </label>
                <textarea
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={formData.support_needed}
                  onChange={(e) => handleInputChange('support_needed', e.target.value)}
                  placeholder="Any support or help you need..."
                />
              </div>

              <Button type="submit" disabled={submitting} variant="accent">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Submitting...' : (todayReport ? 'Update Report' : 'Submit Report')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters for Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
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
              <div className="flex items-end">
                <Button onClick={applyFilters} variant="primary">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            {isAdmin ? 'All EOD Reports' : 'Your EOD Reports'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allReports.length > 0 ? (
            <div className="space-y-4">
              {allReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">
                        {isAdmin ? `${report.user?.first_name} ${report.user?.last_name}` : 'Your Report'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(report.date)}
                      </p>
                    </div>
                    {(report.blockers || report.issues || report.support_needed) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        Needs Attention
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-700">✅ Tasks Completed</h5>
                      <p className="text-sm mt-1">{report.tasks_completed}</p>
                    </div>

                    {report.blockers && (
                      <div>
                        <h5 className="text-sm font-medium text-red-700">❌ Blockers</h5>
                        <p className="text-sm mt-1">{report.blockers}</p>
                      </div>
                    )}

                    {report.issues && (
                      <div>
                        <h5 className="text-sm font-medium text-orange-700">⚠️ Issues</h5>
                        <p className="text-sm mt-1">{report.issues}</p>
                      </div>
                    )}

                    {report.support_needed && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-700">🙋 Support Needed</h5>
                        <p className="text-sm mt-1">{report.support_needed}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No EOD reports found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EODReport;

