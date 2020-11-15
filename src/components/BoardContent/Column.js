import { useAuth , AuthAxios} from "../../utils/auth";

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import React, {useState, useEffect} from 'react';

import {useStyles} from './css/boardContentStyle';
import TagCard from './TagCard';

import {Droppable} from 'react-beautiful-dnd';
import {COL_DROPPABLEID_PREFIX} from '../../utils/global';

export default function Column({tagtype, tags, board_id}){
    const classes = useStyles();
  
    const [columntags, setColumnTags] = useState(undefined);
    const [showAddTag, setShowAddTag] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const {setAuthToken} = useAuth();

    //useEffect ran once at the start
    useEffect(() => {
      if(tags){
        setColumnTags(tags);
      }
    }, [tags]);

    const onCommit = async (tag_id, tag_content) => {
      setIsLoading(true);
      if(!tag_id){
        try{
          const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL +'/boards/edit-board/add-tag', {
            board_id,
            tag_content,
            tag_type: tagtype.id
          });
          if(fetched.status === 200 || fetched.status === 304){
            const data = fetched.data.tagInfo;
            let clonedTags = columntags.slice();
            clonedTags = [data, ...clonedTags];
            setShowAddTag(false);
            setColumnTags(clonedTags);
            setIsLoading(false);
          }else{
            setShowAddTag(false);
            setIsLoading(false);
          }
        } catch (err){
          console.log(err);
          setShowAddTag(false);
          setIsLoading(false);
          if(err.response && err.response.status === 401){
            // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
            setAuthToken(null);
          }
        }
      } else {
        try{
          const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL +'/boards/edit-board/edit-tag', {
            tag_id,
            board_id,
            tag_content,
            tag_type: tagtype.id
          });
          if(fetched.status === 200 || fetched.status === 304){
            const data = fetched.data.tagInfo;
            let clonedTags = columntags.slice().map((value)=>{
              if(value.id === data.id){
                return data;
              }
              return value;
            });
            setColumnTags(clonedTags);
            setIsLoading(false);
          }else{
            setIsLoading(false);
          }
        } catch (err){
          console.log(err);
          setIsLoading(false);
          if(err.response && err.response.status === 401){
            // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
            setAuthToken(null);
          }
        }
      }
    };
  
    const onDelete = async (tag_id) => {
      if(!tag_id) return;
      setIsLoading(true);
      try{
        const fetched = await AuthAxios.post(process.env.REACT_APP_API_URL +'/boards/edit-board/delete-tag', {
          tag_id,
          board_id,
        });
        if(fetched.status === 200 || fetched.status === 304){
          let clonedTags = columntags.slice().filter((item) => item.id !== tag_id);
          clonedTags = [...clonedTags];
          setColumnTags(clonedTags);
          setIsLoading(false);
        }else{
          setIsLoading(false);
        }
      } catch (err){
        console.log(err);
        setIsLoading(false);
        if(err.response && err.response.status === 401){
          // vvvvvvv This line is VERY important, it helps with logging out in case there's a fetching problem vvvvvvvvvvvvvvv 
          setAuthToken(null);
        }
      }
    };
  
    return(
      <Grid container item xs={12} sm={6} md={4} lg={4} className={classes.columnThing}>
        <Paper elevation={3} style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}>
          {
          !tagtype || !tagtype.tagtype_name?
          <Box fontStyle="italic" style={{
            fontWeight: 'normal',
            justifyContent: 'center',
            padding: 7
          }}>
            Xảy ra lỗi về thông tin loại thẻ nên không thể tải cột
          </Box> 
          :
          <Box style={{
            width: "100%",
            background: 'linear-gradient(180deg, #3F51B5 30%, #6ea5ff 90%)',
            borderRadius: '5px 5px 0px 0px',
          }}>
            <Typography variant="h6" align="center" color="textPrimary" paragraph className={classes.tagName}>
              { tagtype.tagtype_name } 
            </Typography>
            <Button style={{
              color: 'white',
              width: '100%',
            }} onClick={async () => {
              if(!board_id){
                return;
              }
              setIsLoading(true);
              // make the hidden add card show up
              setShowAddTag(!showAddTag);
              setIsLoading(false);
            }
            }>
              +
            </Button>
          </Box> 
          }
          {
            /*There is not gonna be a tag_id to separate this tag as an add tag from normal tags*/
            showAddTag?
            <TagCard key={'sparetag'} style={{
              borderRadius: 5,
              padding: 10,
              background: "#f7f7f7",
            }} elevation={3} tag_content={null} turnOnEdit onStoppingEdit={() => {setShowAddTag(false)}} 
            setLoadingState={(state) => {setIsLoading(state)}}
            onCommit={(tag_id, tag_content) => {onCommit(tag_id, tag_content)}}
            onDelete={(tag_id) => {onDelete(tag_id)}}/> : null
          }
          { isLoading ? 
            <Box fontStyle="italic" style={{
              justifyContent: 'center',
              paddingTop: 10,
              paddingBottom: 10,
            }}>
                <CircularProgress />
            </Box>
          : 
          !columntags || !Array.isArray(columntags)?
            <Box fontStyle="italic" style={{
                fontWeight: 'normal',
                justifyContent: 'center',
                paddingTop: 10,
                paddingBottom: 10,
            }}>
                Không thể tìm thấy tag của cột
            </Box>
          :<Droppable droppableId={COL_DROPPABLEID_PREFIX + String(tagtype.id)}>
            {(provided) => {
              return(<div {...provided.droppableProps} ref={provided.innerRef}> 
                {
                  columntags.map((tag, index) => <TagCard key={'tagnumber' + tag.id} style={{
                    borderRadius: 5,
                    padding: 10,
                    background: "#f7f7f7",
                  }} elevation={3} tag_content = {tag.tag_content} tag_id = {tag.id}
                  prev_tag = {tag.prev_tag} next_tag ={tag.next_tag}
                  setLoadingState={(state) => {setIsLoading(state)}}
                  onCommit={(tag_id, tag_content) => {onCommit(tag_id, tag_content)}}
                  onDelete={(tag_id) => {onDelete(tag_id)}}
                  draggable card_idx_in_list={index}/>)
                }
                {provided.placeholder}
              </div>);
            }}
            </Droppable>
          }
        </Paper>
      </Grid>
    );
  }