import axios from "axios"

const todoAPI = axios.create({
  baseURL: process.env.API_URL
})

const rootEl = document.querySelector('.root')

function login(token) {
  localStorage.setItem('token', token)
  todoAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  rootEl.classList.add('root--authed')
}

function logout() {
  localStorage.removeItem('token')
  delete todoAPI.defaults.headers['Authorization']
  rootEl.classList.remove('root--authed')
}

// 자주 쓰는 엘리먼트 빼주기 ex) templates.postList 
const templates = {   
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content,
  login: document.querySelector('#login').content,
}

// Avoid code duplication
function render(fragment) {
  rootEl.textContent = '' 
  // debugger
  rootEl.appendChild(fragment)
}

async function indexPage() {
  document.querySelector('.btn__log--in').addEventListener("click", e => { loginPage() })
}

// 앱 실행 페이지
async function appStartPage() {
  rootEl.classList.add('root--loading')
  const res = await todoAPI.get('/todos?_expand=user')
  rootEl.classList.remove('root--loading')

  const listFrag = document.importNode(templates.todoList, true)

  res.data.forEach(todo => {
    const fragment = document.importNode(templates.todoItem, true)
    const pEl = fragment.querySelector('.todo-item__body')
    const removeButtonEl = fragment.querySelector('.btn__todo-remove')
    const divEl = fragment.querySelector('.todo-item')
    const logoutButtonEl = listFrag.querySelector('.btn__log--out')
    const checkboxEl = fragment.querySelector('.todo-item__checkbox-done')
    const checkboxEl2 = fragment.querySelector('.todo-item__checkbox-yet')
    
    pEl.textContent = todo.body
    removeButtonEl.addEventListener("click", async e => {
      divEl.remove()
      rootEl.classList.add('root--loading')
      const res = await todoAPI.delete(`/todos/${todo.id}`)
      rootEl.classList.remove('root--loading')
    })

    checkboxEl.addEventListener("click", async e => {
      e.preventDefault()
      const payload = {
        complete: "true"
      }
      rootEl.classList.add('root--loading')
      const changeRes = await todoAPI.patch(`/todos/${todo.id}`, payload)
      rootEl.classList.remove('root--loading')

      pEl.classList.add('done')
      checkboxEl.classList.add('hidden')
      checkboxEl2.classList.remove('hidden')
    })

    checkboxEl2.addEventListener("click", async e => {
      e.preventDefault()
      const payload = {
        complete: "false"
      }
      rootEl.classList.add('root--loading')
      const changeRes = await todoAPI.patch(`/todos/${todo.id}`, payload)
      rootEl.classList.remove('root--loading')

      pEl.classList.remove('done')
      checkboxEl2.classList.add('hidden')
      checkboxEl.classList.remove('hidden')
    })

    if (todo.complete === 'true') {
      pEl.classList.add('done');
      checkboxEl.classList.add('hidden')
      checkboxEl2.classList.remove('hidden')
    } else {
      pEl.classList.remove('done');
      checkboxEl.classList.remove('hidden')
      checkboxEl2.classList.add('hidden')
    }

    logoutButtonEl.addEventListener("click", e => {
      logout()
      loginPage()
    })
    listFrag.querySelector('.todo-list').appendChild(fragment)
  })

  const formEl = listFrag.querySelector('.todo-list__add-form')
  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const payload = {
      body: e.target.elements.body.value,
    }
    rootEl.classList.add('root--loading')
    const addRes = await todoAPI.post(`/todos`, payload)
    rootEl.classList.remove('root--loading')

    appStartPage()
  })
  render(listFrag)
}


// 로그인 페이지 실행
async function loginPage() {
  const fragment = document.importNode(templates.login, true)
  const formEl = fragment.querySelector('.login__form')
  formEl.addEventListener("submit", async e => {
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    }
    e.preventDefault()
    rootEl.classList.add('root--loading')
    const res = await todoAPI.post('/users/login', payload)
    rootEl.classList.remove('root--loading')

    login(res.data.token)
    appStartPage()
  })
  render(fragment)
}

// 새로고침하면 로그인이 풀리는 현상 해결
if (localStorage.getItem('token')) {
  login(localStorage.getItem('token'))
} 


if(localStorage.getItem('token')) {
  // localStrage 에 토큰들어가 있으면 무조건 appStartPage() 로 이동해라
  document.querySelector('.btn__log--to-other').addEventListener("click", e => {
    logout();
    loginPage();
  })

  document.querySelector('.btn__log--to-this').addEventListener("click", e => {
    appStartPage();
  })
  
} else indexPage();





// forEach 대신 for of 로 변경해서 사용할 수 있다.
// res.data.forEach(({id, body, complete}) => {
    // .. 
    // forEach 문에서는 함수 이기 때문에 await를 쓰기 위해서는 (async({..})) 선언
// })
// for (const todo of res.data) {  배열 안에 항목들이 들어 온다.. for .. of..
// for (const {id, body, complete} of res.data)
  // const fragment = document.importNode(...) ...
  // ....
  // todo.id 대신에 그냥 id 로 적을 수 있음.
  // await 함수 상관없으므로 루프안에서 자유롭게 사용가능
  // 비동기 for 루프도 생기고 있으니 for of 사용 습관을 늘릴 것.. 
// }


// 체크 박스 내용..
// checkboxEl.setAttribute('check', '') 어트리뷰트 삽입!! getAttribute() 도 ..