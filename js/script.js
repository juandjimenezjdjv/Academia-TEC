document.getElementById('openPopup').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('popupWrapper').style.display = 'block';
});
document.getElementById('closePopup').addEventListener('click', function() {
    document.getElementById('popupWrapper').style.display = 'none';
});
document.getElementById('popup').addEventListener('click', function(event) {
    event.stopPropagation();
});
document.getElementById('popupWrapper').addEventListener('click', function() {
    document.getElementById('popupWrapper').style.display = 'none';
});

//Falta que si hay un usuario logueado, no se muestre el boton de login

async function loginUser(user) {
  const response = await fetch('http://localhost:1434/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  return data;
}

document.getElementById('Scerrarsesion').addEventListener('click', function() {
  sessionStorage.removeItem('usuario');
  alert('Sesión cerrada');
  window.location.href = '#';
});

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("inisesion").addEventListener("click", function(event) {
      if (sessionStorage.getItem('usuario')) {
          event.preventDefault();
          alert("Ya hay una sesión iniciada. Redirigiendo a la página principal.");
          window.location.href = "index.html";
      }
  });
});

