import { createTheme } from "@mui/material/styles";

export default createTheme({
  typography: {
    fontFamily: "Rubik",
    button: {
      textTransform: "none",
      boxShadow: "none",
    },
  },
  palette: {
    type: "light",
    primary: {
      main: "#5179EA",
    },
    secondary: {
      main: "#ABC1FF",
    },
  },
  shadows: ["none"],
});
