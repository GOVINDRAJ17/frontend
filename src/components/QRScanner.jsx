import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Upload, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QRScanner = ({ splitId }) => {
  const [qrImage, setQrImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user, token } = useAuth();

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload image to your backend
      const formData = new FormData();
      formData.append("qr_image", file);
      formData.append("user_id", user?.id);

      const response = await fetch(`${API_URL}/profile/upi-qr`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload QR code");

      toast.success("UPI QR Code uploaded successfully!");
    } catch (error) {
      toast.error((error && error.message) || "Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  };

  const openScanner = () => {
    toast.info("QR Scanner opening... (Camera access required)");
    // In production, implement actual QR scanning with a library like html5-qrcode
  };

  const simulatePayment = () => {
    toast.success("Payment initiated! Redirecting to payment gateway...", {
      description: "This is a demo. Integrate actual payment gateway.",
    });
  };

  return (
    <Card className="shadow-soft border-2">
      <CardHeader className="gradient-primary text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <QrCode />
          UPI Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Upload QR Code */}
        <div>
          <Label className="mb-2 block">Upload Your UPI QR Code</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full"
          >
            <Upload className="mr-2" size={16} />
            {uploading ? "Uploading..." : "Upload QR Code"}
          </Button>
        </div>

        {/* QR Code Preview */}
        {qrImage && (
          <div className="border-2 rounded-lg p-4 bg-white">
            <img src={qrImage} alt="UPI QR Code" className="max-w-full h-auto mx-auto" style={{ maxHeight: "200px" }} />
          </div>
        )}

        {/* Scan QR Code */}
        <div>
          <Label className="mb-2 block">Scan QR Code to Pay</Label>
          <Button
            onClick={openScanner}
            variant="outline"
            className="w-full"
          >
            <Camera className="mr-2" size={16} />
            Open Scanner
          </Button>
        </div>

        {/* Simulate Payment */}
        <Button
          onClick={simulatePayment}
          className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth"
        >
          Pay Now
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Secure payment via UPI</p>
          <p>Scan the creator's QR code with any UPI app</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRScanner;
