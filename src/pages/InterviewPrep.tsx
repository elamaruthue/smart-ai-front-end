import { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Chip,
} from '@mui/material';
import * as Accordion from '@radix-ui/react-accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';

export default function InterviewPrep() {
  const { selectedPath }       = useProgress();
  const { interviewQuestions } = useCourseData();
  const pathId  = selectedPath ?? 'data-analytics';
  const pathQs  = interviewQuestions[pathId] ?? {};
  const tabs    = Object.keys(pathQs);
  const [tab, setTab] = useState(0);

  const currentTopic = tabs[tab] ?? '';
  const questions    = pathQs[currentTopic] ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" fontWeight={800}>Interview Prep 💬</Typography>
        <Chip
          label={pathId === 'data-analytics' ? 'Data Analytics' : 'Data Science'}
          sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }}
        />
      </Box>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Common interview questions for your learning path
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700 } }}
        variant="scrollable" scrollButtons="auto"
      >
        {tabs.map((t) => <Tab key={t} label={t} />)}
      </Tabs>

      {/* Radix Accordion */}
      <Accordion.Root type="multiple" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {questions.map((item, i) => (
          <Accordion.Item
            key={i}
            value={`item-${i}`}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <Accordion.Header>
              <Accordion.Trigger
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: '#1e293b', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 24, height: 24, borderRadius: '50%',
                      bgcolor: '#eef2ff', color: '#4f46e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </Box>
                  {item.q}
                </Box>
                <ExpandMoreIcon sx={{ color: '#64748b', flexShrink: 0 }} />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              style={{
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2.5, py: 2,
                  bgcolor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: 14, color: '#475569', lineHeight: 1.7,
                }}
              >
                💡 {item.a}
              </Box>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Box>
  );
}
