import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RideChat({ rideId }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/ride_chats/${rideId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load messages");
        const data = await response.json();
        const messagesWithNames = data.map((msg) => ({
          ...msg,
          sender_name: msg.user_id === user?.id ? "You" : "Rider",
        }));
        setMessages(messagesWithNames);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        setLoading(false);
      }
    };

    if (user) {
      fetchMessages();
    }
  }, [rideId, user]);

  // Real-time subscription (if needed, use socket/polling here)

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch(`${API_URL}/ride_chats`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ride_id: rideId,
          user_id: user.id,
          type: "text",
          content: newMessage,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const savedMessage = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          ...savedMessage,
          sender_name: savedMessage.user_id === user.id ? "You" : "Rider",
        },
      ]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        handleUploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      toast.success("Recording started - hold to record, release to send");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  };

  const handleUploadAudio = async (audioBlob) => {
    if (!user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      formData.append("rideId", rideId);
      formData.append("userId", user.id);

      const response = await fetch(`${API_URL}/api/chat/upload-audio`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      toast.success("Audio sent!");
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ride Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to access chat.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle>Ride Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id || msg.id}
                    className={`flex ${
                      msg.user_id === user.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.user_id === user.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.type === "text" ? (
                        <>
                          <p className="text-xs opacity-75 mb-1">{msg.sender_name}</p>
                          <p className="text-sm">{msg.content}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs opacity-75 mb-2">{msg.sender_name}</p>
                          <audio
                            src={msg.audio_url || ""}
                            controls
                            className="max-w-xs h-8"
                          />
                        </>
                      )}
                      <p className="text-xs opacity-50 mt-2">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={recording || uploading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || recording || uploading}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={uploading}
                variant={recording ? "default" : "outline"}
                className={recording ? "animate-pulse" : ""}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : recording ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
