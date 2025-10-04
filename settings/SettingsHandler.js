// @ts-check
/******************************************************************************
 * 
 * This contains all information pertaining to the settings of the program.
 * That includes but is not limited to naming, priorities, and more.
 * All default values can be found in the DEFAULT_SETTINGS object.
 * 
 ******************************************************************************/

/**
 * These are all the different groups of settings
 */
// This keeps track of all the possible groups of settings
let allGroups = new Set();

const GROUP_SHEET_NAMES = "Sheet Names";
const GROUP_RATINGS_COLUMNS = "Ratings Sheet Columns";
const GROUP_SESSIONS_COLUMNS = "Sessions Sheet Columns";
const GROUP_ROWS = "Rows Info";
const GROUP_SCHEDULER = "Scheduler";
const GROUP_MISC = "Misc";



/**
 * <p> A reference to the user's cache for storing settings
 * <p> Data will be saving in the following format: {settings: {NAME : VALUE, NAME: VALUE, NAME: VALUE}}
 */
const cache = PropertiesService.getDocumentProperties();

/**
 * <p> The key in which data will be stored in the cache.
 */
const SETTINGS_KEY = "rocket_scheduler_settings";

/**
 * <p> This stores the current cached values which will be updated whenever necessary.
 * <p> The "rocket_scheduler_settings" is the key to the object which contains all the settings
 */
let cache_contents = JSON.parse(cache.getProperty(SETTINGS_KEY));


/**
 * <p> Contains all of the default settings of the program.
 * <p> Contains them in the format: {GROUP: {NAME: VALUE, NAME: VALUE, NAME:VALUE} }
 * <p> Some settings will return numbers, others will return strings.
 */
const DEFAULT_SETTINGS = {
  
  "Ratings Sheet Name"               : "Form Responses",
  "rat_Number of Headers"            : '1', // CURRENTLY WON'T WORK. BEFORE THIS WAS STUDENT_DATA_ROW WHICH WAS 2, NOT 1
  "rat_Name Column"                  : '2',  // Is 'C' (col - 1)
  "rat_Ratings Column"               : '5',  // 'F

  "Sessions Sheet Name"                         : "Sessions",
  "Number of Sessions"                          : '4',
  "ses_Number of Headers"                       : '2',
  "ses_Max Size Column"                         : '4',  // Is 'E' (col - 1)
  "ses_Name Column"                             : '0',  // 'A'
  "ses_Room Column"                             : '3',  // 'D'
  "ses_Host Column"                          : '1',  // 'B'
  "ses_Host Email Column"                    : '2',  // 'C'
  "ses_Available Blocks Column"                 : '5',  // 'F'
  "ses_Length Column"                           : '6',  // 'G'
  "ses_Randomly Assignable Column"              : '7',  // 'H'

  "Sessions Per Attendee"    : '3',  // Option
  "Recursion Depth"         : '2',
  "Max Attempts"            : '10',
  "Rank High To Low"        : "true",
  "Use Range Selector"      : "false",// Determine if modifying the settings should use the range selector or typing.
  "Prioritize Balancing"    : "false",// Determine if balancing out sessions should be more important than giving high ratings
  "Attendee Assignments Sheet Name"   : "Attendee Assignments",
  "Host Rosters Sheet Name"       : "Host Rosters",

  "Show Advanced Settings" : "false",
  "Overrides Sheet Name"   : "Overrides"
};


/**
 * ALL SETTINGS
 */
// This stores every single setting as key-value pairs
// A new setting is added to this in the Setting.gs constructor
let allSettings = {};

// Ratings Columns
let setting_ratings_column_name = new Setting("rat_Name Column", "column", "Name Column", GROUP_RATINGS_COLUMNS, "This controls which column in the ratings sheet contains the name of the attendees.");
let setting_ratings_column_ratings = new Setting("rat_Ratings Column", "column", "Start of Ratings Column", GROUP_RATINGS_COLUMNS, "This controls which column in the ratings sheet is the first column with ratings in it.");

// Sessions Columns
let setting_sessions_column_max_size = new Setting("ses_Max Size Column", "column", "Max Size Column", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the max size of each session (in attendees).");
let setting_sessions_column_name = new Setting("ses_Name Column", "column", "Name Column", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the name of each session.");
let setting_sessions_column_room = new Setting("ses_Room Column", "column", "Room Column", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the rooms of each session. If this is empty, then the output will say UNKNOWN.");
let setting_sessions_column_host = new Setting("ses_Host Column", "column", "Host Column", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the head host name of each session.");
let setting_sessions_column_host_email = new Setting("ses_Host Email Column", "column", "Host Email Column", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the head host' email of each session.");
let setting_sessions_column_available_blocks = new Setting("ses_Available Blocks Column", "column", "Available Blocks", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the available blocks of each session. This can be either in number form '1,2,4' or in letter form 'ABD'");
let setting_sessions_column_length = new Setting("ses_Length Column", "column", "Length of Session", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet contains the lengths of each session. For double blocks, this would be 2. This single blocks (normal sessions), this should be 1. This can handle any number of blocks.");
let setting_sessions_column_randomly_assignable = new Setting("ses_Randomly Assignable Column", "column", "Randomly Assignable", GROUP_SESSIONS_COLUMNS, "This controls which column in the sessions sheet states whether or not this session can be randomly assigned to people who have no ratings (generally people who didn't fill out the form). If 'yes', then this session can be randomly assigned. If 'no', then it can't be.");

// Rows
let setting_ratings_number_of_headers = new Setting("rat_Number of Headers", "number", "Number of Headers - Ratings", GROUP_ROWS, "This is the number of headers in the ratings sheet.");
let setting_sessions_number_of_headers = new Setting("ses_Number of Headers", "number", "Number of Headers - Sessions", GROUP_ROWS, "This is the number of headers in the sessions sheet.")
let setting_number_of_sessions = new Setting("Number of Sessions", "number", "Number of Sessions", GROUP_SCHEDULER, "This is the number of sessions. This is very important and must be set correctly in order to have the scheduler run quickly. Refer to [Counting Sessions Quickly] if you want to count up the number of sessions in a few clicks.");

// Sheet Names
let setting_ratings_sheet_name = new Setting("Ratings Sheet Name", "string", "Ratings Sheet Name", GROUP_SHEET_NAMES, "This is the name of the sheet that has the ratings data (the per-attendee ratings).");
let setting_options_sheet_name = new Setting("Sessions Sheet Name", "string", "Sessions Sheet Name", GROUP_SHEET_NAMES, "This is the name of the sheet that contains the sessions");
let setting_overrides_sheet_name = new Setting("Overrides Sheet Name", "string", "Overrides Sheet Name", GROUP_SHEET_NAMES, "This is the name of the sheet that the overrides are contained in.");
let setting_output_sheet_attendees_name = new Setting("Attendee Assignments Sheet Name", "string", "Attendee Assignments Sheet Name", GROUP_SHEET_NAMES, "This will be the name of the sheet that attendee assignments are placed into after the scheduler is run.");
let setting_output_sheet_hosts_name = new Setting("Host Rosters Sheet Name", "string", "Host Rosters Sheet Name", GROUP_SHEET_NAMES, "This is the name of the sheet that the host rosters will be placed into after the scheduler is run.");

// Scheduler
let setting_sessions_per_attendee = new Setting("Sessions Per Attendee", "number", "Sessions Per Attendee", GROUP_SCHEDULER, "This is the number of sessions that each attendee can have. In other words, this is the number of blocks. For example, if each attendee is supposed to get 4 sessions (or has 4 blocks), then this should be set to 4.")
let setting_recursion_depth = new Setting("Recursion Depth", "number", "Recursion Depth", GROUP_SCHEDULER, "This sounds fancy, but all this does is determine the number of times that the code will try to kick people out from sessions (and put them in other sessions with equal ratings) in order to fit someone into that session who normally couldn't get in. Please do not set this to a high value, (2-3 max), as it gets exponentially slower at higher values. As of May 14, 2025, this currently is not functional.")
let setting_max_attempts = new Setting("Max Attempts", "number", "Max Attempts", GROUP_SCHEDULER, "The scheduler works by running its algorithm {Max Attempts} number of times, and taking the best output of all those trials. This works because a bit of randomness is added each time, resulting in slightly different outputs.")

// Misc
let setting_use_range_selector = new Setting("Use Range Selector", "boolean", "Use The Range Selector", GROUP_MISC, "This will determine if the custom range selector is used when modifying a setting that requires a range. PLEASE NOTE that this is incredibly slow (~30 seconds per range), so use at your own risk.");
let setting_rank_high_to_low = new Setting("Rank High To Low", "boolean", "Rank High To Low", GROUP_MISC, "This is to be removed.")
let setting_prioritize_balancing = new Setting("Prioritize Balancing", "boolean", "Prioritize Balancing", GROUP_MISC, "This is to be removed.")
let setting_show_advanced_settings = new Setting("Show Advanced Settings", "boolean", "Show Advanced Settings", GROUP_MISC, "If enabled, this will show more advanced settings, and enable manual editing of certain settings for potentially faster development. You will need to refresh for this to take effect.")


/**
 * This reloads all of the settings currently in the allSettings array.
 * This is required after every change made to the settings.
 */
function reloadSettings() {
  // Iterate through all of the settings
  for (const [key, setting] of Object.entries(allSettings)) {
    setting.setValue(cache_contents[key]);
  }
}


/**
 * <p> If the settings are empty, initialize them. This is pretty straightforward.
 */
function checkForSettings() {
  if (cache_contents == null) {
    initializeSettings();
  }
}


/**
 * <p> This initializes the default settings and uploads them to the cache.
 * <p> This should only be called on the first time a user uses the script.
 */
function initializeSettings() {
  // Set the cache contents to an empty object. This assumes it was null before.
  cache_contents = {};
  let cached_stuff = {};
  try {
    cached_stuff = JSON.parse(cache.getProperty(SETTINGS_KEY));
  } 
  catch (exception) {
    Logger.log(exception)
  }

  // Loop through each default setting and add it to the local cache.
  for(let key of Object.keys(DEFAULT_SETTINGS)) {
    // If the setting is already cached, read it.
    if (cached_stuff != null && cached_stuff.hasOwnProperty(key)) {
      cache_contents[key] = cached_stuff[key];
    }
    // If not, use the default
    else {
      cache_contents[key] = DEFAULT_SETTINGS[key];
    }
  }

  // Put all the settings in the cache for next time.
  cache.setProperty(SETTINGS_KEY, JSON.stringify(cache_contents));
}


/**
 * <p> Retrives a setting based on the name (denoted as key).
 * <p> If the setting is not found in the user's cache, the default option is used instead and put in cache.
 * @param {string} key Is the name of the setting being searched for
 * @return {string} The setting's value.
 */
function getSetting(key) {
  // If there are no stored settings, then it should initialize the settings.
  if (typeof cache_contents !== 'object' || cache_contents == null) {
    initializeSettings();
  }
  // If the cache does not contain anything associated with the key, it will return null
  if (key in cache_contents) {
    return cache_contents[key];
  }
  // If the cache does not contain the key, the default will be added to the cache and used
  else {
    return defaultValueOf(key);
  }
}


/**
 * <p> Gets the default setting to a specific key.
 * <p> There is no error handling because the code should never ask for a key that doesn't exist lol
 * @param {string} key Is the name of the default setting.
 * @return {string} The default value of the setting.
 */
function defaultValueOf(key) {
  let value = DEFAULT_SETTINGS[key];
  return value;
}


/**
 * This is just for debugging. It outputs the cached settings into the logger.
 */
function readCache() {
  initializeSettings();
  Logger.log("Cache:\n" + cache.getProperty(SETTINGS_KEY));
  Logger.log("Cached Cache (lol):\n" + JSON.stringify(cache_contents));

  // Logger.log("Cache:");
  // for (const [key, setting] of Object.entries(cache.get(SETTINGS_KEY))) {
  //   Logger.log(key + ": " + setting);
  // }
  // Logger.log("Cached Cache (lol):");
  // for (const [key, setting] of Object.entries(cache_contents)) {
  //   Logger.log(key + ": " + setting);
  // }
}


/**
 * This will modify the cache and the temporary array's stored value to a new value based on the key.
 * @param {string} settingKey The key of the setting to update.
 * @param {string} newValue The value to assign to the setting.
 * @param {boolean} popup Determines if a dialogue should show up confirming the update.
 */
function updateSetting(settingKey, newValue, popup=true) {
  cache_contents[settingKey] = newValue;
  cache.setProperty(SETTINGS_KEY, JSON.stringify(cache_contents));
  reloadSettings();
  if (popup)
    alert("Success!", "Updated " + settingKey + " to " + newValue);
}


/**
 * This will open up a prompt window that allows the user to type in a new value for the setting.
 * This type of modification will only allow a number to be entered.
 * @param {Setting|string} setting The setting to modify.
 */
function modifySettingNumber(setting) {
  let value = promptInput(setting, "What new value would you like to apply to " + setting + "?")[setting];

  // Check if the new value is actually a number
  if (!isNaN(value)) {
    if (setting instanceof Setting)
      updateSetting(setting.getKey(), value);
    else
      updateSetting(setting, value);
  }
  // If not a number, then prompt a warning
  else {
    promptWarning(value + " is not a valid number.");
  }
}


/**
 * This will open up a prompt window that allows the user to select yes or no.
 * This type of modification will only allow yes, no, or cancel to be entered
 * @param {string} text The prompt.
 * @param {Setting|string} setting The setting to modify.
 */
function modifySettingBoolean(text, setting) {
  let value = promptYesOrNo(setting, text);

  // Check if the new value is actually a number
  if (value == "yes") {
    if (setting instanceof Setting)
      updateSetting(setting.getKey(), "true");
    else
      updateSetting(setting, "true");
  }
  else if (value == "no") {
    if (setting instanceof Setting)
      updateSetting(setting.getKey(), "false");
    else
      updateSetting(setting, "false");
  }
  // Do nothing if cancel was selected
  return;
}


/**
 * This will open up a prompt window that allows the user to type in a new value for the setting.
 * This type of modification will only allow a String to be entered.
 * @param {Setting|string} setting The setting to modify.
 */
function modifySettingString(setting) {
  let value = promptInput(setting, "What new value would you like to apply to " + setting + "?")[setting];

  if (setting instanceof Setting)
    updateSetting(setting.getKey(), value);
  else
    updateSetting(setting, value);
}


/**
 * This will open up a prompt window that gives the user time to select a column.
 * @param {string} setting_key The key of the setting to modify.
 */
function modifySettingColumn(setting_key) {
  if (setting_use_range_selector.getValue() == "true") {
  // Will pause the code until the user selects a range and clicks the button.
    selectRange();
    let value = convertColumnToNumber(selectedRange.charAt(0));

    // Can't use updateSetting() because it's accessing something inside a dictionary.
    cache_contents[setting_key] = value;
    cache.setProperty(SETTINGS_KEY, JSON.stringify(cache_contents));
    reloadSettings();
    alert("Success!", "Updated " + setting_key + " to " + value);
  }
  else {
    let value = promptInput(setting_key, "Please type in a valid column (example: \'A\').")[setting_key];
    cache_contents[setting_key] = convertColumnToNumber(value);
    cache.setProperty(SETTINGS_KEY, JSON.stringify(cache_contents));
    reloadSettings();
    alert("Success!", "Updated " + setting_key + " to " + value);
  }
}


/**
 * This will open up a prompt window that gives the user time to select a column.
 * @param {string} setting The key of the setting to modify.
 */
function modifySettingRow(setting) {
  if (setting_use_range_selector.getValue() == "true") {
    // Will pause the code until the user selects a range and clicks the button.
    selectRange();
    let value = selectedRange.charAt(1);
    updateSetting(setting, value);
  }
  else {
    let value = promptInput(setting, "Please type in a valid row number.");
    // Check if it is a number
    if (!isNaN(value[setting])) {
      updateSetting(setting, value[setting]);
    }
    else {
      promptWarning("You have entered an invalid row number.\n\'" + value[setting] + "\' is not a valid row.");
    }
  }
}


/**
 * This just straight up changes a setting.
 * There is no prompting or anything.
 * @param {string} key The key of the setting to change.
 * @param {string} value The value to assign to the setting.
 * @return {boolean} True if the setting was successfully updated. False if otherwise. Null if nothing changed.
 */
function changeSetting(key, value) {
  const setting = allSettings[key];
  const columnRegex = /^[A-Z]+$/;
  const numberRegex = /^\d+$/;

  if (setting.getType() === "column" && columnRegex.test(value)) {
    updateSetting(key, String(convertColumnToNumber(value)), false);
    return true;
  }
  else if (setting.getType() === "column" && numberRegex.test(value)) {
    updateSetting(key, value, false);
    return true;
  }
  else if (setting.getType() === "column") {
    promptWarning("Unable to set " + setting.getName() + " to " + value + " because it is not a valid column.");
    return false;
  }
  else if (setting.getType() === "boolean" && (value === "true" || value === "false")) {
    if ((value === "true" && setting.getValue() === "true") || (value === "false" && setting.getValue() === "false")) {
      return null;
    }
    updateSetting(key, value, false);
    return true;
  }
  else if (setting.getType() === "boolean") {
    promptWarning("Unable to set " + setting.getName() + " to " + value + " because it is not a valid boolean.");
    return false;
  }
  else if (setting.getType() === "number" && numberRegex.test(value)) {
    updateSetting(key, value, false);
    return true;
  }
  else if (setting.getType() === "number") {
    promptWarning("Unable to set " + setting.getName() + " to " + value + " because it is not a valid number.");
    return false;
  }
  else if (setting.getType() === "string") {
    updateSetting(key, value, false);
    return true;
  }
  else {
    promptWarning("Unable to set " + setting.getName() + " to " + value + " because it is of the type " + setting.getType() + ".");
    return false;
  }
}


/**
 * This converts a letter into its numerical equivalent. A=0 | B=1 | etc.
 * Currently this doesn't take into account multiple letters.
 * @param {string} column The column (as a letter)
 * @return {number} The numerical equivalent of that column. (A=0, B=1, C=2, ...)
 */
function convertColumnToNumber(column) {
  // Using the ascii value of the uppercase letter.
  return (column.toUpperCase().charCodeAt(0) - 65);
}


/**
 * This takes a column index as a number and returns the corresponding letter index.
 * @param {number} column The index of the column starting at 0.
 * @return {string} The column letter. (0=A, 1=B, 2=C, ...)
 */
function columnToLetter(column)
{
  // Had to include this because of a bug
  if (column == 0) {
    return 'A';
  }

  // Loops through the number because letter indexes can be a combo of letters 'AZ' for example. It's base 26.
  let temp, letter = '';
  while (column > 0)
  {
    temp = (column) % 26;
    // Ascii of 65 = 'A'
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp) / 26;
  }
  return letter;
}







/****************************************
 * HELPER FUNCTIONS FOR SELECTING STUFF *
 ****************************************/
 // The following 3 methods come from https://stackoverflow.com/questions/45382359/prompt-user-for-range-in-gs-function-pass-array-to-html-script-and-re-focus-on/45427670#45427670

/**
 * <p> Prompts a dialogue that gives the user time to select a range.
 * <p> This will pause the code until the range is selected.
 */
function selectRange()//run this to get everything started.  A dialog will be displayed that instructs you to select a range.
{
  let output = HtmlService.createHtmlOutputFromFile('PickRange').setWidth(300).setHeight(200).setTitle('Select A Range');
  SpreadsheetApp.getUi().showModelessDialog(output, 'Range Selector');
}

/**
 * This is called whenever the range selection method is activated, and it stores the selected range in currentRange.
 * @return {string} The range that is currently being highlighted by the user.
 */
function selectCurrentRange() 
{
  let sheet = ss.getActiveSheet();
  let range = sheet.getActiveRange();
  let rangeNotation = range.getA1Notation();
  setSelectedRange(rangeNotation);
  return rangeNotation;
}

let selectedRange = "Z1:Z1";
/**
 * Sets a global variable to the currently selected range.
 * @param range The range to set the global variable (selectedRange) to.
 */
function setSelectedRange(range) {
  selectedRange = range;
}






/************************************************************
 * THIS IS SUCH A LONG FUNCTION THAT IT HAS ITS OWN SECTION *
 ************************************************************/
/**
 * Guess what? This... displays all the settings in a sidebar!
 * It uses the html SettingsSidebar.html and replaces all the {FILLER_SPACES} with the appropriate setting.
 */
function displayAllSettings() {
  displaySettingsSidebar()
}


/**
 * This loops through the settings array and dynamically makes all groups and settings.
 */
function displaySettingsSidebar() {
  // You can see this exact html in the new_settings_sidebar.html <head> tag.
  let htmlText = "<html><head><style>.settingbox {border-radius: 8px;width: auto;height:auto;border: 5px solid rgb(128, 0, 0);padding: 10px;margin: 10px;background-color: rgba(255,255,255,0);}.text {color: #000000;font-family: \"Lucida Console\", \"Courier New\", monospace;}.settingname {color: #000000;font-family: \"Arial\", Impact, fantasy;}.moreinfo{white-space: nowrap;}.moreinfo:before {content: \'?\';display: inline-block;font-family: sans-serif;font-weight: bold;text-align: center;width: 1.8ex;height: 1.8ex;font-size: 1.4ex;line-height: 1.8ex;border-radius: 1.2ex;margin-right: 4px;padding: 1px;color: rgb(255, 0, 0);background: white;border: 1px solid red;text-decoration: none;}.moreinfo:hover:before{color: white;background: rgb(255, 0, 0);border-color: white;text-decoration: none;}.hiddeninfo {font-size: 1.2ex;color: rgb(139, 139, 139);display: none;}.moreinfo:hover + .hiddeninfo {display: inline-block;}.setting {border: none;text-align: left;text-decoration: none;display: inline-block;margin: 5px 2px;    cursor: pointer;color: #ffc400;background-color: rgba(255, 0, 0, 0);}.setting::placeholder {border: none;text-align: left;text-decoration: none;display: inline-block;margin: 0px 0px;    cursor: pointer;color: #ff0000;background-color: rgba(255, 0, 0, 0);}.save_button {background-image: linear-gradient(144deg, #ff4040, #eca114 50%, #111111);border: 0;border-radius: 8px;box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;box-sizing: border-box;color: #FFFFFF;display: flex;font-family: Phantomsans, sans-serif;font-size: 20px;justify-content: center;line-height: 1em;max-width: 100%;min-width: 140px;padding: 6px;text-transform: none;font-size: 24px;text-decoration: none;user-select: none;-webkit-user-select: none;touch-action: manipulation;white-space: nowrap;cursor: pointer;position: fixed;text-align: center;height: 40px;bottom: 0px;left: 50%;transform: translate(-50%, -50%);}.save_button:active {background-image: linear-gradient(144deg, #14802a, #270a91 50%, #6e0aa3);}</style><base target=\"_top\"></head><body><h2>MAKE SURE TO SAVE YOUR SETTINGS!</h2><div id=\"all_settings\">";

  // Add each setting, group by group
  // To do this, we iterate through each group.
  for (const group of allGroups) {
    htmlText += `<h3>${group}</h3><div class="settingbox">`;
    // Find each setting in that group
    for (const [key, setting] of Object.entries(allSettings)) {
      if (setting.getGroup() == group) {
        // Determine which type of setting it is (to change the format of the input)
        let settingType = setting.getType();

        if (settingType == "number") {
          htmlText += `<label for="${setting.getKey()}" class="settingname">${setting.getName()}<span class="moreinfo"></span> <div class="hiddeninfo text">${setting.getDescription()}</div></label><input customtype="number" class="setting" type="number" id="${setting.getKey()}" name="${setting.getName()}" placeholder="${setting.getValue()}">`;
        }

        else if (settingType == "boolean") {
          htmlText += `<label for="${setting.getKey()}" class="settingname">${setting.getName()}<span class="moreinfo"></span> <div class="hiddeninfo text">${setting.getDescription()}</div></label><input customtype="boolean" class="setting" type="checkbox" id="${setting.getKey()}" name="${setting.getName()}" ${setting.getValue()=="true" ? "checked" : ""}>`;
        }

        else if (settingType == "string") {
          htmlText += `<label for="${setting.getKey()}" class="settingname">${setting.getName()}<span class="moreinfo"></span><div class="hiddeninfo text">${setting.getDescription()}</div></label><input customtype="string" class="setting" type="text" id="${setting.getKey()}" name="${setting.getName()}" placeholder="${setting.getValue()}">`;
        }

        else if (settingType == "column") {
          // Columns are dumb because I store them as ints, so I have to convert them to column names.
          htmlText += `<label for="${setting.getKey()}" class="settingname">${setting.getName()}<span class="moreinfo"></span><div class="hiddeninfo text">${setting.getDescription()}</div></label><input customtype="column" class="setting" type="text" id="${setting.getKey()}" name="${setting.getName()}" placeholder="${columnToLetter(setting.getValue())}">`;
        }

        htmlText += `<br>`;
      }
    }

    // Close each group
    htmlText += "</div>";
  }

  // Add the final footer html, including the script that makes the whole system functional.
  htmlText += `</div><br><br><br><br><br><br><br><button id="rocket_scheduler_save_button" class="save_button" onclick = "saveAllSettings()" > Save All </button><script>
  function saveAllSettings() {
    let columnPattern = /^[A-Z]+$/;
    let changedSettings = {};
    const form = document.getElementById("all_settings");
    for (const group of form.children) {
      if (group.className === "settingbox") {
        for (const setting of group.children) {
          if (setting.className === "setting" && setting.value != '') {
            if (setting.getAttribute("customType") === "column" && columnPattern.test(setting.value)) {
              changedSettings[setting.id] = setting.value;
              setting.placeholder = setting.value;
              setting.value = '';
            }
            else if (setting.getAttribute("customType") === "column") {
              alert(setting.value + " is not a valid column for " + setting.name);
            }
            else if (setting.getAttribute("customType") === "boolean") {
              changedSettings[setting.id] = setting.checked ? "true" : "false";
            }
            else {
              changedSettings[setting.id] = setting.value;
              setting.placeholder = setting.value;
              setting.value = '';
            }
          }
        }
      }
    }
    console.log(changedSettings);
    alert("Saved settings for the rocket scheduler may take 8-10 seconds to apply.");
    google.script.run.bulkChangeSettings(changedSettings);
  }</script></body></html>`;

  // Put the html onto the sidebar in the google sheet
  let html = HtmlService.createHtmlOutput();
  html.setContent(htmlText)
  SpreadsheetApp.getUi().showSidebar(html);
}


/**
 * This changes many settings at once and is mainly used for the settings sidebar.
 * The changedSettings object takes the form of:
 * {
 *    key: NEW_VALUE,
 *    key: NEW_VALUE,
 *    ...
 * }
 * @param {object} changedSettings A list of all the settings that were changed.
 */
function bulkChangeSettings(changedSettings) {
  let successes = new Array();
  let failures = new Array();

  for (const [key, value] of Object.entries(changedSettings)) {
    let success = changeSetting(key, value);
    if (success == null) {
      continue;
    }
    if (success) {
      successes.push([key, value]);
    }
    else {
      failures.push([key, value]);
    }
  }
  let text = "Sucessfully updated the following settings:\n";
  for (const keyValuePair of successes) {
    text += keyValuePair[0] + "->" + keyValuePair[1] + "\n";
  }
  text += "\nFailed to update the following settings:\n";
  for (const keyValuePair of failures) {
    text += keyValuePair[0] + "->" + keyValuePair[1] + "\n";
  }

  alert("Settings Have Successfully Updated!", text);
}






/*********************************************
 * FROM HERE ON, IT'S SPECIFIC MENU BUTTONS
 *********************************************/
// Very outdated.
function modifySettingUseRangeSelector()  { modifySettingBoolean("Would you like to enable the Range Selector?\nYes for enable. No for disable.", "Use Range Selector"); }
function modifySelectionsSheet()          { modifySettingString("Ratings Sheet Name"); }
function modifyOptionsSheetName()         { modifySettingString("Sessions Sheet Name"); return true; }
function modifyOutputSheetName()          { modifySettingString("Attendee Assignments Sheet Name"); return true; }
function modifyOutputRosterName()         { modifySettingString("Host Rosters Sheet Name"); return true; }
function modifyAttendeeNameColumn()       { modifySettingColumn("rat_Name Column"); return true; }
function modifyAttendeeSelectionsColumn() { modifySettingColumn("rat_Ratings Column"); return true; }
function modifySessionNameColumn()        { modifySettingColumn("ses_Name Column"); return true; }
function modifySessionHostColumn()        { modifySettingColumn("ses_Host Column"); return true; }
function modifySessionHostEmailColumn()   { modifySettingColumn("ses_Host Email Column"); return true; }
function modifySessionMaxSizeColumn()     { modifySettingColumn("ses_Max Size Column"); return true; }
function modifySessionBlocksColumn()      { modifySettingColumn("ses_Available Blocks Column"); return true; }
function modifySessionLengthColumn()      { modifySettingColumn("ses_Length Column"); return true; }
function modifySessionCanAssignColumn()   { modifySettingColumn("ses_Randomly Assignable Column"); return true; }
function modifySessionRoomColumn()        { modifySettingColumn("ses_Room Column"); return true; }
function modifyAttendeeDataRow()          { modifySettingNumber("rat_Number of Headers"); return true; }
function modifySessionDataRow()           { modifySettingNumber("ses_Number of Headers"); return true; }
function modifyNumberOfSessions()         { modifySettingNumber("Number of Sessions"); return true; }
function modifySessionsPerAttendee()      { modifySettingNumber("Sessions Per Attendee"); return true; }
function modifyRecursionDepth()           { modifySettingNumber("Recursion Depth"); return true; }
function modifyMaxAttempts()              { modifySettingNumber("Max Attempts"); return true; }
function modifySettingRankHighToLow()     { modifySettingBoolean("Would you like higher ratings to be the best ratings?\n<Yes> if you want to rank high -> low.\n<No> if you want to rank low -> high.", "Rank High To Low")}
 function modifySettingPriotizeBalancing(){ modifySettingBoolean("Should balancing out attendee numbers in each session be prioritized over giving people their highest rated sessions?", "Prioritize Balancing")}