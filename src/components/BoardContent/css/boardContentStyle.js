import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: 5,
  },
  columnsFlex: {
    flexDirection: "row",
  },
  boardName: {
    margin: "2%", 
    fontWeight: 'bold',
  },
  tagName: {
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
    userSelect: "none",
  },
  card: {
    margin: theme.spacing(2,1),
    border: '3px solid #6ea5ff',
    background: "#ffffff",
    alignItems: 'flex-start',
  },
  cardEdit: {
    margin: theme.spacing(2,1),
    background: '#ffffff',
    border: '3px dashed #3F51B5',
    alignItems: 'flex-start',
  },
  columnThing: {
    padding: theme.spacing(2)
  }
}));