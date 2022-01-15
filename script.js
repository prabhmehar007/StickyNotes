let allFilters = document.querySelectorAll(".filter div");
let grid = document.querySelector(".grid");
let addBtn = document.querySelector(".add");
let body = document.querySelector("body");

let uid = new ShortUniqueId();

let deleteState = false;
let deleteBtn = document.querySelector(".delete");

//check for modal
let modalVisible = false;

let colors = {
    pink: "#d595aa",
    blue: "#5ecdde",
    green: "#91e6c7",
    black: "black"
};

let colorClasses = ["pink", "blue", "green", "black"];



//local-storage
// initialization step
if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify([]));
}



//1.double click -> makes background white again



//delete-btn
deleteBtn.addEventListener("click", function (e) {
    if (deleteState) {
        deleteState = false;
        e.currentTarget.classList.remove("delete-state");
    } else {
        deleteState = true;
        e.currentTarget.classList.add("delete-state");
    }
});


addBtn.addEventListener("click", function () {
    //better we add the check here cause if add on append walli line function 
    //toh challega he . idhar return kr denge to function ni chalega
    //yahi se return ho jayega and kuch create ni hoga
    if (modalVisible) {
        return;
    }


    //delete-btn
    if (deleteBtn.classList.contains("delete-state")) {
        deleteBtn.classList.remove("delete-state");
        deleteState = false;
    }



    let modal = document.createElement("div");
    modal.classList.add("modal-container");
    modal.setAttribute("click-first", true);
    modal.innerHTML = `<div class="writing-area" contenteditable>Enter you task...</div> 
        <div class="filter-area">
            <div class="modal-filter pink"></div>
            <div class="modal-filter blue"></div>
            <div class="modal-filter green"></div>
            <div class="modal-filter black active-modal-filter"></div>
        </div>` ;
    //by default we will high-light black walla filter 




    let wa = modal.querySelector(".writing-area");
    wa.addEventListener("click", function (e) {
        if (modal.getAttribute("click-first") == "true") {
            wa.innerHTML = "";
            modal.setAttribute("click-first", false);
        }
    });


    //jab yeh walla listener chalega toh writing-area(modal) hamare document ke andar hoga
    wa.addEventListener("keypress", function (e) {
        if (e.key == "Enter") {
            let task = e.currentTarget.innerText;
            let selectModalFilter = document.querySelector(".active-modal-filter");
            let color = selectModalFilter.classList[1];
            let id = uid();
            let ticket = document.createElement("div");
            ticket.classList.add("ticket");
            ticket.innerHTML = ` <div class="ticket-color ${color}"></div>
                <div class="ticket-id">#${id}</div>
                <div class="ticket-box" contenteditable>
                    ${task}
                </div>
            </div>` ;


            saveTicketInLocalStorage(id, color, task);

            //if edit in ticket then save it in local storage
            let ticketWritingArea = ticket.querySelector(".ticket-box");

            ticketWritingArea.addEventListener("input", ticketWritingAreaHandler);

            ticket.addEventListener("click", function (e) {

                if (deleteState) {
                    let id = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];

                    let taskArr = JSON.parse(localStorage.getItem("tasks"));


                    taskArr = taskArr.filter(function (el) {
                        return el.id != id
                    });

                    localStorage.setItem("tasks", JSON.stringify(taskArr));


                    e.currentTarget.remove();
                }

            });



            let ticketColorDiv = ticket.querySelector(".ticket-color");
            ticketColorDiv.addEventListener("click", ticketColorHandler);

            grid.appendChild(ticket);
            modal.remove();
            modalVisible = false;
        }
    });

    body.appendChild(modal);

    let allModalFilters = modal.querySelectorAll(".modal-filter");
    //highlight modal-filter walli class
    for (let i = 0; i < allModalFilters.length; i++) {
        allModalFilters[i].addEventListener("click", function (e) {
            for (j = 0; j < allModalFilters.length; j++) {
                if (allModalFilters[j].classList.contains("active-modal-filter")) {
                    allModalFilters[j].classList.remove("active-modal-filter");
                }
            }
            allModalFilters[i].classList.add("active-modal-filter");
        });
    }


    modalVisible = true;
});



for (let i = 0; i < allFilters.length; i++) {
    allFilters[i].addEventListener("click", function (e) {

        if (e.currentTarget.parentElement.classList.contains("selected-filter")) {
            e.currentTarget.parentElement.classList.remove("selected-filter");
            loadTask();
        } else {
            let color = e.currentTarget.classList[0].split("-")[0];
            e.currentTarget.parentElement.classList.add("selected-filter");
            loadTask(color);
        }
    });

    // allFilters[i].addEventListener("dblclick", function (e) {
    //     grid.style.backgroundColor = "red";
    // })
}


//function

function saveTicketInLocalStorage(id, color, task) {
    let requiredObj = { id, color, task };
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    taskArr.push(requiredObj);
    localStorage.setItem("tasks", JSON.stringify(taskArr));
}


//after refreshing ticket vanishes
//yaha hum iski functionalities save krwa rhe hain
function loadTask(passedColor) {

    //agar koi ticket ui per pehle se hai toh usse remove krdo
    let allTickets = document.querySelectorAll(".ticket");
    for (let t = 0; t < allTickets.length; t++) {
        allTickets[t].remove();
    }

    let tasks = JSON.parse(localStorage.getItem("tasks"));
    for (let i = 0; i < tasks.length; i++) {
        let id = tasks[i].id;
        let color = tasks[i].color;
        let taskValue = tasks[i].task;



        if (passedColor) {
            if (passedColor != color) {
                continue;
            }
        }




        let ticket = document.createElement("div");
        ticket.classList.add("ticket");
        ticket.innerHTML = ` <div class="ticket-color ${color}"></div>
                <div class="ticket-id">#${id}</div>
                <div class="ticket-box" contenteditable>
                    ${taskValue}
                </div>
            </div>` ;


        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.addEventListener("input", ticketWritingAreaHandler);

        let ticketColorDiv = ticket.querySelector(".ticket-color");
        ticketColorDiv.addEventListener("click", ticketColorHandler);


        ticket.addEventListener("click", function (e) {
            if (deleteState) {
                let id = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];

                let taskArr = JSON.parse(localStorage.getItem("tasks"));


                taskArr = taskArr.filter(function (el) {
                    return el.id != id
                });

                localStorage.setItem("tasks", JSON.stringify(taskArr));


                e.currentTarget.remove();
            }

        });

        grid.appendChild(ticket);
    }
}

//page refresh ya app re-open --> memory mai jitni tickets hai woh load ho jaye
loadTask();


function ticketColorHandler(e) {
    let currcolor = e.currentTarget.classList[1];
    let index = colorClasses.indexOf(currcolor);

    index++;
    index = index % 4;

    //remove current color
    e.currentTarget.classList.remove(currcolor);
    e.currentTarget.classList.add(colorClasses[index]);


    //change color in local storage
    let id = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    let reqIndex = -1;
    for (let i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == id) {
            reqIndex = i;
            break;
        }
    }

    taskArr[reqIndex].color = colorClasses[index];
    //add this back to local storage
    localStorage.setItem("tasks", JSON.stringify(taskArr));

}


function ticketWritingAreaHandler(e) {
    let id = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];

    //to edit the storage get the object
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    let reqIndex = -1;
    for (let i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == id) {
            reqIndex = i;
            break;
        }
    }

    //edit your task here
    taskArr[reqIndex].task = e.currentTarget.innerText;
    //now again store this task in yur object
    localStorage.setItem("tasks", JSON.stringify(taskArr));

}



