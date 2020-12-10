import { useAuth , AuthAxios, refreshtoken_keyname} from "../../utils/auth";

import React, {useState, useEffect} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Home from '@material-ui/icons/Home';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import Copyright from '../Copyright';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import {Link} from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: 5,
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6, 0, 4),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    height: 200,
    objectFit: 'contain',
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

export default function BoardsList() {
  const classes = useStyles();

  const [boards, setBoards] = useState([]);
  const [boardName, setBoardName] = useState(null);
  const [boardDescription, setBoardDescription] = useState(null);
  const [boardImage, setBoardImage] = useState(null);
  const [isEditModeOn, setEditMode] = useState(null);
  const [disableForm, setDisableForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // is this page loading boards? vvvvvvvvv
  const [isLoading, setIsLoading] = useState(true);
  const [openAddBoard, setOpenAddBoard] = useState(false);

  const {setAuthToken} = useAuth();

  const [openUserMenu, setOpenUserMenu] = React.useState(false);
  const userMenuAnchorRef = React.useRef(null);

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

  const handleClickOpenAddBoard = async () => {
    if(isLoading) return;
    setEditMode(null);
    setBoardName(null);
    setBoardDescription(null);
    setBoardImage(null);
    setDisableForm(false);
    setOpenAddBoard(true);
  };

  // Actually for handle commit on the dialog
  const handleCloseAddBoard = async () => {
      setDisableForm(true);
      setIsLoading(true);
      try{
        const item = {board_name: boardName, board_image: boardImage, board_description: boardDescription};
        if(isEditModeOn){
          item.board_id = isEditModeOn.id;
        }
        const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL + (isEditModeOn ? '/boards/update-info' : '/boards/add'), item);
        if(fetched.status === 200 || fetched.status === 304){
          if(isEditModeOn){
            const modifiedBoard = fetched.data.modifiedBoard;
            const cloned = boards.slice().map((val) => {
              if(val.id === modifiedBoard.id){
                return modifiedBoard;
              }
              return val;
            });
            setBoards(cloned);
          }else{
            const newBoard = fetched.data.boardInfo;
            let cloned = boards.slice();
            cloned = [newBoard, ...cloned];
            setBoards(cloned);
          }
        }else{
          setBoards(null);
        }
        setOpenAddBoard(false);
        setIsLoading(false);
      }catch(err){
        console.log(err);
        setBoards(null);
        setOpenAddBoard(false);
        setIsLoading(false);
        if(err.response && err.response.status === 401){
          // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
          setAuthToken(null);
        }
      }
  };

  // Used to handle deletion
  const onDelete = async (board_id) => {
    setIsLoading(true);
    try{
      const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL + '/boards/delete', {board_id});
      if(fetched.status === 200 || fetched.status === 304){
        const cloned = boards.slice().filter((val) => val.id !== board_id);
        setBoards(cloned);
      }else{
        setBoards(null);
      }
      setIsLoading(false);
    }catch(err){
      console.log(err);
      setBoards(null);
      setIsLoading(false);
      if(err.response && err.response.status === 401){
        // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
        setAuthToken(null);
      }
    }
  };

  // use Effect to fetch boards at the start
  useEffect(() => {
    (async () => {
      try{
        setIsLoading(true);
        const fetchUser = await AuthAxios.get(process.env.REACT_APP_API_URL + '/users/profile');
        if(fetchUser.status === 200 || fetchUser.status === 304){
          setCurrentUser(fetchUser.data.user);
          const fetched = await AuthAxios.get(process.env.REACT_APP_API_URL +'/boards');
          if(fetched.status === 200 || fetched.status === 304){
            setBoards(fetched.data);
          }else{
            setBoards(null);
          }
        }else{
          setCurrentUser(null);
        }
        setIsLoading(false);
      }catch(err){
        setCurrentUser(null);
        setBoards(null);
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
      setBoards([]);
    };
  }, [setAuthToken]);

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
      <Toolbar>
        <Home className={classes.icon} />
        <Typography variant="h6" color="inherit" noWrap style={{
                userSelect: "none",
              }}>
          Dashboard
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
                      <MenuItem component={Link} to={'/profile'}>My account</MenuItem>
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
        </Grid>
      </Toolbar>
      </AppBar>
      { isLoading ? 
      <Box fontStyle="italic" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <CircularProgress />
      </Box> :
        <>
        <main>
          {/* Hero unit */}
          <div className={classes.heroContent}>
            <Container maxWidth="sm">
              <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom style={{
                userSelect: "none",
              }}>
                Boards
              </Typography>
              <div id="horizontal-menu-1" className={classes.heroButtons}>
                <Grid container spacing={2} justify="center">
                  {isLoading? null : 
                    <>
                    {boards?
                    <Grid item>
                      <Button variant="contained" color="primary" onClick={handleClickOpenAddBoard}>
                        Add new board
                      </Button>
                    </Grid> : null} 
                    </>
                  }
                </Grid>
              </div>
            </Container>
          </div>
          <Container className={classes.cardGrid} maxWidth="lg">
            {/* End hero unit */}
            <Grid container spacing={4}>
              {(() => { 
                if(boards && boards.length > 0){
                  return boards.map((card) => (
                    <Grid item key={card.id} xs={12} sm={6} md={4}>
                      <Card className={classes.card}>
                        <CardMedia
                          className={classes.cardMedia}
                          src={card.board_image ? card.board_image : "default_board_img.png"} component="img"
                          title="Hello, easter egg!"
                        />
                        <CardContent className={classes.cardContent}>
                          <Typography gutterBottom variant="h5" component="h2">
                            {card.board_name}
                          </Typography>
                          <Typography gutterBottom variant="body2" align="justify">
                            {card.board_description ? card.board_description : ""}
                          </Typography>
                        </CardContent>
                        <CardActions>
                        <Grid container item xs={12} style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                          <Grid item xs={12} md={3} >
                            <Button size="small" color="primary" component={Link} to={`/board?id=${card.board_collab}`}>
                              View
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={4} >
                            <Button size="small" color="primary" onClick={() => 
                              {
                                if(isLoading) return;
                                setEditMode(card);
                                setBoardName(card.board_name);
                                setBoardDescription(card.board_description);
                                setBoardImage(card.board_image);
                                setDisableForm(false);
                                setOpenAddBoard(true);
                              }
                            }>
                              Edit Info
                            </Button>
                          </Grid>
                          <Grid item xs={undefined} md={2}>
                          
                          </Grid>
                          <Grid item xs={12} md={3} >
                          <Button style={{
                            maxWidth: 32,
                            minWidth: 32,
                            maxHeight: 32,
                            minHeight: 32,
                          }}
                          onClick={async () => {
                            await onDelete(card.id);
                          }}>
                            <DeleteIcon style={{
                              color: 'red',
                              maxWidth: 32,
                              minWidth: 32,
                              maxHeight: 32,
                              minHeight: 32,
                            }}/>
                          </Button>
                          </Grid>
                          </Grid>
                        </CardActions>
                      </Card>
                    </Grid>
                ))
                } else if (boards) {
                  if(isLoading){
                    return <Box fontStyle="italic" style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: 'translate(-50%, -50%)'
                  }}>
                      <CircularProgress />
                    </Box>
                  }else {
                    return <Box fontStyle="italic" justifyContent="center" width="100%">
                      <Typography variant="body2" color="textSecondary">
                        Không có bảng nào
                      </Typography>
                    </Box>;
                  }
                } else {
                  return <Box fontStyle="italic" justifyContent="center" width="100%">
                    <Alert severity="error">A problem occured while loading your boards</Alert>
                  </Box>
                }
              })()
              }
            </Grid>
          </Container>
          <Dialog open={openAddBoard} onClose={()=>{
            setDisableForm(true);
            setBoardName(null);
            setBoardDescription(null);
            setBoardImage(null);
            setEditMode(null);
            setOpenAddBoard(false);
          }} aria-labelledby="form-dialog-title" disableBackdropClick={disableForm}>
            <DialogTitle id="add-board-dialog-title">{isEditModeOn ? "Modify" : "Create"} board</DialogTitle>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  await handleCloseAddBoard();
                }}>
              <DialogContent>
                <DialogContentText>
                  Enter these infos to {isEditModeOn ? "modify" : "create"} your board right now!
                </DialogContentText>
                
                <TextField
                  autoFocus
                  margin="dense"
                  id="board_name"
                  label="Board's name"
                  fullWidth
                  required
                  onChange={(e) => {
                    e.target.value = e.target.value.slice(0,Math.min(80, e.target.value.length));
                    setBoardName(e.target.value);
                  }}
                  value={boardName ? boardName : ''}
                  disabled={disableForm}
                />
                <TextField
                  margin="dense"
                  id="board_description"
                  label="Describe what your board is for... (Optional)"
                  fullWidth
                  onChange={(e) => {
                    setBoardDescription(e.target.value);
                  }}
                  multiline
                  value={boardDescription ? boardDescription : ''}
                  disabled={disableForm}
                />
                <TextField
                  margin="dense"
                  id="board_image"
                  label="Paste an image link for your board (Optional)"
                  fullWidth
                  onChange={(e) => {
                    setBoardImage(e.target.value);
                  }}
                  value={boardImage ? boardImage : ''}
                  disabled={disableForm}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setDisableForm(true);
                  setBoardName(null);
                  setBoardDescription(null);
                  setBoardImage(null);
                  setEditMode(null);
                  setOpenAddBoard(false);
                }} color="primary" disabled={disableForm}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" disabled={disableForm}>
                  {isEditModeOn ? "Modify" : "Create"}
                </Button>
              </DialogActions>
              </form>
            </Dialog>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Copyright />
        </footer>
        {/* End footer */}
        </>
      }
    </React.Fragment>
  );
}