import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import QuizIcon from '@mui/icons-material/Quiz';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';
import { infoBoxSx, dayBubbleSx } from '../styles/common';

export default function DayLearning() {
  const { selectedSkill, currentDay, setCurrentDay, syncDayComplete, getCompletedDays, getUnlockedDay } = useProgress();
  const { skills } = useCourseData();
  const navigate   = useNavigate();

  const skillData = selectedSkill ? skills[selectedSkill] : null;
  if (!skillData) {
    return (
      <Box>
        <Typography>No skill selected. <Button onClick={() => navigate('/skills')}>Select a skill</Button></Typography>
      </Box>
    );
  }

  const completedDays = getCompletedDays(selectedSkill!);
  const unlockedDay   = getUnlockedDay(selectedSkill!);
  const dayData       = skillData.days.find((d) => d.day === currentDay);
  const isCompleted   = completedDays.includes(currentDay);
  const progress      = (completedDays.length / skillData.totalDays) * 100;

  const handleMarkComplete = () => {
    syncDayComplete(selectedSkill!, currentDay);
    if (currentDay < skillData.totalDays) setCurrentDay(currentDay + 1);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {skillData.icon} {skillData.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedDays.length} / {skillData.totalDays} days completed
          </Typography>
        </Box>
        <Chip
          label={`Day ${currentDay} of ${skillData.totalDays}`}
          icon={<CalendarTodayIcon />}
          sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700, px: 1 }}
        />
      </Box>

      {/* Progress bar */}
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 10, borderRadius: 5 }} />

      {/* Day selector */}
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 3 }}>
        {skillData.days.map((d) => {
          const done   = completedDays.includes(d.day);
          const active = d.day === currentDay;
          const locked = d.day > unlockedDay;
          return (
            <Box
              key={d.day}
              onClick={() => !locked && setCurrentDay(d.day)}
              sx={{
                width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, cursor: locked ? 'not-allowed' : 'pointer',
                bgcolor: done ? 'success.main' : active ? 'primary.main' : locked ? 'action.hover' : 'background.paper',
                color: done || active ? '#fff' : locked ? 'text.disabled' : 'text.secondary',
                border: active ? 'none' : done ? 'none' : '2px solid',
                borderColor: 'divider',
                opacity: locked ? 0.5 : 1,
                transition: 'all .15s',
                position: 'relative',
              }}
            >
              {done ? '✓' : d.day}
              {(d.questions?.length ?? 0) > 0 && (
                <Box sx={{
                  position: 'absolute', top: -4, right: -4,
                  width: 14, height: 14, borderRadius: '50%',
                  bgcolor: '#f59e0b', border: '1.5px solid #fff',
                  fontSize: 8, fontWeight: 800, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.questions!.length}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 3 }}>
        {/* Main Content */}
        <Box>
          {dayData && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
                  Day {dayData.day}: {dayData.topic}
                </Typography>

                <Typography variant="overline" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  Topics
                </Typography>
                <List dense disablePadding sx={{ mb: 2.5 }}>
                  {dayData.subtopics.map((s) => (
                    <ListItem key={s} disableGutters sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, mb: 0.5, px: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={s} slotProps={{ primary: { style: { fontSize: 14 } } }} />
                    </ListItem>
                  ))}
                </List>

                {/* Task */}
                <Box sx={infoBoxSx}>
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    📝 Task
                  </Typography>
                  <Typography variant="body2">{dayData.task}</Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained" color="success"
                    onClick={handleMarkComplete}
                    disabled={isCompleted}
                    sx={{ bgcolor: isCompleted ? 'success.light' : 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/quiz')}
                  >
                    🧠 Take Quiz ({currentDay <= 1 ? 10 : 15} Qs)
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Side panel */}
        <Box>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <QueryStatsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography sx={{ fontWeight: 700 }}>Your Progress</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {Math.round(progress)}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                {completedDays.length} of {skillData.totalDays} days done
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography sx={{ fontWeight: 700 }}>Day Overview</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {skillData.days.map((d) => {
                  const done = completedDays.includes(d.day);
                  return (
                    <Box
                      key={d.day}
                      sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        bgcolor: done ? 'success.main' : d.day === currentDay ? 'primary.main' : 'action.hover',
                        color: done || d.day === currentDay ? '#fff' : 'text.disabled',
                        border: '2px solid',
                        borderColor: done ? 'success.main' : d.day === currentDay ? 'primary.main' : 'divider',
                      }}
                    >
                      {d.day}
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
