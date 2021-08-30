const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies"
const POSTER_URL = BASE_URL + "/posters/"

const dataPanel = document.querySelector('#data-panel')


// const movies = []
// // axios此段也要放入renderMovie函式內，才不會每次重新整理都要重新renderMovie(movies)????
// axios.get(INDEX_URL).then(response => {
//   // console.log(response.data.results)  //(80) [{…}, {…}, {…}, {…},
//   movies.push(...response.data.results)
//   console.log(movies)
//   renderMovie(movies)
// })
//   .catch(err => console.log(err))

// axios 改成localStorage
const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
console.log(favoriteMovies) // (3) [{…}, {…}, {…}]
renderMovie(favoriteMovies)

if (favoriteMovies.length === 0) {
  alert('Please add movies')
}



function renderMovie(data) {
  let rawHTML = ''
  //這行不能省略。不能直接寫入dataPanel.innerHTML，否則搜尋關鍵字時，結果還是全部電影清單(每搜尋一次，會增加一倍的電影數量)

  //一開始寫movie.forEach，導致在搜尋時，永遠顯示最初總清單
  data.forEach(item => {
    // console.log(item)  .image .title
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>

      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

dataPanel.addEventListener('click', function onPanelClick(event) {
  // console.error('Error')
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)

    showMovieModal(Number(event.target.dataset.id))
    // showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    console.log(Number(event.target.dataset.id))  // 絕對id(與API電影總清單的id一樣)
    removeFromFavorite(Number(event.target.dataset.id))
    // removeFromFavorite(event.target.dataset.id)
  }
});

function removeFromFavorite(id) {
  // 除錯：收藏清單沒有內容
  if (!favoriteMovies) return

  // 利用id 找到收藏清單上 對應電影的index
  // 得到的removeIndex為favoriteMovies裡的index
  const removeMovieIndex = favoriteMovies.findIndex((movie) => movie.id === id)
  console.log(removeMovieIndex) // 居然是-1 (找不到時 回傳-1)
  // => {} , {}拿掉才能正常找到index!?

  // 除錯：若不在收藏清單上
  if (removeMovieIndex === -1) return

  // 在收藏清單刪除此電影
  favoriteMovies.splice(removeMovieIndex, 1)


  // 存回local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))

  // 更新頁面
  renderMovie(favoriteMovies)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + "/" + id).then((response) => {
    console.log(response.data.results)
    const data = response.data.results

    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    modalDescription.innerText = data.description
  })
    .catch(err => console.log(err))
}