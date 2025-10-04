// @ts-check
/*************************************************************************************************
 * This represents a session with a name, attendees, size, empty slots, length, host, and room.
 *************************************************************************************************/


/**
 * <p> This stores the actual data associated with each session such as attendees, max size, etc.
 */
// @ts-ignore
class Session {
  /**
   * <p> Using a row of data from the spreadsheet, this initializes the session's data
   * <p> This includes max size, name, description, etc.
   */
  constructor(data) {
    // If there is nothing passed to it, it is constructed as an empty session with no slots.
    if (data == null) {
      this.maxSize          = Array(Number(setting_sessions_per_attendee.getValue()));
      this.emptySlots       = [];
      this.attendees         = [];
      this.numberOfAttendees = 0;
      this.name             = "None";
      this.host          = "None";
      this.email            = "None";
      this.room             = "None";
      this.canRandomlyAssign= false;
      this.sessionLength    = 1;
      this.blocks           = Array(Number(setting_sessions_per_attendee.getValue()));
    }
    else {
      this.maxSize          = data[setting_sessions_column_max_size.getValue()];
      this.emptySlots       = Array(Number(setting_sessions_per_attendee.getValue()));
      // Empty slots array in form of [SLOTS_1, SLOTS_2, ...]
      for(let e = 0; e < this.emptySlots.length; e++) {
        this.emptySlots[e] = data[setting_sessions_column_max_size.getValue()];
      }
      // Attendees array in form of [[STUDENTS_SESSION_1], [STUDENTS_SESSION_2], ...]
      this.attendees         = Array(Number(setting_sessions_per_attendee.getValue()));
      for(let s = 0; s < Number(setting_sessions_per_attendee.getValue()); s++) {
        this.attendees[s] = Array(this.maxSize);
      }
      this.numberOfAttendees = 0;
      this.name             = data[setting_sessions_column_name.getValue()];
      this.host          = data[setting_sessions_column_host.getValue()];
      this.email            = data[setting_sessions_column_host_email.getValue()];
      this.sessionLength    = data[setting_sessions_column_length.getValue()];
      this.room             = data[setting_sessions_column_room.getValue()];
      this.canRandomlyAssign= false;
      if (data[setting_sessions_column_randomly_assignable.getValue()] == "yes") {
        this.canRandomlyAssign = true;
      }
      // Iterate through the available blocks string. Ex: "ABC" would mean available a, b, and c block. "1,2,3" means the same thing.
      this.blocks           = Array(Number(setting_sessions_per_attendee.getValue()));
      // Initialize all block availibility to false
      for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) { this.blocks[i] = false; }
      let availableBlocksRaw = data[setting_sessions_column_available_blocks.getValue()].toLowerCase();
      for(let b = 0; b < availableBlocksRaw.length; b++) {
        // This gets the ascii value of each character.
        let ascii = availableBlocksRaw.charCodeAt(b);
        // If it is 'a-z' and that block exists
        if (ascii >= 97 && ascii <= 122 && (ascii-97) < Number(setting_sessions_per_attendee.getValue())) {
          this.blocks[ascii-97] = true;
          continue;
        }
        // If it is '0-9'
        if (ascii >= 48 && ascii <= 57) {
          let number = availableBlocksRaw.charAt(b);
          // Figure out how long the number is.
          for (let numberLength = 1; numberLength+b < availableBlocksRaw.length; numberLength++) {
            // If next character is a number
            if (availableBlocksRaw.charCodeAt(b+numberLength) >= 48 && availableBlocksRaw.charCodeAt(b+numberLength) <= 57) {
              number += availableBlocksRaw.charAt(b+numberLength);
              continue;
            }
            break;
          }
          // Minus one cause arrays start at 0 but sessions start at 1
          if (Number(number-1) < Number(setting_sessions_per_attendee.getValue())) {
            this.blocks[number-1] = true;
          }
        }
      }

      // After the blocks are initialized, cull them based on the LENGTH of sessions.
      // Only the first block in a series of blocks will be true to make assigning sessions faster later.
      let currentLength = 0;
      for (let l = 0; l < Number(setting_sessions_per_attendee.getValue()); l++) {
        // If you have an available block, then add one to number of consecutive available blocks.
        if (this.blocks[l] == true) {
          currentLength += 1;
          // If it is the session length, set all that came before it EXCEPT the first value to false.
          if (currentLength == this.sessionLength) {
            for (let i = 0; i < currentLength-1; i++) {
              this.blocks[l-i] = false;
            }
            currentLength = 0;
          }
        }
        // If you found a not available block, then make sure it wasn't after consecutive blocks. If so, deal.
        if (this.blocks[l] == false) {
          if (currentLength > 0 && currentLength < this.sessionLength) {
            // Make all previously 'true' blocks false because there aren't enough CONSECUTIVE openings
            while (currentLength > 0) {
              this.blocks[l-currentLength] = false;
              currentLength--;
            }
          }
        }
      }

      // Debugging
      // if (this.name === "Vision Boards / Collaging") {
      //   log(this.blocks);
      // }
    }
  }


  /**
   * <p> This puts a attendee in the assigned slot of this session.
   * <p> It makes sure to fill up that slot in the attendee's sessions as well.
   * @param {Attendee} attendee Must of of type {Attendee}
   * @param {number} slot The slot to assign the attendee to. (index of the slot starting at 0 for first session)
   */
  assignSlot(attendee, slot) {
    // Fill the slot(s) depending on the number of blocks the session takes
    for (let i = 0; i < this.sessionLength; i++) {
      // Fill slot(s) of the attendee
      attendee.fillSlot(slot+i, this);
      // Fill slot(s) of the session going one at a time
      this.attendees[slot+i][this.maxSize - this.emptySlots[slot+i]] = attendee;
      this.emptySlots[slot+i] -= 1;
    }
    this.numberOfAttendees++;
  }


  /**
   * <p> Just forcefully takes the attendee out of the given slot
   * @param {Attendee} attendee Must of of type {Attendee}
   * @param {number} slot The slot to assign the attendee to. (index of the slot starting at 0 for first session)
   */
  unAssignSlot(attendee, slot) {
    for (let i = 0; i < this.sessionLength; i++) {
      for (let s = 0; s < this.attendees[slot+i].length; s++) {
        // We're gonna have to fully remake the array because it's an array and not an arraylist. Someone is going to die today.
        if (this.attendees[slot+i][s] == attendee) {
          // Buckle up
          // New array is equal to (OLD_ARRAY_UP_TO_STUDENT) + (OLD_ARRAY_AFTER_STUDENT) + (EMPTY_SLOT)
          let oldArrayUpToAttendee = this.attendees[slot+i].slice(0,s);
          let oldArrayAfterAttendee = this.attendees[slot+i].slice(s+1,this.attendees[slot+i].length);
          this.attendees[slot+i] = oldArrayUpToAttendee.concat(oldArrayAfterAttendee).concat(new Array(1));
        }
      }

      this.emptySlots[slot+i] -= 1;
      this.numberOfAttendees -= 1;
    }
  }


  /**
   * <p> This is used by the override system to forcefully assign the slot.
   * @param {Attendee} attendee Must be of type {Attendee}
   * @param {number} slot The first slot to fill up (will fill up all slots if the session is a double/triple/... session)
   */
  forceFillSlot(attendee, slot) {
    // Fill the slot(s) depending on the number of blocks the session takes
    for (let i = 0; i < this.sessionLength; i++) {
      // Fill slot(s) of the session going one at a time
      this.attendees[slot+i][this.maxSize - this.emptySlots[slot+i]] = attendee;
      this.emptySlots[slot+i] -= 1;
    }
    this.numberOfAttendees++;
  }


  /**
   * <p> This attempts to assign a attendee to the session by going through each available block that the attendee has.
   * <p> It makes sure to fill up the slot on the attendee's sessions as well.
   * @param {Attendee} attendee Must be of type {Attendee}
   * @return {boolean} True if the slot was assigned. False if it wasn't.
   */
  assignAvailableSlot(attendee) {
    // Loop through all available sessions.
    for (let ii = 0; ii < Number(setting_sessions_per_attendee.getValue()); ii++) {
      let slot = (ii + this.largestEmptySlot())%this.emptySlots.length;
      // (ii + this.largestEmptySlot())%this.emptySlots.length is just making it try to fill in the least-filled slot first.
      if (this.hasAvailableSlot(slot) && attendee.canTake(slot, this)) {
        this.assignSlot(attendee, slot);
        return true;
      }
    }

    return false;
  }


  /**
   * This is a bit more complicated, so bear with me.
   * This will try to force someone out of a session if they have a rating equal to their current session's rating.
   * That allows whatever other attendee that needed this stupidity to take that newly made slot.
   * 
   * Currently this just tries to do it with the attendee's top 3 choices because I'm lazy to implement anything else rn.
   * This method should only be called AFTER checking through sessions normally.
   * @param {Attendee} attendee Must of of type {Attendee}
   * @param {number} depth The current recursion depth. When first called, this is the max recusion depth.
   */
  recursivelyAssignSlot(attendee, depth) {
    // If there is no more depth left (we've reached the last layer of recursion), then stop going deeper.
    if (depth == 0) {
      return false;
    }

    // If the attendee can't take this session for whatever reason, just ignore it.
    // canTake() does not take into account the number of open slots in the session.
    for (let sessionNumber = 0; sessionNumber < 3; sessionNumber++) {
      // Slight optimization: if the attendee already has the session, they can't get it again.
      if (!attendee.sessions.includes(this)) {
        break;
      }
      // Loop through all the attendees in that session and try to assign them a different top 3 session.
      for (let slot = 0; slot < this.emptySlots.length; slot++) {
        // Slight optimization: only check a slot if the attendee has that slot open
        if (!attendee.isFreeSlot(slot, this)) {
          break;
        }
        // Now loop through the other attendees in that slot to try an reassign them.
        for (let otherAttendee = 0; otherAttendee < this.maxSize - this.emptySlots[slot]; otherAttendee++) {
          for (let otherSession = 0; otherSession < 3; otherSession++) {
            if (this.attendees[otherAttendee]) {
              log("WIP")
            }
          }
        }
      }
    }
    
    return false;
  }


  /**
   * <p> Checks if there is enough space for a attendee to be assigned a slot.
   * @return {boolean} True if there is space. False if there isn't.
   */
  hasAvailableSlot(slot) {
    if (this.blocks[slot] == false) {
      return false;
    }

    for (let i = 0; i < this.sessionLength; i++) {
      if (this.emptySlots[slot+i] <= 0 || this.emptySlots[slot+i] == undefined) {
        return false;
      }
    }
    
    return true;
  }


  /**
   * This gets the slot with the fewest attendees signed up.
   * @return {number} The slot number with the fewest attendees signed up.
   */
  largestEmptySlot() {
    let smallest = this.emptySlots[0];
    // Starting at one because I already used the first slot above.
    for (let i = 1; i < this.emptySlots.length; i++) {
      if (this.emptySlots[i] < smallest) {
        smallest = i;
      }
    }

    return smallest;
  }


  /**
   * <p> Crazy concept, but this returns the NAME OF THE SESSION.
   * @return {string} The name of the sesion.
   */
  getName() {
    return this.name;
  }


  /**
   * Guess what?.. This... SETS THE NAME (boom)
   * @param {string} name The new name to be set to.
   */
  setName(name) {
    this.name = name;
  }


  /**
   * <p> Mainly for debugging purposes, this sums up the session's info to put it into a string format.
   * <p> Format is: [Session {NAME} | {TEACHER}[EMPTYSLOTS/MAXSIZE]]
   * @return {string} "[Session {NAME} | {TEACHER}[EMPTYSLOTS/MAXSIZE]]"
   */
  toString() {
    return "[Session " + this.name + " |  " + this.host + " [" + this.emptySlots + "/" + this.maxSize + "]]";
  }

  
  /**
   * <p> This turns it into a String with specific attendee info.
   * <p> Format is: [Session {NAME} | {TEACHER}[EMPTYSLOTS/MAXSIZE]: {Attendees}]
   * @return {string} A more verbose stringified version of the session
   */
  toVerboseString() {
    return "[Session " + this.name + " |  " + this.host + " [" + this.emptySlots + "/" + this.maxSize + "]: " + this.attendees + "]";
  }


  /**
   * <p> This converts the spreadsheet data into something readable by sheets.
   * <p> Format is [NAME, TEACHER, EMAIL, # PEOPLE IN S1, # PEOPLE IN S2, ... , % FILLED IN S1, % FILLED IN S2, ... , SESSION 1, SESSION 2, ..., SESSION_RATINGS 1, SESSION_RATINGS 2, ...]
   * @return {string[]} An array of cells (strings). This represents a row of data.
   */
  toSpreadsheetArray() {
    let data = [];
    data.push(this.name);
    data.push(this.host);
    data.push(this.email);
    // People in S(n)
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      let count = 0;
      for (let j = 0; j < this.attendees[i].length; j++) {
        if (this.attendees[i][j] instanceof Attendee) {
          count++;
        }
      }
      data.push(count);
    }
    // % Filled in S(n)
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      let count = 0;
      for (let j = 0; j < this.attendees[i].length; j++) {
        if (this.attendees[i][j] instanceof Attendee) {
          count++;
        }
      }
      data.push(count / this.maxSize);
    }
    // Session N
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      data.push(this.getGoodAttendeesString(i));
    }
    // Unconfirmed Session N
    // for (let i = 0; i < setting_sessions_per_attendee.getValue(); i++) {
    //   data.push(this.getBadAttendeesString(i));
    // }
    // Session Ratings N
    for (let i = 0; i < Number(setting_sessions_per_attendee.getValue()); i++) {
      data.push(this.getGoodAttendeesWithRatingsString(i));
    }
    return data;
  }

  
  /**
   * Gets a list of all the attendees in the form of a string.
   * Example: "Bob Johnson;Jimony Jones; Jeremiah Falkreath"
   * @param {number} slot The session slot # to get the attendees of. For example, 0 would get the first block attendees.
   * @return {string} A list of all the good attendees.
   */
  getGoodAttendeesString(slot) {
    let s = "";
    for (let i = 0; i < this.attendees[slot].length; i++) {
      // If at the end of the attendees, stop trying to list them.
      if (typeof this.attendees[slot][i] !== 'object') {
        break;
      }

      // Ignore attendee if they have full zero ratings.
      if (this.attendees[slot][i].getBestRating(0) != null && this.attendees[slot][i].getBestRating(0) != 0 && this.attendees[slot][i].getBestRating(0).getRating() == 0) {
        continue;
      }
      else {
        s += this.attendees[slot][i].getName() + "(" + this.attendees[slot][i].customInfo["preferredname"] + ")";
      }

      // Don't want a semicolon after the last name
      if (i < this.attendees[slot].length - 1) {
        s += ";";
      }
    }
    return s;
  }


  /**
   * Gets a list of all the attendees in the form of a string with their ratings in paranthesis
   * Example: "Bob Johnson(3);Jimony Jones(2); Jeremiah Falkreath()"
   * @param {number} slot The session slot # to get the attendees of. For example, 0 would get the first block attendees.
   * @return {string} A list of all the good attendees with ratings.
   */
  getGoodAttendeesWithRatingsString(slot) {
    let s = "";
    for (let i = 0; i < this.attendees[slot].length; i++) {
      // If at the end of the attendees, stop trying to list them.
      if (typeof this.attendees[slot][i] !== 'object') {
        break;
      }

      // Ignore attendee if they have full zero ratings.
      if (this.attendees[slot][i].getBestRating(0) != null && this.attendees[slot][i].getBestRating(0) != 0 && this.attendees[slot][i].getBestRating(0).getRating() == 0) {
        continue;
      }
      else {
        s += this.attendees[slot][i].getName() + "(" + this.attendees[slot][i].getRatingBySession(this).getRating() + ")";
      }

      // Don't want a semicolon after the last name
      if (i < this.attendees[slot].length - 1) {
        s += ";";
      }
    }
    return s;
  }


  /**
   * DEPRECATED - 0 star ratings are no longer considered no rating. Instead, empty cells are considered as no rating.
   * Gets a list of all the attendees in the form of a string WHO have full 0 ratings.
   * Example: "Bob Johnson;Jimony Jones; Jeremiah Falkreath"
   * @param slot The session slot # to get the attendees of. For example, 0 would get the first block attendees.
   */
  getBadAttendeesString(slot) {
    let s = "";
    for (let i = 0; i < this.attendees[slot].length; i++) {
      // If at the end of the attendees, stop trying to list them.
      if (typeof this.attendees[slot][i] !== 'object') {
        break;
      }

      // Ignore attendee if they have full zero ratings.
      if (this.attendees[slot][i].getBestRating(0) != null && this.attendees[slot][i].getBestRating(0) != 0 && this.attendees[slot][i].getBestRating(0).getRating() == 0) {
        s += this.attendees[slot][i].getName();
      }
      else {
        continue;
      }

      // Don't want a semicolon after the last name
      if (i < this.attendees[slot].length - 1) {
        s += ";";
      }
    }
    return s;
  }


  /**
   * Gets the number of blocks that the session takes up.
   * @return The blocks PER running of this session.
   */
  getLength() {
    return this.sessionLength;
  }


  getNumberOfAttendees() {
    let total = 0;
    for (let slot = 0; slot < Number(setting_sessions_per_attendee.getValue()); slot++) {
      for (let attendee = 0; attendee < this.attendees.length; attendee++) {
        if (this.attendees[slot][attendee] instanceof Attendee) {
          total++;
          break;
        }
      }
    }
    return total;
  }
}