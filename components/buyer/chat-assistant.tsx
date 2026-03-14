"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, CirclePlus, Globe, History, Loader2, MapPin, Plus, RefreshCw, Search, Send, Sparkles, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChatHistoryContentPartDto,
  ChatListingPublishedMessage,
  clearChatSession,
  createChatSession,
  getAllListingAmenities,
  getChatHistory,
  getChatSessions,
  getCountries,
  getProvinces,
  searchListingsByPrompt,
  sendChatMessage,
  type AmenityResponse,
  type ChatSessionListItemDto,
} from "@/lib/api-client";
import type { Country, Listing, Province } from "@/lib/types";

interface Message {
  id: string;
  author: "user" | "model" | "function";
  text: string;
  createdAt: number;
  listings?: ChatListingPublishedMessage[];
}

interface SessionListItem {
  sessionId: string;
  updatedAt: number;
}

interface ChatAssistantProps {
  onViewListing: (id: string) => void;
  defaultQuery?: string;
  listingId?: string | null;
  initialSessionId?: string | null;
  onSessionChange?: (sessionId: string | null) => void;
}

const QUICK_SUGGESTIONS = [
  "Find 2 bedroom apartments with gym and parking",
  "Show family-friendly homes near schools and parks",
  "Compare rent options under 25M VND in this area",
  "Which listings have virtual tours and low commute time?",
];

function mapSessionItem(session: ChatSessionListItemDto): SessionListItem {
  return {
    sessionId: session.sessionId,
    updatedAt: new Date(session.updatedAt).getTime(),
  };
}

function mapHistoryPartsToText(parts: ChatHistoryContentPartDto[]): string {
  return parts
    .map((part) => {
      if (part.text) return part.text;
      if (part.functionCall) return `Looking for listings with your criteria...`;
      if (part.functionResponse)
        return (part.functionResponse.response as { result: Listing[] })?.result.length > 0
          ? `Found ${(part.functionResponse.response as { result: Listing[] }).result.length} matching listings.`
          : `Couldn't find any listings matching your criteria.`;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function formatListingPrice(listing: ChatListingPublishedMessage): string {
  if (typeof listing.price !== "number") return "Contact for price";
  return `${listing.price.toLocaleString()} ${listing.priceCurrency || ""}`.trim();
}

function formatSessionDateLabel(value: number): string {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSessionTimeLabel(value: number): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MarkdownMessage({ text, inverted = false }: { text: string; inverted?: boolean }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-6">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ className, children }) =>
          className ? (
            <code
              className={`block overflow-x-auto rounded-md p-2 text-xs ${inverted ? "bg-primary-foreground/20" : "bg-muted"}`}
            >
              {children}
            </code>
          ) : (
            <code className={`rounded px-1 py-0.5 text-xs ${inverted ? "bg-primary-foreground/20" : "bg-muted"}`}>
              {children}
            </code>
          ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`underline ${inverted ? "text-primary-foreground" : "text-primary"}`}
          >
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export function ChatAssistant({
  onViewListing,
  defaultQuery = "",
  listingId,
  initialSessionId,
  onSessionChange,
}: ChatAssistantProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amenities, setAmenities] = useState<AmenityResponse[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("all");

  const bootstrappedRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const selectedAmenityNames = useMemo(() => {
    const idSet = new Set(selectedAmenityIds);
    return amenities.filter((amenity) => idSet.has(amenity.amenityId)).map((amenity) => amenity.amenityName);
  }, [amenities, selectedAmenityIds]);

  const selectedCountryName = useMemo(() => {
    return countries.find((country) => country.countryId === selectedCountryId)?.name || "";
  }, [countries, selectedCountryId]);

  const selectedProvinceName = useMemo(() => {
    return provinces.find((province) => province.provinceId === selectedProvinceId)?.name || "";
  }, [provinces, selectedProvinceId]);

  const loadSessions = async () => {
    const response = await getChatSessions(1, 50);
    const mapped = response.sessions.map(mapSessionItem).sort((a, b) => b.updatedAt - a.updatedAt);
    setSessions(mapped);
    return mapped;
  };

  const refreshHistory = async (sessionId: string) => {
    shouldStickToBottomRef.current = true;
    setActiveSessionId(sessionId);
    onSessionChange?.(sessionId);
    setIsHistoryLoading(true);
    setError(null);
    try {
      const response = await getChatHistory(sessionId);
      const mappedMessages: Message[] = response.history.map((entry, index) => ({
        id: `${sessionId}-${index}`,
        author: entry.role as "model" | "user" | "function",
        text: mapHistoryPartsToText(entry.parts),
        createdAt: Date.now() + index,
        listings: entry.listings,
      }));
      setMessages(mappedMessages);
    } catch (historyError) {
      const text = historyError instanceof Error ? historyError.message : "Unable to load session history.";
      setError(text);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const createAndActivateSession = async () => {
    setIsCreatingSession(true);
    try {
      const response = await createChatSession();
      const now = Date.now();
      setActiveSessionId(response.sessionId);
      onSessionChange?.(response.sessionId);
      setMessages([
        {
          id: crypto.randomUUID(),
          author: "model",
          text: response.reply.text,
          listings: response.reply.listings,
          createdAt: now,
        },
      ]);
      await loadSessions();
      return response.sessionId;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const appendContextToPrompt = (basePrompt: string): string => {
    const contextLines: string[] = [];

    if (listingId) {
      contextLines.push(`Focus listingId: ${listingId}`);
    }

    if (selectedAmenityNames.length > 0) {
      contextLines.push(`Preferred amenities: ${selectedAmenityNames.join(", ")}`);
    }

    const locationParts = [selectedProvinceName, selectedCountryName].filter(Boolean);
    if (locationParts.length > 0) {
      contextLines.push(`Preferred location: ${locationParts.join(", ")}`);
    }

    if (contextLines.length === 0) {
      return basePrompt.trim();
    }

    return `${basePrompt.trim()}\n\nContext:\n- ${contextLines.join("\n- ")}`;
  };

  const sendMessage = async (rawInput?: string, sessionOverride?: string) => {
    const plain = (rawInput ?? input).trim();
    if (!plain || isSending) return;

    setIsSending(true);
    setError(null);

    const composed = appendContextToPrompt(plain);
    const activeId = sessionOverride || activeSessionId || (await createAndActivateSession());
    const now = Date.now();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      author: "user",
      text: composed,
      createdAt: now,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await sendChatMessage(activeId, { message: composed });
      let listings = response.reply.listings || [];

      if (listings.length === 0) {
        try {
          listings = await searchListingsByPrompt({ query: composed, page: 1, pageSize: 4 });
        } catch {
          listings = [];
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        author: "model",
        text: response.reply.text,
        createdAt: Date.now(),
        listings,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setActiveSessionId(activeId);
      await loadSessions();
    } catch (messageError) {
      const text = messageError instanceof Error ? messageError.message : "Unable to send message right now.";
      setError(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearCurrentSession = async () => {
    if (!activeSessionId || isSending) return;
    setIsClearingSession(true);
    try {
      await clearChatSession(activeSessionId);
      const remaining = await loadSessions();
      if (remaining.length > 0) {
        await refreshHistory(remaining[0].sessionId);
      } else {
        await createAndActivateSession();
      }
    } catch (clearError) {
      const text = clearError instanceof Error ? clearError.message : "Unable to clear this session right now.";
      setError(text);
    } finally {
      setIsClearingSession(false);
    }
  };

  const handleNewChat = async (seedPrompt?: string) => {
    try {
      await createAndActivateSession();
      if (seedPrompt) {
        setInput(seedPrompt);
      }
    } catch (createError) {
      const text = createError instanceof Error ? createError.message : "Unable to start a new chat right now.";
      setError(text);
    }
  };

  const handleRefreshActiveHistory = async () => {
    if (!activeSessionId || isHistoryLoading || isBootstrapping) return;
    await refreshHistory(activeSessionId);
  };

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const bootstrap = async () => {
      setIsBootstrapping(true);
      setIsContextLoading(true);
      setError(null);

      try {
        const [amenitiesData, countriesData] = await Promise.all([
          getAllListingAmenities().catch(() => []),
          getCountries().catch(() => []),
        ]);

        setAmenities(amenitiesData);
        setCountries(countriesData);

        const serverSessions = await loadSessions();

        if (serverSessions.length > 0) {
          const preferredSession =
            (initialSessionId && serverSessions.find((session) => session.sessionId === initialSessionId)) ||
            serverSessions[0];
          await refreshHistory(preferredSession.sessionId);
          return;
        }

        setMessages([]);
        setActiveSessionId(null);
        onSessionChange?.(null);
        if (defaultQuery.trim()) {
          setInput(defaultQuery.trim());
        }
      } catch (bootError) {
        const text = bootError instanceof Error ? bootError.message : "Unable to initialize chat assistant.";
        setError(text);
      } finally {
        setIsBootstrapping(false);
        setIsContextLoading(false);
      }
    };

    bootstrap();
  }, [defaultQuery, initialSessionId, onSessionChange]);

  useEffect(() => {
    if (!selectedCountryId || selectedCountryId === "all") {
      setProvinces([]);
      setSelectedProvinceId("all");
      setIsContextLoading(false);
      return;
    }

    setIsContextLoading(true);
    getProvinces(selectedCountryId)
      .then((data) => {
        setProvinces(data);
        setSelectedProvinceId("all");
      })
      .catch(() => {
        setProvinces([]);
        setSelectedProvinceId("all");
      })
      .finally(() => {
        setIsContextLoading(false);
      });
  }, [selectedCountryId]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 48;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom <= threshold;
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (!shouldStickToBottomRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages.length, isSending, isHistoryLoading, isBootstrapping]);

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(amenityId) ? prev.filter((item) => item !== amenityId) : [...prev, amenityId],
    );
  };

  const currentLocationText = [selectedProvinceName, selectedCountryName].filter(Boolean).join(", ");

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="flex w-55 shrink-0 flex-col border-r border-border bg-muted/30">
        <div className="shrink-0 border-b border-border p-3">
          <Button
            className="w-full justify-start"
            size="sm"
            onClick={() => handleNewChat()}
            disabled={isCreatingSession || isBootstrapping}
          >
            {isCreatingSession ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CirclePlus className="mr-1.5 h-3.5 w-3.5" />
            )}
            {isCreatingSession ? "Creating..." : "New chat"}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center gap-2 px-1 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            <span className="flex-1">Sessions</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefreshActiveHistory}
              disabled={!activeSessionId || isHistoryLoading || isBootstrapping}
              aria-label="Refresh active chat history"
              title="Refresh active chat history"
            >
              <RefreshCw className={`h-3 w-3 ${isHistoryLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="mt-1 space-y-0.5">
            {isBootstrapping && (
              <div className="space-y-2 px-1 py-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-4/5 rounded-lg" />
              </div>
            )}

            {sessions.length === 0 && <p className="px-2 py-4 text-xs text-muted-foreground">No saved sessions yet.</p>}

            {sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition ${
                  session.sessionId === activeSessionId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                disabled={isHistoryLoading || isBootstrapping}
                onClick={() => refreshHistory(session.sessionId)}
              >
                <p className="font-medium leading-5">{formatSessionDateLabel(session.updatedAt)}</p>
                <p className="mt-0.5 text-[10px] opacity-75">Updated at {formatSessionTimeLabel(session.updatedAt)}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-hidden bg-background min-w-0">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">Estate AI Assistant</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCurrentSession}
                disabled={!activeSessionId || isSending || isClearingSession || isHistoryLoading || isBootstrapping}
              >
                {isClearingSession ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 h-4 w-4" />
                )}{" "}
                {isClearingSession ? "Clearing..." : "Clear"}
              </Button>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            className="flex-1 space-y-4 overflow-y-auto bg-linear-to-b from-background to-muted/20 p-4 pb-84"
          >
            {(isBootstrapping || isHistoryLoading || isCreatingSession) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isHistoryLoading ? "Updating messages..." : "Initializing chat session..."}
              </div>
            )}

            {isBootstrapping && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
              </div>
            )}

            {!isBootstrapping && messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
                Start with a prompt or pick a suggestion below.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.author === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.author === "model" && (
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                {
                  message.author === "function" && (
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Search className="h-4 w-4" />
                    </div>
                  )
                }

                <div
                  className={`max-w-[92%] space-y-2 rounded-2xl p-3 sm:max-w-[80%] ${
                    ['function', 'model'].includes(message.author)
                      ? "border border-border bg-card"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="text-sm">
                    <MarkdownMessage text={message.text} inverted={message.author === "user"} />
                  </div>

                  {message.listings && message.listings.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {message.listings.slice(0, 4).map((listing) => (
                        <div
                          key={listing.listingId}
                          className="rounded-xl border border-border bg-background/80 p-3 text-foreground"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium leading-5">{listing.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{formatListingPrice(listing)}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {[listing.wardName, listing.provinceName, listing.countryName]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => onViewListing(listing.listingId)}>
                              View
                            </Button>
                          </div>
                          {listing.amenityNames?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {listing.amenityNames.slice(0, 5).map((name) => (
                                <Badge key={`${listing.listingId}-${name}`} variant="outline" className="text-[11px]">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.author === "user" && (
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[80%] space-y-2 rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20">
            <div className="pointer-events-auto space-y-3 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
              <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Select value={selectedCountryId} onValueChange={setSelectedCountryId}>
                  <SelectTrigger size="sm" className="h-7 text-xs min-w-27.5" disabled={isContextLoading}>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any country</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.countryId} value={country.countryId}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Select value={selectedProvinceId} onValueChange={setSelectedProvinceId}>
                  <SelectTrigger size="sm" className="h-7 text-xs min-w-27.5" disabled={isContextLoading || selectedCountryId === "all"}>
                    <SelectValue placeholder="Province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any province</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province.provinceId} value={province.provinceId}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isContextLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}

              {amenities.length > 0 && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {amenities.slice(0, 14).map((amenity) => {
                    const selected = selectedAmenityIds.includes(amenity.amenityId);
                    return (
                      <button
                        key={amenity.amenityId}
                        type="button"
                        onClick={() => toggleAmenity(amenity.amenityId)}
                        disabled={isContextLoading}
                        className={`rounded-full border px-2 py-0.5 text-[10px] transition ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {amenity.amenityName}
                      </button>
                    );
                  })}
                </>
              )}

              {isContextLoading && (
                <>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </>
              )}
              </div>

              <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for neighborhoods, budget, amenities, or comparisons"
                className="min-h-20 resize-none bg-background"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Context menu
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Insert into message</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (selectedAmenityNames.length === 0) return;
                          setInput((prev) => `${prev}${prev ? " " : ""}amenities: ${selectedAmenityNames.join(", ")}`);
                        }}
                      >
                        Selected amenities
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (!currentLocationText) return;
                          setInput((prev) => `${prev}${prev ? " " : ""}location: ${currentLocationText}`);
                        }}
                      >
                        Selected location
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (!listingId) return;
                          setInput((prev) => `${prev}${prev ? " " : ""}focus listingId: ${listingId}`);
                        }}
                      >
                        Current listing focus
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setInput(QUICK_SUGGESTIONS[0])}>
                        Insert starter prompt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {currentLocationText && <Badge variant="outline">{currentLocationText}</Badge>}
                  {selectedAmenityNames.length > 0 && (
                    <Badge variant="outline">{selectedAmenityNames.length} amenities</Badge>
                  )}
                </div>

                <Button
                  onClick={() => sendMessage()}
                  disabled={isBootstrapping || isSending || isHistoryLoading || isCreatingSession || !input.trim()}
                >
                  {isSending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Send className="mr-1 h-4 w-4" />}
                  Send
                </Button>
              </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </div>
    </div>
  );
}
