
const dialog = document.querySelector("#account-dialog");
const title = document.querySelector("#account-title");
const form = document.querySelector("#account-form");
const status = document.querySelector("#account-status");
const content = document.querySelector("#account-content");
const switchButton = document.querySelector("#account-switch");
const submit = form.querySelector("button");
const titles = {login:"로그인", signup:"회원가입", dashboard:"학습 대시보드", admin:"관리자 페이지"};
let mode, user, backend, revision = 0;
const configured = useEmulators || Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

async function connect() {
  const base = "https://www.gstatic.com/firebasejs/10.14.1/firebase-";
  const [app, auth, db] = await Promise.all(
    ["app", "auth", "firestore"].map(name => import(base + name + ".js"))
  );
  const instance = app.initializeApp(useEmulators
    ? {apiKey:"demo-key", projectId:"demo-aibom", appId:"demo-aibom-web"}
    : firebaseConfig);
  const authService = auth.getAuth(instance);
  const database = db.getFirestore(instance);
  if (useEmulators) {
    auth.connectAuthEmulator(authService, "http://127.0.0.1:9099");
    db.connectFirestoreEmulator(database, "127.0.0.1", 8080);
  }
  await authService.authStateReady();
  auth.onAuthStateChanged(authService, account => {
    user = account;
    for (const action of ["login","signup","dashboard","logout"]) {
      document.querySelector(".account [data-account=" + action + "]").hidden =
        ["login","signup"].includes(action) ? Boolean(user) : !user;
    }
    if (dialog.open && ["dashboard","admin"].includes(mode)) render();
  });
  user = authService.currentUser;
  return {auth, db, authService, database};
}
function add(tag, text, parent = content) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.append(element);
  return element;
}
async function render() {
  const current = ++revision;
  title.textContent = titles[mode];
  status.textContent = "";
  content.replaceChildren();
  const editing = mode === "login" || mode === "signup";
  form.hidden = !editing;
  submit.textContent = titles[mode];
  submit.disabled = !configured;
  form.elements.password.autocomplete = mode === "signup" ? "new-password" : "current-password";
  switchButton.hidden = !editing;
  switchButton.textContent = mode === "signup" ? "로그인" : "회원가입";
  switchButton.onclick = () => open(mode === "signup" ? "login" : "signup");
  if (!configured) {
    status.textContent = "Firebase 연결 후 계정 기능을 사용할 수 있습니다.";
    if (mode === "dashboard") {
      add("h3","학습 대시보드 미리보기");
      const list = add("ul","");
      for (const course of coursesForAccount()) add("li",course.title,list);
    }
    return;
  }
  try {
    const {db,database} = await (backend ??= connect());
    if (current !== revision || editing) return;
    if (!user) {
      status.textContent = "로그인 후 이용할 수 있습니다.";
      switchButton.hidden = false;
      switchButton.textContent = "로그인";
      switchButton.onclick = () => open("login");
      return;
    }
    const account = user;
    const admin = (await account.getIdTokenResult()).claims.admin === true;
    if (current !== revision) return;
    if (mode === "admin") {
      if (!admin) { status.textContent = "관리자 권한이 필요합니다."; return; }
      const count = await db.getCountFromServer(db.collection(database,"learning"));
      if (current !== revision) return;
      add("h3","교육 운영 현황");
      add("p","학습 상태를 저장한 회원 " + count.data().count + "명");
      add("p","공개 교육 과정 " + coursesForAccount().length + "개");
      return;
    }
    const ref = db.doc(database,"learning",account.uid);
    const saved = (await db.getDoc(ref)).data() ?? {};
    if (current !== revision) return;
    add("p",account.email);
    add("h3","내 학습 과정");
    for (const course of coursesForAccount()) {
      const row = add("p","");
      const label = add("label","",row);
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = saved[course.id] === true;
      label.append(checkbox, " " + course.title + " 완료");
      checkbox.addEventListener("change", async () => {
        checkbox.disabled = true;
        try {
          await db.setDoc(ref,{[course.id]:checkbox.checked},{merge:true});
          if (current === revision) status.textContent = "학습 상태를 저장했습니다.";
        } catch {
          checkbox.checked = !checkbox.checked;
          if (current === revision) status.textContent = "저장하지 못했습니다. 다시 시도해 주세요.";
        } finally { checkbox.disabled = false; }
      });
    }
  } catch {
    backend = undefined;
    if (current === revision) status.textContent = "Firebase에 연결하지 못했습니다. 설정과 네트워크를 확인해 주세요.";
  }
}
function coursesForAccount() {
  return [...document.querySelectorAll("#curriculum details")].map(detail => ({
    id:detail.id, title:detail.querySelector("summary strong").textContent
  }));
}
function open(next) {
  mode = next;
  form.reset();
  if (!dialog.open) dialog.showModal();
  render();
}
document.addEventListener("click", async event => {
  const button = event.target.closest("[data-account]");
  if (!button) return;
  const action = button.dataset.account;
  if (action !== "logout") {open(action); return;}
  try {
    const {auth,authService} = await backend;
    await auth.signOut(authService);
  } catch {open("dashboard"); status.textContent = "로그아웃하지 못했습니다. 다시 시도해 주세요.";}
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!configured || submit.disabled) return;
  const current = revision;
  const intent = mode;
  const {email,password} = Object.fromEntries(new FormData(form));
  submit.disabled = true;
  try {
    const {auth,authService} = await (backend ??= connect());
    const authenticate = intent === "signup" ? auth.createUserWithEmailAndPassword : auth.signInWithEmailAndPassword;
    await authenticate(authService,email,password);
    if (current === revision && dialog.open) open("dashboard");
  } catch (error) {
    if (current === revision && dialog.open) {
      status.textContent = error.code === "auth/weak-password"
        ? "보안 기준을 충족하는 비밀번호를 입력해 주세요."
        : "계정 요청을 처리하지 못했습니다. 입력 정보와 연결 상태를 확인해 주세요.";
    }
  } finally { submit.disabled = !configured; }
});
dialog.addEventListener("close", () => { revision++; form.reset(); });
if (configured) {
  backend = connect();
  backend.catch(() => {backend = undefined;});
}

