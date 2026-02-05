"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface MenuItem {
  name: string
  price: number
  category: string
  description?: string
}

interface ChatWidgetProps {
  tenantSlug: string
  menuItems?: MenuItem[]
  categories?: string[]
}

export function ChatWidget({ tenantSlug, menuItems = [], categories = [] }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Merhaba! 👋 Ben sipariş asistanınızım. Size nasıl yardımcı olabilirim?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          message: input.trim(),
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          menuContext: {
            categories,
            items: menuItems.slice(0, 20), // Limit for context size
          },
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.success ? data.data.message : "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Bağlantı hatası oluştu. Lütfen tekrar deneyin.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Quick suggestions
  const suggestions = [
    "Kahve önerir misin?",
    "En popüler ürünler?",
    "Tatlı var mı?",
    "Vegan seçenekler?",
  ]

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs">
          <Sparkles className="h-3 w-3" />
        </span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <Card className="flex h-[500px] max-h-[calc(100vh-6rem)] flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Sipariş Asistanı</h3>
                  <p className="text-xs text-white/70">AI destekli yardım</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 border-t bg-slate-50 p-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    setTimeout(() => sendMessage(), 100)
                  }}
                  className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm hover:bg-purple-50 hover:text-purple-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-full bg-purple-500 hover:bg-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
