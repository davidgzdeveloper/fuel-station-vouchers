import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const validationSchema = z.object({
  voucherID: z.string().min(5, "Voucher ID is required"),
  station: z.string().min(3, "Station name must be at least 3 characters").max(100),
  litros: z.number().min(0.1, "Litros must be greater than 0"),
});

export const ValidateVoucher = () => {
  const [voucherID, setVoucherID] = useState("");
  const [station, setStation] = useState("");
  const [litros, setLitros] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    beneficiary?: string;
    amount?: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        voucherID: voucherID.trim(),
        station: station.trim(),
        litros: parseFloat(litros),
      };

      validationSchema.parse(data);
      setLoading(true);
      setValidationResult(null);

      // Find voucher
      const { data: voucher, error: fetchError } = await supabase
        .from("vouchers")
        .select("*")
        .eq("id", data.voucherID)
        .single();

      if (fetchError || !voucher) {
        setValidationResult({
          success: false,
          message: "Voucher not found",
        });
        return;
      }

      if (voucher.status === "USED") {
        setValidationResult({
          success: false,
          message: "This voucher has already been used",
        });
        return;
      }

      if (voucher.status !== "ACTIVE") {
        setValidationResult({
          success: false,
          message: `Invalid voucher status: ${voucher.status}`,
        });
        return;
      }

      // Update voucher as used
      const { error: updateError } = await supabase
        .from("vouchers")
        .update({
          status: "USED",
          used_date: new Date().toISOString(),
          station: data.station,
          litros: data.litros,
        })
        .eq("id", data.voucherID);

      if (updateError) throw updateError;

      setValidationResult({
        success: true,
        message: "Voucher validated successfully!",
        beneficiary: voucher.beneficiary,
        amount: voucher.amount,
      });

      toast({
        title: "Success!",
        description: "Voucher has been marked as used",
      });

      // Reset form
      setVoucherID("");
      setStation("");
      setLitros("");
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
          description: error.message || "Failed to validate voucher",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-6">Validate & Process Fuel Load</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voucherID">Scan Voucher ID</Label>
            <Input
              id="voucherID"
              placeholder="EMP-XX-XXXXXX-X"
              value={voucherID}
              onChange={(e) => setVoucherID(e.target.value)}
              required
              className="font-mono-code"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="station">Station / Attendant</Label>
            <Input
              id="station"
              placeholder="Attendant name"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="litros">Litros Loaded</Label>
            <Input
              id="litros"
              type="number"
              placeholder="e.g., 45.5"
              value={litros}
              onChange={(e) => setLitros(e.target.value)}
              required
              min="0.1"
              step="0.01"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : "Process Fuel Load"}
          </Button>
        </form>
      </Card>

      {validationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`p-6 ${
              validationResult.success
                ? "bg-success/10 border-success"
                : "bg-destructive/10 border-destructive"
            }`}
          >
            <div className="flex items-start gap-4">
              {validationResult.success ? (
                <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">
                  {validationResult.success ? "Load Approved" : "Validation Failed"}
                </h3>
                <p className="mb-3">{validationResult.message}</p>
                {validationResult.success && (
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Beneficiary:</strong> {validationResult.beneficiary}
                    </p>
                    <p>
                      <strong>Authorized Amount:</strong> ${validationResult.amount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
