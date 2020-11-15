import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import { useAuth } from "../utils/auth";

// Make sure that for every component/page using private route, ALWAYS remember to CALL setAuthToken(null) inside "catch" clause of a try-catch on an AXIOS CALL to HANDLE THE ERROR of the AXIOS CALL

export default function PrivateRoute({component: Component, ...rest }) {
  const {authToken} = useAuth();

  return(
      <Route {...rest} render={(props) => (
        authToken || authToken === undefined?(
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      )}
      />
    );
  }