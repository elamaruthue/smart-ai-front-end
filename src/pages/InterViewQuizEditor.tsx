import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert, Chip, CircularProgress,
  MenuItem, Select, InputLabel, FormControl as MuiFormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchinterViewData, saveCourseSection } from '../store/slices/interviewDataSlice';
import CategoryTabs from '../components/Interview/CategoryTabs';
import QuestionCard from '../components/Interview/QuestionCard';
import QuestionForm from '../components/Interview/QuestionForm';
import type { InterviewQuestion, PathData } from '../data/courseData';

export default function InterViewQuizEditor() {
  const dispatch = useAppDispatch();
  const interView = useAppSelector((s) => s.interViewData);
  const course    = useAppSelector((s) => s.courseData);
  const user      = useAppSelector((s) => s.auth.user);

  const paths: PathData[] = (interView?.paths ?? course?.paths) ?? [];
  const interviewSections = interView?.interviewQuestions ?? course?.interviewQuestions ?? {};
  const loading = interView?.loading ?? course?.loading ?? false;
  const saving  = interView?.saving ?? course?.saving ?? false;

  const pathIds = useMemo(() => paths.map((p) => p.id), [paths]);
  const [selectedPath, setSelectedPath] = useState<string>(pathIds[0] ?? '');
  console.log('selectedPath', selectedPath);
  
  const categories = useMemo(() => Object.keys(interviewSections[selectedPath] ?? {}), [interviewSections, selectedPath]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] ?? '');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<InterviewQuestion | undefined>(undefined);

  const role = user?.role ?? 'user';
  const canEdit = role === 'superuser' || role === 'admin';

  useEffect(() => {
    if (!selectedPath && pathIds.length > 0) setSelectedPath(pathIds[0]);
  }, [pathIds, selectedPath]);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0]);
  }, [categories, selectedCategory]);

  const questions: InterviewQuestion[] = (interviewSections[selectedPath] ?? {})[selectedCategory] ?? [];

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const openAdd = () => {
    setEditingIdx(null);
    setEditingItem(undefined);
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingItem(questions[idx]);
    setDialogOpen(true);
  };

  const persist = async (newArr: InterviewQuestion[]) => {
    try {
      const updated = {
        ...interviewSections,
        [selectedPath]: {
          ...(interviewSections[selectedPath] ?? {}),
          [selectedCategory]: newArr,
        },
      };
      const result = await dispatch(saveCourseSection({ section: 'interviewQuestions', data: updated }));
      if (saveCourseSection.fulfilled.match(result)) {
        setSuccessMsg('Saved successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg('Save failed');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleSave = async (payload: InterviewQuestion & { difficulty?: string; tags?: string[] }) => {
    if (!selectedPath || !selectedCategory) return;
    const arr = [...questions];
    if (editingIdx === null) {
      arr.push(payload);
    } else {
      arr[editingIdx] = payload;
    }
    await persist(arr);
    setDialogOpen(false);
  };

  const handleDelete = (idx: number) => persist(questions.filter((_, i) => i !== idx));

  const handleReload = () => {
    dispatch(fetchinterViewData());
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Interview Prep Editor</Typography>
        <Chip label={role.toUpperCase()} size="small" sx={{ fontWeight: 700, bgcolor: role === 'superuser' ? 'error.main' : 'warning.main', color: '#fff' }} />
      </Box>

      {!canEdit && <Alert severity="warning" sx={{ mb: 2 }}>Read-only access — only admin / superuser can save changes.</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <MuiFormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Learning Path</InputLabel>
            <Select value={selectedPath} label="Learning Path" onChange={(e) => { setSelectedPath(e.target.value); setSelectedCategory(''); }}>
              {paths.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.icon} {p.title}</MenuItem>
              ))}
            </Select>
          </MuiFormControl>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReload} disabled={loading}>
            {loading ? <CircularProgress size={16} /> : 'Reload'}
          </Button>

          <Box sx={{ flex: 1 }} />

          {canEdit && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
              Add Question
            </Button>
          )}
        </CardContent>
      </Card>

      <CategoryTabs categories={categories} value={selectedCategory} onChange={(c) => setSelectedCategory(c)} />

      {(!selectedPath || categories.length === 0) && (
        <Alert severity="info">No categories found for the selected path.</Alert>
      )}

      {questions.map((q, i) => (
        <QuestionCard key={i} question={q as any} index={i} onEdit={openEdit} onDelete={handleDelete} canEdit={canEdit} />
      ))}

      <QuestionForm open={dialogOpen} initial={editingItem as any} onSave={handleSave} onCancel={() => setDialogOpen(false)} saving={saving} />
    </Box>
  );
}
