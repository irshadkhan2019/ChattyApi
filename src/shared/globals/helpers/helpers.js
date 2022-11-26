class Helpers {
  static firstLetterUppercase(str) {
    const valueString = str.toLowerCase();
    return valueString
      .split(" ")
      .map(
        (value) =>
          `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`
      )
      .join(" ");
  }
  static lowerCase(str) {
    return str.toLowerCase();
  }
  static generateRandomIntegers(integerLength) {
    const characters = "0123456789";
    let result = " ";
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static parseJson(prop) {
    try {
      return JSON.parse(prop);
    } catch (error) {
      //if prop is not string it throws error so to avoid error use this method
      return prop;
    }
  }

  static isDataURL(value) {
    const dataUrlRegex =
      /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
  }

  static shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  static escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
}
module.exports = Helpers;
