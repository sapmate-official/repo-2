const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('alkaa_token');
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('alkaa_token', token);
  } else {
    localStorage.removeItem('alkaa_token');
  }
}

export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, do not set Content-Type header so browser sets boundary
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (username: string, password: string) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (profile: any) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Dashboard
  getDashboard: () => apiRequest('/dashboard'),

  // Accounts
  getAccounts: () => apiRequest('/accounts'),
  createAccount: (data: any) => apiRequest('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  adjustAccount: (id: number | string, data: any) => apiRequest(`/accounts/${id}/adjust`, { method: 'PUT', body: JSON.stringify(data) }),

  // Invoices & Sales
  getInvoices: () => apiRequest('/invoices'),
  getInvoice: (id: number | string) => apiRequest(`/invoices/${id}`),
  createInvoice: (data: any) => apiRequest('/invoices', { method: 'POST', body: JSON.stringify(data) }),

  // Students & Fees
  getStudents: () => apiRequest('/students'),
  getStudent: (id: number | string) => apiRequest(`/students/${id}`),
  createStudent: (data: any) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
  payStudentFee: (studentId: number | string, data: any) => apiRequest(`/students/${studentId}/fees`, { method: 'POST', body: JSON.stringify(data) }),

  // Staff & Salaries & Incentives
  getStaff: () => apiRequest('/staff'),
  createStaff: (data: any) => apiRequest('/staff', { method: 'POST', body: JSON.stringify(data) }),
  getSalaries: () => apiRequest('/salaries'),
  paySalary: (staffId: number | string, data: any) => apiRequest(`/staff/${staffId}/pay-salary`, { method: 'POST', body: JSON.stringify(data) }),
  getIncentives: () => apiRequest('/incentives'),
  payIncentive: (id: number | string, data: any) => apiRequest(`/incentives/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),
  getIncentivePreview: (staffId: number | string, amount: number | string) => apiRequest(`/staff/${staffId}/incentive-preview?amount=${amount || 0}`),

  // Expenses
  recordExpense: (data: any) => apiRequest('/expenses', { method: 'POST', body: JSON.stringify(data) }),

  // Universal Transactions
  getTransactions: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/transactions${q ? `?${q}` : ''}`);
  },
  getTransaction: (id: number | string) => apiRequest(`/transactions/${id}`),
  updateTransaction: (id: number | string, data: any) => apiRequest(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: number | string) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }),

  // Migration
  previewExcel: (formData: FormData) => apiRequest('/migration/preview', { method: 'POST', body: formData }),
  commitMigration: (formData: FormData) => apiRequest('/migration/commit', { method: 'POST', body: formData }),

  // External Developer API
  getApiKey: () => apiRequest('/v1/api-key'),
  regenerateApiKey: () => apiRequest('/v1/api-key/regenerate', { method: 'POST' }),

  // Alkaa Files / SFTP
  getSftpStatus: () => apiRequest('/sftp/status'),
  getSftpFiles: () => apiRequest('/sftp/files'),
  testSftpAdapter: () => apiRequest('/sftp/test', { method: 'POST' }),
  syncSftpFiles: () => apiRequest('/sftp/sync', { method: 'POST' }),
  uploadSampleSftpFiles: () => apiRequest('/sftp/upload-sample', { method: 'POST' }),

  // Danger Zone
  eraseData: (data: any) => apiRequest('/system/erase-data', { method: 'POST', body: JSON.stringify(data) }),
};

