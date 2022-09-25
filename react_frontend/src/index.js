import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-widgets/styles.css";
import "./index.css";
import "./App.css";
import "./QueryForm.css";
import "./Recipe.css";
import "./Notes.css";
import "./Tags.css";
import "./ResultList.css";
import * as serviceWorker from "./serviceWorker";

const root = createRoot(document.getElementById("root"));
//root.render(
//<React.StrictMode>
//<App />
//</React.StrictMode>
//);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
