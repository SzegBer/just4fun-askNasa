// returns the weeks number in YYYY-WW format - currently not used
/*
function dateFormatterWichWeek (dateObject) {
  let year = new Date(dateObject.getFullYear(), 0, 1);
  let days = Math.floor((dateObject - year) / (24 * 60 * 60 * 1000));
  let week = Math.ceil((dateObject.getDay() + 1 + days) / 7);

  let trueYear = dateObject.getFullYear()
  return `${trueYear}-${week}`;
}*/

// returns any date object to YYYY-MM-DD format in a string (for example: for the API link)
function dateFormatter (dateObject) {
  let day = dateObject.getDate();
  let month = dateObject.getMonth() + 1;
  let year = dateObject.getFullYear();
  month < 10 ? month = `0${month}` : "";
  day < 10 ? day = `0${day}` : "";
  return `${year}-${month}-${day}`;
}

// adds 7 days to the given date Object and gives you back YYYY-MM-DD format string
// used always with Mondays so it gives back the Sunday
function dateCalculateSunday (dateObject) {
  let modifiedDateObject = dateObject.getTime() + (6*86400000)
  dateObject = new Date(modifiedDateObject);
  
  let sunday = dateObject.getDate();
  let month = dateObject.getMonth() + 1;
  let year = dateObject.getFullYear();

  month < 10 ? month = `0${month}` : "";
  sunday < 10 ? day = `0${day}` : "";
  return `${year}-${month}-${sunday}`;
}

// puts the current date into the header section
let today = new Date();
let currentDate = dateFormatter(today);
document.querySelector('#date').innerHTML = `Today is:<br>${currentDate}`

// gives you previous Monday and Sunday date object based on todays day number
// if today is Sunday, it's going to give you back this week's Monday and Sunday
let lastMonday = new Date();
let lastSunday = new Date();
function lastMondayCalculator (mod) {  
  let modifiedDateObject = today.getTime() - (mod*86400000)
  return new Date(modifiedDateObject);
}
function lastSundayCalculator (mod) {  
  let modifiedDateObject = today.getTime() - (mod*86400000)
  return new Date(modifiedDateObject);
}

switch(today.getDay()){
  case 1:
    lastMonday = lastMondayCalculator(7);
    lastSunday = lastSundayCalculator(1);
    break;
  case 2:
    lastMonday = lastMondayCalculator(8);
    lastSunday = lastSundayCalculator(2);
    break;
  case 3:
    lastMonday = lastMondayCalculator(9);
    lastSunday = lastSundayCalculator(3);
    break;
  case 4:
    lastMonday = lastMondayCalculator(10);
    lastSunday = lastSundayCalculator(4);
    break;
  case 5:
    lastMonday = lastMondayCalculator(11);
    lastSunday = lastSundayCalculator(5);
    break;
  case 6:
    lastMonday = lastMondayCalculator(12);
    lastSunday = lastSundayCalculator(6);
    break;
  case 7:
    lastMonday = lastMondayCalculator(6);
    lastSunday = today
    break;
}
//on loading the calendar will always show the previous monday as value
let calendarInputField = document.querySelector('#calendar');
calendarInputField.valueAsDate = lastMonday;
let calendarDateObject = calendarInputField.valueAsDate

//formatting the lastMonday and lastSunday to YYYY-MM-DD format to give them to API
//so on loading the page will show you always a full week's gallery
sendApiRequest(dateFormatter(lastMonday), dateFormatter(lastSunday));

//if you choose a week from the calendar, it is going to send an API request for that week
calendarInputField.addEventListener("input", updateCalendarValue);
function updateCalendarValue (e) {
  calendarDateObject = e.target.valueAsDate;
  let chosenMonday = dateFormatter(calendarDateObject);
  let chosenSunday = dateCalculateSunday(calendarDateObject);
  sendApiRequest(chosenMonday, chosenSunday);
}
//if you use the previous/next navigation buttons, it's going to send an API request with the prev/next week info
function updateCalendarValueWithNavigation () {
  let modifiedDateNumber = calendarDateObject.getTime() - (modifier*86400000*7)
  calendarDateObject = new Date(modifiedDateNumber);
  modifier = 0;
  let chosenMonday = dateFormatter(calendarDateObject);
  let chosenSunday = dateCalculateSunday(calendarDateObject);
  sendApiRequest(chosenMonday, chosenSunday);
}

//API request wich will fill up the gallery with 7 pictures
//spaceData saved as Global[] to be able to reach it with other functions as well.
let spaceData = [];
async function sendApiRequest(chosenMonday, chosenSunday){
  let apiKey = "S8VP2NASnZddZ3x1vDZFL6QrAUTiHoIPo3dzddec"
  let response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${chosenMonday}&end_date=${chosenSunday}`);
  spaceData = await response.json()
  fillUpGallery(spaceData);
}

//gives you all the <img> tags in an array
let thumbnails = document.querySelectorAll('.thumbnails')

// after each api request this function is called to fill up the gallery with a new set of pictures
// if the data has video, it's going to display a png as a thumbnail for the video
// it hides the "next" navigation button if it is not needed.
// we give name attribute to each thumbnail wich is their index number in the spaceData array (0-6)
function fillUpGallery (data) {
  for(i=0; i<7; i++){
    if (data[i].media_type === "image"){
      thumbnails[i].setAttribute("src",data[i].url)
      thumbnails[i].setAttribute("name",i)
    } else {
      thumbnails[i].setAttribute("src","img/video.png")
      thumbnails[i].setAttribute("name",i)
    }
  }
    if(data[6].date === `${dateFormatter(lastSunday)}`){
      document.querySelector('.next').classList.add('impossible')
    } else document.querySelector('.next').classList.remove('impossible')
}

// click event on a thumbnail is going to modify the number with its's name attribute
//(which is the index number in the api spaceData array)
thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener('click', (e) => {
    let number = e.target.name
    showImageDetails(number);
  })
})

// enlarges the chosen picture and show you the description...
function showImageDetails (number) {
  document.querySelector('#title').innerHTML = spaceData[number].title
  document.querySelector('#explanation').innerHTML = spaceData[number].explanation

  if(spaceData[number].copyright === undefined) {
    document.querySelector('#copyright').innerHTML = ``
  } else document.querySelector('#copyright').innerHTML = `Copyright: ${spaceData[number].copyright}`

  if (spaceData[number].media_type === "image"){
    document.querySelector('#iframe').setAttribute("style","display: none")
    document.querySelector('#nasa-img').setAttribute("style","display: inline-block")
    document.querySelector('#nasa-img').setAttribute("src",spaceData[number].url)
  } else {
    document.querySelector('#nasa-img').setAttribute("style","display: none")
    document.querySelector('#iframe').setAttribute("style","display: inline-block")
    document.querySelector('#iframe').setAttribute("src",spaceData[number].url)
  }
}


// NAVIGATION buttons below the picture
let previousWeek = document.querySelector('.previous')
let nextWeek = document.querySelector('.next')

let modifier = 0
previousWeek.addEventListener('click', (e) => {
  modifier += e.detail  // kattintás száma
  updateCalendarValueWithNavigation();
})

nextWeek.addEventListener('click', (e) => {
  modifier -= e.detail  // kattintás száma
  updateCalendarValueWithNavigation();
})
