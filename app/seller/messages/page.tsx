"use client";

import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { SearchBar } from "@/components/common/search-bar";
import { MessageSquare, Phone, User, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export default function SellerMessagesPage() {
  const [search, setSearch] = useState("");
  const [conversations] = useState<ConversationItem[]>([]);
  const selectedConversation = conversations[0] || null;

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return conv.name.toLowerCase().includes(q) || conv.lastMessage.toLowerCase().includes(q);
  });

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
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${conv.unread ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm">{conv.name}</h4>
                        <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">No conversations yet.</div>
                )}
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
                    <h4 className="font-semibold text-sm">{selectedConversation?.name || "No active chat"}</h4>
                    <span className="text-[10px] text-muted-foreground font-medium">Awaiting conversation stream</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="text-sm text-muted-foreground">
                  Messaging data source is not connected yet.
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
