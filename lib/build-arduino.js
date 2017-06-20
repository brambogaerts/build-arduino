"use babel"

var fs = require("fs");
var path = require("path");

export const config = {
	executable: {
		title: 'Path to Arduino app',
		type: 'string',
		default: '/Applications/Arduino.app'
	},
	baud: {
		title: 'BAUD Rate',
		description: 'Sets the BAUD rate for the serial monitor',
		type: 'number',
		default: '9600'
	},
	board: {
		title: 'Arduino board',
		description: 'The board uses the pattern as described <a href="https://github.com/arduino/Arduino/blob/ide-1.5.x/build/shared/manpage.adoc#options">here</a>.',
		type: 'string',
		default: 'arduino:avr:uno'
	},
	part: {
		title: 'Part',
		description: 'The part on the board.',
		type: 'string',
		default: 'ATmega328P'
	},
	programmer: {
		title: 'Programmer',
		description: 'The programmer to use.',
		type: 'string',
		default: 'arduino'
	},
	port: {
		title: 'Port',
		description: 'The port the board is connected to.',
		type: 'string',
		default: '/dev/cu.usbmodemFA131'
	}
};

export function provide(){
	return class ArduinoBuildProvider {
		constructor(cwd){
			this.cwd = cwd;
			this.sketch = path.basename(this.cwd) + ".ino";
		}

		getNiceName(){
			return "Arduino";
		}

		isEligible(){
			if(fs.existsSync(path.join(this.cwd, this.sketch))){
				return true;
			} else {
				return false;
			}
		}

		settings(){
			var sketch = this.sketch;

			function config(mode, name){
				var output = "/.build/" + sketch + ".hex";
				var path = atom.config.get('build-arduino.executable') + "/Contents/Java/";

				var cmd = ""
				+ "mkdir -p .build && (" + path + "arduino-builder"
				+ " -hardware=" + path + "hardware"
				+ " -libraries=" + path + "libraries"
				+ " -libraries=$HOME/Documents/Arduino/libraries"
				+ " -tools=" + path + "hardware/tools"
				+ " -tools=" + path + "tools"
				+ " -tools=" + path + "tools-builder"
				+ " -fqbn=" + atom.config.get('build-arduino.board')
				+ " -build-path=`pwd`/.build"
				+ " `pwd` &&"
				+ " " + path + "hardware/tools/avr/bin/avrdude"
				+ " -C " + path + "hardware/tools/avr/etc/avrdude.conf"
				+ " -c " + atom.config.get('build-arduino.programmer')
				+ " -p " + atom.config.get('build-arduino.part')
				+ " -P " + atom.config.get('build-arduino.port')
				+ " -b 115200"
				+ " -D"
				+ " -Uflash:w:`pwd`" + output + ":i"
				+ " ) || true && rm -rf .build";

				return {
					"exec": cmd,
					"name": name,
					"errorMatch": [
						"\n(?<file>[\\\/0-9a-zA-Z\\._]+):(?<line>\\d+):(?<col>\\d+)"
					]
				}
			}

			return [
				config("verify", "Arduino - Verify sketch"),
				config("upload", "Arduino - Upload sketch")
			];
		}
	}
}
