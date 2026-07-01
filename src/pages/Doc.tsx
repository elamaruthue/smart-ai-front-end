import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import {
  GitHub,
  PictureAsPdf,
  Download,
} from "@mui/icons-material";

export default function Doc() {
  // PDF in public folder
  const fileId = "1nmu6uvmDuL-w4dhs9vJ5K6DWz4hVLRSs";

const pdfUrl = `https://drive.google.com/file/d/${fileId}/preview`;

const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  const downloadDoc = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "smart-ai-doc.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <PictureAsPdf sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Project Documentation
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              color="inherit"
              startIcon={<Download />}
              onClick={downloadDoc}
            >
              Download
            </Button>

            <Button
              color="inherit"
              startIcon={<GitHub />}
              onClick={() =>
                window.open(
                  "https://github.com/elamaruthue/smart-ai-front-end",
                  "_blank"
                )
              }
            >
              Frontend
            </Button>

            <Button
              color="inherit"
              startIcon={<GitHub />}
              onClick={() =>
                window.open(
                  "https://github.com/elamaruthue/smart-ai-back-end",
                  "_blank"
                )
              }
            >
              Backend
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Paper
          elevation={4}
          sx={{
            height: "85vh",
            overflow: "hidden",
            borderRadius: 1,
          }}
        >
          <iframe
            src={pdfUrl}
            title="Project Document"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </Paper>
      </Container>
    </>
  );
}