import React, {useState, useEffect} from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import {useStyles} from './css/boardContentStyle';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import { TextField} from "@material-ui/core";

import {Draggable} from 'react-beautiful-dnd';
import {TAGCARD_DRAGGABLEID_PREFIX, TAGCARD_DRAGGABLEID_TOKEN_INBETWEEN} from '../../utils/global';

export default function TagCard({card_idx_in_list, tag_id, tag_content, prev_tag, next_tag, turnOnEdit, onCommit, onDelete, onStoppingEdit, draggable}) {
    const classes = useStyles();

    const [isEditOn, setEditOn] = useState(turnOnEdit ? true : false);
    const [editTagContent, setEditTagContent] = useState(null);
  
    useEffect(() => {
      if(turnOnEdit){
        setEditTagContent(tag_content);
      }
  
      setEditOn(turnOnEdit ? true : false);
  
      return () => {
        setEditOn(false);
      };
    }, [turnOnEdit, tag_content]);
  
    const child_component = () => {
      return (<Card className={isEditOn ? classes.cardEdit : classes.card} elevation={3}>
        <CardContent style={isEditOn ? {
          display: 'flex',
          flexDirection: 'column',
        } : {
          display: 'flex',
          flexDirection: 'row',
        }}>
          {isEditOn?
          <Grid container>
            <Grid item xs={12}>
              <TextField 
              variant="outlined"
              fullWidth
              value={editTagContent ? editTagContent : ''}
              onChange={(e) => {
                e.target.value = e.target.value.slice(0,Math.min(250, e.target.value.length));
                setEditTagContent(e.target.value);
              }}
              style={{
                width: '100%',
              }}
              inputProps={{
                style: { textAlign: "left" , fontSize: 14,}
              }}
              multiline/>
            </Grid>
          </Grid>
          :
          <Grid container style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <Grid item xs={11}>
              <Typography style={{
                overflowWrap: 'break-word',
                userSelect: "none",
                fontSize: 14,
              }} align="justify">
                {tag_content ? tag_content : ''}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Button style={{
                maxWidth: 16,
                minWidth: 16,
                maxHeight: 16,
                minHeight: 16,
              }}
              onClick={async () => {
                setEditTagContent(tag_content);
                setEditOn(!isEditOn);
              }}>
                <EditIcon style={{
                  color: '#3F51B5',
                  maxWidth: 16,
                  minWidth: 16,
                  maxHeight: 16,
                  minHeight: 16,
                }}/>
              </Button>
            </Grid>
          </Grid>
          } 
      </CardContent>
      <CardActions>
      {isEditOn?
          <Grid container item xs={12} style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Grid item xs={12} lg={2} >
                <Button onClick={async() => {
                  if(!editTagContent || editTagContent === ''){
                    alert('Tag content cannot be empty');
                    return;
                  }
                  if(onCommit) {
                    await onCommit(tag_id, editTagContent);            
                  }
                }}>
                  Done
                </Button>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Button onClick={async() => {
                    if(onStoppingEdit) {
                      onStoppingEdit()
                    }
                    setEditOn(false);
                  }}>
                    Cancel
                </Button>
              </Grid>
              <Grid item xs={undefined} lg={6}/>
              <Grid item xs={12} lg={1}>
                {tag_id? 
                <Button style={{
                  maxWidth: 16,
                  minWidth: 16,
                  maxHeight: 16,
                  minHeight: 16,
                }}
                onClick={async () => {
                  if(onDelete) {
                    await onDelete(tag_id);
                  }
                }}>
                  <DeleteIcon style={{
                    color: 'red',
                    maxWidth: 16,
                    minWidth: 16,
                    maxHeight: 16,
                    minHeight: 16,
                  }}/>
                </Button>
                : null}
              </Grid>
            </Grid>
      : null}
      </CardActions>
    </Card>);
    }

    return((() => {
      if(draggable) {
       return (<Draggable draggableId={TAGCARD_DRAGGABLEID_PREFIX + String(tag_id) 
       + TAGCARD_DRAGGABLEID_TOKEN_INBETWEEN + String(prev_tag)
       + TAGCARD_DRAGGABLEID_TOKEN_INBETWEEN + String(next_tag)} index={card_idx_in_list}>
          {provided => {
            return(<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}> 
              {child_component()}
            </div>);
          }}
        </Draggable>);
      }else{
        return child_component();
      }  
      })()
    );
  }