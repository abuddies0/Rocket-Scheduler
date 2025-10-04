// @ts-check
/*********************************************************************************
 * This section is isolated because it handles the actual algorithm.
 * As stated in Runner.gs, it very simply gives each person their best rating.
 * However, there are also overrides and higher priorities that are handled.
 *********************************************************************************/

/**
 * This will actually assign every attendee their sessions.
 * @param {Attendee[]} attendees A list of the attendees.
 * @param {Session[]} sessions A list of the sessions.
 */
function assignSessions(attendees, sessions) {
  /**
   * Algorithm time!
   */
  // Run for each slot in the session list

  // This controls whether or not the program needs to look recursively for a session to put a attendee into.
  // This currently does nothing.
  let needsRecursion = false;

  // Loop through each possible session slot (4 by default).
  // Per slot, loop through each attendee.
  for (let sessionSlot = 0; sessionSlot < Number(setting_sessions_per_attendee.getValue()); sessionSlot++) {
    for (let currentAttendee = 0; currentAttendee < numberOfAttendees; currentAttendee++) {
      // If we cannot assign sessions for any reason, break out of the current iteration (generally for override purposes)
      if (!attendees[currentAttendee].canBeAssignedSessions || attendees[currentAttendee].isBadAttendee()) {
        continue;
      }
      
      // This will sort the attendee's ratings to figure out what is currently the best.
      attendees[currentAttendee].ratings.sortRatings();
      needsRecursion = true;
      // Get their top rating, and then the next best, and then so-on-so-forth until you get to a worse rating.
      for (let currentRatingIndex = 0; currentRatingIndex < Number(setting_number_of_sessions.getValue()); currentRatingIndex++) {
        // If the session can be assigned, break out of the loop.
        if (attendees[currentAttendee].getBestRating(currentRatingIndex) instanceof Rating && attendees[currentAttendee].getBestRating(currentRatingIndex).getSession().assignAvailableSlot(attendees[currentAttendee])) {
          needsRecursion = false;
          break;
        }
      }
    }
  }

  // I have a really good fix. I'm just gonna do it twice.
  for (let myStupidity = 0; myStupidity < 2; myStupidity++) {
    // Try our very best to make all sessions have at least 2 people.
    // This is very hard coded for now... I'll try to fix this later.
    for (let currentSession = 0; currentSession < Number(setting_number_of_sessions.getValue()); currentSession++) {
      // Doesn't work with double sessions yet. Cry about it.
      if (sessions[currentSession].getLength() != 1) {
        continue;
      }
      // For every slot with less than 2 people...
      for (let currentBlock = 0; currentBlock < Number(setting_sessions_per_attendee.getValue()); currentBlock++) {
        if (sessions[currentSession].emptySlots[currentBlock] > sessions[currentSession].maxSize - 2) {
          // Loop through every attendee and try to force each one into that slot based on a few conditions...
          for (let currentAttendee = 0; currentAttendee < numberOfAttendees; currentAttendee++) {
            // Criteria:
            // 1) Rating must be 3 stars or better
            // 2) Must not already be in the session
            // 3) The attendee has a session there
            // 4) Must not have a double session during that block (because that's annoying to resolve)
            // 5) Must not make another session have <2 people by reassigning
            // 6) That session has an available slot there.
            if (attendees[currentAttendee].getRatingBySession(sessions[currentSession]) == null) {
              attendees[currentAttendee].addRating(sessions[currentSession], 0)
            }
            if (
              !(Number(attendees[currentAttendee].getRatingBySession(sessions[currentSession]).getRating()) <= 3) &&
              !attendees[currentAttendee].isTakingSession(sessions[currentSession]) &&
              attendees[currentAttendee].sessions[currentBlock] !== undefined &&
              attendees[currentAttendee].sessions[currentBlock].getLength() == 1 &&
              attendees[currentAttendee].sessions[currentBlock].emptySlots[currentBlock] < sessions[currentSession].maxSize - 2 &&
              sessions[currentSession].hasAvailableSlot(currentBlock)
            ) {
              attendees[currentAttendee].changeSession(currentBlock, sessions[currentSession]);
              break;
            }
          }
        }
      }
    }
  }
  log("Finished assigning attendees their sessions!");

  // Try to forcefully assign people who didn't get what they wanted
  // WIP
  // if (needsRecursion) {
  //   for (let currentRating = 0; currentRating < setting_number_of_sessions.getValue(); currentRating++) {
  //     // If the session can be assigned, break out of the loop.
  //     if (attendees[currentAttendee].getBestRating(currentRating).getSession().recursivelyAssignSlot(attendees[currentAttendee], setting_recursion_depth.getValue())) {
  //       assigned += 1;
  //       break;
  //     }
  //   }
  // }
}

/**
 * <p> This essentially just does the cleanup of assigning the attendees who didn't have any ratings.
 * <p> This happens once after the best possible sessions-attendees combo is calculated from all trials.
 */
function assignFinalSessions() {
  // Assign all the attendees who didn't put down any star ratings.
  for (let sessionSlot = 0; sessionSlot < Number(setting_sessions_per_attendee.getValue()); sessionSlot++) {
    for (let currentAttendee = 0; currentAttendee < bestAttendees.length; currentAttendee++) {
      // If we cannot assign sessions for any reason, break out of the current iteration
      if (!bestAttendees[currentAttendee].canBeAssignedSessions) {
        continue;
      }
      // If their top rating is not 0 (as in they filled out the form, break)
      if (bestAttendees[currentAttendee].getBestRating(0).getRating() != 0) {
        continue;
      }
      // Get their top rating, and then the next best, and then so-on-so-forth until you get to a worse rating.
      for (let currentRating = 0; currentRating < Number(setting_number_of_sessions.getValue()); currentRating++) {
        // If their top ratings are 0 stars, then break out of the loop to assign them random sessions later.
        bestAttendees[currentAttendee].ratings.sortRatingsBySmallestSessions();
        if (bestAttendees[currentAttendee].getBestRating(currentRating).getSession().canRandomlyAssign) {
          if (bestAttendees[currentAttendee].getBestRating(currentRating).getSession().assignAvailableSlot(bestAttendees[currentAttendee])) {
            break;
          }
        }
      }
    }
  }
}