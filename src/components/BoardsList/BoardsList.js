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
import Link from '@material-ui/core/Link';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="#">
        Retro app
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
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

  useEffect(() => {
    (async () => {
        console.log(process.env.REACT_APP_API_URL +'/boards');
        const fetched = await fetch(process.env.REACT_APP_API_URL +'/boards');
        if(fetched.ok){
          setBoards(await fetched.json());
        }else{
          setBoards(null);
        }
    })();
    //Clean up code
    return ()=> {
        setBoards([]);
    };
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Home className={classes.icon} />
          <Typography variant="h6" color="inherit" noWrap>
            All boards
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              Boards
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Danh sách các bảng 
            </Typography>
            <div id="horizontal-menu-1" className={classes.heroButtons}>
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Button variant="contained" color="primary">
                    Thêm bảng mới
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="primary">
                    Thông tin tài khoản
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="primary">
                    Đăng xuất
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
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
                        <Typography gutterBottom variant="body1" align="justify">
                          {card.board_description ? card.board_description : ""}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          Xem
                        </Button>
                        <Button size="small" color="primary">
                          Sửa
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
              ))
              } else if (boards) {
                return <Box fontStyle="italic" justifyContent="center" width="100%">
                  <Typography variant="body2" color="textSecondary">
                    Đang tải các boards của bạn...
                  </Typography>
                </Box>
              } else {
                return <Box fontStyle="italic" justifyContent="center" width="100%">
                  <Typography variant="body2" color="textSecondary">
                    Chưa có boards nào 
                  </Typography>
                </Box>
              }
            })()
            }
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Typography variant="h6" align="center" gutterBottom>
          HI!
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          Even more hi! hi!
        </Typography>
        <Copyright />
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}