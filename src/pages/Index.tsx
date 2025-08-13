import React, { useState, useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import FinancialDashboard from "@/components/FinancialDashboard";
import TransactionForm from "@/components/TransactionForm";
import CashFlowForm from "@/components/CashFlowForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI } from "@/lib/supabase";

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = authAPI.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // User state will be updated by the auth state change listener
  };

  const handleSignOut = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto my-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions">Add Transaction</TabsTrigger>
              <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <FinancialDashboard onSignOut={handleSignOut} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Add Financial Transaction</h1>
                <p className="text-muted-foreground">Record your revenue and expenses</p>
              </div>
              <TransactionForm onTransactionAdded={() => {
                // Optionally refresh data or show success message
              }} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-0">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Manage Cash Flow</h1>
                <p className="text-muted-foreground">Track cash inflows and outflows</p>
              </div>
              <CashFlowForm onCashFlowAdded={() => {
                // Optionally refresh data or show success message
              }} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
