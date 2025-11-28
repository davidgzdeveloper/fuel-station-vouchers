import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Fuel } from "lucide-react";

interface VoucherTicketProps {
  voucher: {
    id: string;
    beneficiary: string;
    amount: number;
    vehicle: string;
    issue_date: string;
    expiration_date: string;
    hash: string;
  };
}

export const VoucherTicket = ({ voucher }: VoucherTicketProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const qrURL = `${window.location.origin}/scan?id=${voucher.id}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Voucher Generated</h3>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          Print Voucher
        </Button>
      </div>

      <div className="print:block">
        <Card
          ref={ticketRef}
          className="overflow-hidden shadow-elevated max-w-2xl mx-auto print:shadow-none print:border-2 print:border-foreground"
        >
          {/* Header */}
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Fuel className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">FUEL SERVICE STATION</h2>
                <p className="text-sm opacity-90">Av. Principal 1234, Misiones</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
            {/* Details */}
            <div className="space-y-4">
              <div className="inline-block">
                <div className="text-4xl font-bold gradient-accent text-accent px-4 py-2 rounded">
                  ${voucher.amount.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground">FOR:</span>{" "}
                  <span className="font-medium">{voucher.beneficiary}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">VEHICLE:</span>{" "}
                  <span className="font-medium">{voucher.vehicle}</span>
                </div>
                <Separator className="my-3" />
                <div>
                  <span className="font-semibold text-muted-foreground">ISSUED:</span>{" "}
                  <span className="font-medium">{formatDate(voucher.issue_date)}</span>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">EXPIRES:</span>{" "}
                  <span className="font-medium">{formatDate(voucher.expiration_date)}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center border-l-2 border-dashed pl-6 print:border-foreground">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={qrURL} size={150} level="H" />
              </div>
              <p className="text-xs font-mono-code mt-3 text-center text-muted-foreground">
                {voucher.id}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-foreground text-background text-center py-2 text-xs">
            This voucher is an internal document. Valid only with authorized signature.
          </div>
        </Card>

        {/* Cut Line */}
        <div className="relative my-6 print:block">
          <Separator />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            ✂️ CUT HERE
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};
