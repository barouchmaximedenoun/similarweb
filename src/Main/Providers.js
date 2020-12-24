import React from "react";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import { light } from "../themes";
//import { Provider } from "react-redux";
//import { store } from "../store";
import { SocketService } from './SocketService';
import { SocketContext } from './SocketContext';

const socketService = new SocketService();


export const Providers = ({ children }) => (
  //<Provider store={store}>
  <SocketContext.Provider value={socketService}>
    <MuiThemeProvider theme={light}>{children}</MuiThemeProvider>
  </SocketContext.Provider>
  //</Provider>
);
