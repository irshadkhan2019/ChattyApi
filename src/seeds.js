const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");
const { floor, random } = require("lodash");
const axios = require("axios");
const { createCanvas } = require("canvas");

dotenv.config({});

function avatarColor() {
  const colors = [
    "#f44336",
    "#e91e63",
    "#2196f3",
    "#9c27b0",
    "#3f51b5",
    "#00bcd4",
    "#4caf50",
    "#ff9800",
    "#8bc34a",
    "#009688",
    "#03a9f4",
    "#cddc39",
    "#2962ff",
    "#448aff",
    "#84ffff",
    "#00e676",
    "#43a047",
    "#d32f2f",
    "#ff1744",
    "#ad1457",
    "#6a1b9a",
    "#1a237e",
    "#1de9b6",
    "#d84315",
  ];
  return colors[floor(random(0.9) * colors.length)];
}

function generateAvatar(text, backgroundColor, foregroundColor = "white") {
  const canvas = createCanvas(200, 200);
  const context = canvas.getContext("2d");

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = "normal 80px sans-serif";
  context.fillStyle = foregroundColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}

async function seedUserData(count) {
  let i = 0;
  try {
    for (i = 0; i < count; i++) {
      const username = faker.helpers.unique(faker.word.adjective, [8]);
      const color = avatarColor();
      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        email: faker.internet.email(),
        password: "password",
        avatarColor: color,
        avatarImage: avatar,
      };
      console.log(
        `***ADDING USER TO DATABASE*** - ${i + 1} of ${count} - ${username}`
      );
      await axios.post(`${process.env.API_URL}/signup`, body);
    }
  } catch (error) {
    console.log(error?.response?.data);
  }
}

seedUserData(10);
