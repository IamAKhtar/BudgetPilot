import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Wallet, TrendingUp, TrendingDown, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommitmentCard } from "@/components/commitment-card";
import { CommitmentForm } from "@/components/commitment-form";
import { BankBalanceDialog } from "@/components/bank-balance-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getEffectiveDoneSoFar } from "@/lib/auto-payment-utils";
import type { Commitment, InsertCommitment } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  
  // Get current month and year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: commitments = [], isLoading: loadingCommitments } = useQuery<Commitment[]>({
    queryKey: ['/api/commitments', selectedMonth, selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/commitments?month=${selectedMonth}&year=${selectedYear}`);
      if (!res.ok) throw new Error('Failed to fetch commitments');
      return res.json();
    },
  });

  const { data: bankBalance = { id: "", balance: 0 } } = useQuery<{ id: string; balance: number }>({
    queryKey: ['/api/bank-balance'],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCommitment) => apiRequest("POST", "/api/commitments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commitments', selectedMonth, selectedYear] });
      setIsFormOpen(false);
      toast({ title: "Commitment added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertCommitment }) =>
      apiRequest("PATCH", `/api/commitments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commitments', selectedMonth, selectedYear] });
      setIsFormOpen(false);
      setEditingCommitment(null);
      toast({ title: "Commitment updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/commitments/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/commitments', selectedMonth, selectedYear] });
      setDeletingId(null);
      toast({ title: "Commitment deleted successfully" });
    },
  });

  const updateBankBalanceMutation = useMutation({
    mutationFn: ({ balance, reason }: { balance: number; reason: string }) =>
      apiRequest("POST", "/api/bank-balance/adjust", { balance, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-balance'] });
      toast({ title: "Bank balance updated successfully" });
    },
  });

  // Calculate totals using effective doneSoFar for auto-payments
  const totalMonthly = commitments.reduce((sum, c) => sum + c.monthlyCommitment, 0);
  const totalPaid = commitments.reduce((sum, c) => sum + getEffectiveDoneSoFar(c, selectedMonth, selectedYear), 0);
  const totalBalance = totalMonthly - totalPaid;
  const surplusShortfall = bankBalance.balance - totalBalance;
  const isSurplus = surplusShortfall >= 0;

  const handleFormSubmit = (data: InsertCommitment) => {
    if (editingCommitment) {
      updateMutation.mutate({ id: editingCommitment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (commitment: Commitment) => {
    setEditingCommitment(commitment);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleBankBalanceUpdate = (balance: number, reason: string) => {
    updateBankBalanceMutation.mutate({ balance, reason });
  };

  const handleAddNew = () => {
    setEditingCommitment(null);
    setIsFormOpen(true);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1];
  };

  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border">
        <div className="max-w-md mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Budget Tracker</h1>
            <ThemeToggle />
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              data-testid="button-previous-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 text-center">
              <p className="font-semibold text-base" data-testid="text-selected-month">
                {getMonthName(selectedMonth)} {selectedYear}
              </p>
              {!isCurrentMonth && (
                <p className="text-xs text-muted-foreground">Historical View</p>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pb-24">
        {/* Summary Cards */}
        <div className="py-6 space-y-4">
          {/* Bank Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bank Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsBankDialogOpen(true)}
                data-testid="button-adjust-balance"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <p className="text-3xl font-bold font-mono" data-testid="text-bank-balance">
                  ₹{bankBalance.balance.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Surplus/Shortfall Card */}
          <Card className={isSurplus ? "border-success/30" : "border-destructive/30"}>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isSurplus ? "Surplus" : "Shortfall"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isSurplus ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <p 
                  className={`text-3xl font-bold font-mono ${
                    isSurplus ? "text-success" : "text-destructive"
                  }`}
                  data-testid="text-surplus-shortfall"
                >
                  {isSurplus ? "+" : ""}₹{surplusShortfall.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Balance - Pending Payments
              </p>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Monthly</p>
                  <p className="text-lg font-semibold font-mono" data-testid="text-total-monthly">
                    ₹{totalMonthly.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-lg font-semibold font-mono text-success" data-testid="text-total-paid">
                    ₹{totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-lg font-semibold font-mono text-destructive" data-testid="text-total-balance">
                    ₹{totalBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Commitments</p>
                  <p className="text-lg font-semibold" data-testid="text-commitment-count">
                    {commitments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commitments List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Monthly Commitments</h2>
          
          {loadingCommitments ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          ) : commitments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  No commitments yet. Add your first one to get started!
                </p>
                <Button onClick={handleAddNew} data-testid="button-add-first">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Commitment
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {commitments.map((commitment) => (
                <CommitmentCard
                  key={commitment.id}
                  commitment={commitment}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Add Button */}
      {commitments.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={handleAddNew}
            data-testid="button-add-commitment"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Commitment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCommitment ? "Edit" : "Add"} Commitment
            </DialogTitle>
          </DialogHeader>
          <CommitmentForm
            commitment={editingCommitment || undefined}
            month={selectedMonth}
            year={selectedYear}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCommitment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Bank Balance Dialog */}
      <BankBalanceDialog
        open={isBankDialogOpen}
        onOpenChange={setIsBankDialogOpen}
        currentBalance={bankBalance.balance}
        onSubmit={handleBankBalanceUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Commitment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this commitment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
