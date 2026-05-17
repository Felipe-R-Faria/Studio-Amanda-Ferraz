let index = 0;
const slides = document.querySelectorAll(".slide");

function mostrarSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

document.querySelector(".next").onclick = () => {
  index = (index + 1) % slides.length;
  mostrarSlide(index);
};

document.querySelector(".prev").onclick = () => {
  index = (index - 1 + slides.length) % slides.length;
  mostrarSlide(index);
};

// Troca automática
setInterval(() => {
  index = (index + 1) % slides.length;
  mostrarSlide(index);
}, 8000);


/* fUNÇÃO E CONTADOR, NÃO MEXER */

function criarEstrelas(nota){
    let estrelas = "";
    for(let i = 1; i<=5; i += 1){

        if (i<= nota) {
            estrelas += `<i class="fa-solid fa-star"></i>`
        }else {
            estrelas += `<i class="fa-regular fa-star"></i>`
        }
    }
    return estrelas;
}

/* OBJETOS / PESSOAS */
const reviews = [
{
    nome: "Raquel N.",
    nota: 5,
    comentario: "Ótimo espaço, cabelo com a Amanda e unhas com a Larissa amoo",
    avatar: "../img/Curly hair-pana 1.png"
  },
  {
    nome: "Julia L.",
    nota: 5,
    comentario: "Maravilhosa! Primeira vez no salão hoje e nunca recebi uma escova tão bem feita. <3",
    avatar: "../img/Hand sewing-pana.png"
  },
  {
    nome: "Danielle S.",
    nota: 5,
    comentario: "Profissional maravilhosa e studio muito aconchegante.",
    avatar: "../img/messy bun-pana.png"
  },
  {
    nome: "Jennifer S.",
    nota: 5,
    comentario: "Atendimento muito maravilhoso",
    avatar: "../img/messy bun-rafiki.png"
  },
  {
    nome: "Gisele B.",
    nota: 5,
    comentario: "Design de sobrancelhas, Corte de cabelo: Muito simpática profissional rápida sem ficar enrolando no que tem que fazer ",
    avatar: "../img/Self confidence-pana.png"
  }

];
/* APARECER ESTRELAS */
const container = document.getElementById("reviews");

if (container) {
  reviews.forEach(r => {
    container.innerHTML += `
          <div class="review-card">
        <div class="review-header">
          <img class="review-avatar" src="${r.avatar}" alt="Avatar de ${r.nome}" />
          <div class="review-info">
            <div class="review-nome">${r.nome}</div>
            <div class="review-estrelas">${criarEstrelas(r.nota)}</div>
          </div>
        </div>
        <p class="review-texto">${r.comentario}</p>
      </div>
    `;
  });
} else {
  console.error("Elemento #reviews não encontrado");
}

const map = L.map('map').setView([-23.5568738,-46.3974116], 17)

const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom:9
});

layer.addTo(map)

const marker=L.marker([-23.5568738,-46.3974116])
marker.addTo(map)
    .bindPopup(`
        <b>Studio Amanda e Eduarda Ferraz</b><br>
        Rua Raposo da Fonseca, 799<br>
        <a href="https://www.google.com/maps/place/Studio+Amanda+Ferraz/@-23.5569342,-46.3974912,21z/data=!4m6!3m5!1s0x94ce65915fac4b4d:0xa7ce1316fac9216c!8m2!3d-23.5568776!4d-46.3973972!16s%2Fg%2F11h4y5v5tc?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D" target="_blank">
            Abrir no Google Maps
        </a>
    `)
     .openPopup()

map.getContainer().setAttribute('tabindex', '-1');
map.getContainer().addEventListener('click', function(e) {
  e.stopPropagation();
});

document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href="#"]');
  if (link && map.getContainer().contains(link)) {
    e.preventDefault();
  }
});
