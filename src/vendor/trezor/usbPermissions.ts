import { browser } from "webextension-polyfill-ts";
/*
Handling messages from usb permissions iframe
*/

const switchToPopupTab = async (event?: BeforeUnloadEvent) => {
  window.removeEventListener("beforeunload", switchToPopupTab);

  if (!event) {
    // triggered from 'usb-permissions-close' message
    // switch tab to previous index and close current
    const current = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });
    if (current.length < 0) return;
    const popup = await browser.tabs.query({
      index: current[0].index - 1,
    });
    if (popup.length < 0) return;
    browser.tabs.update(popup[0].id, { active: true });
    browser.tabs.remove(current[0].id!);
    return;
  }

  // TODO: remove this query, or add `tabs` permission. This does not work.
  // triggered from 'beforeunload' event
  // find tab by popup pattern and switch to it
  const tabs = await browser.tabs.query({
    url: "*://connect.trezor.io/*/popup.html",
  });
  if (tabs.length < 0) return;
  browser.tabs.update(tabs[0].id, { active: true });
};

window.addEventListener("message", (event) => {
  if (event.data === "usb-permissions-init") {
    const iframe = document.getElementById("trezor-usb-permissions");
    // @ts-ignore
    iframe.contentWindow.postMessage(
      {
        type: "usb-permissions-init",
        extension: browser.runtime.id,
      },
      "*"
    );
  } else if (event.data === "usb-permissions-close") {
    switchToPopupTab();
  }
});

window.addEventListener("beforeunload", switchToPopupTab);
