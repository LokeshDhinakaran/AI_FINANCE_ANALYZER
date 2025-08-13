import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cashFlowAPI } from '@/lib/supabase'

const INFLOW_SOURCES = [
  'Customer Payments',
  'Investment Income',
  'Loan Proceeds',
  'Asset Sales',
  'Government Grants',
  'Other Inflows'
]

const OUTFLOW_SOURCES = [
  'Supplier Payments',
  'Payroll',
  'Loan Payments',
  'Tax Payments',
  'Equipment Purchase',
  'Rent/Utilities',
  'Other Outflows'
]

export default function CashFlowForm({ onCashFlowAdded }) {
  const [formData, setFormData] = useState({
    flow_type: '',
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.flow_type || !formData.source || !formData.amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const cashFlow = {
        flow_type: formData.flow_type,
        source: formData.source,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date
      }

      await cashFlowAPI.addCashFlow(cashFlow)
      
      toast({
        title: 'Success',
        description: `Cash ${formData.flow_type} added successfully!`
      })

      // Reset form
      setFormData({
        flow_type: '',
        source: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })

      if (onCashFlowAdded) {
        onCashFlowAdded()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add cash flow entry',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sources = formData.flow_type === 'inflow' ? INFLOW_SOURCES : OUTFLOW_SOURCES

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Add Cash Flow Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_type">Flow Type *</Label>
              <Select value={formData.flow_type} onValueChange={(value) => setFormData(prev => ({ ...prev, flow_type: value, source: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select flow type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflow">Cash Inflow</SelectItem>
                  <SelectItem value="outflow">Cash Outflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))} disabled={!formData.flow_type}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
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
              placeholder="Enter cash flow description..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Cash Flow'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}