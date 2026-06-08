import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { useProgress } from '../hooks/useProgress';
import { useCourseData } from '../hooks/useCourseData';
import { selectableCardSx } from '../styles/common';
import { AnimatedCardList, AnimatedCardItem, FadeIn } from '../components/AnimatedCard';

export default function PathSelection() {
  const { selectedPath, setSelectedPath } = useProgress();
  const { paths } = useCourseData();
  const navigate  = useNavigate();

  const handleSelect = (id: string) => {
    setSelectedPath(id);
    navigate('/skills');
  };

  return (
    <Box>
      <FadeIn>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Choose Your Path</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select the learning path you want to pursue
        </Typography>
      </FadeIn>

      <AnimatedCardList>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {paths.map((path) => (
              <AnimatedCardItem key={path.id}>
              <Card
                onClick={() => handleSelect(path.id)}
                sx={{
                  ...selectableCardSx(selectedPath === path.id),
                  p: 1,
                  borderRadius: 4,
                  '&:hover': {
                    borderColor: '#4f46e5',
                    boxShadow: '0 8px 30px rgba(79,70,229,0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 2 }}>{path.icon}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{path.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    {path.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', mb: 3 }}>
                    {path.skills.map((s) => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 700 }} />
                    ))}
                  </Box>
                  <Button
                    variant="contained" fullWidth
                    sx={{ py: 1.2 }}
                    onClick={(e) => { e.stopPropagation(); handleSelect(path.id); }}
                  >
                    Select Path
                  </Button>
                </CardContent>
              </Card>
            </AnimatedCardItem>
          ))}
        </Box>
      </AnimatedCardList>
    </Box>
  );
}
