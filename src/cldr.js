/* jshint esnext: true, laxbreak:true */
var  expDTComponents = /(?:[Eec]{1,6}|G{1,5}|(?:[yYu]+|U{1,5})|[ML]{1,5}|d{1,2}|a|[hkHK]{1,2}|m{1,2}|s{1,2}|z{1,4})(?=([^']*'[^']*')*[^']*$)/g;

// Skip over patterns with these datetime components
var  unwantedDTCs = /[QxXVOvZASjgFDwWIQqH]/;

// Maps the number of characters in a CLDR pattern to the specification
var  dtcLengthMap = {
  month:   [ 'numeric', '2-digit', 'short', 'long', 'narrow' ],
  weekday: [ 'short', 'short', 'short', 'long', 'narrow' ],
  era:     [ 'short', 'short', 'short', 'long', 'narrow' ]
};

var  dtKeys = ["weekday", "era", "year", "month", "day"];
var  tmKeys = ["hour", "minite", "second", "timeZoneName"];

function  isDateFormatOnly(obj) {
  for (var i = 0; i <  tmKeys.length; i += 1) {
    if (obj.hasOwnProperty( tmKeys[i])) {
      return false;
    }
  }
  return true;
}

function  isTimeFormatOnly(obj) {
  for (var i = 0; i <  dtKeys.length; i += 1) {
    if (obj.hasOwnProperty( dtKeys[i])) {
      return false;
    }
  }
  return true;
}

function  createDateTimeFormat(format) {
  if ( unwantedDTCs.test(format))
    return undefined;

  var formatObj = {};

  // Replace the pattern string with the one required by the specification, whilst
  // at the same time evaluating it for the subsets and formats
  formatObj.pattern = format.replace( expDTComponents, function ($0) {
  // See which symbol we're dealing with
    switch ($0.charAt(0)) {
      case 'E':
      case 'e':
      case 'c':
        formatObj.weekday =  dtcLengthMap.weekday[$0.length-1];
        return '{weekday}';

        // Not supported yet
      case 'G':
        formatObj.era =  dtcLengthMap.era[$0.length-1];
        return '{era}';

      case 'y':
      case 'Y':
      case 'u':
      case 'U':
        formatObj.year = $0.length === 2 ? '2-digit' : 'numeric';
        return '{year}';

      case 'M':
      case 'L':
        formatObj.month =  dtcLengthMap.month[$0.length-1];
        return '{month}';

      case 'd':
        formatObj.day = $0.length === 2 ? '2-digit' : 'numeric';
        return '{day}';

      case 'a':
        return '{ampm}';

      case 'h':
      case 'H':
      case 'k':
      case 'K':
        formatObj.hour = $0.length === 2 ? '2-digit' : 'numeric';
        return '{hour}';

      case 'm':
        formatObj.minute = $0.length === 2 ? '2-digit' : 'numeric';
        return '{minute}';

      case 's':
        formatObj.second = $0.length === 2 ? '2-digit' : 'numeric';
        return '{second}';

      case 'z':
        formatObj.timeZoneName = $0.length < 4 ? 'short' : 'long';
        return '{timeZoneName}';
    }
  });

      // From http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns:
      //  'In patterns, two single quotes represents a literal single quote, either
      //   inside or outside single quotes. Text within single quotes is not
      //   interpreted in any way (except for two adjacent single quotes).'
  formatObj.pattern = formatObj.pattern.replace(/'([^']*)'/g, function ($0, literal) {
    return literal ? literal : "'";
  });

  if (formatObj.pattern.indexOf('{ampm}') > -1) {
    formatObj.pattern12 = formatObj.pattern;
    formatObj.pattern = formatObj.pattern.replace('{ampm}', '').trim();
  }

  return formatObj;
}

export  function createDateTimeFormats(formats) {

  var avail = formats.availableFormats;
  var order = formats.medium;
  var result = [];
  var M, E, frmt, dFrmt, computed, i, j;
  var timeFrmts = [];
  var dateFrmts = [];

  // Map the formats into a pattern for createDateTimeFormats
  for (frmt in avail) {
    if (avail.hasOwnProperty(frmt)) {
      dFrmt = avail[frmt];

      // Expand component lengths if necessary, as allowed in the LDML spec
      // Get the lengths of 'M' and 'E' substrings in the date pattern
      // as arrays that can be joined to create a new substring
      M = new Array((frmt.match(/M/g)||[]).length + 1);
      E = new Array((frmt.match(/E/g)||[]).length + 1);

      if (M.length > 2)
        dFrmt = dFrmt.replace(/(M|L)+/, M.join('$1'));

      if (E.length > 2)
        dFrmt = dFrmt.replace(/([Eec])+/, E.join('$1'));

      computed =  createDateTimeFormat(dFrmt);

      if (computed) {
        result.push(computed);
        // in some cases, the format is only displaying date specific props
        // or time specific props, in which case we need to also produce the
        // combined formats.
        if ( isDateFormatOnly(computed)) {
          dateFrmts.push(dFrmt);
        } else if ( isTimeFormatOnly(computed)) {
          timeFrmts.push(dFrmt);
        }
      }
    }
  }

  // combine time and date formats when they are orthogonals to complete the
  // formats supported by browsers by relying on the value of "formats.medium"
  for (i = 0; i < timeFrmts.length; i += 1) {
    for (j = 0; j < dateFrmts.length; j += 1) {
      computed =  createDateTimeFormat(
        order
        .replace('{0}', timeFrmts[i])
        .replace('{1}', dateFrmts[j])
        .replace(/^[,\s]+|[,\s]+$/gi, '')
      );
      if (computed) {
        result.push(computed);
      }
    }
  }
  return result;
}
