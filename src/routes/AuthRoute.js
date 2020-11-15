import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import { useAuth } from "../utils/auth";

export default function AuthRoute({component: Component, ...rest }) {
  const {authToken} = useAuth();

  return(
      <Route {...rest} render={(props) => (
        !authToken? (
          <Component {...props} />
        ) : (
          <Redirect to="/" />
        )
      )}
      />
    );
  }