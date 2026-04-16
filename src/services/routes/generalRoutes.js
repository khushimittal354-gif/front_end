import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/finsecure'

const AUTH_LOGIN_PATH = import.meta.env.VITE_AUTH_LOGIN_PATH || '/public/login'

function getAuthConfig() {
  const token = localStorage.getItem('finsecure_token')
  console.log('[getAuthConfig] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')

  if (!token) {
    console.warn('[getAuthConfig] No token found, returning empty config')
    return {}
  }

  console.log('[getAuthConfig] Adding Bearer token to headers')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export async function loginUser(credentials) {
  const endpoint = `${API_BASE_URL}${AUTH_LOGIN_PATH}`
  console.log('[loginUser] Starting login to:', endpoint)
  console.log('[loginUser] Credentials (username):', credentials.username)
  
  try {
    const response = await axios.post(endpoint, credentials)
    console.log('[loginUser] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[loginUser] Error:', error.response?.status, error.response?.data || error.message)
    throw error
  }
}

export async function registerBankAccount(payload) {
  const endpoint = `http://localhost:8085/finsecure/finance/bank-accounts/bank-account`
  console.log('[registerBankAccount] POST to:', endpoint)
  console.log('[registerBankAccount] Payload:', payload)
  
  const config = getAuthConfig()
  console.log('[registerBankAccount] Auth config headers:', config.headers ? 'Bearer token present' : 'No auth headers')
  
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[registerBankAccount] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[registerBankAccount] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

// Alias for current page usage
export async function createBankAccount(payload) {
  return registerBankAccount(payload)
}

export async function getMyBankAccount() {
  const endpoint = `${API_BASE_URL}/finance/bank-accounts/employee/bank-account`
  console.log('[getMyBankAccount] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getMyBankAccount] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getMyBankAccount] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function updateMyBankAccount(payload) {
  const endpoint = `${API_BASE_URL}/finance/bank-accounts/employee/bank-account`
  console.log('[updateMyBankAccount] PUT to:', endpoint)
  console.log('[updateMyBankAccount] Payload:', payload)
  
  const config = getAuthConfig()
  console.log('[updateMyBankAccount] Auth config headers:', config.headers ? 'Bearer token present' : 'No auth headers')
  
  try {
    const response = await axios.put(endpoint, payload, config)
    console.log('[updateMyBankAccount] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[updateMyBankAccount] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getMyInvestments(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/investments`
  console.log('[getMyInvestments] GET from:', endpoint)
  console.log('[getMyInvestments] Pagination - page:', page, 'size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getMyInvestments] Success! Response:', response.data)
    console.log('[getMyInvestments] Page content length:', response.data.content?.length || 0)
    console.log('[getMyInvestments] Total elements:', response.data.totalElements)
    return response.data
  } catch (error) {
    console.error('[getMyInvestments] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function declareInvestment(payload) {
  const endpoint = `${API_BASE_URL}/finance/investments`
  console.log('[declareInvestment] POST to:', endpoint)
  console.log('[declareInvestment] Payload:', payload)
  
  const config = getAuthConfig()
  console.log('[declareInvestment] Auth config headers:', config.headers ? 'Bearer token present' : 'No auth headers')
  
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[declareInvestment] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[declareInvestment] Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getInvestmentById(investmentId) {
  const endpoint = `${API_BASE_URL}/finance/investments/${investmentId}`
  console.log('[getInvestmentById] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getInvestmentById] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getInvestmentById] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function reviewInvestment(investmentId, payload) {
  const endpoint = `${API_BASE_URL}/finance/investments/${investmentId}/review`
  console.log('[reviewInvestment] PUT to:', endpoint)
  console.log('[reviewInvestment] Payload:', payload)
  
  const config = getAuthConfig()
  try {
    const response = await axios.put(endpoint, payload, config)
    console.log('[reviewInvestment] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[reviewInvestment] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getMyCards() {
  const endpoint = `${API_BASE_URL}/finance/cards`
  console.log('[getMyCards] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getMyCards] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getMyCards] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function addCard(payload) {
  const endpoint = `${API_BASE_URL}/finance/cards`
  console.log('[addCard] POST to:', endpoint)
  console.log('[addCard] Payload:', { ...payload, cardNumber: '****' }) // mask card number in logs
  
  const config = getAuthConfig()
  try {
    const response = await axios.post(endpoint, payload, config)
    console.log('[addCard] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[addCard] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function updateCardStatus(cardId, cardStatus) {
  const endpoint = `${API_BASE_URL}/finance/cards/${cardId}/status`
  console.log('[updateCardStatus] PUT to:', endpoint)
  console.log('[updateCardStatus] New status:', cardStatus)
  
  const config = getAuthConfig()
  const payload = { cardStatus }
  
  try {
    const response = await axios.put(endpoint, payload, config)
    console.log('[updateCardStatus] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[updateCardStatus] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getAllMutualFunds(page = 0, size = 10, status = null, category = null) {
  const endpoint = `${API_BASE_URL}/finance/mutual-funds`
  console.log('[getAllMutualFunds] GET from:', endpoint)
  console.log('[getAllMutualFunds] Pagination - page:', page, 'size:', size)
  console.log('[getAllMutualFunds] Filters - status:', status, 'category:', category)
  
  const config = getAuthConfig()
  const params = { page, size }
  if (status) params.status = status
  if (category) params.category = category
  
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params,
    })
    console.log('[getAllMutualFunds] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getAllMutualFunds] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

export async function getFundWiseEmployeeIds() {
  const endpoint = `${API_BASE_URL}/finance/mutual-funds/fund-users`
  console.log('[getFundWiseEmployeeIds] GET from:', endpoint)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, config)
    console.log('[getFundWiseEmployeeIds] Success! Response:', response.data)
    return response.data
  } catch (error) {
    console.error('[getFundWiseEmployeeIds] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}

// ===== SALARY PROCESSING - EMPLOYEE ROUTES =====

export async function getMySalaryRecords(page = 0, size = 10) {
  const endpoint = `${API_BASE_URL}/finance/salary/records`
  console.log('[getMySalaryRecords] GET from:', endpoint)
  console.log('[getMySalaryRecords] Pagination - page:', page, 'size:', size)
  
  const config = getAuthConfig()
  try {
    const response = await axios.get(endpoint, {
      ...config,
      params: { page, size }
    })
    console.log('[getMySalaryRecords] Success! Response received')
    console.log('[getMySalaryRecords] Records count:', response.data.content?.length || 0)
    console.log('[getMySalaryRecords] Total records:', response.data.totalElements)
    return response.data
  } catch (error) {
    console.error('[getMySalaryRecords] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
    throw error
  }
}
