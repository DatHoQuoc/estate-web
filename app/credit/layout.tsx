import { Link } from "react-router-dom";

export default function CreditLayout({ children }: any) {
  return (
    <div className="flex gap-6 p-6">
      <div className="w-64 space-y-2">
        <Link to="/credit" className="block">Wallet</Link>
        <Link to="/credit/history" className="block">Transaction History</Link>
        <Link to="/credit/simulate/chat" className="block">Simulate AI Chat</Link>
        <Link to="/credit/simulate/post" className="block">Simulate Post</Link>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}