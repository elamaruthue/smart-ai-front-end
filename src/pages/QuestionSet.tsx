import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, FormHelperText,
  RadioGroup, Radio, FormControlLabel, Chip, Alert, Divider,
  IconButton, Tooltip, Collapse, CircularProgress, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useCourseData } from "../hooks/useCourseData";
import { getQuestions, createQuestion, deleteQuestion, updateQuestion } from "../api/questions";
import type { Question, QuestionPayload } from "../api/questions";

const ANSWER_OPTIONS = ["A", "B", "C", "D"] as const;
type AnswerKey = (typeof ANSWER_OPTIONS)[number];

const OPTION_LABELS: Record<AnswerKey, keyof QuestionPayload> = {
  A: "option_a", B: "option_b", C: "option_c", D: "option_d",
};

const emptyForm = (): QuestionPayload => ({
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
  const [formOpen, setFormOpen]       = useState(true);
  const [form, setForm]               = useState<QuestionPayload>(emptyForm());
  const [errors, setErrors]           = useState<Partial<Record<keyof QuestionPayload, string>>>({});
  const [editId, setEditId]           = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Question | null>(null);
  const [filterSkill, setFilterSkill] = useState("");

  useEffect(() => {
    getQuestions()
      .then(setQuestions)
      .catch(() => setApiError("Failed to load questions. Make sure you are connected to the server."))
      .finally(() => setLoading(false));
  }, []);

  const validate = (): boolean => {
    const e: Partial<Record<keyof QuestionPayload, string>> = {};
    if (form.skill.length === 0)        e.skill    = 'Skill is required';
    if (!form.day || form.day < 1)     e.day      = 'Day must be >= 1';
    if (form.question.trim().length === 0) e.question = 'Question text is required';
    if (form.option_a.trim().length === 0) e.option_a = 'Option A is required';
    if (form.option_b.trim().length === 0) e.option_b = 'Option B is required';
    if (form.option_c.trim().length === 0) e.option_c = 'Option C is required';
    if (form.option_d.trim().length === 0) e.option_d = 'Option D is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (validate() === false) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateQuestion(editId, form);
        setQuestions((prev) => prev.map((q) => (q._id === editId ? updated : q)));
        setSnack("Question updated successfully");
        setEditId(null);
      } else {
        const created = await createQuestion(form);
        setQuestions((prev) => [...prev, created]);
        setSnack("Question created successfully");
      }
      setForm(emptyForm());
      setErrors({});
    } catch {
      setApiError("Failed to save question. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q: Question) => {
    setForm({
      skill: q.skill, day: q.day, question: q.question,
      option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d,
      answer: q.answer, explanation: q.explanation ?? "",
    });
    setEditId(q._id);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(emptyForm());
    setErrors({});
  };

  const handleDelete = async () => {
    if (deleteDialog === null) return;
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

  const setField = (key: keyof QuestionPayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const filtered = filterSkill ? questions.filter((q) => q.skill === filterSkill) : questions;
  const grouped = filtered.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.skill]) acc[q.skill] = [];
    acc[q.skill].push(q);
    return acc;
  }, {});

  return (
    <Box>
      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg,#dc2626,#f97316)", borderRadius: 3, p: 3, mb: 3, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Question Set Manager</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Create and manage quiz questions — Superuser / Admin only</Typography>
        </Box>
        <Chip label={questions.length + " Questions"} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 14 }} />
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>{apiError}</Alert>}

      {/* Form */}
      <Card sx={{ mb: 3, borderRadius: 3, border: editId ? "2px solid #f59e0b" : "2px solid #e0e7ff" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: formOpen ? 2 : 0, cursor: "pointer" }} onClick={() => setFormOpen((p) => !p)}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: editId ? "#d97706" : "#4f46e5" }}>
              {editId ? "Edit Question" : "Add New Question"}
            </Typography>
            <IconButton size="small">{formOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
          </Box>

          <Collapse in={formOpen}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 2, mb: 2 }}>
              <FormControl error={!!errors.skill} fullWidth>
                <InputLabel>Skill *</InputLabel>
                <Select label="Skill *" value={form.skill} onChange={(e) => setField("skill", e.target.value as string)}>
                  {skillKeys.map((sk) => <MenuItem key={sk} value={sk}>{sk}</MenuItem>)}
                </Select>
                {errors.skill && <FormHelperText>{errors.skill}</FormHelperText>}
              </FormControl>
              <TextField label="Day *" type="number" slotProps={{ htmlInput: { min: 1 } }} value={form.day}
                onChange={(e) => setField("day", Number(e.target.value))}
                error={!!errors.day} helperText={errors.day} />
            </Box>

            <TextField label="Question *" fullWidth multiline minRows={2} sx={{ mb: 2 }}
              value={form.question} onChange={(e) => setField("question", e.target.value)}
              error={!!errors.question} helperText={errors.question} />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
              {ANSWER_OPTIONS.map((letter) => {
                const fkey = OPTION_LABELS[letter];
                return (
                  <TextField key={letter} label={"Option " + letter + " *"} fullWidth
                    value={form[fkey] as string}
                    onChange={(e) => setField(fkey, e.target.value)}
                    error={!!errors[fkey]} helperText={errors[fkey]}
                    slotProps={{ input: { startAdornment: (
                      <Chip label={letter} size="small" sx={{ mr: 1, minWidth: 24, bgcolor: form.answer === letter ? "#4f46e5" : "#eef2ff", color: form.answer === letter ? "#fff" : "#4f46e5", fontWeight: 700 }} />
                    )}}}
                  />
                );
              })}
            </Box>

            <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f3ff", borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "#4f46e5" }}>Correct Answer</Typography>
              <FormControl component="fieldset">
                <RadioGroup row value={form.answer} onChange={(e) => setField("answer", e.target.value)}>
                  {ANSWER_OPTIONS.map((letter) => (
                    <FormControlLabel key={letter} value={letter}
                      control={<Radio sx={{ "&.Mui-checked": { color: "#4f46e5" } }} />}
                      label={<Typography sx={{ fontWeight: form.answer === letter ? 700 : 400 }}>{letter}</Typography>}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <TextField label="Explanation (optional)" fullWidth multiline minRows={2} sx={{ mb: 2 }}
              value={form.explanation} onChange={(e) => setField("explanation", e.target.value)} />

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddCircleOutlineIcon />}
                onClick={handleSubmit}
                sx={{ bgcolor: editId ? "#d97706" : "#4f46e5", "&:hover": { bgcolor: editId ? "#b45309" : "#4338ca" }, fontWeight: 700 }}>
                {saving ? "Saving..." : editId ? "Update Question" : "Save Question"}
              </Button>
              {editId && <Button variant="outlined" onClick={handleCancelEdit}>Cancel</Button>}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* List */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>All Questions</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Skill</InputLabel>
          <Select label="Filter by Skill" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
            <MenuItem value="">All Skills</MenuItem>
            {skillKeys.map((sk) => <MenuItem key={sk} value={sk}>{sk}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress sx={{ color: "#4f46e5" }} /><Typography sx={{ mt: 2 }} color="text.secondary">Loading questions...</Typography></Box>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No questions yet. Use the form above to add the first question.</Alert>
      ) : (
        Object.entries(grouped).map(([skill, qs]) => (
          <Box key={skill} sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#4f46e5" }}>{skills[skill]?.icon ?? ""} {skill}</Typography>
              <Chip label={qs.length + " questions"} size="small" sx={{ bgcolor: "#eef2ff", color: "#4f46e5" }} />
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 3, border: "1px solid #e0e7ff" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f3ff" }}>
                    <TableCell sx={{ fontWeight: 700, width: 50 }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Question</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>A</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>B</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>C</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>D</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 70 }}>Answer</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 80 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qs.map((q) => (
                    <TableRow key={q._id} hover sx={{ "&:last-child td": { border: 0 } }}>
                      <TableCell><Chip label={"D" + q.day} size="small" sx={{ bgcolor: "#e0e7ff", color: "#3730a3", fontWeight: 700 }} /></TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{q.question}</Typography>
                        {q.explanation && <Typography sx={{ fontSize: 11, color: "#6b7280", mt: 0.5 }}>💡 {q.explanation}</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{q.option_a}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{q.option_b}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{q.option_c}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{q.option_d}</TableCell>
                      <TableCell><Chip label={q.answer} size="small" sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 800 }} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(q)} sx={{ color: "#4f46e5" }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog(q)} sx={{ color: "#ef4444" }}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}

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
