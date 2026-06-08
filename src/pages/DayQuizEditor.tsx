import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert,
  MenuItem, Select, InputLabel, FormControl as MuiFormControl,
  CircularProgress, TextField, Radio, RadioGroup,
  FormControlLabel, Chip, IconButton,
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import DeleteIcon     from '@mui/icons-material/Delete';
import SaveIcon       from '@mui/icons-material/Save';
import EditIcon       from '@mui/icons-material/Edit';
import RefreshIcon    from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveCourseSection, fetchCourseData } from '../store/slices/courseDataSlice';
import type { QuizQuestion, SkillData, DayData } from '../data/courseData';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionForm {
  q: string;
  options: [string, string, string, string];
  answer: number;
}

const emptyForm = (): QuestionForm => ({ q: '', options: ['', '', '', ''], answer: 0 });

// ─── Inline form ──────────────────────────────────────────────────────────────
interface FormProps {
  form: QuestionForm;
  onChange: (field: keyof QuestionForm, value: unknown) => void;
  onOptionChange: (idx: number, val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

function QuestionFormFields({ form, onChange, onOptionChange, onSave, onCancel, saving }: FormProps) {
  return (
    <Box>
      <TextField
        fullWidth size="small" label="Question text" multiline minRows={2}
        value={form.q}
        onChange={(e) => onChange('q', e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        {form.options.map((opt, i) => (
          <TextField
            key={i} size="small" label={`Option ${LETTERS[i]}`}
            value={opt} onChange={(e) => onOptionChange(i, e.target.value)}
          />
        ))}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.5 }}>Correct Answer</Typography>
        <RadioGroup row value={form.answer} onChange={(e) => onChange('answer', Number(e.target.value))}>
          {LETTERS.map((l, i) => (
            <FormControlLabel key={i} value={i} control={<Radio size="small" />} label={l} />
          ))}
        </RadioGroup>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon />} onClick={onSave} disabled={saving}>
          Save
        </Button>
        <Button variant="outlined" size="small" onClick={onCancel} disabled={saving}>Cancel</Button>
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DayQuizEditor() {
  const dispatch  = useAppDispatch();
  const { skills, loading, saving } = useAppSelector((s) => s.courseData);
  const user      = useAppSelector((s) => s.auth.user);

  const skillNames = Object.keys(skills);

  const [selectedSkill, setSelectedSkill] = useState(skillNames[0] ?? '');
  const [selectedDay,   setSelectedDay]   = useState(1);
  const [addingNew,     setAddingNew]     = useState(false);
  const [editingIdx,    setEditingIdx]    = useState<number | null>(null);
  const [form,          setForm]          = useState<QuestionForm>(emptyForm());
  const [saveOk,        setSaveOk]        = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);

  const role    = user?.role ?? 'user';
  const canEdit = role === 'superuser' || role === 'admin';

  const skillData: SkillData | undefined  = skills[selectedSkill];
  const dayData:   DayData   | undefined  = skillData?.days.find((d) => d.day === selectedDay);
  const dayQuestions: QuizQuestion[]      = dayData?.questions ?? [];

  // ── form helpers ─────────────────────────────────────────────────────────
  const handleFormChange = (field: keyof QuestionForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleOptionChange = (idx: number, val: string) => {
    const opts = [...form.options] as [string, string, string, string];
    opts[idx] = val;
    setForm((prev) => ({ ...prev, options: opts }));
  };

  const validate = (): boolean => {
    if (!form.q.trim())                        { setFormError('Question text is required.'); return false; }
    if (form.options.some((o) => !o.trim()))   { setFormError('All 4 options are required.'); return false; }
    setFormError(null);
    return true;
  };

  // ── persist to DB ─────────────────────────────────────────────────────────
  const persist = async (newQuestions: QuizQuestion[]) => {
    const updatedSkills = {
      ...skills,
      [selectedSkill]: {
        ...skillData!,
        days: skillData!.days.map((d) =>
          d.day === selectedDay ? { ...d, questions: newQuestions } : d
        ),
      },
    };
    const result = await dispatch(saveCourseSection({ section: 'skills', data: updatedSkills }));
    if (saveCourseSection.fulfilled.match(result)) {
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    }
  };

  const handleAdd = async () => {
    if (!validate()) return;
    await persist([...dayQuestions, { q: form.q, options: form.options, answer: form.answer }]);
    setForm(emptyForm());
    setAddingNew(false);
  };

  const handleSaveEdit = async () => {
    if (editingIdx === null || !validate()) return;
    const updated = dayQuestions.map((q, i) =>
      i === editingIdx ? { q: form.q, options: form.options, answer: form.answer } : q
    );
    await persist(updated);
    setEditingIdx(null);
    setForm(emptyForm());
  };

  const handleDelete = (idx: number) =>
    persist(dayQuestions.filter((_, i) => i !== idx));

  const startEdit = (idx: number) => {
    const q = dayQuestions[idx];
    setForm({ q: q.q, options: q.options as [string, string, string, string], answer: q.answer });
    setEditingIdx(idx);
    setAddingNew(false);
    setFormError(null);
  };

  const handleSkillChange = (skill: string) => {
    setSelectedSkill(skill);
    setSelectedDay(1);
    setAddingNew(false);
    setEditingIdx(null);
    setForm(emptyForm());
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Day Quiz Editor 📝</Typography>
        <Chip
          label={role.toUpperCase()} size="small"
          sx={{ fontWeight: 700, bgcolor: role === 'superuser' ? 'error.main' : 'warning.main', color: '#fff' }}
        />
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Assign quiz questions to each skill day. Students see these questions when they click "Take Quiz" on that day.
      </Typography>

      {!canEdit && <Alert severity="warning" sx={{ mb: 3 }}>Read-only access — only admin / superuser can save changes.</Alert>}
      {formError && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
      {saveOk   && <Alert severity="success"  sx={{ mb: 2 }}>Questions saved to database ✓</Alert>}

      {/* Selectors */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <MuiFormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Skill</InputLabel>
            <Select value={selectedSkill} label="Skill" onChange={(e) => handleSkillChange(e.target.value)}>
              {skillNames.map((s) => (
                <MenuItem key={s} value={s}>{skills[s]?.icon} {skills[s]?.title}</MenuItem>
              ))}
            </Select>
          </MuiFormControl>

          <MuiFormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Day</InputLabel>
            <Select
              value={selectedDay} label="Day"
              onChange={(e) => { setSelectedDay(Number(e.target.value)); setAddingNew(false); setEditingIdx(null); setForm(emptyForm()); }}
            >
              {skillData?.days.map((d) => (
                <MenuItem key={d.day} value={d.day}>
                  Day {d.day} — {d.topic.slice(0, 22)}{d.topic.length > 22 ? '…' : ''}
                  {(d.questions?.length ?? 0) > 0 && (
                    <Chip
                      label={`${d.questions!.length}Q`} size="small"
                      sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>

          <Button
            variant="outlined" startIcon={<RefreshIcon />}
            onClick={() => dispatch(fetchCourseData())} disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : 'Reload'}
          </Button>
        </CardContent>
      </Card>

      {/* Day topic summary */}
      {dayData && (
        <Card sx={{ mb: 3, bgcolor: '#eef2ff', border: '1px solid #c7d2fe' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography sx={{ fontWeight: 700 }}>Day {dayData.day}: {dayData.topic}</Typography>
            <Typography variant="body2" color="text.secondary">{dayData.subtopics.join(' · ')}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Question list header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700 }}>
          Questions for Day {selectedDay}
          <Chip
            label={dayQuestions.length} size="small"
            sx={{ ml: 1, fontWeight: 700, bgcolor: '#eef2ff', color: '#4f46e5' }}
          />
        </Typography>
        {canEdit && (
          <Button
            variant="contained" size="small" startIcon={<AddIcon />}
            onClick={() => { setAddingNew(true); setEditingIdx(null); setForm(emptyForm()); setFormError(null); }}
            disabled={addingNew}
          >
            Add Question
          </Button>
        )}
      </Box>

      {dayQuestions.length === 0 && !addingNew && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No questions set for Day {selectedDay}. Click "Add Question" to get started.
        </Alert>
      )}

      {/* Existing questions */}
      {dayQuestions.map((q, idx) => (
        <Card
          key={idx}
          sx={{ mb: 1.5, border: editingIdx === idx ? '2px solid #4f46e5' : '1px solid #e2e8f0' }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {editingIdx === idx ? (
              <QuestionFormFields
                form={form}
                onChange={handleFormChange}
                onOptionChange={handleOptionChange}
                onSave={handleSaveEdit}
                onCancel={() => { setEditingIdx(null); setForm(emptyForm()); setFormError(null); }}
                saving={saving}
              />
            ) : (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, flex: 1 }}>
                    Q{idx + 1}. {q.q}
                  </Typography>
                  {canEdit && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => startEdit(idx)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(idx)} disabled={saving}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mt: 1.5 }}>
                  {q.options.map((opt, i) => (
                    <Box
                      key={i}
                      sx={{
                        px: 1.5, py: 0.75, borderRadius: 1.5, fontSize: 13,
                        bgcolor: i === q.answer ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${i === q.answer ? '#22c55e' : '#e2e8f0'}`,
                        color: i === q.answer ? '#15803d' : '#475569',
                        fontWeight: i === q.answer ? 700 : 400,
                      }}
                    >
                      {LETTERS[i]}. {opt}{i === q.answer ? '  ✓' : ''}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {/* New question form */}
      {addingNew && (
        <Card sx={{ mb: 1.5, border: '2px dashed #4f46e5' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography sx={{ fontWeight: 700, mb: 2, color: '#4f46e5' }}>New Question</Typography>
            <QuestionFormFields
              form={form}
              onChange={handleFormChange}
              onOptionChange={handleOptionChange}
              onSave={handleAdd}
              onCancel={() => { setAddingNew(false); setForm(emptyForm()); setFormError(null); }}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
