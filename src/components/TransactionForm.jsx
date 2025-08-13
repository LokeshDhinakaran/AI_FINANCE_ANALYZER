import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { financialAPI } from '@/lib/supabase'

const REVENUE_CATEGORIES = [
  'Sales Revenue',
  'Service Revenue',
  'Product Sales',
  'Consulting',
  'Licensing',
  'Interest Income',
  'Other Revenue'
]

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Marketing',
  'Travel',
  'Software/Tools',
  'Rent',
  'Utilities',
  'Insurance',
  'Professional Services',
  'Equipment',
  'Other Expenses'
]

export default function TransactionForm({ onTransactionAdded }) {
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.type || !formData.category || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const transaction = {
        type: formData.type,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date
      }

      await financialAPI.addTransaction(transaction)
      
      toast({
        title: 'Success',
        description: `${formData.type === 'revenue' ? 'Revenue' : 'Expense'} added successfully!`
      })

      // Reset form
      setFormData({
        type: '',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })

      if (onTransactionAdded) {
        onTransactionAdded()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add transaction',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const categories = formData.type === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Add Financial Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, category: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expenditure">Expenditure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))} disabled={!formData.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter transaction description..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}