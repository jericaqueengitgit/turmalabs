const API_BASE_URL = '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(endpoint, filename) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async registerUser(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async getUsers() {
    return this.request('/auth/users');
  }

  async updateUser(userId, userData) {
    return this.request(`/auth/users/${userId}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(userId) {
    return this.request(`/auth/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Time log endpoints
  async clockIn() {
    return this.request('/time-logs/clock-in', {
      method: 'POST',
    });
  }

  async clockOut() {
    return this.request('/time-logs/clock-out', {
      method: 'POST',
    });
  }

  async getTimeLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/time-logs?${params}`);
  }

  async getTodayTimeLog() {
    return this.request('/time-logs/today');
  }

  async exportTimeLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.downloadFile(`/time-logs/export?${params}`, 'time-logs.csv');
  }

  // EOD Report endpoints
  async submitEODReport(reportData) {
    return this.request('/eod-reports', {
      method: 'POST',
      body: reportData,
    });
  }

  async getEODReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/eod-reports?${params}`);
  }

  async getTodayEODReport() {
    return this.request('/eod-reports/today');
  }

  async exportEODReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.downloadFile(`/eod-reports/export?${params}`, 'eod-reports.csv');
  }

  // Training endpoints
  async getTrainings() {
    return this.request('/trainings');
  }

  async createTraining(trainingData) {
    return this.request('/trainings', {
      method: 'POST',
      body: trainingData,
    });
  }

  async markTrainingComplete(trainingId) {
    return this.request(`/trainings/${trainingId}/complete`, {
      method: 'POST',
    });
  }

  async getTrainingProgress() {
    return this.request('/trainings/progress');
  }

  // SOP endpoints
  async getSOPs() {
    return this.request('/sops');
  }

  async createSOP(sopData) {
    return this.request('/sops', {
      method: 'POST',
      body: sopData,
    });
  }

  async markSOPRead(sopId) {
    return this.request(`/sops/${sopId}/read`, {
      method: 'POST',
    });
  }

  // Leave request endpoints
  async submitLeaveRequest(requestData) {
    return this.request('/leave-requests', {
      method: 'POST',
      body: requestData,
    });
  }

  async getLeaveRequests(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/leave-requests?${params}`);
  }

  async updateLeaveRequest(requestId, status, adminNotes = '') {
    return this.request(`/leave-requests/${requestId}`, {
      method: 'PUT',
      body: { status, admin_notes: adminNotes },
    });
  }

  // Announcement endpoints
  async getAnnouncements() {
    return this.request('/announcements');
  }

  async createAnnouncement(announcementData) {
    return this.request('/announcements', {
      method: 'POST',
      body: announcementData,
    });
  }

  async updateAnnouncement(announcementId, announcementData) {
    return this.request(`/announcements/${announcementId}`, {
      method: 'PUT',
      body: announcementData,
    });
  }

  async deleteAnnouncement(announcementId) {
    return this.request(`/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();

