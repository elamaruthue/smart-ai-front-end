import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

interface Props {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ categories, value, onChange }: Props) {
  const idx = Math.max(0, categories.indexOf(value));
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={idx} onChange={(_, i) => onChange(categories[i])} variant="scrollable" scrollButtons="auto">
        {categories.map((c) => (
          <Tab key={c} label={c} />
        ))}
      </Tabs>
    </Box>
  );
}
