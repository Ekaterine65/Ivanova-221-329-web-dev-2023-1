/* eslint-disable max-len */
'use strict';

const apiKey = '50d2199a-42dc-447d-81ed-d68a443b697e';
const apiUrl = 'http://tasks-api.std-900.ist.mospolytech.ru/api/tasks';

function updateTasksCounters(event) {
    let columnElement = event.target.closest('.card');
    let tasksCounterElement = columnElement.querySelector('.tasks-counter');

    tasksCounterElement.innerHTML = columnElement.querySelector('ul').children.length;
}

function drawTask(taskData) {
    let taskElement = document.getElementById(taskData.id);
    let creatingTask = !taskElement;
    let parsedTask;
    if (creatingTask) {
        let template = document.getElementById("task-template");
        taskElement = template.content.firstElementChild.cloneNode(true);
        taskElement.id = taskData.id;
    }
    taskElement.querySelector('span.task-name').textContent = taskData.name;
    if (!creatingTask) {
        parsedTask = taskData.id;
    }
    if (creatingTask || taskData.status != parsedTask.status) {
        let container;
        if (taskData.status == "to-do") {
            container = document.getElementById("to-do-list");
        } else if (taskData.status == "done") {
            container = document.getElementById("done-list");
        }
        container.append(taskElement);
    }
}

function showAlert(message, type) {
    const alertsContainer = document.querySelector('.alerts');
    const alertTemplate = document.getElementById('alert-template');
    const alertElement
        = alertTemplate.content.firstElementChild.cloneNode(true);
    alertElement.classList.add(`alert-${type}`);
    alertElement.querySelector('.msg').textContent = message;
    alertsContainer.appendChild(alertElement);
    setTimeout(() => {
        alertElement.remove();
    }, 5000);
}
async function saveNewTask(event) {
    let newTaskForm = document.getElementById("new-task-form");
    let newTaskData = {
        name: newTaskForm.elements["name"].value,
        desc: newTaskForm.elements["desc"].value,
        status: newTaskForm.elements["status"].value
    };
    try {
        const response = await fetch(apiUrl + `?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(newTaskData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        const responseData = await response.json();
        newTaskData.id = responseData.id;

        newTaskForm.reset();
        drawTask(newTaskData);
    } catch (error) {
        showAlert(`Ошибка при сохранении задачи: ${error}`, 'danger');
    }
}


async function editTask(event) {
    let form = document.getElementById("edit-new-task-form");
    let taskID = form.elements['taskID'].value;
    let currentTaskResponse
        = await fetch(apiUrl + `/${taskID}?api_key=${apiKey}`);
    let currentTaskData = await currentTaskResponse.json();
    let editedTaskData = {};
    if (form.elements["name"].value !== currentTaskData.name) {
        editedTaskData.name = form.elements["name"].value;
    }
    if (form.elements["desc"].value !== currentTaskData.desc) {
        editedTaskData.desc = form.elements["desc"].value;
    }
    if (form.elements["status"].value !== currentTaskData.status) {
        editedTaskData.status = form.elements["status"].value;
    }
    try {
        const response
            = await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(editedTaskData),
            });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        const updatedTaskData = await response.json();
        drawTask(updatedTaskData);
    } catch (error) {
        showAlert(`Ошибка при редактировании задачи: ${error}`, 'danger');
    }

}

async function seeTask(event) {
    let form = document.getElementById("see-task-form");
    let task = {
        name: form.elements["name"].value,
        desc: form.elements["desc"].value,
        status: form.elements["status"].value
    };
    drawTask(task);
}

async function deleteTask() {
    let form = document.getElementById("deleteTask");
    let taskID = form.elements['taskID'].value;

    try {
        const response
            = await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        let task = document.getElementById(taskID);
        task.remove();
    } catch (error) {
        showAlert(`Ошибка при удалении задачи: ${error}`, 'danger');
    }
}

function loadTasksFromServer() {
    const apiURL = `${apiUrl}?api_key=${apiKey}`;

    fetch(apiURL, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка загрузки задач: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tasksArray = Array.isArray(data.tasks) ? data.tasks : [];

            tasksArray.forEach(task => {
                drawTask(task);
            });

        })
        .catch(error => {
            showAlert(`Ошибка загрузки задач: ${error.message}`, 'danger');
        });
}


function populateEditForm(task) {
    let editTaskForm = document.getElementById("edit-new-task-form");
    editTaskForm.elements['name'].value = task.name;
    editTaskForm.elements['desc'].value = task.desc;
    editTaskForm.elements['status'].value = task.status;
    editTaskForm.elements['taskID'].value = task.id;
}
const editTaskModal = document.getElementById('editTaskModal');
if (editTaskModal) {
    editTaskModal.addEventListener('show.bs.modal', async event => {
        const button = event.relatedTarget;
        let taskID = button.closest('.task').id;

        try {
            const response
                = await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const task = await response.json();
            populateEditForm(task);
        } catch (error) {
            showAlert(`Ошибка при загрузке задачи: ${error}`, 'danger');
        }
    });


};

function populateSeeForm(task) {
    let seeTaskForm = document.getElementById("see-task-form");
    seeTaskForm.elements['name'].value = task.name;
    seeTaskForm.elements['desc'].value = task.desc;
    seeTaskForm.elements['status'].value = task.status;
    seeTaskForm.elements['taskID'].value = task.id;
}
const seeTaskModal = document.getElementById('seeTaskModal');
if (seeTaskModal) {
    if (seeTaskModal) {
        seeTaskModal.addEventListener('show.bs.modal', async event => {
            const button = event.relatedTarget;
            let taskID = button.closest('.task').id;

            try {
                const response =
                    await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`);

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error);
                }

                const task = await response.json();
                populateSeeForm(task);
            } catch (error) {
                showAlert(`Ошибка при загрузке задачи: ${error}`, 'danger');
            }
        });
    }

};


document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('move-to-do')) {
        let taskElement = event.target.closest('.task');
        let taskID = taskElement.id;

        try {
            const response
                = await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        status: 'to-do',
                    }),
                });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const taskData = await response.json();
            taskElement.remove();
            drawTask(taskData);
        } catch (error) {
            showAlert(`Ошибка при перемещении задачи в статус 'To Do': ${error}`, 'danger');
        }
    }
});
document.addEventListener('click', async function (event) {
    if (event.target.classList.contains('move-done')) {
        let taskElement = event.target.closest('.task');
        let taskID = taskElement.id;

        try {
            const response
                = await fetch(`${apiUrl}/${taskID}?api_key=${apiKey}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        status: 'done',
                    }),
                });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            const taskData = await response.json();
            taskElement.remove();
            drawTask(taskData);
        } catch (error) {
            showAlert(`Ошибка при перемещении задачи в статус 'Done': ${error}`, 'danger');
        }
    }
});


const deleteTaskModal = document.getElementById('confirmDelete');
if (deleteTaskModal) {
    deleteTaskModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;

        let taskID = button.closest('.task').id;

        let deleteTaskForm = document.getElementById("deleteTask");
        deleteTaskForm.elements['taskID'].value = taskID;

    });
}
/*
let newTaskSaveButton = document.getElementById("new-task-save-button");
let editTaskSaveButton = document.getElementById("edit-task-save-button");
let deleteTaskButton = document.getElementById("delete-task-button");
*/
window.onload = function () {
    for (let list of document.querySelectorAll('#done-list, #to-do-list')) {
        list.addEventListener('DOMSubtreeModified', updateTasksCounters);
    }
    loadTasksFromServer();
};

document.getElementById("new-task-save-button").addEventListener('click', saveNewTask);
document.getElementById("edit-task-save-button").addEventListener('click', editTask);
document.getElementById("delete-task-button").addEventListener('click', deleteTask);