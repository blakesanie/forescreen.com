import styles from "./index.module.css";
import TextField from "@mui/material/TextField";
import HeaderAndFooter from "../../components/HeaderAndFooter";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import MuiPhoneNumber from "material-ui-phone-number";

export default function Account() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  return (
    <HeaderAndFooter bodyClassName={styles.body}>
      <h1 className="pageHeader">Account</h1>
      <div className={styles.content}>
        <h2>Profile</h2>
        <div>
          <div>
            <TextField
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={styles.textInput}
              color="primary"
            />
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
            <MuiPhoneNumber
              defaultCountry={"us"}
              onChange={setPhoneNumber}
              value={phoneNumber}
              variant="outlined"
              label="Phone Number"
            />
          </div>
          <div>
            <Button variant="contained">Reset Password</Button>
            <Button variant="contained">Sign Out</Button>
          </div>
        </div>
        <h2>Subscription</h2>
        <div>
          <div>
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small">
                  Subscribe now
                </Button>
              }
            >
              Currently not subscribed
            </Alert>
            <Alert
              severity="success"
              action={
                <>
                  <Button color="inherit" size="small">
                    View Plans
                  </Button>
                  <Button color="inherit" size="small">
                    Manage subscription on Stripe
                  </Button>
                </>
              }
            >
              Subscribed
            </Alert>
          </div>
          <div>
            <Button variant="contained">View Pricing</Button>
          </div>
        </div>
        <h2>Extension</h2>
        <div>
          <div>
            <Alert severity="success">
              Browser Extension installed and synced
            </Alert>
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small">
                  Sync Now
                </Button>
              }
            >
              Browser Extension not synced
            </Alert>
            <Alert
              severity="warning"
              action={
                <Button color="inherit" size="small">
                  Install now
                </Button>
              }
            >
              Browser Extension not installed
            </Alert>
          </div>
        </div>
        <h2>Danger Zone</h2>
        <div>
          <div>
            <Button variant="outlined" color="error">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </HeaderAndFooter>
  );
}
