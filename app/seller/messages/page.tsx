"use client";

import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { SearchBar } from "@/components/common/search-bar";
import { MessageSquare, Phone, User, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SellerMessagesPage() {
  const [search, setSearch] = useState("");
  
  const mockConversations = [
    { id: 1, name: "John Doe", lastMessage: "Is this property still available?", time: "2h ago", unread: true },
    { id: 2, name: "Alice Smith", lastMessage: "I would like to schedule a tour for tomorrow.", time: "5h ago", unread: false },
    { id: 3, name: "Bob Johnson", lastMessage: "Thank you for the information.", time: "Yesterday", unread: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      <main className="ml-60 pt-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Communication with potential buyers and staff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Conversation List */}
            <div className="md:col-span-1 rounded-xl border bg-card flex flex-col overflow-hidden">
              <div className="p-4 border-b">
                <SearchBar
                  placeholder="Search messages..."
                  value={search}
                  onChange={setSearch}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {mockConversations.map((conv) => (
                  <div 
                    key={conv.id} 
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${conv.unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{conv.name}</h4>
                      <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 rounded-xl border bg-card flex flex-col overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">John Doe</h4>
                    <span className="text-[10px] text-emerald-500 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-2xl bg-muted text-sm">
                    Is this property at District 1 still available for sale?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[70%] p-3 rounded-2xl bg-primary text-primary-foreground text-sm">
                    Yes, it is! Would you like to see more details or schedule a visit?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-2xl bg-muted text-sm">
                    Yes, I would like to schedule a tour for tomorrow afternoon if possible.
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 bg-muted border-none rounded-lg px-4 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  placeholder="Type your message..."
                />
                <Button size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
