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
}
module.exports = Helpers;
