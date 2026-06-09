import Confetti from "react-confetti-boom";
import { Box, Typography, Button } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function TestCompleted() {
return (
<> <Confetti mode="fall" particleCount={200} />
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      p: 3,
    }}
  >
    <EmojiEventsIcon
      color="warning"
      sx={{ fontSize: 100, mb: 2 }}
    />
  </Box>
</>

);
}
