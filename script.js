// api key
const API_KEY = `d04bb617d9224fd99952d1aad456b9e6`
let articles = [];
let page = 1;
let totalPage = 1;
const PAGE_SIZE = 10;
// netligy 주소 :  https://yoonji-news.netlify.app

// url 변수에 netligy주소와 PAGE_SIZE 설정
// class를 부르고 싶으면 앞에 new를 적어준다.
let url = new URL(
  `https://yoonji-news.netlify.app/top-headlines?country=kr&pageSize=${PAGE_SIZE}`
);
let menus = document.querySelectorAll("#menu-list button");
// 각각의 menus를 클릭할 때 마다 getNewsByTopic실행한다
menus.forEach((menu) =>
  menu.addEventListener("click", (e) => getNewsByTopic(e))
);

// onclick 이벤트
const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};

const pageClick = (pageNum) => {
  page = pageNum;
  window.scrollTo({ top: 0, behavior: "smooth" });
  getNews();
};


// 오류 해결하기
// 
const getNews = async () => {
  try {
    url.searchParams.set("page", page);
    console.log("url은", url);

     // response로 응답을 받음
    let response = await fetch(url);
     // data에서 json을 추출한다.
    let data = await response.json();

    if (response.status == 200) {
      console.log("resutl", data);
      if (data.totalResults == 0) {
        page = 0;
        totalPage = 0;
        renderPagination();
        throw new Error("검색어와 일치하는 결과가 없습니다");
      }

      articles = data.articles;
      totalPage = Math.ceil(data.totalResults / PAGE_SIZE);
      render();
      renderPagination();

    } else {

      page = 0;
      totalPage = 0;
      renderPagination();
      throw new Error(data.message);
    }

  } catch (e) {
    errorRender(e.message);
    page = 0;
    totalPage = 0;
    renderPagination();
  }

};

// getLatestNews
const getLatestNews = () => {
  page = 1; 
  url = new URL(
    `https://yoonji-news.netlify.app/top-headlines?country=kr&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
  );
  getNews();
};

// 주제별 뉴스를 보여줌. 
// event.target.textContent로 어떤게 검색됐는지 찾아줌
// textContent는 태그안에 있는 내용을 가져온다.
const getNewsByTopic = (event) => {
  const topic = event.target.textContent.toLowerCase();

  page = 1;
  url = new URL(
    `https://yoonji-news.netlify.app/top-headlines?country=kr&pageSize=${PAGE_SIZE}&category=${topic}&apiKey=${API_KEY}`
  );
  
  // 뉴스 그리기
  getNews();
};


// 검색창활성화
const openSearchBox = () => {
  let inputArea = document.getElementById("input-area");
  if (inputArea.style.display === "inline") {
    inputArea.style.display = "none";

  } else {
    inputArea.style.display = "inline";
  }
};

// 검색키워드 가져온다 -> 데이터 가져와서 보여준다
const getNewsByKeyword = () => {
    // input에 있는 value값을 가져온다.
  const keyword = document.getElementById("search-input").value;
  page = 1;
 
  url = new URL(
    `https://yoonji-news.netlify.app/top-headlines?q=${keyword}&country=kr&pageSize=${PAGE_SIZE}&apiKey=${API_KEY}`
  );
    // 뉴스 그리기
  getNews();
};

const render = () => {
  // 불러올 이미지가 없을 때 대체 할 이미지 추가, 내용없거나 값이 없을 때 실행될것
  let resultHTML = articles
    .map((news) => {
      return `<div class="news row">
        <div class="col-lg-4">
            <img class="news-img"
                src="${
                  news.urlToImage ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqEWgS0uxxEYJ0PsOb2OgwyWvC0Gjp8NUdPw&usqp=CAU"
                }" />
        </div>
        <div class="col-lg-8">
            <a class="title" target="_blank" href="${news.url}">${news.title}</a>
            
            <p>${news.description == null || news.description == ""
                ? "내용없음"
                : news.description.length > 200
                ? news.description.substring(0, 200) + "..."
                : news.description
            }
            </p>

            <div>${news.source.name || "no source"}  ${moment(news.publishedAt).fromNow()}</div>
        </div>
    </div>`;

    })
    .join("");
  document.getElementById("news-board").innerHTML = resultHTML;
};

const renderPagination = () => {
  let paginationHTML = ``;
    //Math.ceil -> 소수점 이상의 가장 작은 정수로 반환한다. 
  let pageGroup = Math.ceil(page / 5);
  let last = pageGroup * 5;
   // lastPage가 totalPage보다 클때
  if (last > totalPage) {
    last = totalPage;
  }
  let first = last - 4 <= 0 ? 1 : last - 4;
  if (first >= 6) {
    paginationHTML = `<li class="page-item" onclick="pageClick(1)">
                        <a class="page-link" href='#js-bottom'>&lt;&lt;</a>
                      </li>
                      <li class="page-item" onclick="pageClick(${page - 1})">
                        <a class="page-link" href='#js-bottom'>&lt;</a>
                      </li>`;
  }
  for (let i = first; i <= last; i++) {
    paginationHTML += `<li class="page-item ${i == page ? "active" : ""}" >
                        <a class="page-link" href='#js-bottom' onclick="pageClick(${i})" >${i}</a>
                       </li>`;
  }

  if (last < totalPage) {
    paginationHTML += `<li class="page-item" onclick="pageClick(${page + 1})">
                        <a  class="page-link" href='#js-program-detail-bottom'>&gt;</a>
                       </li>
                       <li class="page-item" onclick="pageClick(${totalPage})">
                        <a class="page-link" href='#js-bottom'>&gt;&gt;</a>
                       </li>`;
  }

  document.querySelector(".pagination").innerHTML = paginationHTML;
};


const errorRender = (message) => {
  document.getElementById(
    "news-board"
  ).innerHTML = `<h3 class="text-center alert alert-danger mt-1">${message}</h3>`;
};
getLatestNews();
