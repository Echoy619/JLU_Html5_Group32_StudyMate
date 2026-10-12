//=====数据=====
let courses = JSON.parse(localStorage.getItem('courses')) || [];
let currentDay = new Date().getDay();
courses.forEach((c, i) => { if (!c.id) c.id = Date.now() + i; });

//把课程数组存回浏览器
function saveCourses() {
    localStorage.setItem('courses', JSON.stringify(courses));
}

//=====课程列表=====
function renderCourses() {
    const list = document.getElementById('courseList');
    
    const dayCourses = courses.filter(c => c.day === currentDay).sort((a, b) => a.start.localeCompare(b.start));
    
    if (dayCourses.length === 0) {
        list.innerHTML = '<p>这一天没有课程。</p>';
        return;
    }

    
    list.innerHTML = dayCourses.map(c => `
        <div class="course-card">
            <div class="course-time">${c.start} - ${c.end}</div>
            <div class="course-name">${c.name}</div>
            <div class="course-location">📍 ${c.location}</div>
            <button onclick="deleteCourse(${c.id})">删除</button>
        </div>
    `).join('');
}

//=====切换星期=====
document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 取消原来选中按钮的高亮
        document.querySelector('.day-btn.active').classList.remove('active');
        // 给刚点的按钮加高亮
        btn.classList.add('active');
        // 更新当前星期，重新渲染列表
        currentDay = Number(btn.dataset.day);
        renderCourses();
    });
});

//=====添加课程=====
function addCourse() {
    const name = document.getElementById('courseName').value.trim();
    const day = Number(document.getElementById('courseDay').value);
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    const location = document.getElementById('courseLocation').value.trim();

    //简单校验：有没填的就弹窗
    if (!name || !start || !end || !location) {
        alert('请把课程信息填完整！');
        return;
    }
    if (end <= start) {
    alert('结束时间必须晚于开始时间！');
    return;
}

    //加进数组，保存，刷新列表
        courses.push({ id: Date.now(), name, day, start, end, location });
        saveCourses();

    //添加完自动切到那门课所在的星期，立刻看到结果
    currentDay = day;
    document.querySelector('.day-btn.active').classList.remove('active');
    document.querySelector(`.day-btn[data-day="${day}"]`).classList.add('active');
    renderCourses();

    //提示时间冲突
const conflict = courses.some(c =>
    c.day === day && c.start < end && c.end > start
);
if (conflict && !confirm('这个时间段已有其他课程，确定还要添加吗？')) {
    return;
}

    //清空输入框
    document.getElementById('courseName').value = '';
    document.getElementById('courseLocation').value = '';
}

//=====删除课程=====
function deleteCourse(id) {
    if (!confirm('确定删除这门课吗？')) return;
    courses = courses.filter(c => c.id !== id);
    saveCourses();
    renderCourses();
}

//=====页面打开时：自动选中"今天"并显示课程=====
document.querySelector(`.day-btn[data-day="${currentDay}"]`).classList.add('active');
renderCourses();