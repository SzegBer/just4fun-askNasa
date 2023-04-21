window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.querySelector('#picture').setAttribute("style", "opacity: 1")
    document.querySelector('#information').setAttribute("style", "opacity: 1")
  }, 3000)
})


function dateFormatter (dateObject) {

  let day = dateObject.getDate();
  let month = dateObject.getMonth() + 1;
  let year = dateObject.getFullYear();
  
  month < 10 ? month = `0${month}` : "";
  day < 10 ? day = `0${day}` : "";
  
  return `${year}-${month}-${day}`;
}

// Display Today's date in header
let today = new Date();
let currentDate = dateFormatter(today);
document.querySelector('#date').innerHTML = `Today is:<br>${currentDate}`

// ------------ --EVENT LISTENER A NAPTÁR INPUT MEZEJÉN
// chosenDate változóba menti el a kiválasztott dátumot.
// meghívja az API-t adott dátumra vonatkozólag.
// Eredményül egy tömböt kap, benne az adott 1 nap objectjével.

let calendarInputField = document.querySelector('#calendar');
calendarInputField.setAttribute("max", `${currentDate}`);
calendarInputField.setAttribute("value", `${currentDate}`);
calendarInputField.addEventListener("input", updateCalendarValue);

let chosenDate = currentDate;
let calendarDateObject = calendarInputField.valueAsDate
let modifier = 0;

// updating calendar value and re-sending api request
function updateCalendarValue (e) {         // from the calendar Event
  modifier = 0;
  calendarDateObject = e.target.valueAsDate;

  chosenDate = dateFormatter(calendarDateObject)
  sendApiRequest();
}

function updateCalendarValueWithNavigation () {   // from the navigation prev/next buttons  
  let modifiedDateNumber = calendarDateObject.getTime() - (modifier*86400000)
  calendarDateObject = new Date(modifiedDateNumber);
  modifier = 0;
  chosenDate = dateFormatter(calendarDateObject);
  calendarInputField.setAttribute("value", `${chosenDate}`);
  sendApiRequest();
}

sendApiRequest();

async function sendApiRequest(){
  let apiKey = "S8VP2NASnZddZ3x1vDZFL6QrAUTiHoIPo3dzddec"
  let response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${chosenDate}&end_date=${chosenDate}`);
  let spaceData = await response.json()
  useApiDataChosenDate(spaceData)
}

//chosenDate szerinti image betöltése az oldalba
//Mivel itt a spaceData egy tömb amibe az 1 napnyi object van ágyazva, így hivatkoznunk kell a tömbön belüli [0] helyére is.
function useApiDataChosenDate(data){
  //date in navigation field
  document.querySelector('#pic-date').innerHTML = data[0].date
  if(data[0].date === currentDate){
    document.querySelector('.next').classList.add('impossible')
  } else document.querySelector('.next').classList.remove('impossible')

  //information block
  document.querySelector('#title').innerHTML = data[0].title
  document.querySelector('#explanation').innerHTML = data[0].explanation

  if(data[0].copyright === undefined) {
    document.querySelector('#copyright').innerHTML = ``
  } else document.querySelector('#copyright').innerHTML = `Copyright: ${data[0].copyright}`

  if (data[0].media_type === "image"){
    document.querySelector('#iframe').setAttribute("style","display: none")
    document.querySelector('#nasa-img').setAttribute("style","display: inline-block")
    document.querySelector('#nasa-img').setAttribute("src",data[0].url)
  } else {
    document.querySelector('#nasa-img').setAttribute("style","display: none")
    document.querySelector('#iframe').setAttribute("style","display: inline-block")
    document.querySelector('#iframe').setAttribute("src",data[0].url)
  }

}

// NAVIGATION below the picture
let previousDay = document.querySelector('.previous')
let nextDay = document.querySelector('.next')

previousDay.addEventListener('click', (e) => {
  modifier += e.detail  // kattintás száma
  updateCalendarValueWithNavigation();
})

nextDay.addEventListener('click', (e) => {
  modifier -= e.detail  // kattintás száma
  updateCalendarValueWithNavigation();
})
