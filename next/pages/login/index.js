import HeaderAndFooter from "../../components/HeaderAndFooter";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import styles from "./index.module.css";
import { ThemeProvider } from "@mui/material/styles";
import { useState } from "react";
import Wave from "react-wavify";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <HeaderAndFooter bodyClassName={styles.body} hideFooterWave>
      {[1, 2].map((i) => {
        return (
          <Wave
            className={`absoluteBottom ${styles.wave}`}
            fill="url(#gradient)"
            paused={false}
            options={{
              height: 50,
              amplitude: 170,
              speed: 0.07,
              points: 4,
            }}
          >
            <defs>
              <linearGradient id="gradient" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="#81A3FF70" />
                <stop offset="100%" stopColor="#81A3F118" />
              </linearGradient>
            </defs>
          </Wave>
        );
      })}
      {/* <h1 className={styles.title}>Account</h1> */}
      <ToggleButtonGroup
        color="primary"
        exclusive
        onChange={(event, nextView) => {
          setIsLogin(nextView == "login");
        }}
        className={styles.toggle}
      >
        <ToggleButton value="login" selected={isLogin}>
          Login
        </ToggleButton>
        <ToggleButton value="signup" selected={!isLogin}>
          Sign Up
        </ToggleButton>
      </ToggleButtonGroup>
      <div className={styles.box}>
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className={styles.textInput}
          color="primary"
        />
        <TextField
          label="Password"
          variant="outlined"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className={styles.textInput}
          color="primary"
          type="password"
        />
        {isLogin ? (
          <div className={styles.checkboxContainer}>
            <p>Forgot login? Reset password</p>
          </div>
        ) : (
          <div className={styles.checkboxContainer}>
            <Checkbox
              checked={checked}
              onChange={(e) => {
                console.log(e.target.checked);
                setChecked(e.target.checked);
              }}
            />
            <p>
              I have read and acknowledged the <a>Terms and Conditions</a>.
            </p>
          </div>
        )}
        <Button variant="contained" className={styles.submit} color="primary">
          {isLogin ? "Login" : "Sign Up"}
        </Button>
      </div>
    </HeaderAndFooter>
  );
}
