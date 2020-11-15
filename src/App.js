import './css/App.css';
import {useEffect, useState} from "react";
import BoardsList from './components/BoardsList/BoardsList';
import LogIn from './components/Login/LoginPage';
import SignUp from './components/SignUp/SignUpPage';
import { BrowserRouter, Switch, Route} from "react-router-dom";
import PrivateRoute from './routes/PrivateRoute';
import AuthRoute from './routes/AuthRoute';
import HomeRoute from './routes/HomeRoute';
import NoMatchPage from './components/NoMatchPage';
import BoardContent from './components/BoardContent/BoardContent';
import Profile from './components/Profile/Profile';
import {AuthAxios, removeInterceptorForeverFromAxios} from './utils/auth';

// Contexts
import { AuthContext , accesstoken_keyname} from "./utils/auth";

function App() {
  const [authToken, setAccessToken] = useState(localStorage.getItem(accesstoken_keyname));
  const [isChecking_FirstTime, setCheckFirstTime] = useState(true);
  
  const setToken = (data) => {
    if(data){
      localStorage.setItem(accesstoken_keyname, data);
    }else{
      localStorage.removeItem(accesstoken_keyname);
    }
    setAccessToken(data);
  }

  useEffect(() => {
    (async() => {
      let existingToken = localStorage.getItem(accesstoken_keyname);
      if(existingToken && existingToken !== 'null'){
        try{    
          // vvvvv Check if access token is valid. if not valid will try to refresh the token => if refresh is successful, access token inside storage will automatically update. Otherwise, will throw an error vvvvvvvvv
          const checkToken = await AuthAxios.post(process.env.REACT_APP_API_URL + '/users/check-token-valid');
          if(checkToken.status !== 200) {
            localStorage.removeItem(accesstoken_keyname);
          }else{
            existingToken = localStorage.getItem(accesstoken_keyname);
            setToken(existingToken);
          }
        }catch(err){
          localStorage.removeItem(accesstoken_keyname);
        }
      } else {
        localStorage.removeItem(accesstoken_keyname);
      }
      setCheckFirstTime(false);
    })();

    return () => {
      removeInterceptorForeverFromAxios();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: setToken, isChecking_FirstTime}}>
      <BrowserRouter>
        <div className="App">
          <Switch>
            {/* Home will be the list of boards */}
            <HomeRoute exact path="/" component={BoardsList}/>
            {/* Login page */}
            <AuthRoute exact path="/login" component={LogIn}/>
            {/* SignUp page */}
            <AuthRoute exact path="/signup" component={SignUp}/>
            {/* Boards page */}
            <PrivateRoute exact path="/boards" component={BoardsList}/>   
            <PrivateRoute exact path="/board" component={BoardContent} />
            {/* Boards page */}
            <PrivateRoute exact path="/profile" component={Profile}/>   
            {/* 404 not found page */}
            <Route component={NoMatchPage}/>
          </Switch>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
