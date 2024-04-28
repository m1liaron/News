// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function (){
  const apikey = '0f04803dcad9454aa86c061701f50d4c';
  const apiUrl = 'https://newsapi.org/v2';

  return {
    topHeadlines(country = 'ua', category = 'technology', cb){
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apikey}`, cb)
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apikey}`, cb)
    },

  }
})()

// Elements

const form = document.forms['newsControls'];
const countrySelect = form.elements['country']
const searchInput = form.elements['search']
const categorySelect = form.elements['category']

form.addEventListener('submit', (e) => {
  e.preventDefault()
  loadNews()
})

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  loadNews()
  M.AutoInit();
});

// load news function

function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if(!searchText){
    newsService.topHeadlines(country, category, onGetResponse)
  } else {
    newsService.everything(searchText, onGetResponse)
  }

}

function onGetResponse(err, res) {
  removePreloader();
  if(err){
    showAlert(err, 'error-msg');
    return
  }
  if(!res.articles.length){
    showAlert('No news by your search', 'error-msg');
    return;
  }

  renderNews(res.articles)
}

function renderNews(news) {
  const newsContainer = document.querySelector('.news-container .row')
  if(newsContainer.children.length){
    clearContainer(newsContainer);
  }
  let fragment = '';

  news.forEach(newsItem => {
    if(newsItem.content !== '[Removed]' && newsItem.description !== '[Removed]'){
      const el = newsTemplate(newsItem)
      fragment += el;
    } else {
      console.log('No data')
    }
  })
  console.log(news)
  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

function clearContainer(container) {
  // container.innerHTML = '';
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child)
    child = container.lastElementChild;
  }
}

function newsTemplate({urlToImage, title, url, description}) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Newspaper_Cover.svg/2048px-Newspaper_Cover.svg.png"}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
`)
}

function removePreloader() {
  const loader = document.querySelector('.progress');
  if(loader){
    loader.remove()
  }
}