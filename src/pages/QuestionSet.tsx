import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, Button, TextField,
  RadioGroup, Radio, FormControl, FormControlLabel, Chip, Alert,
  IconButton, Tooltip, CircularProgress, Snackbar, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCourseData } from "../hooks/useCourseData";
import { getQuestions, createQuestion, deleteQuestion, updateQuestion } from "../api/questions";
import type { Question, QuestionPayload } from "../api/questions";

const ANSWER_OPTIONS = ["A", "B", "C", "D"] as const;
type AnswerKey = (typeof ANSWER_OPTIONS)[number];

type QuestionForm = QuestionPayload;

const OPTION_LABELS: Record<AnswerKey, keyof QuestionPayload> = {
  A: "option_a", B: "option_b", C: "option_c", D: "option_d",
};

const emptyForm = (): QuestionForm => ({
  skill: "",
  day: 1,
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  answer: "A",
  explanation: "",
});

export default function QuestionSet() {
  const { skills } = useCourseData();
  const skillKeys = useMemo(() => Object.keys(skills), [skills]);

    const [questions, setQuestions]     = useState<Question[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [apiError, setApiError]       = useState("");
  const [snack, setSnack]             = useState("");
  const [form, setForm]               = useState<QuestionForm>(emptyForm());
  const [errors, setErrors]           = useState<Partial<Record<keyof QuestionPayload, string>>>({});
  const [editId, setEditId]           = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Question | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>(skillKeys[0] ?? "");

  useEffect(() => {
    getQuestions()
      .then(setQuestions)
      .catch(() => setApiError("Failed to load questions. Make sure you are connected to the server."))
      .finally(() => setLoading(false));
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);

  const grouped = useMemo(() => {
    return questions.reduce<Record<string, Question[]>>((acc, q) => {
      if (!acc[q.skill]) acc[q.skill] = [];
      acc[q.skill].push(q);
      return acc;
    }, {});
  }, [questions]);

  const skillTabs = useMemo(() => (skillKeys.length ? skillKeys : ["General"]), [skillKeys]);
  const selectedQuestions = grouped[selectedSkill] ?? [];

  const validate = (): boolean => {
    const e: Partial<Record<keyof QuestionPayload, string>> = {};
    if (form.skill.length === 0) e.skill = "Skill is required";
    if (!form.day || form.day < 1) e.day = "Day must be >= 1";
    if (form.question.trim().length === 0) e.question = "Question text is required";
    if (form.option_a.trim().length === 0) e.option_a = "Option A is required";
    if (form.option_b.trim().length === 0) e.option_b = "Option B is required";
    if (form.option_c.trim().length === 0) e.option_c = "Option C is required";
    if (form.option_d.trim().length === 0) e.option_d = "Option D is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm(emptyForm());
    setErrors({});
    setEditId(null);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm(), skill: selectedSkill || skillTabs[0] || "", day: 1 });
    setErrors({});
    setDialogOpen(true);
  };

  const handleEdit = (q: Question) => {
    setForm({
      skill: q.skill,
      day: q.day,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      answer: q.answer,
      explanation: q.explanation ?? "",
    });
    setEditId(q._id);
    setSelectedSkill(q.skill);
    setDialogOpen(true);
  };

  const handleCancelEdit = () => {
    resetForm();
    setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, skill: form.skill || selectedSkill };
      if (editId) {
        const updated = await updateQuestion(editId, payload);
        setQuestions((prev) => prev.map((q) => (q._id === editId ? updated : q)));
        setSnack("Question updated successfully");
      } else {
        const created = await createQuestion(payload);
        setQuestions((prev) => [...prev, created]);
        setSnack("Question created successfully");
      }
      resetForm();
      setDialogOpen(false);
    } catch {
      setApiError("Failed to save question. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await deleteQuestion(deleteDialog._id);
      setQuestions((prev) => prev.filter((q) => q._id !== deleteDialog._id));
      setSnack("Question deleted");
    } catch {
      setApiError("Failed to delete question.");
    } finally {
      setDeleteDialog(null);
    }
  };

  const setField = (key: keyof QuestionForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  useEffect(() => {
    if (!selectedSkill && skillTabs.length > 0) {
      setSelectedSkill(skillTabs[0]);
    }
  }, [selectedSkill, skillTabs]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg,#dc2626,#f97316)", borderRadius: 3, p: 3, mb: 3, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Mock Test Question Manager</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Manage daily mock test items with the same editor experience.</Typography>
        </Box>
        <Chip label={questions.length + " Questions"} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 14 }} />
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>{apiError}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tabs value={selectedSkill} onChange={(_, value) => setSelectedSkill(value)} variant="scrollable" scrollButtons="auto" sx={{ minWidth: 320 }}>
            {skillTabs.map((skill) => (
              <Tab key={skill} label={skill} value={skill} />
            ))}
          </Tabs>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setApiError(""); setLoading(true); getQuestions().then(setQuestions).catch(() => setApiError("Failed to reload questions.")).finally(() => setLoading(false)); }} disabled={loading}>
            {loading ? <CircularProgress size={16} /> : 'Reload'}
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={openAdd}>
            Add Question
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress sx={{ color: '#4f46e5' }} /><Typography sx={{ mt: 2 }} color="text.secondary">Loading questions...</Typography></Box>
      ) : selectedQuestions.length === 0 ? (
        <Alert severity="info">No questions for {selectedSkill} yet.</Alert>
      ) : (
        selectedQuestions.map((q) => (
          <Card key={q._id} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label={`Day ${q.day}`} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{q.question}</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 2 }}>
                    {ANSWER_OPTIONS.map((letter) => {
                      const field = OPTION_LABELS[letter];
                      const optionText = q[field] as string;
                      return (
                        <Box key={letter} sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: letter === q.answer ? '#f0fdf4' : '#f8fafc', border: `1px solid ${letter === q.answer ? '#22c55e' : '#e2e8f0'}`, color: letter === q.answer ? '#166534' : '#475569' }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{letter}. {optionText}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  {q.explanation && <Typography sx={{ mt: 2, fontSize: 13, color: '#475569' }}>💡 {q.explanation}</Typography>}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(q)} sx={{ color: '#4f46e5' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog(q)} sx={{ color: '#ef4444' }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={dialogOpen} onClose={handleCancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth size="small" label="Question text" multiline minRows={2}
            value={form.question}
            onChange={(e) => setField('question', e.target.value)}
            error={!!errors.question}
            helperText={errors.question}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <TextField
              label="Day *"
              type="number"
              value={form.day}
              onChange={(e) => setField('day', Math.max(1, Number(e.target.value) || 1))}
              error={!!errors.day}
              helperText={errors.day}
            />
            <TextField
              label="Skill"
              value={selectedSkill}
              disabled
              fullWidth
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            {ANSWER_OPTIONS.map((letter) => {
              const field = OPTION_LABELS[letter];
              return (
                <TextField
                  key={letter}
                  size="small"
                  label={`Option ${letter}`}
                  value={form[field] as string}
                  onChange={(e) => setField(field, e.target.value)}
                  error={!!errors[field]}
                  helperText={errors[field]}
                />
              );
            })}
          </Box>
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f3ff', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#4f46e5' }}>Correct Answer</Typography>
            <FormControl component="fieldset">
              <RadioGroup row value={form.answer} onChange={(e) => setField('answer', e.target.value)}>
                {ANSWER_OPTIONS.map((letter) => (
                  <FormControlLabel
                    key={letter}
                    value={letter}
                    control={<Radio sx={{ '&.Mui-checked': { color: '#4f46e5' } }} />}
                    label={<Typography sx={{ fontWeight: form.answer === letter ? 700 : 400 }}>{letter}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Explanation (optional)"
            value={form.explanation}
            onChange={(e) => setField('explanation', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}>
            {editId ? 'Update Question' : 'Save Question'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Question?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question? This cannot be undone.</Typography>
          {deleteDialog && <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "#fef2f2", borderRadius: 2, fontSize: 13, color: "#991b1b" }}>{deleteDialog.question}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}
