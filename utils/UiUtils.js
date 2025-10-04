/*********************************************************************************
 * This has helper methods for managing the UI.
 *********************************************************************************/

/**
 * <p> This file is in charge of all things related to the UI.
 * <p> This includes prompts showing up on the screen, handling responses, and more.
 * <p> The only thing that is not here that has to do with the prompt is the menu setup, which is in Code.gs (for now)
 */


const ui = SpreadsheetApp.getUi();


/**
 * <p> This first displays the error message in an alert before actually throwing it.
 */
function promptError(message) {
  ui.alert(message);
  throw Error(message);
}


/**
 * <p> This pops up a screen with the options to end the program or continue going.
 * <p> This also logs the warning.
 */
function promptWarning(message) {
  let response = ui.alert("Warning", message + "\n\nWould you like to cancel the script?", ui.ButtonSet.YES_NO);

  if (response == ui.Button.YES) {
    throw Error(message);
  }
}


/**
 * This opens up a prompt window which accepts a typed number value.
 * @param id The name of the setting
 * @param prompt The text that will be displayed on the popup window.
 */
let lastInput = {};
function promptInput(id, prompt) {
  let response = ui.prompt(prompt);

  lastInput[id] = response.getResponseText();
  return lastInput;
}


/**
 * This will make a menu that contains a bunch of buttons for you to push :)
 * I'm doing it this way cause I can't make arbitrary buttons in Google Script, so custom HTML it is!
 */
function promptMenu(name) {
  // Use some custom HTML code in order to display the window and communicate the response.
  // See the following: https://stackoverflow.com/questions/75285382/how-to-add-custom-buttons-on-ui-using-prompt
  let html = HtmlService.createHtmlOutputFromFile(name);
  // This will automatically open up a new menu and save the value.
  SpreadsheetApp.getUi().showModalDialog(html, name);
}


/**
 * Prompts the user to select Yes, No, or Cancel.
 * @return "yes" if Yes was selected. "no" if No was selected. "cancel" if Cancel was selected.
 */
function promptYesOrNo(title, description) {
  let response = ui.alert(title, description, ui.ButtonSet.YES_NO_CANCEL);
  if (response == ui.Button.YES)    { return "yes";    }
  if (response == ui.Button.NO)     { return "no";     }
  if (response == ui.Button.CANCEL) { return "cancel"; }
}


/**
 * This will just put an alert on the user's screen.
 * Typically used to feedback after pressing some buttons.
 */
function alert(title, description) {
  ui.alert(title, description, ui.ButtonSet.OK);
}