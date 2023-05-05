// Getting ip address from local storage
let ipAddress = window.localStorage.getItem('ip');

const ipInfo = document.getElementById('ipAdd');
const latInfo = document.getElementById('latitude');
const longInfo = document.getElementById('longitude');
const cityInfo = document.getElementById('city_Name');
const regionInfo = document.getElementById('regionName');
const orgInfo = document.getElementById('orgName');
const hostInfo = document.getElementById('hostName');
const timeZoneInfo = document.getElementById('time-zone');
const dataInfo = document.getElementById('date-time');
const pincodeInfo = document.getElementById('pincode');
const messageData = document.getElementById('message');
const searchBoxData = document.getElementById('search-box');
const displayMapDiv = document.getElementById('map-display');
const displayPostOfficesDiv = document.getElementById('card');
ipInfo.textContent = ipAddress

// Functions
// var lat , long ;
// function getLocation()
// {
//   if(navigator.geolocation)
//   {
//     navigator.geolocation.getCurrentPosition((position)=>{
//        lat = position.coords.latitude;
//        long = position.coords.longitude;
//       console.log(lat,long);
//     });
//   }
// }
// geolocation();

//  location on map
function ShowMap(latitude, longitude) {
  let html = `
  <iframe 
  src="https://maps.google.com/maps?q=${latitude}, ${longitude}&output=embed" 
  width="100%" 
  height="100%" 
  frameborder="0" 
  style="border:0">
  </iframe>
  `
  displayMapDiv.innerHTML = html;
}

// Show Post offices in given pincode 
function showPostOffices(poName, poBranch, poDeliveryStatus, poDistrict, poDivision) {
  let html = `
  <div class="details-tiles ${poName.toLowerCase()} ${poBranch.toLowerCase()}">
    <p class="details">Name: <span id="poName">${poName}</span> </p>
    <p class="details">Branch Type: <span id="poBranch">${poBranch}</span></p>
    <p class="details">Delivery Status: <span id="poDeliveryStatus">${poDeliveryStatus}</span></p>
    <p class="details">District: <span id="poDistrict">${poDistrict}</span></p>
    <p class="details">Division: <span id="poDivision">${poDivision}</span></p>
  </div>
  `
  displayPostOfficesDiv.insertAdjacentHTML('beforeend', html);
}

//------------------------------------------------------------------------------------------------------------------------------------

// Fetching data from url  adding event listener to search box 

fetch(`https://ipinfo.io/${ipAddress}/geo?token=abc35c0a2ab03b`)
  .then(response => response.json())
  .then((data) => {
    [lat, long] = data.loc.split(',');
    latInfo.textContent = lat;
    longInfo.textContent = long;
    cityInfo.textContent = data.city;
    regionInfo.textContent = data.region;
    orgInfo.textContent = data.org;
    hostInfo.textContent = data.hostname;
    ShowMap(lat, long);
    timeZoneInfo.textContent = data.timezone;
    dataInfo.textContent = new Date().toLocaleString("en-US", { timeZone: `${data.timezone}` });
    pincodeInfo.textContent = data.postal;
    return data.postal;
  })
  .then((pin) => {
    let pinCode = pin;
    fetch(`https://api.postalpincode.in/pincode/${pinCode}`)
      .then(response => response.json())
      .then((postalDataArray) => {
        // Storing all post offices present in that pin code in an array
        let postalData = postalDataArray[0];
        messageData.textContent = postalData.Message;
        let postOfficesInPincodeArray = postalData.PostOffice;
        // display post offices present in that pincode
        postOfficesInPincodeArray.forEach(postOffice => {
          showPostOffices(postOffice.Name, postOffice.BranchType, postOffice.DeliveryStatus, postOffice.District, postOffice.Division)
        });
        searchBoxData.classList.remove('hidden');
        //----------------------------------------------------
        // Adding event listener on search bar
        searchBoxData.addEventListener('input', (e) => {
          e.preventDefault();
          // storing all postal office card elements in an array
          let postOfficeArray = document.querySelectorAll('.details-tiles');
          let searchValue = searchBoxData.value.toLowerCase().trim();
          // searching for that specific element
          postOfficeArray.forEach((postOfficeElement) => {
            let name = postOfficeElement.querySelector('#poName').textContent.toLowerCase();
            let branchType = postOfficeElement.querySelector('#poBranch').textContent.toLowerCase();
            if (searchValue === '') postOfficeElement.classList.remove('hidden');
            if (!name.includes(searchValue) && !branchType.includes(searchValue)) {
              postOfficeElement.classList.add('hidden');
            } else {
              postOfficeElement.classList.remove('hidden');
            }
          })
        })
        //----------------------------------------------------
      })
      .catch(postalError => {
        console.error(postalError.message);
      })
  })
  .catch((error) => {
    console.error(error.message);
  })
