import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Fuel } from "lucide-react";
import { motion } from "framer-motion";

const Scan = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "valid" | "used" | "invalid">("loading");
  const [message, setMessage] = useState("");
  const [voucherData, setVoucherData] = useState<any>(null);

  useEffect(() => {
    const voucherID = searchParams.get("id");

    if (!voucherID) {
      setStatus("invalid");
      setMessage("No voucher ID provided");
      return;
    }

    const checkVoucher = async () => {
      try {
        const { data, error } = await supabase
          .from("vouchers")
          .select("*")
          .eq("id", voucherID)
          .single();

        if (error || !data) {
          setStatus("invalid");
          setMessage("Voucher not found");
          return;
        }

        setVoucherData(data);

        if (data.status === "USED") {
          setStatus("used");
          setMessage("This voucher has already been used");
        } else if (data.status === "ACTIVE") {
          setStatus("valid");
          setMessage("Voucher is valid and ready to use");
        } else {
          setStatus("invalid");
          setMessage(`Invalid voucher status: ${data.status}`);
        }
      } catch (error) {
        setStatus("invalid");
        setMessage("Error checking voucher");
      }
    };

    checkVoucher();
  }, [searchParams]);

  const getStatusColor = () => {
    switch (status) {
      case "valid":
        return "bg-success/10 border-success";
      case "used":
        return "bg-destructive/10 border-destructive";
      case "invalid":
        return "bg-warning/10 border-warning";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "valid":
        return <CheckCircle2 className="w-16 h-16 text-success" />;
      case "used":
        return <XCircle className="w-16 h-16 text-destructive" />;
      case "invalid":
        return <AlertTriangle className="w-16 h-16 text-warning" />;
      default:
        return <div className="w-16 h-16 animate-spin rounded-full border-b-2 border-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className={`p-8 shadow-elevated ${getStatusColor()}`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
              <Fuel className="w-10 h-10 text-primary" />
            </div>

            {getStatusIcon()}

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {status === "loading" && "Checking Voucher..."}
                {status === "valid" && "✓ Valid Voucher"}
                {status === "used" && "✗ Already Used"}
                {status === "invalid" && "⚠ Invalid Voucher"}
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>

            {voucherData && (
              <div className="w-full mt-4 p-4 bg-background/50 rounded-lg text-left space-y-2 text-sm">
                <div>
                  <span className="font-semibold">ID:</span>{" "}
                  <span className="font-mono-code">{voucherData.id}</span>
                </div>
                <div>
                  <span className="font-semibold">Beneficiary:</span> {voucherData.beneficiary}
                </div>
                <div>
                  <span className="font-semibold">Amount:</span> ${voucherData.amount}
                </div>
                <div>
                  <span className="font-semibold">Vehicle:</span> {voucherData.vehicle}
                </div>
                {voucherData.status === "USED" && voucherData.used_date && (
                  <div>
                    <span className="font-semibold">Used:</span>{" "}
                    {new Date(voucherData.used_date).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Scan;
