import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Phone, Video, MoreVertical, ArrowLeft, Smile, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    display_name: string;
    avatar_url: string;
  };
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount: number;
}

interface RealTimeChatProps {
  bookingId?: string;
  receiverId?: string;
  onClose?: () => void;
  isMinimized?: boolean;
}

const RealTimeChatSystem = ({ bookingId, receiverId, onClose, isMinimized = false }: RealTimeChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user && (bookingId || receiverId)) {
      initializeChat();
      setupRealtimeSubscription();
    }
  }, [user, bookingId, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // If we have a booking ID, get the other participant
      if (bookingId) {
        const { data: booking } = await supabase
          .from("bookings")
          .select(`
            *,
            customer:profiles!bookings_customer_id_fkey(user_id, display_name, avatar_url),
            provider:profiles!fk_bookings_provider(user_id, display_name, avatar_url)
          `)
          .eq("id", bookingId)
          .single();

        if (booking) {
          const otherUser = user.id === booking.customer_id ? booking.provider : booking.customer;
          setChatUser({
            id: otherUser.user_id,
            name: otherUser.display_name || "User",
            avatar: otherUser.avatar_url,
            isOnline: true, // We'll implement presence later
            unreadCount: 0
          });
        }
      }

      // Load existing messages
      await loadMessages();
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!user || !bookingId) return;

    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !bookingId) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("booking_id", bookingId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!user || !chatUser || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsTyping(false);

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          booking_id: bookingId,
          sender_id: user.id,
          receiver_id: chatUser.id,
          message_text: messageText,
          message_type: "text"
        });

      if (error) throw error;

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        booking_id: bookingId || "",
        sender_id: user.id,
        receiver_id: chatUser.id,
        message_text: messageText,
        message_type: "text",
        is_read: false,
        created_at: new Date().toISOString(),
        sender_profile: {
          display_name: "You",
          avatar_url: ""
        }
      };

      setMessages(prev => [...prev, optimisticMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      // Send typing indicator to other user
      broadcastTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 1000);
  };

  const broadcastTyping = async (typing: boolean) => {
    // In a real implementation, you'd broadcast typing status
    // For now, we'll just simulate it
  };

  const setupRealtimeSubscription = () => {
    if (!user || !bookingId) return;

    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== user.id) {
            setMessages(prev => [...prev, newMessage]);
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ["😊", "👍", "❤️", "😂", "🙏", "👌", "🔥", "💯"];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onClose}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          💬
          {chatUser?.unreadCount && chatUser.unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 flex items-center justify-center">
              {chatUser.unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[500px] w-full max-w-md mx-auto shadow-xl">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {chatUser && (
              <>
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={chatUser.avatar} />
                    <AvatarFallback>{chatUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {chatUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{chatUser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {chatUser.isOnline ? "Online" : `Last seen ${chatUser.lastSeen}`}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View booking details</DropdownMenuItem>
                <DropdownMenuItem>Block user</DropdownMenuItem>
                <DropdownMenuItem>Report issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end space-x-2 max-w-[80%]">
                  {message.sender_id !== user?.id && (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={message.sender_profile?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {message.sender_profile?.display_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-xs break-words ${
                      message.sender_id === user?.id
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{message.message_text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {otherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none pr-20"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-6 w-6 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim()}
            size="sm"
            className="h-10 w-10 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 bg-background border rounded-lg shadow-lg p-3 z-50">
            <div className="grid grid-cols-4 gap-2">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => addEmoji(emoji)}
                  className="h-8 w-8 p-0 text-lg"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RealTimeChatSystem;