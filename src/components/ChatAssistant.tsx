import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getPageContext, type UserRole } from "@/lib/chat-assistant/pageContextRegistry";
import { buildSystemPrompt } from "@/lib/chat-assistant/promptBuilder";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const DAILY_LIMIT = 30;

export default function ChatAssistant() {
  const { user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine user role (default to player)
  const userRole: UserRole = (user?.user_metadata?.role as UserRole) ?? "player";
  const pageContext = getPageContext(location.pathname, { userId: user?.id, role: userRole });

  // Load daily usage count
  useEffect(() => {
    if (!user) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("chat_assistant_usage" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since)
      .then(({ count }) => {
        setDailyCount(count ?? 0);
      });
  }, [user]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const remaining = DAILY_LIMIT - dailyCount;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || remaining <= 0 || !user) return;

      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const systemPrompt = buildSystemPrompt({
          pageContext,
          userRole,
        });

        const { data, error: fnError } = await supabase.functions.invoke(
          "chat-assistant",
          {
            body: {
              messages: newMessages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              systemPrompt,
              pageRoute: location.pathname,
            },
          },
        );

        if (fnError) throw fnError;

        if (data?.error) {
          if (data.remaining === 0) {
            setError("Batas harian tercapai. Coba lagi besok!");
          } else {
            setError(data.error);
          }
          return;
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
        setDailyCount((c) => c + 1);
      } catch (err) {
        console.error("Chat error:", err);
        setError("Gagal mengirim pesan. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, remaining, user, pageContext, userRole, location.pathname],
  );

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating action button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[420px] max-w-full p-0 flex flex-col">
          {/* Header */}
          <SheetHeader className="border-b px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-600" />
                <SheetTitle className="text-base">SuperFans Assistant</SheetTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {pageContext.pageName}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {remaining}/{DAILY_LIMIT}
                </Badge>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 pt-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Bot className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Halo! Saya asisten SuperFans Pro
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Saya bisa membantu Anda di halaman{" "}
                    <span className="font-medium">{pageContext.pageName}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {pageContext.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-left text-sm rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengetik...
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t px-4 py-3 flex gap-2 flex-shrink-0"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                remaining <= 0
                  ? "Batas harian tercapai"
                  : "Ketik pertanyaan..."
              }
              disabled={isLoading || remaining <= 0}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim() || remaining <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
