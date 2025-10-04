// @ts-check
/*********************************************************************************
 * This stores a attendee with their name, email, ratings, and sessions.
 *********************************************************************************/


/**
 * <p> This represents a attendee with a name, grade, and selections.
 */
class Attendee {

  /**
   * <p> Using a row of data from the spreadsheet, this initializes the attendee's data
   * @param {string[]} headers The header range of the sheet used for initializing ratings.
   * @param {string[]} data The direct spreadsheet data for the entire row of the attendee.
   * @param {Session[]} sessions An array of all the sessions ordered. Each must be of type {Session}
   */
  static createFromSheetData(headers, data, sessions) {
    // If we're making a blank attendee
    if (data == null) {
      return new Attendee(
        "None",
        new Ratings(null, null, null),
        {}
      )
    }
    // If there is data
    else {
      let customInfo = {};
      for (let i = 0; i < Number(setting_ratings_column_ratings.getValue()); i++) {
        // Do not add the name column data to the customInfo
        if (i == Number(setting_ratings_column_name.getValue())) {
          continue;
        }
        customInfo[headers[i].toLowerCase().replaceAll(' ', '')] = data[i];
      }

      return new Attendee(
        data[setting_ratings_column_name.getValue()],
        Ratings.createFromSheetData(
          headers.slice(Number(setting_ratings_column_ratings.getValue()), Number(setting_ratings_column_ratings.getValue()) + Number(setting_number_of_sessions.getValue())),
          data.slice(Number(setting_ratings_column_ratings.getValue()), Number(setting_ratings_column_ratings.getValue()) + Number(setting_number_of_sessions.getValue())),
          sessions
        ),
        customInfo
      );
    }
  }

  /**
   * <p> This will create a attendee that stores their name, their ratings, and any additional info.
   * <p> The additional info is decided by headers generally.
   * @param {string} name The name of the attendee.
   * @param {Ratings} ratings The ratings of the attendee of type Ratings
   * @param {object} customInfo An object storing header to custom info. For example: { "grade": "8", "timestamp": "01:00:00"}. Please note that all of the customInfo keys must be lowercase and without spaces to work effectively.
   * @param {boolean} assignable Decides whether or not the attendee can be assigned sessions NOT randomly.
   */
  constructor(name, ratings, customInfo, assignable=true) {
    /**
     * Determines if the session can be randomly assigned.
     * @type {boolean} 
     */
    this.assignable = false;
    
    /**
     * The name of the Attendee.
     * @type {string}
     */
    this.name = "None";

    /**
     * The ratings associated with the attendee.
     * @type {Ratings}
     */
    this.ratings = new Ratings(null, null, null);

    /**
     * Any additional information associated with an attendee.
     * Stored as key-value pairs.
     * Common values are:
     * - preferred_name
     * - grade
     */
    this.customInfo = {};

    if (ratings != null) {
      this.assignable = assignable;
      this.name = name;
      this.ratings = ratings;
      this.customInfo = customInfo;
    }

    /**
     * This stores the sessions that this attendee is taking.
     * @type {Session[]}
     */
    this.sessions = new Array(Number(setting_number_of_sessions.getValue()));
  }


  /**
   * <p> This fills one of the slots in the attendees sessions list
   * @param {number} slot The slot to fill.
   * @param {Session} session The session to fill it with. Must be of type {Session}
   */
  fillSlot(slot, session) {
    this.sessions[slot] = session;
  }


  /**
   * This will take over whatever slot they currently have (if any) and assign them a new session.
   * @param {number} slot The slot in their schedule to fill.
   * @param {Session} session The session to fill that slot with. Must be of type {Session}
   */
  override(slot, session) {
    for (let block = 0; block < session.getLength(); block++) {
      // If they already have a session, make sure to properly unfill that slot
      if (this.sessions[slot + block] instanceof Session) {
        this.sessions[slot + block].unAssignSlot(this, slot);
      }
      this.sessions[slot+block] = session;
    }
    // TODO: Add a setting to make it toggleable whether they'll actually fill up a slot in the session.
    session.forceFillSlot(this, slot)
  }


  /**
   * <p> Mainly for debugging purposes, this sums up the user's info to put it into a string format.
   * <p> Format is: [Attendee {NAME}/ {preferred_name} ({GRADE})
   * SESSIONS:
   * {SESSIONS}
   * RATINGS:
   * {RATINGS}]
   * @return {string} [Attendee {NAME}/ {preferred_name} ({GRADE}) \n SESSIONS: \n {SESSIONS} \n RATINGS: \n {RATINGS}
   */
  toString() {
    let s = "[Attendee " + this.name + "/ " + this.getPreferredName() + " (" + this.getGrade() + "):\nSESSIONS:\n";
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      if (this.sessions[i] instanceof Session) {
        s += this.sessions[i].getName();
      }
      else {
        s += "None";
      }
      s += ", ";
    }
    s += this.sessions;
    return  s + "\nRATINGS:\n" + this.ratings.toString() + "]";
  }


  /**
   * <p> This is the same as above, but it gives all the ratings.
   * 
   */
  /**
   * <p> Mainly for debugging purposes, this sums up the user's info to put it into a string format.
   * <p> Format is: [Attendee {NAME}/ {preferred_name} ({GRADE})
   * SESSIONS:
   * {SESSIONS}
   * RATINGS:
   * {RATINGS}]
   * @return {string} The same as toString() but it includes MUCH more information about the sessions.
   */
  toVerboseString() {
    let s = "[Attendee " + this.name + "/ " + this.getPreferredName() + " (" + this.getGrade() + "):\nSESSIONS:\n";
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      // if (typeof(this.sessions[i]) !== "undefined") {
      //   s += this.sessions[i].getName();
      // }
      // else {
      //   s += "None";
      // }
      // s += ", ";
    }
    s += this.sessions;
    return  s + "\nRATINGS:\n" + this.ratings.toString() + "]";
  }


  /**
   * <p> Just toString but instead it returns a quick summary of the attendee.
   * <p> Format is [Attendee {NAME}/ {preferred_name} ({GRADE}): {FIRST_RATING}]
   * @return {string} [Attendee {NAME}/ {preferred_name} ({GRADE}): {FIRST_RATING}]
   */
  summary() {
    return "[Attendee " + this.name + "/ " + this.getPreferredName() + " (" + this.getGrade() + "): " + this.ratings.getRating(0).toString() + "]";
  }


  /**
   * <p> Checks to see if the given slot(s) is/are available.
   * @param {number} slot The slot to check.
   * @param {Session} session The session to check. This is needed for double blocks.
   * @return {boolean} True if the slot is open. False if it is taken.
   */
  isFreeSlot(slot, session) {
    for (let i = 0; i < session.getLength(); i++) {
      if (typeof(this.sessions[slot+i]) !== "undefined") {
        return false;
      }
    }
    
    return true;
  }


  /**
   * Changes the session at the given block to a new session.
   * @param {number} block The index of the session to change (0 is the first block)
   * @param {Session} session Must be of type {Session}
   */
  changeSession(block, session) {
    // Take them out of the old session
    this.sessions[block].unAssignSlot(this, block);
    // Assign the new session
    session.forceFillSlot(this, block);
  }


  /**
   * <p> Checks to see if the given session can be assigned to the attendee.
   * @param {number} slot The slot to check to assign.
   * @param {Session} session The session to assign.
   * @return {boolean} True if the session can be assigned. False if not.
   */
  canTake(slot, session) {
    // If the slot isn't open...
    if (!this.isFreeSlot(slot, session)) {
      return false;
    }
    // If session is full...
    if (!session.hasAvailableSlot(slot)) {
      return false;
    }
    // If they have the session already...
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      // If they already have the session, return false.
      if (this.sessions[i] == session) {
        return false;
      }
    }

    return true;
  }


  /**
   * Determines whether or not the attendee has enough data to be assigned sessions.
   * @return {boolean} True if they can be assigned. False if they cannot.
   */
  canBeAssignedSessions() {
    return this.assignable;
  }


  /**
   * To quote a professor, an attendee is bad if they didn't fill out the form.
   * Therefore, this attendee is bad if all of their ratings are null (or empty).
   * @return {boolean} True if the attendee didn't fill out the form.
   */
  isBadAttendee() {
    return !(this.getBestRating(0) instanceof Rating);
  }


  /**
   * <p> Gets the number {rating} best rating of the attendee.
   * @param {number} rating The index of the rating in the rating array (which is sorted by favorite -> detested)
   * @return {Rating} The rating of type {Rating} (or null)
   */
  getBestRating(rating) {
    return this.ratings.getRating(rating);
  }


  /**
   * <p> Gets the literal highest rating based on an index.
   * <p> This is needed because the ratings array can be sorted by criteria other than highest rating.
   * @param {number} rating The index of the rating (0 would be the highest rating).
   * @return {Rating} The highest rating of index {rating}.
   */
  getHighestRating(rating) {
    let ratingsCopy = this.ratings.ratings.slice()
    return ratingsCopy.sort(function(a,b) {
      if (a.getRating() === "") { return 1; }
      if (b.getRating() === "") { return -1; }
      if (setting_rank_high_to_low.getValue() === "true") { return Number(b.getRating()) - Number(a.getRating()); }
      return Number(a.getRating()) - Number(b.getRating());
    })[rating];
  }


  /**
   * <p> This gets you the attendee's rating of the session based on the session.
   * @param {Session} session The session to check for. Must be of type {Session}
   * @return {Rating} The Rating of the session for the attendee of type {Rating}
   */
  getRatingBySession(session) {
    // Tries to return the session's rating, but if the session doesn't exist, it returns 0.
    if (typeof session === 'object')
      return this.ratings.getRatingBySession(session);
    return null;
  }


  /**
   * This lets you directly access the ratings array and modify a specific index.
   * @param {number} index The index in the ratings array
   * @param {Session} session The session you would like to place there
   * @param {number} rating The numerical rating you would like to assign.
   */
  setRatingByIndex(index, session, rating) {
    this.ratings.ratings[index] = new Rating(session, rating);
  }


  /**
   * <p> This just loops through and checks if the attendee is taking the provided session.
   * @param {Session} session Must be of type {Session}.
   * @return {boolean} True if the student has the provided session. False otherwise.
   */
  isTakingSession(session) {
    for (let i = 0; i < this.sessions.length; i++) {
      if (this.sessions[i] == session) {
        return false;
      }
    }
    return true;
  }


  /**
   * <p> Returns the name of the attendee.
   * @return {string} The name of the attendee.
   */
  getName() {
    return this.name;
  }

  /**
   * <p> Returns the preffered name of the attendee if they have one.
   * @return {string} The preferred name as indicated by the header containing "preferredname" or "nickname"
   */
  getPreferredName() {
    const PreferredNameRegex = /preferredname|nickname|preferred_name/;
    const info = this.getInfo(PreferredNameRegex);
    if (info != null) {
      return info;
    }
    // If there is no preferred name specified, then we return the name
    return this.name;
  }


  /**
   * <p> Returns the grade if it is available, or null if it does not exist.
   * @return {number} The grade as indicated by a header containing "grade". null if there is no grade.
   */
  getGrade() {
    const GradeRegex = /grade/;
    const info = this.getInfo(GradeRegex);
    if (info != null) {
      return Number(info);
    }
    
    return null;
  }


  /**
   * <p> Returns the email if it is available, or null if it does not exist.
   * @return {string} The email as indicated by the header containing "email". Null if there is no email.
   */
  getEmail() {
    const EmailRegex = /email/;
    const info = this.getInfo(EmailRegex);
    if (info != null) {
      return info;
    }

    return null;
  }


  /**
   * <p> This gets some info from the attendee's customInfo if it exists.
   * @param {string|RegExp} header The header to check. Must be lowercase, and without spaces. This can be a regular expression if you want.
   * @param {boolean} matchExact Default: false. If this is false, it simply checks if the info CONTAINS the header. If true, it checks to make sure if it is exact.
   * @return {string} The custom info if it exists, or null if it does not exist.
   */
  getInfo(header, matchExact=false) {
    if (header instanceof RegExp) {
      for (const [key, value] of Object.entries(this.customInfo)) {
        if (header.test(key)) {
          return value;
        }
      }
    }
    else {
      for (const [key, value] of Object.entries(this.customInfo)) {
        if ((!matchExact && key.includes(header)) || (matchExact && key === header)) {
          return value;
        }
      }
    }
    // If no custom data found, return null
    return null;
  }


  /**
   * <p> Returns the session that fills the slot provided.
   * @param {number} slot The slot of the session.
   * @return {Session} The session that fills that slot. Will be of type {Session}
   */
  getSession(slot) {
    return this.sessions[slot];
  }


  /**
   * This lets you set the name of the attendee.
   * @param {string} name The new name to set it to.
   */
  setName(name) {
    this.name = name;
  }
  

  /**
   * This will add a key,value pair to the customInfo object.
   * @param {string} key The key of the info. Must be lowercase and without spaces.
   * @param {string} info The custom info to insert in the form of a string.
   */
  setInfo(key, info) {
    this.customInfo[key] = info;
  }


  /**
   * This adds a rating to the attendee's ratings array (and sorts it).
   * @param {Session} session The session to add.
   * @param {number} rating The rating to give (number).
   */
  addRating(session, rating) {
    this.ratings.ratings.push(new Rating(session, rating));
    this.ratings.sortRatings();
  }


  /**
   * <p> This converts all of the attendee's data into an array to be put into the spreadsheet.
   * <p> The array represents a ROW of data.
   * <p> Format is [NAME, PREFERRED_NAME, GRADE, SESSIONS (ROOM NUMBERS)]
   * @return {Array<string|number>} An array of strings representing a row of cells in a sheet.
   */
  toSpreadsheetArray() {
    let data = [];
    data.push(this.name);
    data.push(this.getPreferredName());
    data.push(this.getGrade());
    data.push(this.getEmail());
    // Varying number of sessions
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      if (this.sessions[i] instanceof Session)
        data.push(this.sessions[i].getName() + " (" + this.sessions[i].room + ")");
      else
        data.push("None")
    }
    // Get the best possible score that they could have had
    let s = "";
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      if (this.getHighestRating(i) != null)
        s += this.getHighestRating(i).getRating() + ".";
      else
        s += "0.";
    }
    data.push(s);
    // Get the actual score they achieved
    s = "";
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      if (this.getRatingBySession(this.sessions[i]) != null && this.getRatingBySession(this.sessions[i]).getRating() != 0)
        s += this.getRatingBySession(this.sessions[i]).getRating() + ".";
      else
        s += "0.";
    }
    data.push(s);

    return data;
  }
}