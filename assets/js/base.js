

const apiUrl = "https://public-participation-forum-api0ne.onrender.com/api/v1"
let p_token = null
let requestSig = null
const button = document.getElementById("submitButton");
const buttonText = button.querySelector(".button-text");
const spinner = button.querySelector(".spinner");
let  ENCRYPTION_KEY = getSessionData("ptkn"); // Replace with a strong, unique key

async function submitForm(formData) {
  // Log or process the form data 
  getSessionData("ptkn")

  // Send the form data via fetch to a backend API
  fetch(`${apiUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${requestSig}`, 
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      loading_timeout()
    })
    .catch((error) => {
      console.error("Error:", error);
      loading_timeout()
    });
}

const loading_timeout = ()=>{
  setTimeout(() => {
    // Re-enable the button and hide spinner
    button.disabled = false;
    buttonText.style.display = "inline";
    spinner.classList.add("formbold-btn-hidden");
  }, 2000); 
}

// Add an event listener to override default form submission
document.getElementById("responseForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission

  // Disable the button and show spinner
  button.disabled = true;
  buttonText.style.display = "none";
  spinner.classList.remove("formbold-btn-hidden");

  // Collect form data
  const formData = {
    first_name: document.getElementById("firstname").value,
    last_name: document.getElementById("lastname").value,
    id_number: document.getElementById("idnumber").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value
  };

  // Call the custom action
  submitForm(formData);
});

let response_identifer = null
let campaign_data = null
const modalOverlay = document.getElementById('modalOverlay');
const openModalButton = document.getElementById('openModal');
const closeModalButton = document.getElementById('closeModal');

// Show the modal
openModalButton.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

const inputClasses = ["first-name", "last-name", "id-number", "phone-number", "email"];
inputClasses.forEach((className) => {
    const inputField = document.querySelector(`.${className}`);

    if (inputField) { // Ensure the input field exists
        inputField.addEventListener("input", (e) => {
            if (e.target.value.includes("<script>")) {
                e.target.value = "";
            }
        });
    }
});

// Function to render schedule items
function renderCampaigns(campaigns,target_organ,legal_consent) {
  const container = document.getElementById(target_organ);
  container.innerHTML = ""; 

  campaigns.forEach(campaign => {
      const campaignItem = document.createElement("div");
      campaignItem.classList.add("row", "schedule-item");
      campaignItem.setAttribute("data-id", campaign.id+campaign.target_organ);

      campaignItem.innerHTML = `
        <div class="col-md-2"><time>${new Date(campaign.campaign.start_date).toLocaleDateString()}</time></div>
        <div class="col-md-10">
          <h4>${campaign.campaign.campaign_title}</h4>
          <p><strong>Target For:</strong> ${campaign.campaign.target_for}</p>
          <p><strong>Target To:</strong> ${campaign.campaign.target_to}</p>
          <p><strong>Source:</strong> ${campaign.campaign.campign_source}</p>
          <p><strong>Deliver To:</strong> <a href="mailto:${campaign.campaign.deliver_to}">${campaign.campaign.deliver_to}</a></p>
          <p><strong>Target organ:</strong> ${campaign.campaign.target_organ}</p>
        </div>
      `;
      container.appendChild(campaignItem);

      // Event listener for opening the modal on click
      campaignItem.addEventListener("click", () => {
        // Populate modal with campaign data
        document.getElementById("modal-title").textContent = campaign.campaign.campaign_title;
        document.getElementById("modal-target-organ").innerHTML = `<p><i class="fa-solid fa-building-columns fa-lg"></i> ${campaign.campaign.target_organ}</p>`;
        document.getElementById("modal-target-for").innerHTML = `<p><i class="fa-solid fa-building-columns fa-lg"></i> ${campaign.campaign.target_for}</p>`;
        // document.getElementById("modal-target-to").innerHTML = `<p><i class="fa-solid fa-house fa-lg"></i> ${campaign.campaign.target_to}</p>`;
        document.getElementById("modal-source").innerHTML = `<p><i class="fa-solid fa-bullhorn fa-lg"></i> ${campaign.campaign.campign_source}</p>`;
        document.getElementById("modal-deliver-to").innerHTML = `<p><i class="fa-solid fa-at fa-lg"></i></i> ${campaign.campaign.deliver_to}</p>`;

        // Inject FAQ content into the modal dynamically
        const legalRamificationsSection = document.getElementById("legal-ramifications-container");
        legalRamificationsSection.innerHTML = ''; 
        campaign.legal_ramifications.forEach(legalRamification => {
          const legalRamificationsContent = `
            <div class="legal-ramifications-item">
              <h3>${legalRamification.name}</h3>
              <div class="legal-ramifications-content">
                <p>${legalRamification.description}</p>
              </div>
            </div>
          `;
          legalRamificationsSection.innerHTML += legalRamificationsContent;
        });

        // Show the modal
        document.getElementById("modal").style.display = "block";
      });
  });

  const legalConsentSection = document.getElementById("modal-terms-container");
  legalConsentSection.innerHTML = ''; 
  const legalConsentContent = `
      <div class="legal-ramifications-item">

        <div class="legal-ramifications-content">
          <h3>${legal_consent.title}</h3>

          <p>${legal_consent.content}</p>
        </div>
      </div>
    `;
  legalConsentSection.innerHTML += legalConsentContent;
}

// Call the function to render the schedule
// Event listener for closing the modal
document.getElementById("close-btn").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

function getCurrentPosition() {
  navigator.geolocation.getCurrentPosition(
    position => {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
      // Send this to your API
      return {
        latitude: position.coords.latitudet,
        longitude: position.coords.latitude, 
        };
    },
    error => {
      console.error("Geolocation error:", error);
      return {
        latitude: null,
        longitude: null, 
        };
    }
  );
}
getCurrentPosition() 

function generateRandomToken(length = 32) {
  // Create a random array of values
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  
  // Convert the array to a hexadecimal string (a hash-like format)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function getBrowserData() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    colorDepth: window.screen.colorDepth,
    timezoneOffset: new Date().getTimezoneOffset(),
  };
}

function setSessionData(name, value) {
    sessionStorage.setItem(name, value);
    getSessionData("ptkn")
  }
  
function getSessionData(name) {
    // Retrieve the item
    const ptkn = sessionStorage.getItem(name);

    if(ptkn != null){
      return ptkn
    }else{
      return false
    }
  }
  
let token = generateRandomToken(32); // Generate a 32-byte token
p_token = getSessionData() ? getSessionData() : token

function setPtoken(opts=""){
  let ptkn = getSessionData("ptkn");

  if(ptkn != false){

  }else{
    setSessionData("ptkn",p_token);
  }
  ENCRYPTION_KEY = getSessionData("ptkn")
  return getSessionData("ptkn")  
}

document.addEventListener("DOMContentLoaded", function() {
  setPtoken("addEventListeneraddEventListener for fetch data")
  fetchData();
});

async function fetchData() {  
  // Prepare the data to be sent in the POST request
  const storedToken = localStorage.getItem(token);
  const token_value = getSessionData("ptkn");

  const requestData = {
    userAgent: getBrowserData(),
    geolocation: "",
    token: p_token,
    ptkn: token_value
  };

  // const jsonString = null
  // if(!response_identifer){
  const jsonString = JSON.stringify(requestData);
  const campaighns_path = `${apiUrl}/campaigns`
  try {
    const response = await fetch(campaighns_path, {
      method: "GET",  // Change to POST request
      headers: {
        "Content-Type": "application/json", // Ensure the server understands the JSON payload
        "Authorization": jsonString, // Set the Authorization header
      },
      // body: JSON.stringify(requestData),  // Send email and password as JSON in the request body
    });

    // If the response is successful, process the data
    if (response.ok) {
      const data = await response.json();
      campaign_data = data
      renderCampaigns(campaign_data['campaigns'], "all",campaign_data.legal_consent);
      renderCampaigns(campaign_data['legislature_campaigns'], "legistlature",campaign_data.legal_consent);
      renderCampaigns(campaign_data['executive_campaigns'], "executive",campaign_data.legal_consent);
      renderCampaigns(campaign_data['judiciary_campaigns'], "judiciary",campaign_data.legal_consent);

      // You can update the DOM or use the data as needed
    } else {
      console.error("Failed to fetch data:", response.statusText);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

websocket_1 = `wss://public-participation-forum-api0ne.onrender.com/api/v1cable?token=${token}`
websocket_2 = `wss://public-participation-forum-api0ne.onrender.com/api/v1cable?token=${token}`
socket_1 = `wss://public-participation-forum-api0ne.onrender.com/api/v1cable?token=${token}`
socket_2 = `wss://public-participation-forum-api0ne.onrender.com/api/v1cable?token=${token}`

const websocket_path = `wss://public-participation-forum-api0ne.onrender.com/api/v1cable?token=${token}` 

document.addEventListener("DOMContentLoaded", function() {
  const cable = ActionCable.createConsumer(websocket_path);
  const channelName = `DataChannel`;  // Construct the dynamic channel name

  // Subscribe to the DataChannel
  const dataChannel = cable.subscriptions.create({ channel: channelName, token: p_token }, {
    connected() {
      let ptkn = setPtoken()
      requestSig = getSessionData("utkn_u")
      this.perform("resend_data", {ptkn: ptkn, p_token: p_token,requestSig: requestSig });
    },
    disconnected() {
      console.log("Disconnected from DataChannel");
    },
    received(data) {
      response_identifer = data
      console.log("received-received-data")
      console.log(data)
      let utkn = false;
     
      if(response_identifer.type === "connection"){
        console.log("data-connection")
        console.log(data)
        console.log("END data-connection ")
      }
      if(response_identifer.type === "utkn"){
        localStorage.setItem(token, JSON.stringify(response_identifer));
        console.log(response_identifer.utkn)
        setSessionData("utkn_u",response_identifer.utkn)
        saveToken(p_token,utkn)
        db_data = readToken()
        requestSig = getSessionData("utkn_u")
        console.log("utkn_u" +requestSig)
      }
      
      if(response_identifer.type === "resend_data"){
        console.log(getSessionData("utkn_u"))
        if(requestSig===response_identifer.utkn){
           console.log("resend_data" + requestSig)
        }
        // requestSig = response_identifer
      }

    }
  });
});

async function readToken(){
  let ptkn = getSessionData()? getSessionData() : false 
  if (ptkn){
    await getToken(ptkn)
  }else{
    return false
  }  
}

// Encrypt a value
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

// Decrypt a value
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Open (or create) the IndexedDB database
function openDatabase() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open("SecureDB", 1);

      request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("tokens")) {
              db.createObjectStore("tokens", { keyPath: "id" });
          }
      };

      request.onsuccess = (event) => {
          resolve(event.target.result);
      };

      request.onerror = (event) => {
          reject(event.target.error);
      };
  });
}

// Save encrypted token in IndexedDB
async function saveToken(id, data) {
  const db = await openDatabase();
  const encryptedToken = encryptData(data);

  return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readwrite");
      const store = transaction.objectStore("tokens");

      const request = store.put({ id: id, token: encryptedToken });

      request.onsuccess = () => {
          console.log("Token saved successfully");
          resolve();
      };

      request.onerror = (event) => {
          console.error("Error saving token:", event.target.error);
          reject(event.target.error);
      };
  });
}

// Retrieve and decrypt the token from IndexedDB
async function getToken(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");

      const request = store.get(id);

      request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
              const decryptedToken = decryptData(result.token);
              resolve(decryptedToken);
          } else {
              console.log("No token found");
              resolve(null);
          }
      };

      request.onerror = (event) => {
          console.error("Error retrieving token:", event.target.error);
          reject(event.target.error);
      };
  });
}
