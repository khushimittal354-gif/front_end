import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/finsecure'

function getAuthConfig() {
  const token = localStorage.getItem('finsecure_token')
  console.log('[financeRoutes.getAuthConfig] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

  if (!token) {
    console.warn('[financeRoutes.getAuthConfig] No token found, returning empty config')
    return {}
  }

  console.log('[financeRoutes.getAuthConfig] Adding Bearer token to headers')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export async function addFinanceBankAccount(payload) {
  const endpoint = `${API_BASE_URL}/finance/banks`
  console.log('[addFinanceBankAccount] POST to:', endpoint)
  console.log('[addFinanceBankAccount] Payload:', payload)
  
  const config = getAuthConfig()
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[addFinanceBankAccount] Success:', response.data)
    return response.data
  } catch (error) {
    console.error('[addFinanceBankAccount] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getAllBankAccounts({ page = 0, size = 10, status } = {}) {
  const endpoint = `${API_BASE_URL}/finance/banks`
  const params = { page, size, ...(status ? { status } : {}) }
  console.log('[getAllBankAccounts] GET from:', endpoint, 'with params:', params)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params,
    })
    console.log('[getAllBankAccounts] Success, received', response.data?.length || '?', 'records')
    return response.data
  } catch (error) {
    console.error('[getAllBankAccounts] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getBankAccountById(bankAccountId) {
  const response = await axios.get(`${API_BASE_URL}/finance/banks/${bankAccountId}`, getAuthConfig())
  return response.data
}

export async function updateBankAccountStatusByFinance(bankAccountId, status) {
  const response = await axios.put(
    `${API_BASE_URL}/finance/banks/${bankAccountId}/status`,
    null,
    {
      ...getAuthConfig(),
      params: { status },
    },
  )
  return response.data
}

export async function getAllEmployeeBankAccounts({
  page = 0,
  size = 10,
  status,
  bankId,
  holderName,
} = {}) {
  const response = await axios.get(`${API_BASE_URL}/finance/bank-accounts`, {
    ...getAuthConfig(),
    params: {
      page,
      size,
      ...(status ? { status } : {}),
      ...(bankId ? { bankId } : {}),
      ...(holderName ? { holderName } : {}),
    },
  })
  return response.data
}

export async function getEmployeeBankAccountById(bankAccountId) {
  const response = await axios.get(
    `${API_BASE_URL}/finance/bank-accounts/${bankAccountId}`,
    getAuthConfig(),
  )
  return response.data
}

export async function reviewEmployeeBankAccount(bankAccountId, payload) {
  const response = await axios.put(
    `${API_BASE_URL}/finance/bank-accounts/${bankAccountId}/review`,
    payload,
    getAuthConfig(),
  )
  return response.data
}

export async function addMutualFund(payload) {
  const endpoint = `${API_BASE_URL}/finance/mutual-funds`
  console.log('[addMutualFund] POST to:', endpoint)
  console.log('[addMutualFund] Payload:', payload)
  
  const config = getAuthConfig()
  console.log('[addMutualFund] Auth config headers:', config.headers ? 'Bearer token present' : 'No auth headers')
  
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[addMutualFund] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[addMutualFund] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function updateMutualFundStatus(fundId, status) {
  const endpoint = `${API_BASE_URL}/finance/mutual-funds/${fundId}/status`
  console.log('[updateMutualFundStatus] PUT to:', endpoint)
  console.log('[updateMutualFundStatus] Status:', status)
  
  const config = getAuthConfig()
  try {
    const response = await axios.put(endpoint, null, {
      ...config,
      params: { status }
    })
    console.log('[updateMutualFundStatus] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[updateMutualFundStatus] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getMutualFundById(fundId) {
  const endpoint = `${API_BASE_URL}/finance/mutual-funds/${fundId}`
  console.log('[getMutualFundById] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getMutualFundById] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getMutualFundById] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getEmployeeBankAccountSummary() {
  const response = await axios.get(`${API_BASE_URL}/finance/bank-accounts/summary`, getAuthConfig())
  return response.data
}

export async function getUnregisteredEmployees() {
  const response = await axios.get(`${API_BASE_URL}/finance/bank-accounts/unregistered`, getAuthConfig())
  return response.data
}

export async function unlockEmployeeBankAccount(bankAccountId) {
  const response = await axios.put(
    `${API_BASE_URL}/finance/bank-accounts/${bankAccountId}/unlock`,
    null,
    getAuthConfig(),
  )
  return response.data
}

export async function getAllInvestments() {
  const response = await axios.get(`${API_BASE_URL}/finance/investments`, getAuthConfig())
  return response.data
}

export async function getInvestmentById(investmentId) {
  const response = await axios.get(
    `${API_BASE_URL}/finance/investments/${investmentId}`,
    getAuthConfig(),
  )
  return response.data
}

export async function updateInvestmentByFinance(investmentId, payload) {
  const response = await axios.put(
    `${API_BASE_URL}/finance/investments/${investmentId}`,
    payload,
    getAuthConfig(),
  )
  return response.data
}

export async function getAllCards() {
  const response = await axios.get(`${API_BASE_URL}/finance/cards`, getAuthConfig())
  return response.data
}

export async function getCardById(cardId) {
  const response = await axios.get(`${API_BASE_URL}/finance/cards/${cardId}`, getAuthConfig())
  return response.data
}

export async function getCardsByEmployee(employeeId) {
  const endpoint = `${API_BASE_URL}/finance/cards/employee/${employeeId}`
  console.log('[getCardsByEmployee] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getCardsByEmployee] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getCardsByEmployee] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function updateCardStatusByFinance(cardId, cardStatus) {
  const endpoint = `${API_BASE_URL}/finance/cards/${cardId}/status`
  console.log('[updateCardStatusByFinance] PUT to:', endpoint)
  console.log('[updateCardStatusByFinance] New status:', cardStatus)
  
  const config = getAuthConfig()
  const payload = { cardStatus }
  
  try {
    const response = await axios.put(endpoint, payload, config)
    console.log('[updateCardStatusByFinance] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[updateCardStatusByFinance] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getCardSummary() {
  const endpoint = `${API_BASE_URL}/finance/cards/summary`
  console.log('[getCardSummary] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getCardSummary] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getCardSummary] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function scheduleSalaryJob(payload) {
  const endpoint = `${API_BASE_URL}/finance/salary/schedule`
  console.log('[scheduleSalaryJob] POST to:', endpoint)
  console.log('[scheduleSalaryJob] Payload:', payload)
  
  const config = getAuthConfig()
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[scheduleSalaryJob] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[scheduleSalaryJob] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getAllSalaryJobs(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/salary/jobs`
  console.log('[getAllSalaryJobs] GET from:', endpoint)
  console.log('[getAllSalaryJobs] Pagination - page:', page, 'size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getAllSalaryJobs] Success! Response:', response.data)
    console.log('[getAllSalaryJobs] Page content length:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getAllSalaryJobs] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getSalaryJobById(jobId) {
  const endpoint = `${API_BASE_URL}/finance/salary/jobs/${jobId}`
  console.log('[getSalaryJobById] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getSalaryJobById] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getSalaryJobById] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function processSalaryJob(jobId) {
  const endpoint = `${API_BASE_URL}/finance/salary/jobs/${jobId}/trigger`
  console.log('[processSalaryJob] POST to:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.post(endpoint, {}, config)
    console.log('[processSalaryJob] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[processSalaryJob] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getAllSalaryRecords(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/salary/records`
  console.log('[getAllSalaryRecords] GET from:', endpoint)
  console.log('[getAllSalaryRecords] Pagination - page:', page, 'size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getAllSalaryRecords] Success! Response:', response.data)
    console.log('[getAllSalaryRecords] Page content length:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getAllSalaryRecords] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getSalaryRecordsByEmployee(employeeId, page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/salary/records/employee/${employeeId}`
  console.log('[getSalaryRecordsByEmployee] GET from:', endpoint)
  console.log('[getSalaryRecordsByEmployee] Pagination - page:', page, 'size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getSalaryRecordsByEmployee] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getSalaryRecordsByEmployee] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getSalaryProcessingLogs(jobId, page = 0, size = 10, status = null) {
  const endpoint = `${API_BASE_URL}/finance/salary/jobs/${jobId}/logs`
  console.log('[getSalaryProcessingLogs] GET from:', endpoint)
  console.log('[getSalaryProcessingLogs] JobId:', jobId, 'Page:', page, 'Size:', size, 'Status:', status)
  
  const config = getAuthConfig()
  try {
    const params = { page, size }
    if (status) params.status = status
    
    const response = await axios.get(endpoint, {
      ...config,
      params
    })
    console.log('[getSalaryProcessingLogs] Success! Records count:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getSalaryProcessingLogs] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

// ===== FINANCE REPORTS =====

export async function getSalaryRegisterReport(month, page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/reports/salary`
  console.log('[getSalaryRegisterReport] GET from:', endpoint)
  console.log('[getSalaryRegisterReport] Month:', month, 'Page:', page, 'Size:', size)
  
  const config = getAuthConfig()
  try {
    const params = { page, size }
    if (month) params.month = month
    
    const response = await axios.get(endpoint, {
      ...config,
      params
    })
    console.log('[getSalaryRegisterReport] Success! Records count:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getSalaryRegisterReport] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getComplianceReport(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/reports/compliance`
  console.log('[getComplianceReport] GET from:', endpoint)
  console.log('[getComplianceReport] Page:', page, 'Size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getComplianceReport] Success! Non-compliant investments:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getComplianceReport] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getBankAccountStatusReport() {
  const endpoint = `${API_BASE_URL}/finance/reports/bank-summary`
  console.log('[getBankAccountStatusReport] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getBankAccountStatusReport] Success! Summary:', response.data)
    return response.data
  } catch (error) {
    console.error('[getBankAccountStatusReport] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getSalaryJobReport(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/reports/salary-jobs`
  console.log('[getSalaryJobReport] GET from:', endpoint)
  console.log('[getSalaryJobReport] Page:', page, 'Size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getSalaryJobReport] Success! Jobs count:', response.data.content?.length || 0)
    return response.data
  } catch (error) {
    console.error('[getSalaryJobReport] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

// ===== FINANCE EMPLOYEE INVESTMENT REVIEW =====

export async function getEmployeeInvestments(page = 0, size = 10, status = null) {
  const endpoint = `${API_BASE_URL}/finance/investments/all`
  console.log('[getEmployeeInvestments] GET from:', endpoint)
  console.log('[getEmployeeInvestments] Page:', page, 'Size:', size, 'Status:', status)
  
  const config = getAuthConfig()
  try {
    const params = { page, size }
    if (status) {
      params.status = status
    }
    
    const response = await axios.get(endpoint, {
      ...config,
      params
    })
    console.log('[getEmployeeInvestments] Success! Page:', response.data)
    return response.data
  } catch (error) {
    console.error('[getEmployeeInvestments] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getEmployeeInvestmentsByCompliance(complianceStatus, page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/investments/all`
  console.log('[getEmployeeInvestmentsByCompliance] GET from:', endpoint)
  console.log('[getEmployeeInvestmentsByCompliance] Status:', complianceStatus, 'Page:', page, 'Size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { status: complianceStatus, page, size }
    })
    console.log('[getEmployeeInvestmentsByCompliance] Success! Page:', response.data)
    return response.data
  } catch (error) {
    console.error('[getEmployeeInvestmentsByCompliance] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getEmployeeInvestmentById(investmentId) {
  const endpoint = `${API_BASE_URL}/finance/investments/${investmentId}`
  console.log('[getEmployeeInvestmentById] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getEmployeeInvestmentById] Success! Investment:', response.data)
    return response.data
  } catch (error) {
    console.error('[getEmployeeInvestmentById] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function reviewEmployeeInvestment(investmentId, payload) {
  const endpoint = `${API_BASE_URL}/finance/investments/${investmentId}/review`
  console.log('[reviewEmployeeInvestment] PUT to:', endpoint)
  console.log('[reviewEmployeeInvestment] Payload:', payload)
  
  const config = getAuthConfig()
  try {
    const response = await axios.put(endpoint, payload, config)
    console.log('[reviewEmployeeInvestment] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[reviewEmployeeInvestment] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}
