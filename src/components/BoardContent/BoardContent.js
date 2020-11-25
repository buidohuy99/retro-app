import { useAuth , AuthAxios, refreshtoken_keyname} from "../../utils/auth";

import CssBaseline from '@material-ui/core/CssBaseline';
import React, {useState, useEffect} from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import List from '@material-ui/icons/List';
import AssignmentReturnIcon from '@material-ui/icons/AssignmentReturn';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import Alert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

import {useStyles} from './css/boardContentStyle';

import {Link} from 'react-router-dom';

import Column from './Column';

import {DragDropContext} from 'react-beautiful-dnd';

import {extractTagtypeID_fromColDroppableID} from '../../utils/global';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

const queryString = require('query-string');

export default function BoardContent({ match, location}) {
    const classes = useStyles();

    const [tagTypes, setTagTypes] = useState(null);
    const [boardInfo, setBoardInfo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    // is this page loading boards? vvvvvvvvv
    const [isLoading, setIsLoading] = useState(true);
    const [paramError, setParamError] = useState(null);
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

    useEffect(() => {
        (async () => {
        const query = location.search;
        try{
          setIsLoading(true);
          const fetchUser = await AuthAxios.get(process.env.REACT_APP_API_URL + '/user-management/profile');
          if(fetchUser.status === 200 || fetchUser.status === 304){
            setCurrentUser(fetchUser.data.user);
            if(!query) {
              const queryError = "Error in query params: need to provide at least one query!";
              setParamError(queryError);
              throw new Error(queryError);
            }
            const fetched = await AuthAxios.get(process.env.REACT_APP_API_URL +'/tagtype-management/tagtypes');
            if(fetched.status === 200 || fetched.status === 304){
              setTagTypes(fetched.data);
              let parsed, parseError;
              try{
                parsed = queryString.parse(query);
                if(!parsed) {
                  parseError = "Error in query params: cannot be parsed";
                  setParamError(parseError);
                  throw new Error(parseError);
                }
              } catch (err) {
                parseError = "Error in query params: cannot be parsed";
                setParamError(parseError);
                throw new Error(parseError);
              }
              const fetchedBoard = await AuthAxios.get(process.env.REACT_APP_API_URL +'/board-management/board-content', { params: { board_collab: parsed.id} });
              if(fetchedBoard.status === 200 || fetchedBoard.status === 304){
                setBoardInfo(Array.isArray(fetchedBoard.data.foundBoard) ? fetchedBoard.data.foundBoard[0] : fetchedBoard.data.foundBoard);
              }else{
                setBoardInfo(null);
              }
            }else{
              setTagTypes(null);
            }
          }else{
            setCurrentUser(null);
          }
          setIsLoading(false);
        }catch(err){
            if(err.response){
              setCurrentUser(null);
              setTagTypes(null);
              setBoardInfo(null);
            }
            if(err.response && err.response.status === 400){
              const queryError = "Error in query params: query param is invalid";
              setParamError(queryError);
            }
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
          setTagTypes([]);
        };
    }, [setAuthToken, location.search]);

    // Reordering logic
    const onDragEnd = (result) => {
      //Reordering logic backend here.....
      const {destination, source} = result;

      // Drag outside of droppable
      if(!destination) return;
      
      const {droppableIdStart, droppableIdEnd, droppableIndexStart, droppableIndexEnd} = {
        droppableIdStart: source.droppableId,
        droppableIdEnd: destination.droppableId,
        droppableIndexStart: source.index,
        droppableIndexEnd: destination.index
      };

      if(droppableIdEnd === droppableIdStart && droppableIndexStart === droppableIndexEnd) return;

      // The movement of the draggable tag is WITHIN the same droppable column (inside a droppable - a column)
      if(droppableIdStart === droppableIdEnd && boardInfo.Tags && droppableIdStart){
        // This means that i take the whole array of tags in a board, then i filter it
        // and ONLY take tags that is within THIS SAME DROPPABLE COLUMN that i am executing the action
        // => Hence, tag.tagtype === droppableIdStart 

        //(i use the function "extract...." because my droppableID is in this form "column_number_<id of the column>")
        //( => i use the function to get the part inside these brackets "< >")
        const column_dragging_happening = extractTagtypeID_fromColDroppableID(droppableIdStart);
        let filtered_list = boardInfo.Tags['col_' + column_dragging_happening];
        if(!filtered_list) return;
        // Interact directly on the list, DO NOT use immutable
        const exchangedCard = filtered_list[droppableIndexEnd];
        const draggedCard = filtered_list.splice(droppableIndexStart, 1);       
        console.log(exchangedCard);
        // add the dragged Card in place of tobe exchanged card
        filtered_list.splice(droppableIndexEnd, 0, draggedCard[0]);
        // new Board Info
        const oldBoardInfo = {
          ...boardInfo,
        }
        const newBoardInfo = {
          ...boardInfo,
          Tags:{
            ...boardInfo.Tags,
            ['col_' + column_dragging_happening] : filtered_list
          }
        };
        //At the same time do the swapping on the server
        setBoardInfo(newBoardInfo);
        setIsLoading(true);
        (async () => {
          try{
            const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL +'/tag-management/edit-tag', {
              tag_id: draggedCard[0].id,
              tag_to_exchange: exchangedCard.id,
              tag_content: draggedCard[0].tag_content,
              board_id: boardInfo.id,
            });
            if(fetched.status === 200 || fetched.status === 304){
              setIsLoading(false);
            }
          } catch (err){
            console.log(err);
            setBoardInfo(oldBoardInfo);
            setIsLoading(false);
            if(err.response && err.response.status === 401){
              // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
              setAuthToken(null);
            }
          }
        })();
        //Set Board Info to prevent reversion on return (while also not immutabling)
        //setBoardInfo(newBoardInfo);
        //At the

        return;
      }

      if(droppableIdStart !== droppableIdEnd && boardInfo.Tags && droppableIdStart && droppableIdEnd){
        const column_dragging_start = extractTagtypeID_fromColDroppableID(droppableIdStart);
        const column_dragging_end = extractTagtypeID_fromColDroppableID(droppableIdEnd);
        const list_start = boardInfo.Tags['col_' + column_dragging_start];
        const list_end = boardInfo.Tags['col_' + column_dragging_end];
        if(!list_start || !list_end) return;
        // Interact directly on the lists, DO NOT use immutable
        const leftCard = droppableIndexEnd - 1 < 0 ? null : list_end[droppableIndexEnd - 1];
        const rightCard = droppableIndexEnd >= list_end.length ? null : list_end[droppableIndexEnd];
        const draggedCard = list_start.splice(droppableIndexStart, 1);       
        // add the dragged Card in place of tobe exchanged card
        list_end.splice(droppableIndexEnd, 0, draggedCard[0]);
        // new Board Info
        const oldBoardInfo = {
          ...boardInfo,
        }
        const newBoardInfo = {
          ...boardInfo,
          Tags:{
            ...boardInfo.Tags,
            ['col_' + column_dragging_start] : list_start,
            ['col_' + column_dragging_end] : list_end
          }
        };
        //At the same time do the swapping on the server
        setBoardInfo(newBoardInfo);
        setIsLoading(true);
        (async () => {
          try{
            const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL +'/tag-management/edit-tag', {
              tag_id: draggedCard[0].id,
              tag_type: parseInt(column_dragging_end),
              left_side: rightCard ? rightCard.id : null,
              right_side: leftCard ? leftCard.id : null,
              tag_content: draggedCard[0].tag_content,
              board_id: boardInfo.id,
            });
            if(fetched.status === 200 || fetched.status === 304){
              setIsLoading(false);
            }
          } catch (err){
            console.log(err);
            setBoardInfo(oldBoardInfo);
            setIsLoading(false);
            if(err.response && err.response.status === 401){
              // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
              setAuthToken(null);
            }
          }
        })();


        return;
      }
    }

    return(
    <>
      <CssBaseline/>
      <AppBar position="relative">
      <Toolbar>
          <List className={classes.icon} />
          <Typography variant="h6" color="inherit" style={{
                userSelect: "none",
              }}>
            Board Content
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
                          <MenuItem>
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
                          </MenuItem>
                          <MenuItem component={Link} to={'/profile'}>My account</MenuItem>
                          <MenuItem onClick={async (e) => {
                            handleClose(e);
                            setIsLoading(true);
                            try{
                              const refresh_token = localStorage.getItem(refreshtoken_keyname);
                              if(!refresh_token || refresh_token === 'null') throw new Error("refresh token not found");
                              await AuthAxios.post(process.env.REACT_APP_API_URL +'/auth/logout', {refreshToken: refresh_token});
                            }catch(err){
                              console.log(err);
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
      <Grid container style={{
        maxWidth: '100%',
        justify: "center"
      }}>
      { isLoading ? 
        <Box fontStyle="italic" style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'
        }}>
            <CircularProgress />
        </Box> 
      : paramError ? 
        <Grid container item justify="center">
          <Alert severity="error">{paramError}</Alert>
        </Grid>
      :
      (!tagTypes || tagTypes.length <= 0)? 
        <Grid container item justify="center">
          <Alert severity="info">Có vẻ như vẫn chưa có cột nào trong bảng, chúng tôi đang cố tải thông tin bảng...</Alert>
        </Grid>
      : 
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container item lg={12} style={{
          flexDirection: "column",
        }}>
          {
            boardInfo && boardInfo.board_name?
            <Grid container item style={{
              flexDirection: "row-reverse",
              justify: "flex-start",
            }}>
              <Typography variant="h5" color="textPrimary" className={classes.boardName}>
                {boardInfo.board_name}
              </Typography>
            </Grid>
            : 
            <Grid container item justify="center">
              <Alert severity="error">Xảy ra lỗi load tên bảng</Alert>
            </Grid>
          }
          {
            boardInfo && boardInfo.Tags && boardInfo.id? 
            <Grid container item className={classes.columnsFlex}>
              {tagTypes.map((tagtype) => {
              const tags = boardInfo.Tags['col_' + String(tagtype.id)];
              if(!tags){
                return null;
              }
              return <Column key={'columnid'+tagtype.id} tagtype={tagtype} 
              board_id={boardInfo.id} tags={tags}/>})}
            </Grid>
            :
            <Grid container item justify="center">
              <Alert severity="error">Xảy ra lỗi định vị bảng</Alert>
            </Grid>
          }
        </Grid>
      </DragDropContext>
      }
      </Grid>
    </>);
}