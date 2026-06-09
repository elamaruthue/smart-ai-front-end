import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
return (
<Box
sx={{
minHeight: "100vh",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
bgcolor: "background.default",
px: 2,
textAlign: "center",
}}
>
<Typography
variant="h1"
sx={{
fontWeight: 700,
color: "error.main",
fontSize: { xs: "5rem", md: "8rem" },
}}
>
404 </Typography>
  <Typography variant="h4" gutterBottom>
    Page Not Found
  </Typography>

  <Typography
    variant="body1"
    color="text.secondary"
    sx={{ mb: 4, maxWidth: 500 }}
  >
    Sorry, the page you're looking for doesn't exist or may have been moved.
  </Typography>

  <Button
    component={Link}
    to="/"
    variant="contained"
    color="primary"
    size="large"
  >
    Go Back Home
  </Button>
</Box>

);
}
