import { firebaseConfig } from "./firebase.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  push,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);

let form1 = document.getElementById("prisijungimas");
let form = document.getElementById("form");
let carBrand = document.getElementById("carBrandInput");
let carModel = document.getElementById("carModelInput");
let carYear = document.getElementById("carYearInput");
let carPrice = document.getElementById("carPriceInput");
let favCarPhoto = document.getElementById("favoriteCarPhotoInput");
let container = document.getElementById("container");
let emailInput = document.getElementById("emails");
let passwordInput = document.getElementById("passwords");

let insertBtn = document.getElementById("insertBtn");
let updateBtn = document.getElementById("updateBtn");
let deleteBtn = document.getElementById("deleteBtn");
let regBtn = document.getElementById("reg");
let logBtn = document.getElementById("log");
let outBtn = document.getElementById("signOut");

regBtn.addEventListener("click", (e) => {
  e.preventDefault();

  console.log(emailInput.value, passwordInput.value);
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);

      const registerTime = new Date();
      set(ref(db, "/users/" + user.uid), {
        email: email,
        role: "simple",
        timestamp: `${registerTime}`,
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

logBtn.addEventListener("click", (e) => {
  e.preventDefault();
  //   console.log(emailInput.value, passwordInput.value);
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const loginTime = new Date();
      update(ref(db, "/users/" + user.uid), {
        timestamp: `${loginTime}`,
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

insertBtn.addEventListener("click", (event) => {
  event.preventDefault();

  set(push(ref(db, "cars/")), {
    brand: carBrand.value,
    model: carModel.value,
    year: carYear.value,
    price: carPrice.value,
    photo: favCarPhoto.value,
  })
    .then(() => {
      alert("added successfuly");
      form.reset();
      createCard();
    })
    .catch((error) => {
      alert(error);
    });
});

const getData = function () {
  get(child(ref(db), "cars/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        const data = snapshot.val();
        for (const car in data) {
          const carData = data[car];
          console.log("Car data:", carData);
          container.innerHTML += `
            <div class="card" style="width: 250px; height: 350px; border: 2px solid black">
            <h3>${carData.brand}</h3>
            <h6>${carData.model}</h6>
            <p>${carData.year}</p>
            <h3>${carData.price} eur</h3>
            <img src="${carData.photo}" alt="car" style="height: 150px; width: 250px;">
            </div>
            `;
        }
      } else {
        console.log("No data");
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

getData();

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

    get(child(ref(db), "/users/" + uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userDataFromDB = snapshot.val();
          const userRole = userDataFromDB.role;
          const img = document.getElementById("imgContainer");
          const greetings = document.createElement("img");
          greetings.alt = "greeting";
          greetings.id = "panelImg";
          img.appendChild(greetings);
          if (userRole === "admin") {
            console.log("god mode");
            greetings.src =
              "https://i.ytimg.com/vi/H8xXhWWHldU/maxresdefault.jpg";
          } else {
            console.log("nevykelis");
            greetings.src =
              "https://lol.tv3.lt/uploads/modules/lols/videos/original/40074_1345311592_5502.jpg";
          }
        } else {
          console.log("no data");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    console.log("you are signed out");
  }
});

outBtn.addEventListener("click", (event) => {
  event.preventDefault();
  auth
    .signOut()
    .then(() => {
      const img = document.getElementById("panelImg");
      img.remove();
      console.log("user has signed out");
    })
    .catch((error) => {
      console.log(error);
    });
});
