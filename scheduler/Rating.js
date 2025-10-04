// @ts-check
/************************************************************************
 * This is a class that stores a single attendee's rating for a session.
 * This stores the session and the numerical rating.
 ************************************************************************/
class Rating {
  /**
   * <p> Basic constructor for a rating which stores a session and a rating number.
   * @param {Session} session The session that was rated. Must be of type {Session}
   * @param {number} rating The numerical rating that was given to the session.
   */
  constructor(session, rating) {
    this.session = session;
    this.rating = rating;
  }


  /**
   * <p> Returns the rating (pretty simple, right?)
   * @return {number|string} The numerical rating associated with the session. Returns "" when the rating was empty.
   */
  getRating() {
    return this.rating;
  }


  /**
   * <p> Returns the session (pretty simple, right?)
   * @return {Session} The session of type {Session}
   */
  getSession() {
    return this.session;
  }


  /**
   * <p> Mainly for debugging purposes, this sums up the rating's info to put it into a string format.
   * <p> Format is: {SESSION_NAME}: {RATING}
   * @return {string} "{SESSION_NAME}: {RATING}"
   */
  toString() {
    return this.session.name + ": " + this.rating;
  }
}