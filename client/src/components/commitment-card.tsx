import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, CreditCard } from "lucide-react";
import { getEffectiveDoneSoFar, getEffectiveBalance } from "@/lib/auto-payment-utils";
import type { Commitment } from "@shared/schema";

interface CommitmentCardProps {
  commitment: Commitment;
  selectedMonth: number;
  selectedYear: number;
  onEdit: (commitment: Commitment) => void;
  onDelete: (id: string) => void;
}

export function CommitmentCard({ commitment, selectedMonth, selectedYear, onEdit, onDelete }: CommitmentCardProps) {
  const effectiveDoneSoFar = getEffectiveDoneSoFar(commitment, selectedMonth, selectedYear);
  const effectiveBalance = getEffectiveBalance(commitment, selectedMonth, selectedYear);
  const isFullyPaid = effectiveBalance === 0;
  const isPaid = effectiveDoneSoFar > 0;

  return (
    <Card 
      className="p-4 hover-elevate"
      data-testid={`card-commitment-${commitment.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge 
              variant={commitment.type === "Fixed" ? "secondary" : "outline"}
              className="text-xs"
              data-testid={`badge-type-${commitment.id}`}
            >
              {commitment.type}
            </Badge>
            {commitment.isAutomated && (
              <Badge variant="outline" className="text-xs gap-1">
                <CreditCard className="h-3 w-3" />
                Auto
              </Badge>
            )}
            {isFullyPaid && (
              <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                Paid
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold text-base mb-3" data-testid={`text-name-${commitment.id}`}>
            {commitment.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly</span>
              <span className="font-mono font-semibold" data-testid={`text-monthly-${commitment.id}`}>
                ₹{commitment.monthlyCommitment.toLocaleString()}
              </span>
            </div>
            
            {isPaid && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-mono text-success" data-testid={`text-done-${commitment.id}`}>
                  ₹{effectiveDoneSoFar.toLocaleString()}
                </span>
              </div>
            )}
            
            {effectiveBalance > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-mono font-semibold text-destructive" data-testid={`text-balance-${commitment.id}`}>
                  ₹{effectiveBalance.toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due: Day {commitment.dueDay}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(commitment)}
            data-testid={`button-edit-${commitment.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(commitment.id)}
            data-testid={`button-delete-${commitment.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
