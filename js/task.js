// 从浏览器中读取以前保存的任务
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// 截止日期不能选过去
const dateInput = document.getElementById('taskDate');
if (dateInput) {
    const t = new Date();
    dateInput.min = t.getFullYear() + '-' +
        String(t.getMonth() + 1).padStart(2, '0') + '-' +
        String(t.getDate()).padStart(2, '0');
}


// 当前显示的任务类型
let currentFilter = "all";

const addTaskButton = document.getElementById("addTaskButton");

addTaskButton.addEventListener("click", function () {

    // 获取用户输入的数据
    const taskName =
        document.getElementById("taskName").value;

    const taskDate =
        document.getElementById("taskDate").value;

    const taskCategory =
        document.getElementById("taskCategory").value;

    const taskPriority =
        document.getElementById("taskPriority").value;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (taskDate && taskDate < todayStr) {
        alert('截止日期不能是过去的时间！');
        return;
    }

    // 检查任务名称是否为空
    if (taskName.trim() === "") {

        alert("请输入任务名称");

        return;
    }


    // 创建一个新的任务
    const newTask = {

        id: Date.now(),

        name: taskName,

        date: taskDate,

        category: taskCategory,

        priority: taskPriority,

        completed: false

    };


    // 把任务加入任务数组
    tasks.push(newTask);


    // 保存到浏览器
    saveTasks();


    // 更新页面
    displayTasks();


    // 清空任务名称
    document.getElementById("taskName").value = "";

});

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}

function displayTasks() {

    const taskList =
        document.getElementById("taskList");


    // 清空原来的显示内容
    taskList.innerHTML = "";


    // 根据筛选条件选择任务
    let filteredTasks = tasks;

    // 按优先级排序：高 > 中 > 低
    const priorityOrder = { "高": 0, "中": 1, "低": 2 };
    filteredTasks = [...filteredTasks].sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31");
    });

    if (currentFilter === "todo") {

        filteredTasks =
            tasks.filter(task => !task.completed);

    }


    if (currentFilter === "completed") {

        filteredTasks =
            tasks.filter(task => task.completed);

    }


    // 如果没有任务
    if (filteredTasks.length === 0) {

        taskList.innerHTML =
            "<p>暂时没有任务。</p>";

        return;
    }


    // 显示每一个任务
    filteredTasks.forEach(function (task) {

        const taskItem =
            document.createElement("div");


        taskItem.innerHTML = `

        <p>完成打勾</p>
            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <strong
                style="${task.completed ?
                "text-decoration: line-through;" : ""}"
            >

                ${task.name}

            </strong>

            <p>
                截止日期：
                ${task.date || "未设置"}
            </p>

            <p>
                类别：
                ${task.category}
            </p>

            <p>
                优先级：
                ${task.priority}
            </p>

            <button
                onclick="deleteTask(${task.id})"
            >
                删除
            </button>

            <hr>

        `;


        taskList.appendChild(taskItem);

    });

}

function toggleTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (task) {

        task.completed = !task.completed;

    }


    saveTasks();

    displayTasks();

}

function deleteTask(id) {

    tasks = tasks.filter(
        task => task.id !== id
    );


    saveTasks();

    displayTasks();

}

function filterTasks(filter) {

    currentFilter = filter;

    displayTasks();

}

displayTasks();