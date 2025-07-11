import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: any;
}

interface Conversation {
  booking_id: string;
  other_user: any;
  last_message: Message;
  unread_count: number;
  booking_details: any;
}

interface MessageCenterProps {
  selectedBookingId?: string;
  onBack?: () => void;
}

const MessageCenter = ({ selectedBookingId, onBack }: MessageCenterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(selectedBookingId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;

    const { data: bookings } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_id,
        provider_id,
        service_id,
        booking_date,
        status,
        services(title),
        customer:profiles!bookings_customer_id_fkey(full_name, avatar_url),
        provider:profiles!fk_bookings_provider(full_name, avatar_url)
      `)
      .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (bookings) {
      const conversationsData: Conversation[] = [];
      
      for (const booking of bookings) {
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("*, sender_profile:profiles!messages_sender_id_fkey(full_name)")
          .eq("booking_id", booking.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("booking_id", booking.id)
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        const otherUser = user.id === booking.customer_id ? booking.provider : booking.customer;

        conversationsData.push({
          booking_id: booking.id,
          other_user: otherUser,
          last_message: lastMessage?.[0],
          unread_count: unreadCount || 0,
          booking_details: booking
        });
      }

      setConversations(conversationsData);
    }
  };

  const fetchMessages = async (bookingId: string) => {
    const { data } = await supabase
      .from("messages")
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(full_name, avatar_url)
      `)
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const markMessagesAsRead = async (bookingId: string) => {
    if (!user) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("booking_id", bookingId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setIsLoading(true);

    const conversation = conversations.find(c => c.booking_id === selectedConversation);
    if (!conversation) return;

    const receiverId = user.id === conversation.booking_details.customer_id 
      ? conversation.booking_details.provider_id 
      : conversation.booking_details.customer_id;

    const { error } = await supabase
      .from("messages")
      .insert({
        booking_id: selectedConversation,
        sender_id: user.id,
        receiver_id: receiverId,
        message_text: newMessage,
        message_type: "text"
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage("");
      fetchMessages(selectedConversation);
      fetchConversations(); // Refresh to update last message
    }

    setIsLoading(false);
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.booking_id === selectedConversation) {
            fetchMessages(selectedConversation);
            markMessagesAsRead(selectedConversation);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (!user) return null;

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className={`w-80 border-r ${selectedConversation ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {conversations.map((conversation) => (
            <div
              key={conversation.booking_id}
              className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${
                selectedConversation === conversation.booking_id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedConversation(conversation.booking_id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={conversation.other_user?.avatar_url} />
                  <AvatarFallback>
                    {conversation.other_user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">
                      {conversation.other_user?.full_name || "Unknown User"}
                    </p>
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.booking_details.services?.title}
                  </p>
                  {conversation.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {conversation.last_message.message_text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => {
                    setSelectedConversation(null);
                    onBack?.();
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {(() => {
                  const conversation = conversations.find(c => c.booking_id === selectedConversation);
                  return (
                    <>
                      <Avatar>
                        <AvatarImage src={conversation?.other_user?.avatar_url} />
                        <AvatarFallback>
                          {conversation?.other_user?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {conversation?.other_user?.full_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {conversation?.booking_details.services?.title}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-2">
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
                    <DropdownMenuItem>Report issue</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.message_text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;