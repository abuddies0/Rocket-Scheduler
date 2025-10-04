// @ts-check
/************************************************************************************
 * This represents a single setting with a key(name), group, description, and value.
 ************************************************************************************/

/**
 * This represents a setting and the value assigned to it.
 * This is needed in order to automatically update settings.
 */
class Setting {

  /**
   * Adds a new setting into the project.
   * This can be reloaded by running the function reloadSettings()
   * @param {string} key The key of the setting in the cache. Generally the same as the name.
   * @param {string} type The type of setting this is: 'number', 'boolean', 'string', 'object'
   * @param {string} name The name of the setting to show in the Settings Sidebar.
   * @param {string} group The group that this setting belongs to. This is used for organization in the menus.
   * @param {string} description A description of what this setting modifies in a few sentences or more.
   */
  constructor(key, type, name, group, description) {
    /**
     * The key of the setting in the cache. Generally the same as the name.
     * @type {string}
     */
    this.key = key;
    /**
     * The group that this setting belongs to. This is used for organization in the menus.
     * @type {string}
     */
    this.group = group;
    /**
     * A description of what this setting modifies in a few sentences or more.
     * @type {string}
     */
    this.description = description;
    /**
     * The current value of the setting. Defaults to the default values in SettingsHandler.
     * @type {string}
     */
    this.value = getSetting(key);
    /**
     * What type of data this setting stores.
     * 'number', 'boolean', 'string', 'object'
     * @type {string}
     */
    this.type = type;
    /**
     * The name of the setting to show in the Settings Sidebar.
     * @type {string}
     */
    this.name = name;

    allSettings[key] = this;
    allGroups.add(group);
  }


  /**
   * This sets the value of this setting to something else.
   * @param {string} value The new value to set it to.
   */
  setValue(value) {
    this.value = value;
  }


  /**
   * This gets the text key of the setting.
   * For example, the setting that stores the max attempts per run is "max_attempts"
   * @return {string} The key of this setting.
   */
  getKey() {
    return this.key;
  }


  /**
   * This gets the value of this setting.
   * @return {string} The value of this setting.
   */
  getValue() {
    return this.value;
  }


  /**
   * @return {string} The description of the setting in a few sentences.
   */
  getDescription() {
    return this.description;
  }


  /**
   * A group is a way to link multiple settings together under tabs and in the settings sidebar.
   * @return {string} The group's name that this setting should be a part of.
   */
  getGroup() {
    return this.group;
  }


  /**
   * Returns a string representation on the type of data this setting stores.
   * For example, a true/false would return "bool"
   * The types are:
   * "boolean",
   * "number",
   * "string",
   * "object"
   * @return {string} The type of this object: 'boolean', 'number', 'string', 'object'
   */
  getType() {
    return this.type;
  }


  /**
   * This gets the more readable format of the name.
   * For example, the key might be "selections_sheet" while the name is "Selection Sheet Name"
   * @return {string} The name of this setting as seen in the settings sidebar.
   */
  getName() {
    return this.name;
  }


  /**
   * This returns the value of the setting.
   * This is called toString for ease of use.
   * @return {string} Currently just returns the value of the setting.
   */
  toString() {
    return this.value;
  }
}