// @ts-check
/************************************************************************
 * This stores every rating a attendee has.
 * This is, for all practical purposes, a glorified array of Rating.
 ************************************************************************/
class Ratings {


  /**
   * <p> This takes the portion of the spreadsheet that stores attendee's ratings and initializes ratings for them.
   * @param {string[]} headers The headers (names) of the sessions in the form responses sheet.
   * @param {string[]} ratings An array of the numerical ratings attendees gave to the sessions. Checks for substrings, so it must have the SAME case sensitivity!
   * @param {Session[]} sessions The list of all available sessions. This must be in order.
   */
  static createFromSheetData(headers, ratings, sessions) {
    return new Ratings(headers, ratings, sessions);
  }


  /**
   * <p> This takes the portion of the spreadsheet that stores attendee's ratings and initializes ratings for them.
   * @param {string[]} headers The headers (names) of the sessions in the form responses sheet.
   * @param {string[]} ratings An array of the numerical ratings attendees gave to the sessions. Checks for substrings, so it must have the SAME case sensitivity!
   * @param {Session[]} sessions The list of all available sessions. This must be in order.
   */
  constructor(headers, ratings, sessions) {
    /** 
     * A list of all ratings.
     * When a rating is null, it is initialized as "".
     * @type {Rating[]} 
     * */
    this.ratings = null;


    if (sessions == null) {
      this.ratings = Array(1);
      this.ratings[0] = new Rating(new Session(), null);
    }
    else {
      this.ratings = Array(Number(setting_number_of_sessions.getValue()));
    }

    // Empty constructor
    if (ratings == null || sessions == null) {
      // log("Ratings initialized as null.")
    }
    // If the constructor is passed actual info, initialize...

    else {
      // Populate the array
      for (let i = 0; i < headers.length; i++) {
        // Find the session of the same name
        // Is this slow? Yes. However, it's not THAT bad.
        // TODO: Fix this by initializing all the sessions in the correct order using the headers.
        let success = false;
        for (let s = 0; s < sessions.length; s++) {
          // If the header of the rating contains the session name...
          if (headers[i].toLowerCase().includes(sessions[s].getName().toLowerCase())) {
            this.ratings[i] = new Rating(sessions[s], Number(ratings[i]));
            success = true;
            break;
          }
        }
        if (!success) {
          promptError("ERROR" + 
            "\nDidn't find session when initializing attendees for session #" + (i+1) + 
            "\nAre you sure this session exists? Try checking the names. You can always just delete it if it doesn't exist!" + 
            "\nIf this is not a session at all, double check the number of sessions setting!" +
            "\nFull Session Name: " + headers[i]
          );
        }
      }
      // Sort the array into higher ratings first with a bit of randomness to make each session even.
      // null sessions are always ranked last
      this.ratings.sort(function(a,b){
        // If rating is null (as in no response on the sheet), return the other rating.
        if (b.getRating() === "") {
          return -1;  // Use a
        }
        if (a.getRating() === "") {
          return 1;   // Use b
        }
        // If equal, randomly use one of the two.
        if (Number(b.getRating()) - Number(a.getRating()) == 0) {
          return Math.random()*2-1;
        }
        // Sort high to low
        if (setting_rank_high_to_low.getValue() === "true") {
          return Number(b.getRating()) - Number(a.getRating())
        }
        // Sort low to high
        if (setting_rank_high_to_low.getValue() === "false") {
          return Number(a.getRating()) - Number(b.getRating())
        }
        });
    }
  }


  /**
   * This will check all of the priorities in the system to determine the best sorting algorithm to use.
   */
  sortRatings() {
    // We need to re-sort the ratings that the attendee has each time by the lowest number of slots if we want to balance the sessions.
      if (setting_prioritize_balancing.getValue() === "true") {
        this.sortRatingsBalanced();
      }
  }


  /**
   * This will sort the ratings array by putting the smallest sessions first
   */
  sortRatingsBySmallestSessions() {
    this.ratings.sort(function(a,b){
      return b.getSession().getNumberOfAttendees() - a.getSession().getNumberOfAttendees();
    });
  }


  /**
   * This does something similar to sortRatingsBySmallestSessions() but it also takes into account ratings and won't assign sessions without a rating.
   */
  sortRatingsBalanced() {
    this.ratings.sort(function(a,b) {
      // If session b is larger than session a, return a unless it has no rating.
      if (b.getSession().getNumberOfAttendees() > a.getSession().getNumberOfAttendees()) {
        // If a has no rating, return b
        if (a.getRating() === "") {
          return 1; // return b
        }
        else {
          return -1;  // return a
        }
        // return -1;
      }

      // If session a is larger than session b, return b unless it has no rating.
      if (b.getSession().getNumberOfAttendees() < a.getSession().getNumberOfAttendees()) {
        // If a has no rating, return b
        if (b.getRating() === "") {
          return -1; // return a
        }
        else {
          return 1;  // return b
        }
        // return 1;
      }

      // If session b has the same size as a, return the highest rating between the two
      else if (b.getSession().getNumberOfAttendees() == a.getSession().getNumberOfAttendees()) {
        // If a has no rating, return b
        if (a.getRating() === "") {
          return 1;
        }
        // If b has no rating, return a
        else if (b.getRating() === "") {
          return -1;
        }
        // Otherwise, compare the two
        else {
          // If ranking high to low
          if (setting_rank_high_to_low.getValue() === "true") {
            return Number(b.getRating()) - Number(a.getRating());
          }
          else if (setting_rank_high_to_low.getValue() === "false") {
            return Number(a.getRating()) - Number(b.getRating());
          }
        }
      }

      else {
        log("How did we get here... Every session should at least have 0 ppl in it :o");
      }
    })
  }


  /**
   * <p> Mainly for debugging purposes, this sums up all the ratings' info to put it into a string format.
   * <p> Format is: [{SESSION_NAME}: {RATING}, {SESSION_NAME}: {RATING}, ...]
   */
  toString() {
    let s = "[";
    for (let i = 0; i < this.ratings.length; i++) {
      s += this.ratings[i].toString() + ", ";
    }
    // Get rid of the last extra comma
    s = s.substring(0,s.length-2) + "]";
    return s;
  }


  /**
   * <p> Just gets a specific rating based on either index or name.
   * @param {number|string} key The key to look for. If it is a number, it searches by index. If it is a String, it searches by name.
   */
  getRating(key) {
    if (typeof key === "number") {
      return this.ratings[key];
    }
    else {
      // WIP
      return;
    }
  }


  /**
   * <p> This gets you a rating of a session based on the session.
   * @param {Session} session The session to check for. Must be of type {Session}
   * @return {Rating} The Rating of the session of type {Rating}
   */
  getRatingBySession(session) {
    for (let r = 0; r < this.ratings.length; r++) {
      if (this.ratings[r].getSession() == session) {
        return this.ratings[r];
      }
    }

    return null;
  }


  /**
   * This gets a list (array) of all the sessions that have the supplied rating, EXCEPT the excluded session.
   * @param {number} rating The numerical rating to compare with.
   * @param {Session|Session[]} exclusion The excluded session or sessions {Session} or {Array<Session>}
   * @return {Session[]} An array of sessions with the same rating.
   */
  getSessionsWithRatingExcluding(rating, exclusion) {
    let currentRating;
    let ratingsWithSameRating = new Array();
    // If passed in multiple exclusions
    if (Array.isArray(exclusion)) {
      for (let r = 0; r < ratings.length; r++) {
        currentRating = this.ratings[r];
        if (currentRating instanceof Rating && currentRating.getRating() == rating) {
          let canAdd = true;
          for (let e = 0; e < exclusion.length; e++) {
            if (currentRating.getSession() == exclusion[e]) {
              canAdd = false;
            }
          }
          if (canAdd) {
            ratingsWithSameRating.splice(ratingsWithSameRating.indexOf(currentRating.getSession()));
          }
        }
      }
    }
    // If the exlusion is just a single session
    else {
      for (let r = 0; r < ratings.length; r++) {
        currentRating = this.ratings[r]
        if (currentRating instanceof Rating && currentRating.getRating() == rating && currentRating.getSession() != exclusion) {
         ratingsWithSameRating.splice(ratingsWithSameRating.indexOf(currentRating.getSession()));
        }
      }
    }

    return ratingsWithSameRating;
  }
}