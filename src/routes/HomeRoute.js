import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import { useAuth } from "../utils/auth";

export default function HomeRoute({component: Component, ...rest }) {
  const {authToken, isChecking_FirstTime} = useAuth();
  return(
      <Route {...rest} render={(props) => (
        isChecking_FirstTime? 
        <div style={{
          position: "absolute",
          background: "#ffffff",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}></div>
        :
        authToken? (
          <Component {...props} />
        ) 
        :
          <Redirect to="/login" /> 
        )}
      />
    );
  }