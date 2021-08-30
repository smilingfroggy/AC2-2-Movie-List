const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

const displaySwitch = document.querySelector('.display-switch-buttons')

// create movie list -> dataPanel
const movies = []
let filteredMovies = []
// A12 新增
let currentPage = 1
let currentDisplayForm = 'card'

axios.get(INDEX_URL).then(response => {
  movies.push(...response.data.results)
  console.log(movies)
  renderMovie(getMoviesByPage(1))
  renderPaginator(movies.length)
})
  .catch(err => console.log(err))

function renderMovie(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>

      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


// 頁數處理
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = '<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>'
  for (let page = 2; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  let lastPage = currentPage
  currentPage = Number(event.target.dataset.page)
  // 點選的頁數 將標示active；上一次頁數 取消active
  paginator.children[currentPage - 1].classList.toggle('active')
  paginator.children[lastPage - 1].classList.toggle('active')

  // 依照原本所選的的顯示方式呈現
  if (currentDisplayForm === "card") {
    renderMovie(getMoviesByPage(currentPage))
  } else if (currentDisplayForm === "list") {
    renderMovieList(getMoviesByPage(currentPage))
  }
})


dataPanel.addEventListener('click', (event) => onPanelClick(event));
function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addFavorite(Number(event.target.dataset.id))
  }
}


function addFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  alert('已加入收藏清單！')
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + "/" + id).then((response) => {
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    modalDescription.innerText = data.description
  })
    .catch(err => console.log(err))
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('No result with: ' + keyword)
  }
  currentPage = 1
  renderPaginator(filteredMovies.length)
  // 依照原本所選的的顯示方式呈現
  if (currentDisplayForm === "card") {
    renderMovie(getMoviesByPage(1))
  } else if (currentDisplayForm === "list") {
    renderMovieList(getMoviesByPage(1))
  }
})
const listBtn = document.querySelector('.btn.display-list')
const cardBtn = document.querySelector('.btn.display-card')
///////////////////A12 新增//////////////////////
// 顯示方式切換事件
displaySwitch.addEventListener("click", function onDisplayListClicked(event) {
  const target = event.target
  console.log(target)
  if (target.classList.contains('display-list')) {
    renderMovieList(getMoviesByPage(currentPage))
    currentDisplayForm = "list"
    // 方法一：toggle
    // btn -> target.classList.toggle('active')
    // 使用toggle，萬一有人連續點兩下list mode就會開始出錯
    // listBtn.classList.toggle('active')
    // cardBtn.classList.toggle('active')
    // 方法二：setAttribute (可是remove時 全部class要一起移除?!)
    // listBtn.setAttribute('class','active')
    // cardBtn.removeAttribute('')
    // 方法三：新增attribute data-toggle

  } else if (target.classList.contains('display-card')) {
    renderMovie(getMoviesByPage(currentPage))
    currentDisplayForm = "card"
    // cardBtn.classList.toggle('active')
    // listBtn.classList.toggle('active')
  }
})

// 以清單呈現
function renderMovieList(data) {
  let rawHTML = '<ul class="list-group list-group-flush col-12">'
  data.forEach(item => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
      <p class="h4">${item.title}</p>
      <div class="btn-group" role="group" aria-label="Basic example">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>`
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}