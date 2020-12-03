import "./main.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import {
  listen,
  createLocationState,
  navigate,
  HistoryAction,
} from "lib/woozie";
import { isPopupModeEnabled } from "lib/popup-mode";
import { WindowType, openInFullPage } from "app/env";
import App from "app/App";

const savedPageStr = localStorage.getItem("popup_saved_page");
if (savedPageStr) {
  const { pathname, search, hash, savedAt } = JSON.parse(savedPageStr);
  if (savedAt > Date.now() - 30_000) {
    navigate({ pathname, search, hash }, HistoryAction.Replace);
  }
}

ReactDOM.render(
  <App env={{ windowType: WindowType.Popup }} />,
  document.getElementById("root")
);

const popups = browser.extension.getViews({ type: "popup" });
if (!popups.includes(window) || !isPopupModeEnabled()) {
  openInFullPage();
  window.close();
}

listen(() => {
  const { pathname, search, hash } = createLocationState();
  localStorage.setItem(
    "popup_saved_page",
    JSON.stringify({
      pathname,
      search,
      hash,
      savedAt: Date.now(),
    })
  );
});
