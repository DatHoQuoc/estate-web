// src/app/credit/components/TopUpModal.tsx
import React, { useState } from "react";
import { useCredit } from "@/components/credit/CreditContext";
import { createPaymentLink } from "@/lib/payos";
import { CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "form" | "payos" | "success";

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {

  const { refreshData } = useCredit();

  const [amount, setAmount] = useState("50000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>("form");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const parsedAmount = Number(amount);
  const isValidAmount = parsedAmount >= 10 && parsedAmount <= 1000000;
  const vnd = parsedAmount;

  const handleSubmit = async () => {

    if (!isValidAmount) {
      setError("Số tiền phải từ 10.000 đến 1.000.000.");
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const res = await createPaymentLink({
        amount: vnd
      });

      setCheckoutUrl(res.checkoutUrl);
      setModalState("payos");

    } catch (err: any) {

      setError(err.message || "Không thể tạo link thanh toán");

    } finally {

      setLoading(false);

    }

  };

  const PRESET = [10000, 50000, 100000, 200000, 500000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={
          modalState === "payos"
            ? "p-0 max-w-6xl h-[90vh]"
            : "max-w-md"
        }
      >

        {/* FORM */}
        {modalState === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center">
                <CreditCard size={18} />
                Mua thêm Credit
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">

              {/* preset */}
              <div>
                <Label className="mb-2 block text-sm">
                  Chọn nhanh
                </Label>

                <div className="flex gap-2 flex-wrap">
                  {PRESET.map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className={`px-3 py-1 rounded border text-sm ${parsedAmount === v
                        ? "bg-primary text-white"
                        : "hover:border-primary"
                        }`}
                    >
                      {v.toLocaleString({
                        'baseName': 'vi-VN',
                        'language': 'vi-VN'

                      } as Intl.LocalesArgument, {
                        'currency': 'VND'
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* input */}
              <div>
                <Label>Hoặc nhập số lượng</Label>

                <Input
                  type="number"
                  value={amount}
                  min={10}
                  max={1000}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              {/* summary */}
              <div className="border rounded-lg p-3 flex justify-between">
                <span>Tổng thanh toán</span>

                <span className="font-bold">
                  {isValidAmount ? vnd.toLocaleString() : "--"} VNĐ
                </span>
              </div>

              {error && (
                <div className="text-red-500 flex gap-2 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Hủy
                </Button>

                <Button
                  disabled={!isValidAmount || loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Đang tạo...
                    </>
                  ) : (
                    "Thanh toán"
                  )}
                </Button>
              </div>

            </div>
          </>
        )}

        {/* PAYOS */}
        {modalState === "payos" && checkoutUrl && (
          <iframe
            src={checkoutUrl}
            className="w-full h-full border-none bg-white"
            allow="payment *"
          />
        )}

        {/* SUCCESS */}
        {modalState === "success" && (
          <div className="flex flex-col items-center justify-center gap-4 p-10">

            <CheckCircle size={40} className="text-green-500" />

            <h3 className="text-xl font-bold">
              Thanh toán thành công
            </h3>

            <Button
              onClick={() => {
                refreshData();
                onClose();
              }}
            >
              Đóng
            </Button>

          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};
