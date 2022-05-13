(async function() {  

var currentPage = 1;
var maxItemCount = 5;

var searchFilter = null;

const tableColumnLables = {name:"имя",}
const hiddenColumn = ["id"];

const settingsModal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-btn");
const settingsCloseBtn = document.getElementById("settings-close-btn");

settingsBtn.addEventListener('click',()=>{settingsModal.showModal();});
settingsCloseBtn.addEventListener('click',()=>{settingsModal.close();});

const dbData = document.getElementById("db-data");
const tableActions = document.getElementById("table-actions");

await (async function() {  
    const settingsTable = settingsModal.querySelector("table");

    let style = dbData.querySelector("style");
    let css = "";

    let data = await globalThis.DB.retrieveData("books",searchFilter,maxItemCount,((currentPage - 1) * maxItemCount))
    //console.log(data);
    let fragment = document.createDocumentFragment();
    let settingsFragment = document.createDocumentFragment();

    let head = document.createElement("thead");

    let settingsHead = document.createElement("thead");
    let settingsBody = document.createElement("tbody");
    let settingsVisibility = document.createElement("tr");
    let settingsLable = document.createElement("tr"); 
    (function(){
        let th = document.createElement("th");
        th.innerText = "column name:";
        settingsHead.append(th);

        th = document.createElement("th");
        th.innerText = "hiden:";
        settingsVisibility.append(th);

        th = document.createElement("th");
        th.innerText = "lable:";
        settingsLable.append(th);
    })();    

    let i = 1;
    data.fields.forEach(element => {
        let th = document.createElement("th")
        th.innerText = element.name;
        const header = th;
        head.append(th);
        css += `#db-data.${element.name} tr td:nth-child(${i}),#db-data.${element.name} thead th:nth-child(${i}){display:none;}\n`;
        i++;
        //====
        th = document.createElement("th");
        th.innerText = element.name;
        settingsHead.append(th);
        //====
        th = document.createElement("td");
        let check = document.createElement('input');
        check.type = "checkbox";
        const name = element.name;
        check.addEventListener("change",(e)=>{
            if (e.target.checked) {
                dbData.classList.add(name);
            } else {
                dbData.classList.remove(name);
            }
        });
        if (hiddenColumn.includes(name)){
            check.checked = true;
            dbData.classList.add(name);
        }
        th.append(check)
        settingsVisibility.append(th);
        //====
        th = document.createElement("td");
        let input = document.createElement('input');
        input.type = "text";
        input.addEventListener("change",(e)=>{
            let lable = e.target.value;
            if (lable != "") {
                header.style.setProperty("--lable",`"${lable}"`);
            } else {
                header.style.removeProperty("--lable");
            }
        });
        if (name in tableColumnLables) {
            let value = tableColumnLables[name];
            input.value = value;
            header.style.setProperty("--lable",`'${value}'`);
        }
        th.append(input);
        settingsLable.append(th);
    });

    let actions = document.createElement("th");
    actions.innerText = "actions";
    actions.classList.add("action");
    head.append(actions);

    fragment.append(head);
    settingsFragment.append(settingsHead);
    settingsBody.append(settingsVisibility);
    settingsBody.append(settingsLable);
    settingsFragment.append(settingsBody);
    settingsTable.append(settingsFragment);

    let body = document.createElement("tbody");
    body.append(createTBodyFragment(data));
    fragment.append(body);
    style.appendChild(document.createTextNode(css));
    dbData.append(fragment);
})();  

const dbDataBody = dbData.querySelector("tbody");

function createTBodyFragment(data){
    let fragment = document.createDocumentFragment();
    data.rows.forEach(element => {
        let row = document.createElement("tr");
        Object.values(element).forEach(val => {
            let td = document.createElement("td");
            td.innerText = val;
            row.append(td);
        });
        let td = tableActions.content.cloneNode(true);
        let removeBtn = td.querySelector(".delete");
        const id = element.id;
        removeBtn.addEventListener("click",async ()=>{
            console.log(id);
            await globalThis.DB.deleteData("books",id);
            updateTable();
        });
        td.querySelector("td").classList.add("action");//  <========
        row.append(td);
        fragment.append(row);
    });
    return fragment;
}

async function updateTable(){
    let data = await globalThis.DB.retrieveData("books",searchFilter,maxItemCount,((currentPage - 1) * maxItemCount))
    while (dbDataBody.lastElementChild) {
        dbDataBody.removeChild(dbDataBody.lastElementChild);
    }
    dbDataBody.append(createTBodyFragment(data));
}

const refrashBtn = document.getElementById("table-refrash");
refrashBtn.addEventListener("click",()=>{
    updateTable();
});

const addBtn = document.getElementById("table-add");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalInsert = document.getElementById("modal-insert");

const insertBookName = document.getElementById("insert-book-name");
const insertAuthorId = document.getElementById("insert-author-id");
const insertPublisherId = document.getElementById("insert-publisher-id");

const selectDefaultValue = document.getElementById("select-default-value");
addBtn.addEventListener("click",async()=>{

    let result = await Promise.all([
        globalThis.DB.retrieveData("authors",null,"all"),
        globalThis.DB.retrieveData("publishers",null,"all")
    ]);

    //authors
    while (insertAuthorId.firstChild)
        insertAuthorId.removeChild(insertAuthorId.lastChild);
    insertAuthorId.append(selectDefaultValue.content.cloneNode(true));
    result[0].rows.forEach(row=>{
        let option = document.createElement("option");
        option.value = row.id;
        option.innerText = row.name;
        insertAuthorId.append(option);
    });
    //publishers
    while (insertPublisherId.firstChild)
    insertPublisherId.removeChild(insertPublisherId.lastChild);
    insertPublisherId.append(selectDefaultValue.content.cloneNode(true));
    result[1].rows.forEach(row=>{
        let option = document.createElement("option");
        option.value = row.id;
        option.innerText = row.name;
        insertPublisherId.append(option);
    });

    modal.showModal();

});
modalClose.addEventListener("click",()=>{
    modal.close();
});
const inputs = modal.querySelectorAll(".input");
modalInsert.addEventListener('click',()=>{
    let values = [];
    let isValid = true;
    for (let input of inputs) {
        values.push(input.value);
        if (input.value === '') {
            isValid = false;
            break;
        }
    }
    if (isValid) {
        //fix here
        values[0] = `'${values[0]}'`;
        //
        (async function(){
            await globalThis.DB.insertData("books",values.join());
            modal.close();
            updateTable();
        })();
    } else {
        iAlert("invalid input data");
    }
});

const pageField = document.getElementById("page-field");
const pageInc = document.getElementById("page-inc");
const pageDec = document.getElementById("page-dec");
pageInc.addEventListener("click",()=>{
    currentPage++;
    pageField.value = currentPage;
    updateTable()
});
pageDec.addEventListener("click",()=>{
    if (currentPage > 1){currentPage--;}
    pageField.value = currentPage;
    updateTable()
});

//===============

const maxItemSelect = document.getElementById("max-item-select");
maxItemSelect.addEventListener("change",()=>{
    maxItemCount = parseInt(maxItemSelect.value);
    updateTable()
})

const alertModal = document.getElementById("alert-modal");
const msg = document.getElementById("alert-message");
const alertClose = document.getElementById("alert-close");
alertClose.addEventListener('click',()=>{alertModal.close();});
function iAlert(message) {
    msg.innerText = message;
    alertModal.showModal();
}

const filterInput = document.getElementById("filter-input");
const filterWrapper = document.getElementById("filter-wrapper");
const filterBtn = document.getElementById("filter-btn");
const filterApply = document.getElementById("filter-apply");
filterBtn.addEventListener("click",()=>{
    if (!filterWrapper.classList.toggle("active")) {
        //hidden
        searchFilter = null;
        filterInput.value = null;
        updateTable();
    }
});
filterApply.addEventListener("click",()=>{
    searchFilter = `%${filterInput.value}%`;
    //console.log(searchFilter);
    updateTable();
});

})();