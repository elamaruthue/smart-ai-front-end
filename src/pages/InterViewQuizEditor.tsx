import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchinterViewData, saveCourseSection } from '../store/slices/interviewDataSlice';

type Section = 'paths' | 'skills' | 'quizBank' | 'interviewQuestions' | 'mockTestQuestions';

const SECTION_LABELS: Record<Section, string> = {
  paths:               'Learning Paths',
  skills:              'Skills & Days',
  quizBank:            'Quiz Bank',
  interviewQuestions:  'Interview Questions',
  mockTestQuestions:   'Mock Test Questions',
};

export default function InterViewQuizEditor() {
  const dispatch = useAppDispatch();
  const interViewData = useAppSelector((s) => s.interViewData);
  const user       = useAppSelector((s) => s.auth.user);

  const [section,  setSection]  = useState<Section>('paths');
  const [draft,    setDraft]    = useState('');
  const [editing,  setEditing]  = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);

  const role = user?.role ?? 'user';
  const canEdit = role === 'superuser' || role === 'admin';

  const handleEdit = () => {
    const raw = JSON.stringify(interViewData[section as keyof typeof interViewData], null, 2);
    setDraft(raw);
    setJsonError(null);
    setSaved(false);
    setEditing(true);
  };

  const handleSave = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError((e as Error).message);
      return;
    }

    const result = await dispatch(saveCourseSection({ section, data: parsed }));
    if (saveCourseSection.fulfilled.match(result)) {
      setSaved(true);
      setEditing(false);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchinterViewData());
    setEditing(false);
    setSaved(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Course Editor 🎓</Typography>
        <Chip
          label={role.toUpperCase()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: role === 'superuser' ? 'error.main' : 'warning.main',
            color: '#fff',
          }}
        />
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and edit course content. Changes are saved to the database and served to all users.
      </Typography>

      {!canEdit && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You have read-only access. Only <strong>admin</strong> and <strong>superuser</strong> accounts can save changes.
        </Alert>
      )}

      {/* Section selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={section}
              label="Section"
              onChange={(e) => { setSection(e.target.value as Section); setEditing(false); setSaved(false); }}
            >
              {(Object.keys(SECTION_LABELS) as Section[]).map((s) => (
                <MenuItem key={s} value={s}>{SECTION_LABELS[s]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={interViewData.loading}
          >
            {interViewData.loading ? <CircularProgress size={16} /> : 'Reload from DB'}
          </Button>

          {canEdit && !editing && (
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={interViewData.saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={interViewData.saving}
              >
                Save to DB
              </Button>
              <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status messages */}
      {saved     && <Alert severity="success" sx={{ mb: 2 }}>Section saved successfully!</Alert>}
      {interViewData.error && <Alert severity="error" sx={{ mb: 2 }}>{interViewData.error}</Alert>}
      {jsonError && <Alert severity="error" sx={{ mb: 2 }}>Invalid JSON: {jsonError}</Alert>}

      {/* JSON editor / viewer */}
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box
            sx={{
              px: 2, py: 1,
              bgcolor: 'grey.100',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
              {SECTION_LABELS[section]}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {editing ? 'Editing — JSON must be valid before saving' : 'Read-only view'}
            </Typography>
          </Box>

          <Box
            component="textarea"
            value={editing ? draft : JSON.stringify(interViewData[section as keyof typeof interViewData], null, 2)}
            onChange={(e) => setDraft(e.target.value)}
            readOnly={!editing}
            spellCheck={false}
            sx={{
              width: '100%',
              minHeight: 520,
              p: 2,
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
              fontSize: 12,
              lineHeight: 1.6,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              bgcolor: editing ? '#1e1b4b0a' : 'transparent',
              color: 'text.primary',
              boxSizing: 'border-box',
              cursor: editing ? 'text' : 'default',
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
