import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertCommitmentSchema, type Commitment } from "@shared/schema";

const formSchema = insertCommitmentSchema.extend({
  monthlyCommitment: z.union([z.string(), z.number()]).pipe(z.coerce.number().min(1, "Required")),
  doneSoFar: z.union([z.string(), z.number()]).pipe(z.coerce.number()),
  dueDay: z.union([z.string(), z.number()]).pipe(z.coerce.number().min(1).max(31)),
});

interface CommitmentFormProps {
  commitment?: Commitment;
  month: number; // 1-12
  year: number; // e.g., 2025
  onSubmit: (data: z.infer<typeof insertCommitmentSchema>) => void;
  onCancel: () => void;
}

export function CommitmentForm({ commitment, month, year, onSubmit, onCancel }: CommitmentFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: commitment?.type || "Fixed",
      name: commitment?.name || "",
      monthlyCommitment: commitment?.monthlyCommitment || 0,
      doneSoFar: commitment?.doneSoFar || 0,
      balance: commitment?.balance || 0,
      dueDay: commitment?.dueDay || 0,
      isAutomated: commitment?.isAutomated || false,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const monthlyCommitment = values.monthlyCommitment;
    const doneSoFar = values.doneSoFar;
    const balance = monthlyCommitment - doneSoFar;
    
    onSubmit({
      type: values.type,
      name: values.name,
      monthlyCommitment,
      doneSoFar,
      balance,
      dueDay: values.dueDay,
      isAutomated: values.isAutomated,
      month,
      year,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Family Support" 
                  {...field} 
                  data-testid="input-commitment-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-commitment-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthlyCommitment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Commitment (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="23000" 
                  {...field} 
                  data-testid="input-monthly-commitment"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doneSoFar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Done So Far (₹)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field} 
                  data-testid="input-done-so-far"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Day (1-31)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="31" 
                  placeholder="1" 
                  {...field} 
                  data-testid="input-due-day"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAutomated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Auto-payment</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Is this automatically deducted?
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-automated"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            data-testid="button-save-commitment"
          >
            {commitment ? "Update" : "Add"} Commitment
          </Button>
        </div>
      </form>
    </Form>
  );
}
