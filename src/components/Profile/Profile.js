import { useAuth , AuthAxios, refreshtoken_keyname} from "../../utils/auth";

import React, {useState, useEffect} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Copyright from '../Copyright';
import AssignmentReturnIcon from '@material-ui/icons/AssignmentReturn';
import { makeStyles } from '@material-ui/core/styles';

import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import {Link} from 'react-router-dom';

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
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
    },
}));

export default function Profile(){
    const classes = useStyles();

    const [disableForm, setDisableForm] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditOn, setEditOn] = useState(false);

    const [password, setPassword] = useState(null);
    const [newPassword, setNewPassword] = useState(null);
    const [email, setEmail] = useState(null);

    const [isError, setIsError] = useState(null);
    const [isSuccess , setIsSuccess] = useState(null);
    const {setAuthToken} = useAuth();

    const [openUserMenu, setOpenUserMenu] = React.useState(false);
    const userMenuAnchorRef = React.useRef(null);

    const postChangeProfileForm = async () => {
        if(email === currentUser.email && (!newPassword || newPassword.length <= 0)){
            setEditOn(false);
            setDisableForm(false);
            return;
        }
        if(!email || email.length <= 0) {
            setIsError("your new email is illegal");
            setEditOn(false);
            setDisableForm(false);
            return;
        }
        if(newPassword && newPassword.length > 0 && (!password || password.length <= 0 || newPassword === password)){
            setIsError("your new password is illegal");
            setEditOn(false);
            setDisableForm(false);
            return;
        }
        try{
            const user = await AuthAxios.post(process.env.REACT_APP_API_URL + '/users/update-profile', {
                email: email === currentUser.email ?  undefined : email,
                current_password: newPassword ? password : undefined,
                new_password: newPassword ?  newPassword : undefined
            });
            if(user.status === 200 || user.status === 304){
                setCurrentUser(user.data.record);
                setEditOn(false);
                setDisableForm(false);
                setIsSuccess("You have successfully changed the info");
            }else{
                setIsSuccess(null);
                setIsError("There has been a problem when updating your profile");  
                setEditOn(false);
                setDisableForm(false);
            }    
        }catch(err){
            console.log(err);
            setIsSuccess(null);
            setIsError(JSON.stringify(err));
            setEditOn(false);
            setDisableForm(false);
        }
    };

    const handleToggle = () => {
        setOpenUserMenu((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (userMenuAnchorRef.current && userMenuAnchorRef.current.contains(event.target)) {
            return;
        }
        setOpenUserMenu(false);
    };

    function handleListKeyDown(event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpenUserMenu(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(openUserMenu);
    useEffect(() => {
        if (prevOpen.current === true && openUserMenu === false) {
        userMenuAnchorRef.current.focus();
        }

        prevOpen.current = openUserMenu;
    }, [openUserMenu]);

    useEffect(() => {
        (async () => {
            try{
                setIsLoading(true);
                const fetchUser = await AuthAxios.get(process.env.REACT_APP_API_URL + '/users/profile');
                if(fetchUser.status === 200 || fetchUser.status === 304){
                    setCurrentUser(fetchUser.data.user);
                }else{
                    setCurrentUser(null);
                }
                setIsLoading(false);
            }catch(err){
                setCurrentUser(null);
                setIsLoading(false);
                if(err.response && err.response.status === 401){
                    // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
                    setAuthToken(null);
                }
            }
        })();
        //Clean up code
        return ()=> {
            setIsLoading(true);
        };
    }, [setAuthToken]);

    return (
        <React.Fragment>
          <CssBaseline />
          <AppBar position="relative">
          <Toolbar>
            <AccountCircleIcon className={classes.icon} />
            <Typography variant="h6" color="inherit" noWrap style={{
                    userSelect: "none",
                  }}>
              Account
            </Typography>
    
            <Grid container style={{flexDirection: "row-reverse", flex: 1}}>
              {currentUser ? 
                <>
                <Button style={{
                  flexDirection: "row",
                  color: 'white'
                }}
                ref={userMenuAnchorRef}
                aria-controls={openUserMenu ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}>
                  <AssignmentIndIcon />
                </Button>
                <Popper open={openUserMenu} anchorEl={userMenuAnchorRef.current} role={undefined} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList autoFocusItem={openUserMenu} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                          <Typography align="center" color="textSecondary" paragraph style={{
                              userSelect: "none",
                              overflowWrap: 'break-word',
                              fontSize: 18,
                              marginLeft: 10,
                              marginRight: 10,
                              fontStyle: "italic",
                            }}>
                              Welcome '{currentUser.display_name? currentUser.display_name : currentUser.username}'!
                          </Typography>
                          <MenuItem onClick={async (e) => {
                            handleClose(e);
                            setIsLoading(true);
                            try{
                                const refresh_token = localStorage.getItem(refreshtoken_keyname);
                                if(!refresh_token || refresh_token === 'null') throw new Error("refresh token not found");
                                await AuthAxios.post(process.env.REACT_APP_API_URL +'/users/logout', {refreshToken: refresh_token});
                            }catch(err){
                                console.log(err);         
                                setAuthToken(null);
                                return;
                            }
                            localStorage.removeItem(refreshtoken_keyname); 
                            //Dont need to setIsLoadingPage to false here to avoid people clicking on random shits, and since setting auth token to null will definitely change the page on PrivateRoutes such as this one
                            setAuthToken(null);     
                           }}>Logout</MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
                </>
              : null} 
              <Button style={{
                marginRight: 5,
                flexDirection: "row",
                color: 'white'
              }}
              component={Link} to={'/'}>
                <AssignmentReturnIcon className={classes.icon} />
                <Typography variant="subtitle2" color="inherit" noWrap>
                    Go back to dashboard
                </Typography>
              </Button>    
            </Grid>
          </Toolbar>
          </AppBar>
          { isLoading ? 
          <Box fontStyle="italic" style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <CircularProgress />
          </Box> 
          :
        currentUser? <>
            <div className={classes.paper}>
                <Container component="main" maxWidth="sm">
                    <Grid container item xs={12} style={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}>
                    <Grid item xs={10}>
                        <Typography component="h1" variant="h5" style={{
                            overflowWrap: 'break-word',
                            userSelect: "none",
                        }} align="justify">
                            Account Information
                        </Typography>
                    </Grid>
                {isError ?  null :
                    <Grid item xs={2}>
                        <Button style={{
                            flexDirection: "row",
                        }} color="primary" onClick={(e) => {
                            if(!isEditOn){
                                setEmail(currentUser.email);
                            }
                            setIsSuccess(null);
                            setPassword(null);
                            setNewPassword(null);
                            setEditOn(!isEditOn);
                        }} disabled={disableForm}>
                            {isEditOn ? "Stop edit": "Edit"}
                        </Button>
                    </Grid>
                }
                </Grid>
                {
                    isSuccess ? <Box fontStyle="italic" justifyContent="center" width="100%">
                        <Alert severity="success" style={{
                                flex: 1,
                                flexDirection: "column",
                                overflowWrap: "break-word",
                            }}>{isSuccess}</Alert>
                    </Box>: null
                }
                {isError ? 
                <Box fontStyle="italic" justifyContent="center" width="100%">
                    <Alert severity="error" style={{
                        flex: 1,
                        flexDirection: "column",
                        overflowWrap: "break-word",
                    }}>{isError}</Alert>
                </Box>
                :
                <form className={classes.form} onSubmit={async (e) => {
                    e.preventDefault();
                    setDisableForm(true);
                    //Do axios post call after preventing form from posting
                    postChangeProfileForm();
                }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} >
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={currentUser.username}
                            disabled={true}
                        />
                    </Grid> 
                    <Grid item xs={12} >
                        <TextField
                            variant="outlined"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            onChange={(e) => {
                            e.target.value = e.target.value.slice(0,Math.min(120, e.target.value.length));
                                setEmail(e.target.value);
                            }}
                            value={!isEditOn ? currentUser.email : (email ? email : '')}
                            disabled={disableForm || !isEditOn}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="password"
                            label={isEditOn ?  "Current password" : "Password"}
                            type={isEditOn ? "password" : undefined}
                            id="password"
                            autoComplete="current-password"
                            onChange={(e) => {
                            e.target.value = e.target.value.slice(0,Math.min(100, e.target.value.length));
                                setPassword(e.target.value);
                            }}
                            value={!isEditOn ? 'Your password is hidden' : (password ? password : '')}
                            inputProps={!isEditOn ? {
                                style: {fontStyle: "italic"}
                            } : undefined}
                            disabled={disableForm || !isEditOn}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {isEditOn ? 
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="passwordNew"
                            label="Type your new password"
                            type="password"
                            id="passwordNew"
                            autoComplete="new-password"
                            onChange={(e) => {
                                e.target.value = e.target.value.slice(0,Math.min(100, e.target.value.length));
                                setNewPassword(e.target.value);
                            }}
                            value={newPassword ? newPassword : ''}
                            disabled={disableForm}
                        />
                        : 
                            null
                        }
                    </Grid>
                </Grid>
                    {isEditOn ?
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            disabled={disableForm}>
                            Submit change
                        </Button>
                    : null}
                </form>}
                </Container>
            </div>
            <footer className={classes.footer}>
                <Copyright />
            </footer>
            </>
            : null}
        </React.Fragment>
      );
}