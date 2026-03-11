// @ts-nocheck
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_TRANSACTION_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  }
});

export interface CreatePaymentLinkRequest {
  amount: number;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  orderCode?: number;
  paymentLinkId?: string;
}

export async function createPaymentLink(
  data: CreatePaymentLinkRequest
): Promise<CheckoutResponse> {

  const res = await apiClient.post('/credits/topup/initiate', {
    amount: data.amount,
  });

  return res.data;   // backend đã trả object
}