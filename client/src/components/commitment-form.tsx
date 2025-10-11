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
  monthlyCommitment: z.string().min(1, "Required").transform((val) => parseInt(val, 10)),
  doneSoFar: z.string().transform((val) => parseInt(val || "0", 10)),
  dueDay: z.string().min(1, "Required").transform((val) => parseInt(val, 10)),
});

type FormValues = z.input<typeof formSchema>;

interface CommitmentFormProps {
  commitment?: Commitment;
  onSubmit: (data: z.infer<typeof insertCommitmentSchema>) => void;
  onCancel: () => void;
}

export function CommitmentForm({ commitment, onSubmit, onCancel }: CommitmentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: commitment?.type || "Fixed",
      name: commitment?.name || "",
      monthlyCommitment: commitment?.monthlyCommitment?.toString() || "",
      doneSoFar: commitment?.doneSoFar?.toString() || "0",
      balance: commitment?.balance || 0,
      dueDay: commitment?.dueDay?.toString() || "",
      isAutomated: commitment?.isAutomated || false,
    },
  });

  const handleSubmit = (values: FormValues) => {
    const parsed = formSchema.parse(values);
    const monthlyCommitment = parsed.monthlyCommitment;
    const doneSoFar = parsed.doneSoFar;
    const balance = monthlyCommitment - doneSoFar;
    
    onSubmit({
      type: parsed.type,
      name: parsed.name,
      monthlyCommitment,
      doneSoFar,
      balance,
      dueDay: parsed.dueDay,
      isAutomated: parsed.isAutomated,
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
