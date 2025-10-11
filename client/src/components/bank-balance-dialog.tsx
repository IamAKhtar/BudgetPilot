import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  balance: z.string().min(1, "Required").transform((val) => parseInt(val, 10)),
  reason: z.string().min(1, "Please provide a reason for adjustment"),
});

type FormValues = z.input<typeof formSchema>;

interface BankBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
  onSubmit: (balance: number, reason: string) => void;
}

export function BankBalanceDialog({
  open,
  onOpenChange,
  currentBalance,
  onSubmit,
}: BankBalanceDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: currentBalance.toString(),
      reason: "",
    },
  });

  // Reset form when currentBalance changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        balance: currentBalance.toString(),
        reason: "",
      });
    }
  }, [open, currentBalance, form]);

  const handleSubmit = (data: z.output<typeof formSchema>) => {
    onSubmit(data.balance, data.reason);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Bank Balance</DialogTitle>
          <DialogDescription>
            Update your bank balance and provide a reason for the adjustment.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Balance (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      data-testid="input-bank-balance"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Adjustment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Salary credited, Unexpected expense, etc."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-adjustment-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                data-testid="button-cancel-adjustment"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                data-testid="button-save-adjustment"
              >
                Update Balance
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
