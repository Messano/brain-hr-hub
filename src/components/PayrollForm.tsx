import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayrollInsert, PayrollUpdate } from "@/hooks/usePayrolls";
import { useEffect } from "react";

const payrollSchema = z.object({
  period_start: z.string().min(1, "La date de début est requise"),
  period_end: z.string().min(1, "La date de fin est requise"),
  base_salary: z.coerce.number().min(0, "Le salaire de base est requis"),
  bonus: z.coerce.number().optional(),
  deductions: z.coerce.number().optional(),
  net_salary: z.coerce.number().min(0, "Le salaire net est requis"),
  status: z.enum(["pending", "processing", "paid"]).optional(),
  payment_date: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollFormProps {
  payroll?: PayrollUpdate & { id?: string };
  onSubmit: (data: PayrollInsert | PayrollUpdate) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PayrollForm({ payroll, onSubmit, onCancel, isLoading }: PayrollFormProps) {
  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      period_start: payroll?.period_start || "",
      period_end: payroll?.period_end || "",
      base_salary: payroll?.base_salary ? Number(payroll.base_salary) : 0,
      bonus: payroll?.bonus ? Number(payroll.bonus) : 0,
      deductions: payroll?.deductions ? Number(payroll.deductions) : 0,
      net_salary: payroll?.net_salary ? Number(payroll.net_salary) : 0,
      status: (payroll?.status as PayrollFormData["status"]) || "pending",
      payment_date: payroll?.payment_date || "",
    },
  });

  const baseSalary = form.watch("base_salary") || 0;
  const bonus = form.watch("bonus") || 0;
  const deductions = form.watch("deductions") || 0;

  useEffect(() => {
    const netSalary = baseSalary + bonus - deductions;
    form.setValue("net_salary", netSalary > 0 ? netSalary : 0);
  }, [baseSalary, bonus, deductions, form]);

  const handleSubmit = (data: PayrollFormData) => {
    onSubmit({
      ...data,
      payment_date: data.payment_date || null,
      bonus: data.bonus || 0,
      deductions: data.deductions || 0,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="period_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Début de période *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin de période *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="base_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salaire de base (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primes (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deductions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retenues (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="0.00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="net_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salaire net (MAD) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="0.00" readOnly className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="processing">En cours</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de paiement</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {payroll?.id ? "Modifier" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
