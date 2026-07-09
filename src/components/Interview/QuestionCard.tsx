import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { InterviewQuestion } from '../../data/courseData';

interface Props {
  question: InterviewQuestion & { difficulty?: string; tags?: string[] };
  index: number;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
  canEdit: boolean;
}

const colorFor = (d?: string) => {
  if (!d) return 'default';
  if (d.toLowerCase() === 'easy') return 'success';
  if (d.toLowerCase() === 'hard') return 'error';
  return 'warning';
};

export default function QuestionCard({ question, index, onEdit, onDelete, canEdit }: Props) {
  return (
    <Card sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Q{index + 1}. {question.q}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{question.a}</Typography>
            {question.tags && question.tags.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {question.tags.map((t) => <Chip key={t} label={t} size="small" />)}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip label={question.difficulty ?? 'Medium'} color={colorFor(question.difficulty)} size="small" />
            <Box>
              <IconButton size="small" onClick={() => onEdit(index)} disabled={!canEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(index)} disabled={!canEdit}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
