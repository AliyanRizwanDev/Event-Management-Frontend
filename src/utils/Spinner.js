import React from "react";
import classes from "./Spinner.module.css";

const Spinner = () => (
  <div className={classes.spinnerContainer}>
    <div className={classes.spinner}></div>
  </div>
);

export default Spinner;
