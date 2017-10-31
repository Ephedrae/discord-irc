var fs = require("fs");
var winston = _interopRequireDefault(require('winston'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CommandParser {
  static ADMINS_FILE = "../admins.json";
  static IGNORED_USERS_FILE = "../ignored_users.json";

  static readJSONFile(filePath, callback) {
    fs.readFile(filePath, "utf-8", function(error, data) {
      callback(error, data);
    });
  }

  static writeJSONFile(filePath, json) {
    var jsonString = JSON.stringify(json);

    if (jsonString && jsonString.trim() != "") {
      fs.writeFile(filePath, jsonString);
    }
  }

  static addToList(list, elem, index) {
    if (index && index.trim() != "") {
      list[index].push(elem);
    } else {
      list.push(elem);
    }

    return list;
  }

  static removeFromList(list, elem, index) {
    if (index && index.trim() != "") {
			var elemIndex = list[index].indexOf(elem);

			if (elemIndex  != -1) {
				list[index].splice(elemIndex, 1)
			}
    } else {
			var elemIndex = list.indexOf(elem);
			if (elemIndex  != -1) {
				list.splice(elemIndex, 1)
			}
    }

    return list;
  }

  static findAdmin(user, callback) {
    CommandParser.readJSONFile(CommandParser.ADMINS_FILE, function(error, data) {
      if (!error) {
        var adminJSON = JSON.parse(data);

        for (var i=0; i<adminJSON["admin"].length; i++) {
          if (adminJSON["admin"][i] == user) {
            winston.default.info(user);
            winston.default.info(adminJSON["admin"][i]);
            callback();
            break;
          }
        }
      }
    });
  }

  constructor(text) {
    this.platform = null;
    this.client = null;
    this.channel = null;
		this.command = "";
		this.args = [];
    
    // Check if the text is not null or empty
    if (text && text.trim() != "") {
      // Get an array of words
      var textWords = text.split(/\s+/);

      // Get the first elem of the array as command, the rest as arguments
      this.command = textWords.shift();
      this.command = this.command.substring(1); // Clear the command character

      // Command arguments
      this.args = textWords;
    }
  }

  run(platform, client, channel) {
    this.platform = platform;
    this.client = client;
    this.channel = channel;

		switch (this.command) {
      case "list": {
        return this.list();
        break;
      }
      case "admin": {
        this.admin();
        break;
      }
			case "ignore": {
        this.ignore();
				break;
			}
      case "shrug": {
        return this.say("¯\\_(ツ)_/¯");
      }
      default: {
        this.help();
      }
		}
  }

  say(text) {
    if (this.platform && this.client) {
			switch (this.platform) {
				case "discord": {
					this.client.send(text);
					break;
				}
				case "irc": {
          if (this.channel) {
            this.client.say(this.channel, text);
          }
					break;
				}
			}
    }
  }

  help() {
    winston.default.info("Help");
  }

  list() {
    var listArg = this.args.shift();
    var jsonFile, indices;

    // Get the list to read and the indices
    switch(listArg) {
      case "admin": {
        jsonFile = CommandParser.ADMINS_FILE;
        indices = ["admin"];
        break;
      }
      case "ignore": {
        jsonFile = CommandParser.IGNORED_USERS_FILE;
        indices = ["irc", "discord"];
        break;
      }
    }

    if (jsonFile) {
      var listOutput = "";

      CommandParser.readJSONFile(jsonFile, function(error, data) {
        if (!error) {
          var json = JSON.parse(data);
          
          for (var i=0; i<indices.length; i++) {
            listOutput += indices[i] + ":\n";

            if (indices[i] in json) {
              var attrList = json[indices[0]];

              if (attrList) {
                listOutput += attrList.join(",");
              }
            }

            listOutput += "\n\n";
          }

          winston.default.info(listOutput);
        }
      });
    }
  }

  admin() {
    var this_args = this.args;

    CommandParser.readJSONFile(CommandParser.ADMINS_FILE, function(error, data) {
      if (!error) {
				// Get ignored user file
				var admins = JSON.parse(data) || {"admin": []};

				// Get action (add|remove)
				var action = this_args.shift();
				if (action != "add" && action != "rm") {
					return false;
				}

				// Add or remove users to the ignored list
				for (var i = 0; i < this_args.length; i++) {
					var admin = this_args[i];

					if (action == "add") {
						CommandParser.addToList(admins, admin, "admin");
					} else {
						CommandParser.removeFromList(admins, admin, "admin");
					}
				}

				winston.default.info(JSON.stringify(admins));
				CommandParser.writeJSONFile(CommandParser.ADMINS_FILE, admins);
      }
    });
  }

  ignore() {
    var this_args = this.args;

    CommandParser.readJSONFile(CommandParser.IGNORED_USERS_FILE, function(error, data) {
      if (!error) {
				// Get ignored user file
				var ignoredUsers = JSON.parse(data) || {"irc": [], "discord": []};

				// Get action (add|remove)
				var action = this_args.shift();
				if (action != "add" && action != "rm") {
					return false;
				}

				// Get platform (irc|discord)
				var platform = this_args.shift();
				if (platform != "irc" && platform != "discord") {
					return false;
				}

				// Add or remove users to the ignored list
				for (var i = 0; i < this_args.length; i++) {
					var user = this_args[i];

					if (action == "add") {
						CommandParser.addToList(ignoredUsers, user, platform);
					} else {
						CommandParser.removeFromList(ignoredUsers, user, platform);
					}
				}

				winston.default.info(JSON.stringify(ignoredUsers));
				CommandParser.writeJSONFile(CommandParser.IGNORED_USERS_FILE, ignoredUsers);
      }
    });
  }
}

module.exports = CommandParser;
