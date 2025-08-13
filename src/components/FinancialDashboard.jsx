import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Target, LogOut } from 'lucide-react'
import { financialAPI, cashFlowAPI, authAPI } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

export default function FinancialDashboard({ onSignOut }) {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [cashFlows, setCashFlows] = useState([])
  const [cashFlowSummary, setCashFlowSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const [summaryData, transactionsData, cashFlowData, cashFlowSummaryData] = await Promise.all([
        financialAPI.getFinancialSummary(),
        financialAPI.getTransactions(),
        cashFlowAPI.getCashFlows(),
        cashFlowAPI.getCashFlowSummary()
      ])

      setSummary(summaryData)
      setTransactions(transactionsData)
      setCashFlows(cashFlowData)
      setCashFlowSummary(cashFlowSummaryData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSignOut = async () => {
    try {
      await authAPI.signOut()
      onSignOut()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      })
    }
  }

  // Process data for charts
  const categoryData = transactions.reduce((acc, t) => {
    const existing = acc.find(item => item.category === t.category)
    if (existing) {
      existing.amount += parseFloat(t.amount)
    } else {
      acc.push({ category: t.category, amount: parseFloat(t.amount), type: t.type })
    }
    return acc
  }, [])

  const monthlyTrends = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const existing = acc.find(item => item.month === month)
    if (existing) {
      if (t.type === 'revenue') {
        existing.revenue += parseFloat(t.amount)
      } else {
        existing.expenses += parseFloat(t.amount)
      }
    } else {
      acc.push({
        month,
        revenue: t.type === 'revenue' ? parseFloat(t.amount) : 0,
        expenses: t.type === 'expenditure' ? parseFloat(t.amount) : 0
      })
    }
    return acc
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">Real-time financial health tracking</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${summary?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${summary?.totalExpenditure?.toLocaleString() || '0'}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                  <p className={`text-2xl font-bold ${summary?.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary?.totalProfit?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${cashFlowSummary?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${cashFlowSummary?.netCashFlow?.toLocaleString() || '0'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Revenue', amount: summary?.totalRevenue || 0, fill: 'hsl(var(--primary))' },
                        { name: 'Expenses', amount: summary?.totalExpenditure || 0, fill: 'hsl(var(--destructive))' }
                      ]}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData.filter(c => c.type === 'expenditure')}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="amount"
                          nameKey="category"
                        >
                          {categoryData.filter(c => c.type === 'expenditure').map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.type === 'revenue' ? 'default' : 'destructive'}>
                            {transaction.type}
                          </Badge>
                          <span className="font-medium">{transaction.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                      <div className={`text-lg font-bold ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Cash Flow Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Inflow</span>
                      <span className="font-bold text-green-600">
                        ${cashFlowSummary?.totalInflow?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Outflow</span>
                      <span className="font-bold text-red-600">
                        ${cashFlowSummary?.totalOutflow?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Net Cash Flow</span>
                        <span className={`font-bold text-lg ${cashFlowSummary?.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${cashFlowSummary?.netCashFlow?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Recent Cash Flows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cashFlows.slice(0, 5).map((flow) => (
                      <div key={flow.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={flow.flow_type === 'inflow' ? 'default' : 'destructive'}>
                              {flow.flow_type}
                            </Badge>
                            <span className="font-medium">{flow.source}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(flow.date).toLocaleDateString()}</p>
                        </div>
                        <div className={`font-bold ${flow.flow_type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                          {flow.flow_type === 'inflow' ? '+' : '-'}${flow.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrends}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}