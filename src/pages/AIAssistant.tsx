import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import {
  Box, Typography, Card, TextField,
  IconButton, Chip, Avatar, Divider, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BACKEND_URL = '';   // Vite proxy forwards /api/* → http://localhost:4000

const QUICK_PROMPTS = [
  'Explain Pandas groupby with example',
  'Give me a SQL JOIN example',
  'What is Overfitting in ML?',
  'Show Python list comprehension',
  'Explain VLOOKUP in Excel',
];

// ─── Render message: split code blocks out of text ───────────────────────────
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <Box
              key={i}
              component="pre"
              sx={{
                mt: 1, p: 1.5, bgcolor: '#0f172a', color: '#e2e8f0',
                borderRadius: 1.5, fontSize: 12, overflowX: 'auto',
                fontFamily: '"Courier New", monospace', lineHeight: 1.6,
                whiteSpace: 'pre-wrap', margin: '8px 0 0',
              }}
            >
              {lines}
            </Box>
          );
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
      })}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Study Assistant 🤖 Ask me anything about Data Analytics, Data Science, Python, SQL, or ML!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const updatedHistory: Message[] = [...messages, userMessage];

    setMessages(updatedHistory);
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          if (data === '[DONE]') {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: accumulated },
            ]);
            setStreamingText('');
            setLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(data) as { delta?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              accumulated += parsed.delta;
              setStreamingText(accumulated);
            }
          } catch {
            // skip malformed SSE line
          }
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not reach backend.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${message}\n\nMake sure the backend is running:\n\`\`\`bash\ncd smartprep-ai/backend && npm run dev\n\`\`\``,
        },
      ]);
      setStreamingText('');
      setLoading(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // All messages to render (including the in-progress stream)
  const displayMessages: Message[] = loading
    ? [...messages, { role: 'assistant', content: streamingText }]
    : messages;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={0.5}>
        AI Assistant 🤖
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Powered by OpenAI GPT-4o-mini · Ask anything about data, code &amp; concepts
      </Typography>

      <Card sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            px: 2.5, py: 1.5, display: 'flex', alignItems: 'center',
            gap: 1.5, borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)' }}>
            <SmartToyIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize={14}>SmartPrep AI</Typography>
            <Typography variant="caption" color={loading ? 'warning.main' : 'success.main'}>
              {loading ? '● Typing…' : '● Online'}
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1, overflowY: 'auto', p: 2.5,
            display: 'flex', flexDirection: 'column', gap: 1.5,
          }}
        >
          {displayMessages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <Avatar
                  sx={{
                    width: 30, height: 30, mr: 1, flexShrink: 0,
                    background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}

              <Box sx={{ maxWidth: '78%' }}>
                <Box
                  sx={{
                    p: '10px 14px',
                    borderRadius:
                      msg.role === 'user'
                        ? '14px 14px 4px 14px'
                        : '14px 14px 14px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                        : '#f8fafc',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                    fontSize: 14, lineHeight: 1.6,
                  }}
                >
                  {msg.content === '' && loading ? (
                    <CircularProgress size={14} thickness={5} />
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </Box>
              </Box>

              {msg.role === 'user' && (
                <Avatar
                  sx={{
                    width: 30, height: 30, ml: 1,
                    bgcolor: 'primary.light', flexShrink: 0,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}
            </Box>
          ))}
          <div ref={bottomRef} />
        </Box>

        <Divider />

        {/* Quick prompts */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.map((p) => (
            <Chip
              key={p} label={p} size="small" clickable
              onClick={() => sendMessage(p)}
              disabled={loading}
              sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, fontSize: 11 }}
            />
          ))}
        </Box>

        {/* Input */}
        <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth size="small" placeholder="Ask me anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 30 } }}
          />
          <IconButton
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            sx={{
              bgcolor: 'primary.main', color: '#fff', width: 40, height: 40,
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            }}
          >
            {loading ? <CircularProgress size={18} sx={{ color: '#94a3b8' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
}
