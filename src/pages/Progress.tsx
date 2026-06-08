import { useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, LinearProgress,
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';
import { statGridSx } from '../styles/common';
import { FadeIn, AnimatedCardList, AnimatedCardItem } from '../components/AnimatedCard';

export default function Progress() {
  const { selectedPath, getCompletedDays, getAvgScore, getDayStreak, quizResults, fetchProgress } = useProgress();
  const { paths, skills } = useCourseData();

  // Re-fetch progress every time the user opens this page
  useEffect(() => { fetchProgress(); }, []);

  const pathData  = paths.find((p) => p.id === selectedPath);
  const skillList = pathData?.skills ?? Object.keys(skills);

  const totalDaysCompleted = skillList.reduce((sum, s) => sum + getCompletedDays(s).length, 0);
  const streak = getDayStreak();
  const avg    = getAvgScore();

  const stats = [
    { icon: <CalendarTodayIcon sx={{ fontSize: 32, color: 'primary.main' }} />,  label: 'Days Completed', value: totalDaysCompleted },
    { icon: <QueryStatsIcon   sx={{ fontSize: 32, color: 'secondary.main' }} />, label: 'Avg Quiz Score',  value: `${avg}%` },
    { icon: <WhatshotIcon     sx={{ fontSize: 32, color: 'warning.main' }} />,   label: 'Day Streak',     value: streak },
    { icon: <EmojiEventsIcon  sx={{ fontSize: 32, color: 'warning.dark' }} />,   label: 'Quizzes Taken',  value: Object.keys(quizResults).length },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 30 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>My Progress</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track your learning journey across all skills
      </Typography>

      {/* Stats row */}
      <FadeIn delay={0.05}>
        <Box sx={statGridSx(4)}>
          {stats.map(({ icon, label, value }) => (
            <Card key={label}>
              <CardContent>
                <Box sx={{ mb: 1 }}>{icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </FadeIn>

      {/* Per-skill progress */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Skill Progress</Typography>
      <AnimatedCardList>
        <div>
          {skillList.map((skillName) => {
            const skillData = skills[skillName];
            if (!skillData) return null;
            const completed = getCompletedDays(skillName);
            const pct       = Math.round((completed.length / skillData.totalDays) * 100);

            return (
              <AnimatedCardItem key={skillName} style={{ marginBottom: 16 }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 24 }}>{skillData.icon}</Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{skillData.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {completed.length} / {skillData.totalDays} days
                          </Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: 20, minWidth: 52, textAlign: 'right' }}>
                        {pct}%
                      </Typography>
                    </Box>

                    <LinearProgress variant="determinate" value={pct} sx={{ mb: 1.5, height: 10 }} />

                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {skillData.days.map((d) => {
                        const done    = completed.includes(d.day);
                        const qKey    = `${skillName}_day${d.day}`;
                        const qResult = quizResults[qKey];
                        return (
                          <Box
                            key={d.day}
                            title={qResult ? `Score: ${qResult.score}/${qResult.total}` : `Day ${d.day}`}
                            sx={{
                              width: 30, height: 30, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700,
                              bgcolor: done ? 'success.main' : 'action.hover',
                              color: done ? '#fff' : 'text.disabled',
                              border: done ? 'none' : '2px solid',
                              borderColor: 'divider',
                              cursor: 'default',
                            }}
                          >
                            {done ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : d.day}
                          </Box>
                        );
                      })}
                    </Box>

                    {streak > 0 && pct > 0 && (
                      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WhatshotIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {streak} day streak
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCardItem>
            );
          })}
        </div>
      </AnimatedCardList>
    </Box>
  );
}
