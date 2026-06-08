import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';
import { selectableCardSx } from '../styles/common';
import { AnimatedCardList, AnimatedCardItem, FadeIn } from '../components/AnimatedCard';

export default function SkillSelection() {
  const { selectedPath, selectedSkill, setSelectedSkill, getCompletedDays } = useProgress();
  const { paths, skills } = useCourseData();
  const navigate = useNavigate();

  const pathData = paths.find((p) => p.id === selectedPath);
  const pathSkills = pathData?.skills ?? [];

  // A skill is locked if the previous one isn't completed
  const isLocked = (skillName: string, idx: number) => {
    if (idx === 0) return false;
    const prevSkill = pathSkills[idx - 1];
    const skillData = skills[prevSkill];
    if (!skillData) return false;
    return getCompletedDays(prevSkill).length < skillData.totalDays;
  };

  const handleSelect = (skillName: string, locked: boolean) => {
    if (locked) return;
    setSelectedSkill(skillName);
  };

  const handleStart = () => {
    if (!selectedSkill) return;
    navigate('/learn');
  };

  return (
    <Box>
      <FadeIn>
        <Typography variant="h4" fontWeight={800} mb={0.5}>Select a Skill</Typography>
        <Typography variant="body1" color="text.secondary" mb={1}>
          You can select only one skill at a time
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Complete one skill before choosing another. Skills unlock sequentially.
        </Alert>
      </FadeIn>

      <AnimatedCardList>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          {pathSkills.map((skillName, idx) => {
          const locked = isLocked(skillName, idx);
          const skillData = skills[skillName];
          const isSelected = selectedSkill === skillName;

          return (
              <AnimatedCardItem key={skillName}>
                <Card
                  onClick={() => handleSelect(skillName, locked)}
                  sx={{
                    ...selectableCardSx(isSelected),
                    cursor: locked ? 'not-allowed' : 'pointer',
                    opacity: locked ? 0.5 : 1,
                    '&:hover': !locked ? { borderColor: '#4f46e5', boxShadow: '0 4px 20px rgba(79,70,229,0.12)' } : {},
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                    <Typography fontSize={36} mb={1}>
                      {locked ? '🔒' : skillData?.icon ?? '📚'}
                    </Typography>
                    <Typography fontWeight={700} fontSize={15}>{skillName}</Typography>
                    {skillData && (
                      <Typography variant="caption" color="text.secondary">
                        {skillData.totalDays} days
                      </Typography>
                    )}
                    {locked && (
                      <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <LockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled">Locked</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCardItem>
            );
          })}
        </Box>
      </AnimatedCardList>
      <Button
        variant="contained" size="large"
        disabled={!selectedSkill}
        onClick={handleStart}
        sx={{ px: 5, py: 1.5 }}
      >
        Start Learning
      </Button>
    </Box>
  );
}
