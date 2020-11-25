import { useAuth , AuthAxios, refreshtoken_keyname} from "../../utils/auth";
import { Link as RouterLink} from 'react-router-dom';

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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function LogIn() {
  const classes = useStyles();

  const [isError, setIsError] = useState(false);
  const { setAuthToken } = useAuth();

  //Login infos
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [disableForm, setDisableForm] = useState(false);

  const postLogin = async () => {
    if(!username || !password) {
      setIsError(true);
      return;
    } 
    let result;
    try{
      result = await AuthAxios.post(process.env.REACT_APP_API_URL + "/auth/login", {
        username,
        password,
        getRefreshToken: rememberMe ? true : undefined
      });
      setUsername(null);
      setPassword(null);  
      setDisableForm(false);  
      if (result.status === 200) {
        const data = result.data;
        if(data.refresh_token){
          localStorage.setItem(refreshtoken_keyname, data.refresh_token);
        }
        setAuthToken(data.access_token);
      } else {
        setIsError(true);
      }
    }catch(err){
      console.log(err);
      setUsername(null);
      setPassword(null);  
      setDisableForm(false); 
      setIsError(true);
    }
  }

  useEffect(() => {
   
    return () => {
      setUsername(null);
      setPassword(null);  
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
          Log in
        </Typography>
        <form action="/" method="POST" className={classes.form} onSubmit={async (e) => {
          e.preventDefault();
          setDisableForm(true);
          //Do axios post call after preventing form from posting
          await postLogin();
        }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            onChange={(e) => {
              e.target.value = e.target.value.slice(0,Math.min(40, e.target.value.length));
              setUsername(e.target.value);
            }}
            value={username ? username : ''}
            disabled={disableForm}
          />
          <TextField
            variant="outlined"
            margin="normal"
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
          <FormControlLabel
            control={<Checkbox value={rememberMe} color="primary" onChange={(e) => {
              setRememberMe(e.target.checked);
            }}/>}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={disableForm}
          >
            Log In
          </Button>
          <Grid container>
            <Grid item xs>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>

            <Grid container item justify="center">
              {isError ? <Alert severity="error">There was a problem with your login</Alert> : 
              disableForm? <CircularProgress/> : null}
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}