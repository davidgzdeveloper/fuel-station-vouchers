import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { VoucherTicket } from "./VoucherTicket";
import { Loader2 } from "lucide-react";

const voucherSchema = z.object({
  beneficiary: z.string().min(3, "Beneficiary must be at least 3 characters").max(100),
  amount: z.number().min(100, "Amount must be at least $100"),
  vehicle: z.string().min(3, "Vehicle details must be at least 3 characters").max(100),
});

interface Voucher {
  id: string;
  beneficiary: string;
  amount: number;
  vehicle: string;
  issue_date: string;
  expiration_date: string;
  hash: string;
}

export const CreateVoucher = () => {
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdVoucher, setCreatedVoucher] = useState<Voucher | null>(null);

  const generateVoucherID = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const check = Math.floor(Math.random() * 10);
    return `EMP-${year}${month}-${random}-${check}`;
  };

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 12);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const voucherData = {
        beneficiary: beneficiary.trim(),
        amount: parseFloat(amount),
        vehicle: vehicle.trim(),
      };

      voucherSchema.parse(voucherData);
      setLoading(true);

      const voucherID = generateVoucherID();
      const hash = generateHash();
      const issueDate = new Date();
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);

      const { data, error } = await supabase
        .from("vouchers")
        .insert({
          id: voucherID,
          issue_date: issueDate.toISOString(),
          expiration_date: expirationDate.toISOString(),
          amount: voucherData.amount,
          beneficiary: voucherData.beneficiary,
          vehicle: voucherData.vehicle,
          status: "ACTIVE",
          hash: hash,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedVoucher(data);

      toast({
        title: "Success!",
        description: "Voucher created successfully",
      });

      // Reset form
      setBeneficiary("");
      setAmount("");
      setVehicle("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create voucher",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 shadow-card mb-8">
        <h2 className="text-2xl font-bold mb-6">Issue New Voucher</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary (Driver/Company)</Label>
            <Input
              id="beneficiary"
              placeholder="e.g., Juan Pérez"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Authorized Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle / License Plate / Details</Label>
            <Input
              id="vehicle"
              placeholder="e.g., Toyota Hilux AA123BB"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating..." : "Generate Voucher"}
          </Button>
        </form>
      </Card>

      {createdVoucher && <VoucherTicket voucher={createdVoucher} />}
    </div>
  );
};
