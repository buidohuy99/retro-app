import { useAuth , AuthAxios} from "../../utils/auth";
import {Link as RouterLink} from 'react-router-dom';

import React, { useState, useEffect} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import Copyright from '../Copyright';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
  const classes = useStyles();

  const [isError, setIsError] = useState(null);
  const { setAuthToken } = useAuth();

  //Login infos
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [passwordConfirm, setPasswordConfirm] = useState(null);
  const [email, setEmail] = useState(null);
  const [disableForm, setDisableForm] = useState(false);

  const postRegister = async () => {
    if(!username || !password) {
      setIsError(true);
      return;
    } 
    let result;
    try{
      if(passwordConfirm.localeCompare(password)) throw new Error("Confirm password do not match");
      result = await AuthAxios.post(process.env.REACT_APP_API_URL + "/auth/register", {
        username,
        password, 
        email,
      });
      setUsername(null);
      setPassword(null);  
      setEmail(null);
      setPasswordConfirm(null);
      setDisableForm(false);  
      if (result.status === 200) {
        const data = result.data;
        setAuthToken(data.access_token);
      } else {
        setIsError(result.data);
      }
    }catch(err){
      console.log(err);
      setUsername(null);
      setPassword(null);
      setEmail(null);  
      setPasswordConfirm(null);
      setDisableForm(false); 
      setIsError(err.message);
    }
  }

  useEffect(() => {
    return () => {
      setUsername(null);
      setPassword(null);  
      setEmail(null);
      setPasswordConfirm(null);
      setDisableForm(false);
    }
  }, []);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={async (e) => {
          e.preventDefault();
          setDisableForm(true);
          //Do axios post call after preventing form from posting
          await postRegister();
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                autoComplete="username"
                name="username"
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                autoFocus
                onChange={(e) => {
                  e.target.value = e.target.value.slice(0,Math.min(40, e.target.value.length));
                  setUsername(e.target.value);
                }}
                value={username ? username : ''}
                disabled={disableForm}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => {
                  e.target.value = e.target.value.slice(0,Math.min(120, e.target.value.length));
                  setEmail(e.target.value);
                }}
                value={email ? email : ''}
                disabled={disableForm}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => {
                  e.target.value = e.target.value.slice(0,Math.min(100, e.target.value.length));
                  setPassword(e.target.value);
                }}
                value={password ? password : ''}
                disabled={disableForm}
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
                variant="outlined"
                required
                fullWidth
                name="passwordConfirm"
                label="Confirm your password"
                type="password"
                id="passwordConfirm"
                autoComplete="current-password"
                onChange={(e) => {
                  e.target.value = e.target.value.slice(0,Math.min(100, e.target.value.length));
                  setPasswordConfirm(e.target.value);
                }}
                value={passwordConfirm ? passwordConfirm : ''}
                disabled={disableForm}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={disableForm}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Log in
              </Link>
            </Grid>

            <Grid container item justify="center">
              {isError ? <Alert severity="error">{JSON.stringify(isError)}</Alert> : 
              disableForm? <CircularProgress/> : null}
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}