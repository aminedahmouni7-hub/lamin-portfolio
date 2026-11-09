const assignments = [
  {
    id: "01",
    title: "Выбор конфигурации компьютера",
    category: "КОМПЬЮТЕРНЫЕ СИСТЕМЫ",
    description: "Изучение характеристик ПК, подбор комплектующих, сравнение конфигураций и расчёт стоимости компьютера.",
    icon: "⌘",
    status: "PDF прикреплён",
    file: "Практическая_работа_1_Дахмуни.pdf"
  },
  {
    id: "02",
    title: "Архитектура компьютера",
    category: "КОМПЬЮТЕРНЫЕ СИСТЕМЫ",
    description: "Процессор, оперативная память, архитектуры фон Неймана и Гарвардская, системные шины.",
    icon: "⌘",
    status: "PDF прикреплён",
    file: "Практическая_работа_2_Дахмуни_заполнено.pdf"
  },
  {
    id: "03",
    title: "Исследование тенденций развития компьютерных технологий",
    category: "РАЗВИТИЕ КОМПЬЮТЕРНЫХ ТЕХНОЛОГИЙ",
    description: "Изучение поколений ЭВМ, параллельных и распределённых вычислений, мобильных устройств и современных ИТ-тенденций.",
    icon: "⌁",
    status: "PDF прикреплён",
    file: "Практическая_работа_3_Дахмуни.pdf"
  },
  {
    id: "04",
    title: "Исследование программного обеспечения мобильного устройства",
    category: "МОБИЛЬНЫЕ ОПЕРАЦИОННЫЕ СИСТЕМЫ",
    description: "Изучение iOS, классификация мобильных приложений, использование памяти, разрешения и безопасность устройства.",
    icon: "▦",
    status: "PDF прикреплён",
    file: "Практическая_работа_4_Дахмуни.pdf"
  },
  {
    id: "05",
    title: "Программная среда колледжа",
    category: "ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ",
    description: "Классификация ПО, Android и iOS, выбор программ и организация цифровой среды колледжа.",
    icon: "▦",
    status: "PDF прикреплён",
    file: "Practical_Work_5_Lamin_Dahmuni.pdf"
  },
  {
    id: "06",
    title: "Разработка многопроцессной системы анализа данных на Python",
    category: "PYTHON · MULTIPROCESSING",
    description: "Анализ 1 000 000 случайных чисел, последовательная и параллельная обработка, сравнение производительности.",
    icon: "⌁",
    status: "PDF прикреплён",
    file: "Практическая_работа_6_Дахмуни.pdf"
  },
  {
    id: "07",
    title: "Файловая система, маски имён файлов, адреса в Интернете",
    category: "ИНФОРМАТИКА · ФАЙЛОВЫЕ СИСТЕМЫ",
    description: "Изучение структуры каталогов, масок имён файлов, построения интернет-адресов и восстановления IP-адресов.",
    icon: "📁",
    status: "PDF прикреплён",
    file: "Практическая_работа_7_Дахмуни.pdf"
  },
  {
    id: "08",
    title: "Системное программное обеспечение",
    category: "ОПЕРАЦИОННЫЕ СИСТЕМЫ",
    description: "Изучение классификации программного обеспечения, структуры ОС, файловых систем, драйверов, системных утилит и современных тенденций развития ПО.",
    icon: "⚙️",
    status: "PDF прикреплён",
    file: "Практическая_работа_8.pdf"
  }
];


const grid = document.getElementById("workGrid");
const count = document.getElementById("workCount");
const input = document.getElementById("pdfInput");
const dialog = document.getElementById("uploadDialog");
const choices = document.getElementById("assignmentChoices");
const selectedFileName = document.getElementById("selectedFileName");
let pendingFile = null;
let dbPromise;

function openDatabase(){
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve,reject)=>{
    const request = indexedDB.open("LaminPortfolioFiles",1);
    request.onupgradeneeded = () => request.result.createObjectStore("pdfs");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}
async function savePdf(id,file){
  const db = await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction("pdfs","readwrite");
    tx.objectStore("pdfs").put(file,id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}
async function getPdf(id){
  const db = await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction("pdfs","readonly");
    const req = tx.objectStore("pdfs").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
function render(){
  count.textContent = String(assignments.length).padStart(2,"0");
  grid.innerHTML = assignments.map(a=>`
    <article class="work-card">
      <div class="card-top"><span class="card-number">ПРАКТИЧЕСКАЯ РАБОТА № ${a.id}</span><span class="card-icon">${a.icon}</span></div>
      <div class="card-category">${a.category}</div>
      <h3>${a.title}</h3><p>${a.description}</p>
      <div class="card-bottom"><span class="card-status" id="status-${a.id}">${a.file ? "PDF прикреплён" : a.status}</span>
      <button class="card-action" data-id="${a.id}">${a.file ? "Открыть PDF ↗" : "Добавить PDF ＋"}</button></div>
    </article>`).join("");
  grid.querySelectorAll(".card-action").forEach(button=>{
    button.addEventListener("click",async()=>{
      const a=assignments.find(x=>x.id===button.dataset.id);
      if(a.file){window.open(a.file,"_blank","noopener");return;}
      try{
        const saved=await getPdf(a.id);
        if(saved){const url=URL.createObjectURL(saved);window.open(url,"_blank","noopener");return;}
      }catch(e){console.error(e);}
      showUploadChoices(null,a.id);
    });
  });
}
function showUploadChoices(file, preselectedId){
  pendingFile=file;
  selectedFileName.textContent=file ? `Выбран файл: ${file.name}` : "Сначала выберите PDF-файл.";
  choices.innerHTML=assignments.map(a=>`<button class="choice-button" data-id="${a.id}"><strong>Работа № ${a.id} · ${a.title}</strong><small>Прикрепить выбранный PDF</small></button>`).join("");
  choices.querySelectorAll("button").forEach(button=>button.addEventListener("click",async()=>{
    const id=button.dataset.id;
    if(!pendingFile){dialog.close();input.click();return;}
    try{
      await savePdf(id,pendingFile);
      const a=assignments.find(x=>x.id===id);
      a.status="PDF сохранён в этом браузере";
      dialog.close();render();
      const status=document.getElementById(`status-${id}`);
      if(status)status.classList.add("file-ready");
    }catch(error){
      selectedFileName.textContent="Не удалось сохранить файл. Попробуйте другой PDF.";
      selectedFileName.classList.add("empty-file");
    }
  }));
  dialog.showModal();
}
input.addEventListener("change",()=>{
  const file=input.files && input.files[0];
  if(!file)return;
  if(file.type!=="application/pdf" && !file.name.toLowerCase().endsWith(".pdf")){
    alert("Пожалуйста, выберите PDF-файл.");input.value="";return;
  }
  showUploadChoices(file);
  input.value="";
});
render();
