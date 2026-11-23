const courses = [
  {id:"media", type:"콘텐츠 제작", title:"AI로 홍보포스터, 홍보영상 만들기", audience:"홍보 담당자 · 소상공인 · 콘텐츠 제작 입문자", result:"홍보 포스터 1장과 15~30초 영상 초안", steps:[["홍보 메시지 기획","대상과 채널을 정한 뒤 제목, 행동 유도 문구, 게시 규격을 정리합니다."],["포스터 제작","이미지 프롬프트를 작성하고 생성 결과를 비교합니다. 문구를 편집하고 모바일 화면에서 가독성을 점검합니다."],["영상 구성과 편집","장면별 콘티를 만든 뒤 이미지, 자막, 음원을 배치합니다. 저작권과 초상권을 점검하고 채널 규격에 맞춰 내보냅니다."]]},
  {id:"automation", type:"업무 자동화", title:"AI 자동화", audience:"반복 업무를 줄이고 싶은 실무자 · 팀 운영자", result:"폼 응답을 정리하고 알림 초안을 만드는 예제 워크플로", steps:[["반복 업무 분석","입력·판단·출력을 구분하고 자동화할 부분과 사람의 승인이 필요한 부분을 표시합니다."],["흐름 연결","예제 폼과 스프레드시트, AI 요약을 연결해 데이터를 정리하고 알림 초안을 생성합니다."],["예외 처리와 검증","빈 입력과 중복 응답을 테스트합니다. 실행 기록, 승인 단계, 개인정보 처리 기준을 정리합니다."]]},
  {id:"reports", type:"문서 실무", title:"AI 활용 보고서 작성하기", audience:"기획 · 행정 · 운영 보고서를 쓰는 실무자", result:"근거 목록과 검토 항목을 갖춘 1쪽 보고서", steps:[["보고 구조 설계","독자와 의사결정 목표를 정하고 핵심 질문, 근거, 권고안을 목차로 구성합니다."],["자료 요약과 초안 작성","제공 자료에서 주요 사실과 수치를 추출하고, 출처를 연결해 초안을 작성합니다."],["교차 검토와 편집","숫자·인용·가정의 정확성을 원문과 대조하고 요약문과 표를 다듬습니다."]]},
  {id:"special", type:"무료 특강", title:"AI 무료특강", audience:"생성형 AI를 처음 접하는 분", result:"내 업무에 적용할 프롬프트 3종", steps:[["기초 익히기","생성형 AI가 잘하는 일과 확인이 필요한 답변의 사례를 살펴봅니다."],["첫 프롬프트 작성","역할, 목표, 입력 자료, 출력 형식을 정해 이메일이나 요약문을 만들어 봅니다."],["답변 점검과 개선","첫 결과와 수정 결과를 비교하고 민감정보를 제외한 나만의 프롬프트를 저장합니다."]]},
  {id:"trainer", type:"강사 양성", title:"AI 강사 양성", audience:"AI 수업을 설계하거나 시연하려는 예비 강사", result:"수업 지도안과 실습 활동지, 10분 시연안", steps:[["학습 목표와 흐름 설계","대상자의 수준을 파악하고 설명·시연·실습·피드백 순서를 설계합니다."],["실습 자료 제작","예제와 단계별 활동지를 만들고 평가 기준을 정합니다. 도구 장애에 대비한 대체 활동도 준비합니다."],["모의 강의와 개선","10분 시연을 진행하고 설명 명료성, 시간 배분, 학습 성과에 대한 피드백을 반영합니다."]]}
];
const curriculum = document.querySelector("#curriculum");
curriculum.innerHTML = courses.map(course => `
<details id="${course.id}"><summary><span class="course-type">${course.type}</span><strong>${course.title}</strong><span class="expand" aria-hidden="true"></span></summary>
<div class="course-body"><div class="course-meta"><p><b>추천 대상</b> ${course.audience}</p><p><b>결과물</b> ${course.result}</p></div><ol>${course.steps.map(([title,desc])=>`<li><strong>${title}</strong><p>${desc}</p></li>`).join("")}</ol></div></details>`).join("");
function openLinkedCourse() {
  const course = courses.find(item => "#" + item.id === location.hash);
  if (!course) return;
  const detail = document.getElementById(course.id);
  detail.open = true;
  detail.scrollIntoView();
}
window.addEventListener("hashchange", openLinkedCourse);
if (location.hash) openLinkedCourse();
const menu = document.querySelector("#menu-toggle");
menu.addEventListener("click", () => menu.setAttribute("aria-expanded", menu.getAttribute("aria-expanded") !== "true"));
document.querySelector("#navigation").addEventListener("click", event => {
  if (!event.target.closest("a")) return;
  menu.setAttribute("aria-expanded", "false");
  if (event.target.hash === location.hash) openLinkedCourse();
});
