import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Financial Transactions API
export const financialAPI = {
  // Get all transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add new transaction
  async addTransaction(transaction) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([transaction])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update transaction
  async updateTransaction(id, updates) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete transaction
  async deleteTransaction(id) {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get financial summary
  async getFinancialSummary() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('type, amount, date')
    
    if (error) throw error
    
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyData = data.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    
    const totalRevenue = data.filter(t => t.type === 'revenue').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const totalExpenditure = data.filter(t => t.type === 'expenditure').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const monthlyRevenue = monthlyData.filter(t => t.type === 'revenue').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const monthlyExpenditure = monthlyData.filter(t => t.type === 'expenditure').reduce((sum, t) => sum + parseFloat(t.amount), 0)
    
    return {
      totalRevenue,
      totalExpenditure,
      totalProfit: totalRevenue - totalExpenditure,
      monthlyRevenue,
      monthlyExpenditure,
      monthlyProfit: monthlyRevenue - monthlyExpenditure
    }
  }
}

// Cash Flow API
export const cashFlowAPI = {
  // Get all cash flow entries
  async getCashFlows() {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add new cash flow entry
  async addCashFlow(cashFlow) {
    const { data, error } = await supabase
      .from('cash_flow')
      .insert([cashFlow])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update cash flow entry
  async updateCashFlow(id, updates) {
    const { data, error } = await supabase
      .from('cash_flow')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete cash flow entry
  async deleteCashFlow(id) {
    const { error } = await supabase
      .from('cash_flow')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get cash flow summary
  async getCashFlowSummary() {
    const { data, error } = await supabase
      .from('cash_flow')
      .select('flow_type, amount, date')
    
    if (error) throw error
    
    const totalInflow = data.filter(cf => cf.flow_type === 'inflow').reduce((sum, cf) => sum + parseFloat(cf.amount), 0)
    const totalOutflow = data.filter(cf => cf.flow_type === 'outflow').reduce((sum, cf) => sum + parseFloat(cf.amount), 0)
    
    return {
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow
    }
  }
}

// Budget API
export const budgetAPI = {
  // Get all budget targets
  async getBudgetTargets() {
    const { data, error } = await supabase
      .from('budget_targets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add new budget target
  async addBudgetTarget(target) {
    const { data, error } = await supabase
      .from('budget_targets')
      .insert([target])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Update budget target
  async updateBudgetTarget(id, updates) {
    const { data, error } = await supabase
      .from('budget_targets')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete budget target
  async deleteBudgetTarget(id) {
    const { error } = await supabase
      .from('budget_targets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Auth API
export const authAPI = {
  // Sign up
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}