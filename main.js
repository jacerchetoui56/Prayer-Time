
const city = document.querySelector('.cityName');
const search = document.querySelector('.search');
const fajrField = document.querySelector('.fajr p');
const dohrField = document.querySelector('.dohr p');
const asrField = document.querySelector('.asr p');
const maghribField = document.querySelector('.maghrib p');
const ishaField = document.querySelector('.isha p');
const nextPage = document.querySelector('.nextPage');
const name = document.querySelector('.title span')
const remainingTime = document.querySelectorAll('.remaining-time')
const times = document.querySelectorAll('.prayer')
const adhan = document.querySelector('audio')
const currentTime = document.querySelector('.currentTime')
let indexNext = 0
let interval = null

city.focus()

async function searchPrayerTime(cityName) {
    //I usually hide the key but it's okey for now if it's shown
    let response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=0329aab0cda94946a805658568855af8`)
    let data = await response.json()

    let { lat, lng } = data.results[0].geometry
    let response2 = await fetch("https://www.islamicfinder.us/index.php/api/prayer_times?latitude="
        + lat
        + "&longitude=" +
        lng
        + "&timezone=utc&time_format=0&method=1")
    let data2 = await response2.json()

    let { Fajr, Dhuhr, Asr, Maghrib, Isha } = data2.results
    fajrField.textContent = fixTime(Fajr)
    dohrField.textContent = fixTime(Dhuhr)
    asrField.textContent = fixTime(Asr)
    maghribField.textContent = fixTime(Maghrib)
    ishaField.textContent = fixTime(Isha)
    name.textContent = cityName
    interval = setInterval(() => {
        let arrayPrayers = [fixTime(Fajr), fixTime(Dhuhr), fixTime(Asr), fixTime(Maghrib), fixTime(Isha)]
        nextPrayer(arrayPrayers)
        let now = new Date()
        let nowTime = "" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
        let difference = diffrenceBetweenTimes(arrayPrayers[indexNext], nowTime)
        for (let i = 0; i < difference.length; i++) {
            if (difference[i] < 10) {
                difference[i] = "0" + difference[i]
            }
        }
        remainingTime[indexNext].textContent = difference[0] + ":" + difference[1] + ":" + difference[2]

        displayCurrentTime()
        if (remainingTime[indexNext].textContent == "00:00:00") {
            adhan.play()
        }
    }, 1000);

}


function fixTime(salah) {
    let time = salah.split(":")
    //add 1 hour to the time (tunsia)
    time[0] = parseInt(time[0]) + 1
    if (time[0] < 10) time[0] = "0" + time[0]
    return time.join(":")
}


function diffrenceBetweenTimes(time1, time2) {
    //!->get the infos of today 
    let now = new Date()
    let thisYear = now.getFullYear()
    let thisMonth = now.getMonth()
    let thisDay = now.getDate()
    //!->get the times in the parameters
    let time1Array = time1.split(":")
    let time2Array = time2.split(":")
    let time1Hours = parseInt(time1Array[0])
    let time1Minutes = parseInt(time1Array[1])
    let time1Seconds = 0
    let time2Hours = parseInt(time2Array[0])
    let time2Minutes = parseInt(time2Array[1])
    let time2Seconds = parseInt(time2Array[2])
    let time1date = new Date(thisYear, thisMonth, thisDay, time1Hours, time1Minutes, time1Seconds)
    let time2date = new Date(thisYear, thisMonth, thisDay, time2Hours, time2Minutes, time2Seconds)
    //!===> now let's get the diffrence between the times
    let difference = time1date.getTime() - time2date.getTime()
    difference = difference / 1000
    let hours = Math.floor(difference / 3600)
    let minutes = Math.floor((difference - hours * 3600) / 60)
    let seconds = Math.floor(difference - hours * 3600 - minutes * 60)

    return [hours, minutes, seconds]
}

//!==> this function is to now what prayer is the next to style it accordingly
function nextPrayer(arrayTimes) {
    arrayTimes.forEach((time, index) => {
        let now = new Date()
        let nowTime = "" + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
        //!==> fortunately wa can compare two strings XD
        if (time > nowTime
            && nowTime > arrayTimes[index - 1]) {
            for (let i = 0; i < times.length; i++) {
                if (i == index) {
                    times[i].classList.add('next')
                }
                else {
                    times[i].classList.remove('next')
                }
            }
            remainingTime[index].textContent = diffrenceBetweenTimes(time, nowTime)
            indexNext = index
            scrollToSalah(indexNext)
        }
    })
}

function displayCurrentTime() {
    let now = new Date()
    let nowHour = now.getHours() > 9 ? now.getHours() : "0" + now.getHours()
    let nowMinutes = now.getMinutes() > 9 ? now.getMinutes() : "0" + now.getMinutes()
    let nowSeconds = now.getSeconds() > 9 ? now.getSeconds() : "0" + now.getSeconds()
    currentTime.textContent = nowHour + ":" + nowMinutes + ":" + nowSeconds
}

//!==> this function is to scroll to the next Salah 
//* this variable is to check if I'm alrady in the right place or not
let alreadyScrolled = false
function scrollToSalah(index) {
    if (!alreadyScrolled) {
        switch (index) {
            case 3: window.scrollTo({ top: maghribField.offsetTop + 150, behavior: 'smooth' });
                break;
            case 4: window.scrollTo({ top: ishaField.offsetTop + 150, behavior: 'smooth' })
                break;
        }
        alreadyScrolled = true
    }
}



//!============= Event Listeners ===============
if (localStorage.getItem('city')) {
    searchPrayerTime(localStorage.getItem('city'))
    alreadyScrolled = false
    setTimeout(() => {
        nextPage.classList.add('show')
    }, 1700);
}
city.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        let cityName = city.value
        localStorage.setItem('city', cityName)
        clearInterval(interval)
        searchPrayerTime(cityName)
        alreadyScrolled = false
        setTimeout(() => {
            nextPage.classList.add('show')
        }, 1700);
        city.value = ""
        city.blur()
    }
})





