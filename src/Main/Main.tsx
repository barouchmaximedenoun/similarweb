import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Dashboard from "../components/Dashboard";
import { Providers } from "./Providers";

const Main: React.FC<{}> = (): React.ReactElement => (
  <Providers>
    <CssBaseline />
    <Dashboard />
  </Providers>
);
export default Main