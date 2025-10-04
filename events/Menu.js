// @ts-check
/**************************************************************************
 * This handles the creation of the menu whenever the spreadsheet is open.
 **************************************************************************/


/**
 * <p> When the script is opened, the following should happen:
 * <p> 1) A new menu option is added to the bar
 * <p> 2) The user's cache is read to get previous settings (if there)
 */
function onOpen() {
  // The menu has settings, run, and help tabs.
  // The setting tab is in charge of managing any unique aspects of the program such as priority, arbitrary data given, and email templates.
  const ui = SpreadsheetApp.getUi();

  if (setting_show_advanced_settings.getValue() === "true") {
  ui.createMenu("Rocket Scheduler")
    // Settings.gs: Will store user-specific settings using a cache (settings are unique per user)
    .addSubMenu(ui.createMenu("Settings")
      .addItem("View All Settings", "displayAllSettings")
      .addSeparator()
      .addSubMenu(ui.createMenu("Priority Options")
        .addItem("Rank High To Low", "modifySettingRankHighToLow")
        .addItem("Prioritize Balancing", "modifySettingPriotizeBalancing"))
      .addSubMenu(ui.createMenu("Advanced Features")
        .addItem("Recursion Depth", "modifyRecursionDepth")
        .addItem("Max Attempts", "modifyMaxAttempts")
        .addItem("Enable/Disable Range Selector (For Speed)", "modifySettingUseRangeSelector"))
      .addSubMenu(ui.createMenu("Data Ranges")
        .addSubMenu(ui.createMenu("Attendee Responses Sheet")
          .addItem("Modify Name Column", "modifyAttendeeNameColumn")
          .addItem("Modify Selections Column", "modifyAttendeeSelectionsColumn")
        .addSeparator()
          .addItem("Modify Start of Data Row", "modifyAttendeeDataRow"))
        .addSubMenu(ui.createMenu("Session List Sheet")
          .addItem("Modify Name Column", "modifySessionNameColumn")
          .addItem("Modify Host Column", "modifySessionHostColumn")
          .addItem("Modify Host Email Column", "modifySessionHostEmailColumn")
          .addItem("Modify Max Size Column", "modifySessionMaxSizeColumn")
          .addItem("Modify Blocks Column", "modifySessionBlocksColumn")
          .addItem("Modify Length Column", "modifySessionLengthColumn")
          .addItem("Modify Room", "modifySessionRoomColumn")
          .addItem("Modify Can Randomly Assign", "modifySessionCanAssignColumn")
          .addSeparator()
          .addItem("Modify Start of Data Row", "modifySessionDataRow"))
        .addSeparator()
        .addItem("Modify Number Of Sessions", "modifySettingNumberOfSessions"))
      .addItem("Sheet Names", "modifySheetNames")
      )

    // Run.gs: Will cache the end of the last execution so run time shouldn't be an issue
    .addItem("Run", "runScheduler")

    .addSubMenu(ui.createMenu("Help")
      .addItem("Documentation", "getDocumentation")
    )

    .addToUi(); // Actually add it to UI lol
  } else {
    ui.createMenu("Rocket Scheduler")
      .addItem("View All Settings", "displayAllSettings")
      .addItem("Run", "runScheduler")
      .addItem("Help", "openDocumentation")
    .addToUi();
  }
}


function openDocumentation() {
  let html = "<script>window.open(https://docs.google.com/document/d/1ZjZDFl0SBjFbB50lH4XLWmV9kEasu8cz9QXw_n_anDg/edit?usp=sharing);google.script.host.close();</script>";  
  let userInterface = HtmlService.createHtmlOutput(html);
  SpreadsheetApp.getUi().showModalDialog(userInterface, 'Open Tab');
}