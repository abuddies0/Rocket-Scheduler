// @ts-check
/************************************************************************
 * This is the section that actually runs the scheduler.
 * Currently, this uses a simple algorithm of "give best rating".
 * The "best rating" is the first rating in the Ratings array.
 * Which session has the "best rating" is found by sorting the Ratings.
 * Is that a really inefficient solution?
 * Yes, but the program still runs in a few seconds, so it's fine.
 ************************************************************************/

/**
 * <p> The following are variables that will eventually be changed in the settings.
 */

/**
 * Reference to the entire spreadsheet (not individual sheets)
 * @type {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
const ss = SpreadsheetApp.getActiveSpreadsheet();

/**
 * The sheet containing the selection data
 * @type {GoogleAppsScript.Spreadsheet.Sheet}
 */
let ss_ratings;

/**
 * The sheet containing all options for selection
 * @type {GoogleAppsScript.Spreadsheet.Sheet}
 */
let ss_options;

/**
 * The array that will contain the selection sheet's data
 * @type {string[]}
 */
let ratings;

/**
 * The array that will contain the option sheet's data
 * @type {string[]}
 */
let options;

/**
 * The total number of attendees.
 * @type {number}
 */
let numberOfAttendees;

/**
 * A list of the final sessions after every trial is run.
 * @type {Session[]}
 */
let bestSessions;

/**
 * A list of the final attendees (with their sessions) after every trial is run.
 * @type {Attendee[]}
 */
let bestAttendees;

/**
 * The highest score of all the trials run.
 * @type {number}
 */
let bestScore = 0.0;


/**
 * <p> Runs and manages the scheduling process.
 * <p> It starts by iterating through each person and recursively assigning them their desired session.
 */
function runScheduler() {
  // This time is just used for debugging purposes (although it doesn't work for some reason)
  const startTime = new Date().getMilliseconds();
  
  /**
   * Spreadsheet data reading
   */
  // Read the raw sheet data
  /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
  const ss_ratings = ss.getSheetByName(setting_ratings_sheet_name.getValue());
  /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
  const ss_options = ss.getSheetByName(setting_options_sheet_name.getValue());
  /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
  const ss_overrides = ss.getSheetByName(setting_overrides_sheet_name.getValue());

  // Get the data from the sheets.
  // These are both 2d matrices where ROW_DATA = ratings[rowNumber] and CELL_DATA = ratings[rowNumber][colNumber]
  /** @type {any[][]} */
  const ratings = ss_ratings.getDataRange().getValues();
  /** @type {any[][]} */
  const options = ss_options.getDataRange().getValues();
  /** @type {any[][]} */
  const overrides = ss_overrides.getDataRange().getValues();


  // Run the code as many times as the MaxAttempts setting requires.
  // TODO: Put this inside of the Scheduler.gs and initialize all the relevant info before hand.
  for (let attempt = 0; attempt < Number(setting_max_attempts.getValue()); attempt++) {

    const startingRowAttendees = Number(setting_ratings_number_of_headers.getValue());   
    // The number of attendees is the height of the ratings array minus the headers

    log("Finished Reading Spreadsheet Data!");


    /**
     * Session initialization
     */
    log("Started reading session info...");
    // -1 cause arrays start at 0.
    const startingRowSessions = Number(setting_sessions_number_of_headers.getValue());
    // The number of sessions is the height of the options array minus the headers
    // const numberOfSessions = ss_options.getDataRange().getHeight() - startingRowSessions;
    const numberOfSessions = Number(setting_number_of_sessions.getValue());

    numberOfAttendees = ss_ratings.getDataRange().getHeight() - startingRowAttendees;
    // Populate an array with sessions
    const sessions = Array(numberOfSessions);
    for (let i = 0; i < numberOfSessions; i++) {
      sessions[i] = new Session(options[i + startingRowSessions])
      // log("Finished Session #" + (i+1) + ". Data: " + sessions[i].toString());
    }
    log("Finished reading session info.");


    /**
     * Attendees initialization
     */

    log("Started reading attendee info...");
    // Populate an array with attendees
    /** @type {Attendee[]} */
    const attendees = Array(numberOfAttendees);
    // JUST the headers of the ratings (session names)
    const headers = ratings[0];

    for (let j = 0; j < numberOfAttendees; j++) {
      attendees[j] = Attendee.createFromSheetData(headers, ratings[j + startingRowAttendees], sessions);
      // log("Finished Attendee #" + (j+1) + ". Data: " + attendees[j].summary());
    }
    log("Finished reading attendee info.");

    /**
     * Overrides initialization
     */
    const OVERRIDE_COLUMN_NAME = 0;       // A
    const OVERRIDE_COLUMN_EMAIL = 1;      // B
    const OVERRIDE_COLUMN_SESSION = 2;    // C
    const OVERRIDE_COLUMN_BLOCKS = 3;     // D

    // For each override, the code checks if the Attendee is already initialized to overwrite their data.
    // If the attendee does not exist, it makes a new attendee.
    for (let i = 2; i < overrides.length; i++) {
      /** @type {string[]} */
      const overrideData = overrides[i];
      /** @type {string} */
      const name = overrideData[OVERRIDE_COLUMN_NAME];
      /** @type {string} */
      const email = overrideData[OVERRIDE_COLUMN_EMAIL];
      /** @type {string} */
      const session = overrideData[OVERRIDE_COLUMN_SESSION];
      /** @type {string} */
      const blocks = overrideData[OVERRIDE_COLUMN_BLOCKS];

      if (name == "") {
        break;  // End the checks if the current "override" is empty
      }

      // Find the session or make it if need be
      let overrideSession = null;
      for (let s = 0; s < sessions.length; s++) {
        // If any session name has the "session" inside of it
        if (sessions[s].getName().toLowerCase().includes(session.toLowerCase())) {
          overrideSession = sessions[s];
          break;
        }
      }

      // If the session doesn't exist, just make it cause why not
      if (overrideSession == null) {
        log("Had to make new session (" + session + ") overriding for " + name);
        overrideSession = new Session();
        overrideSession.setName(session);
      }

      const blocksBooleans = getBlocks(blocks);

      // If the override includes an equal side, it must be a group override.
      // A group override is when a whole group is overridden based on column data.
      // For example, Grade=10 would apply the override to all students with a '10' in their 'Grade' column.
      if (name.includes('=')) {
        /** @type {string|RegExp} */
        let columnHeader = name.split('=')[0].toLowerCase().replaceAll(' ', '');
        if (columnHeader.charAt(0) == '/' && columnHeader.charAt(columnHeader.length-1) == '/') {
          columnHeader = RegExp(columnHeader);
        }

        /** @type {string|RegExp} */
        let condition = name.split('=')[1];
        if (condition.charAt(0) == '/' && condition.charAt(condition.length-1) == '/') {
          condition = RegExp(condition);
        }

        for (const attendee of attendees) {
          // Check if the attendee's value under the column fits the condition.
          let value = String(attendee.getInfo(columnHeader))
          if (value == null) { break; }
          if (condition instanceof RegExp && condition.test(value)) {
            for (let b = 0; b < blocksBooleans.length; b++) {
              if (blocksBooleans[b]) {
                attendee.override(b, overrideSession);
              }
            }
          }
          else if (condition == value) {
            for (let b = 0; b < blocksBooleans.length; b++) {
              if (blocksBooleans[b]) {
                attendee.override(b, overrideSession);
              }
            }
          }
        }
        break;
      }
      

      // Starting the attendee as null to be handled later
      let attendee = null;
      // Iterate through the attendees to see if one already exists
      for (let s = 0; s < attendees.length; s++) {
        if (attendees[s].getName().toLowerCase() == name.toLowerCase()) {
          attendee = attendees[s];
          break;
        }
      }
      if (attendee == null) {
        attendee = new Attendee(null, null, null);
        attendee.setName(name);
        attendee.setInfo("email", email);
        attendee.setInfo("preferred_name", name);
        attendee.setRatingByIndex(0, overrideSession, 0);
        attendees.push(attendee);
      }


      for (let b = 0; b < blocksBooleans.length; b++) {
        if (blocksBooleans[b]) {
          attendee.override(b, overrideSession);
        }
      }
    }


    log("Assigning attendees their sessions...");
    assignSessions(attendees, sessions)

    log("Calculating the stats...");
    // Just for statistics analyzing purposes
    let score = calculateSuccess(attendees);

    if (score >= bestScore) {
      bestScore = score;
      bestAttendees = attendees;
      bestSessions = sessions;
    }
  }

  assignFinalSessions();


  log("Exporting to sheets...");
  // Make the final spreadsheets
  createOutputSheets(bestAttendees, bestSessions);

  const endTime = new Date().getMilliseconds();
  log("Finished attendee selections in " + (endTime-startTime) + " milliseconds.");

  alert("Score", "Score: " + bestScore + "%");

  return;
}









/**
 * Get an array of the numerical slots corresponding to the input blocks.
 * @param {string} blocks The blocks in either alphabetical or numerical form (ex: "ABD" or "1,2,4")
 * @return {boolean[]} An array of booleans corresponding to having filled a slot or not (ex: "ABD" -> [true, true, false, true])
 */
function getBlocks(blocks) {
  let formattedBlocks = blocks.toLowerCase();

  let returnBlocks = Array(Number(setting_sessions_per_attendee.getValue()));
  for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) { returnBlocks[i] = false; }

  for(let b = 0; b < formattedBlocks.length; b++) {
    // This gets the ascii value of each character.
    let ascii = formattedBlocks.toLowerCase().charCodeAt(b);
    // If it is 'a-z' and that block exists
    if (ascii >= 97 && ascii <= 122 && (ascii-97) < Number(setting_sessions_per_attendee.getValue())) {
      returnBlocks[ascii-97] = true;
      continue;
    }
    // If it is '0-9'
    if (ascii >= 48 && ascii <= 57) {
      let number = formattedBlocks.charAt(b);
      // Figure out how long the number is.
      for (let numberLength = 1; numberLength+b < formattedBlocks.length; numberLength++) {
        // If next character is a number
        if (formattedBlocks.charCodeAt(b+numberLength) >= 48 && formattedBlocks.charCodeAt(b+numberLength) <= 57) {
          number += formattedBlocks.charAt(b+numberLength);
          continue;
        }
        break;
      }
      // Minus one cause arrays start at 0 but sessions start at 1
      if (Number(number)-1 < Number(setting_sessions_per_attendee.getValue())) {
        returnBlocks[Number(number)-1] = true;
      }
    }
  }
  
  return returnBlocks;
}











/**
 * <p> This is in charge of making the final 2 sheets:
 * <p> Attendee sessions, and host rosters.
 * @param {Attendee[]} attendees A list of the attendees.
 * @param {Session[]} sessions A list of the sessions.
 */
function createOutputSheets(attendees, sessions) {
  // Check if the sheets already exists, and if not, make them.
  let attendeeRoster = ss.getSheetByName(setting_output_sheet_attendees_name.getValue());
  let hostRoster = ss.getSheetByName(setting_output_sheet_hosts_name.getValue());

  // This checks for if it exists. If it does not, it inserts a new sheet.
  if (!attendeeRoster) {
    attendeeRoster = ss.insertSheet();
    attendeeRoster.setName(setting_output_sheet_attendees_name.getValue());

  }
  if (!hostRoster) {
    hostRoster = ss.insertSheet();
    hostRoster.setName(setting_output_sheet_hosts_name.getValue());
  }

  attendeeRoster.clear();
  hostRoster.clear();

  log("Started writing the attendee roster...");
  // Convert the attendees array into something that can be written to the spreadsheet
  let attendeesSSValues = [];
  // Populate the first row with information on what is to come
  let attendeesSSHeaders = [];
  attendeesSSHeaders.push("Name")
  attendeesSSHeaders.push("Preferred Name")
  attendeesSSHeaders.push("Grade");
  attendeesSSHeaders.push("Email");
  for (let s = 1; s <= Number(setting_sessions_per_attendee.getValue()); s++) {
    attendeesSSHeaders.push("Session " + s);
  }
  attendeesSSHeaders.push("Best Picks");
  attendeesSSHeaders.push("Picks Ratings");
  attendeesSSValues.push(attendeesSSHeaders);
  // Read individual attendee data
  for (let s = 0; s < attendees.length; s++) {
    attendeesSSValues.push(attendees[s].toSpreadsheetArray());
  }

  // Top left cell at (1,1) and bottom right cell at (data_length, number_of_attendees)
  attendeeRoster.getRange(1, 1, attendeesSSValues.length, attendeesSSValues[0].length).setValues(attendeesSSValues);
  log("Finished writing the attendee roster.");
  log("Started writing the host roster...");

  // Convert the sessions array into something that can be written to the spreadsheet
  let sessionsSSValues = [];
  // Populate the first row with information on what is to come
  let sessionsSSHeaders = [];
  sessionsSSHeaders.push("Name");
  sessionsSSHeaders.push("Host");
  sessionsSSHeaders.push("Host Email");
  for (let s = 0; s < Number(setting_sessions_per_attendee.getValue()); s++) {
    sessionsSSHeaders.push("People In S" + (s+1));
  }
  for (let s = 0; s < Number(setting_sessions_per_attendee.getValue()); s++) {
    sessionsSSHeaders.push("% Filled In S" + (s+1));
  }
  for (let s = 0; s < Number(setting_sessions_per_attendee.getValue()); s++) {
    sessionsSSHeaders.push("Session " + (s+1));
  }
  // for (let s = 0; s < setting_sessions_per_attendee.getValue(); s++) {
  //   sessionsSSHeaders.push("Unconfirmed Session " + (s+1));
  // }
  for (let s = 0; s < Number(setting_sessions_per_attendee.getValue()); s++) {
    sessionsSSHeaders.push("Session " + (s+1) + " Ratings");
  }
  sessionsSSValues.push(sessionsSSHeaders);
  // Individual session data
  for (let s = 0; s < sessions.length; s++) {
    sessionsSSValues.push(sessions[s].toSpreadsheetArray());
  }

  // Top left cell at (1,1) and bottom right cell at (data_length, number_of_attendees)
  hostRoster.getRange(1, 1, sessionsSSValues.length, sessionsSSValues[0].length).setValues(sessionsSSValues);
  log("Finished writing the host roster.");
}










/**
 * <p> This is used for analyzing how effective the algorithm was.
 * @param {Attendee[]} attendees A list of the attendees.
 */
function calculateSuccess(attendees) {
  // Analyze how many attendees got their best picks
  let score = 0;
  let maxScore = 0;
  // Go through each attendee
  for (let s = 0; s < attendees.length; s++) {

    let numberOfSessions = 0;
    // Get score
    for (let block = 0; block < Number(setting_sessions_per_attendee); block ++) {
      if (attendees[s].getRatingBySession(attendees[s].getSession(block)) instanceof Rating) {
        if (attendees[s].getRatingBySession(attendees[s].getSession(block)).getRating() !== "") {
          if (setting_rank_high_to_low.getValue() == "true") {
            score += Number(attendees[s].getRatingBySession(attendees[s].getSession(block)).getRating());
          }
          else {
            score += 5-Number(attendees[s].getRatingBySession(attendees[s].getSession(block)).getRating());
          }
        }
        numberOfSessions++;
        // This is to account for double blocks
        if (attendees[s].getSession(block).getLength() > 1) {
          block += attendees[s].getSession(block).getLength() - 1;
        }
      }
    }
    // Get max score
    for (let block = 0; block < numberOfSessions; block++) {
      if (attendees[s].getHighestRating(block) instanceof Rating) {
        if (attendees[s].getHighestRating(block).getRating() !== "") {
          if (setting_rank_high_to_low.getValue() == "true") {
            maxScore += Number(attendees[s].getHighestRating(block).getRating());
          }
          else {
            maxScore += 5-Number(attendees[s].getHighestRating(block).getRating());
          }
        }
      }
    }
  }

  log("Score: " + score + "/" + maxScore);
  log("Score %: " + (score/maxScore*100) + "%");
  return (score/maxScore*100);
}