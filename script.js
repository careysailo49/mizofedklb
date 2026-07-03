// Paste your actual Web App Executable URL below
const API_URL = "https://script.google.com/macros/s/AKfycbxxqCf9JeCZ_ZYQXCGuuSJGnHxufiGBMJvriIl-z8H32mQyo9BfBf3mAiXwpg4od8V9/exec";

let localDataStore = [];
let filteredDataStore = [];
let userLookupStore = [];
let isAdminLoggedIn = false;
let isUserUpdateMode = false;
let isFullEditMode = false;
let loginModalObj;

let currentPage = 1;
const itemsPerPage = 20;

window.onload = function() {
  loginModalObj = new bootstrap.Modal(document.getElementById('loginModal'));
};

function toggleUserLookupZone() {
  const zone = document.getElementById('userLookupZone');
  const btn = document.getElementById('userModeBtn');
  
  if(isAdminLoggedIn) toggleAdminAuth();
  if (zone.style.display === 'block') {
    zone.style.display = 'none';
    btn.innerText = "DAC Update Na";
    btn.className = "btn btn-outline-primary";
    isUserUpdateMode = false;
    resetForm();
  } else {
    zone.style.display = 'block';
    btn.innerText = "A Tira Letna";
    btn.className = "btn btn-primary";
    document.getElementById('lookupMobile').value = '';
    document.getElementById('userResultTableWrapper').style.display = 'none';
    document.getElementById('lookupStatus').innerText = '';
  }
}

function toggleAdminAuth() {
  if (isAdminLoggedIn) {
    isAdminLoggedIn = false;
    document.getElementById('authBtn').innerText = "Admin Login";
    document.getElementById('authBtn').className = "btn btn-outline-dark";
    document.getElementById('adminDashboardZone').style.display = 'none';
    resetForm();
  } else {
    if(document.getElementById('userLookupZone').style.display === 'block') {
      toggleUserLookupZone();
    }
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('loginError').classList.add('d-none');
    loginModalObj.show();
  }
}

function verifyCredentials() {
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  if (user === "mizofedkol" && pass === "Gasuih123") {
    isAdminLoggedIn = true;
    loginModalObj.hide();
    document.getElementById('authBtn').innerText = "Logout Admin";
    document.getElementById('authBtn').className = "btn btn-danger";
    document.getElementById('adminDashboardZone').style.display = 'block';
    loadDashboardData();
  } else {
    document.getElementById('loginError').classList.remove('d-none');
  }
}

function searchUserByMobile() {
  const mobile = document.getElementById('lookupMobile').value.trim();
  const statusDiv = document.getElementById('lookupStatus');
  const tableWrapper = document.getElementById('userResultTableWrapper');
  const tbody = document.getElementById('userResultTableBody');
  
  statusDiv.innerText = "";
  tableWrapper.style.display = "none";
  if (mobile.length !== 10) {
    statusDiv.innerText = "Khawngaihin Mobile Number digit 10 tling ngei chhu lut rawh.";
    return;
  }
  
  statusDiv.innerText = "Data kan zawng mek e, lo nghak lawk rawh...";
  
  fetch(`${API_URL}?action=getEntriesByMobile&mobile=${mobile}`)
    .then(res => res.json())
    .then(results => {
      userLookupStore = results;
      if (results.length === 0) {
        statusDiv.innerText = "He mobile number hian link a nei lo emaw i chhu sual palh ani maithei!!";
        return;
      }
      
      statusDiv.innerText = "A sira Update Na tih ah hian hmet la, i DAC Number dawn thar kha chhu lut rawh!";
      let html = "";
      results.forEach((item, index) => {
        let rowClass = item.isUserUpdated ? 'table-danger' : '';
        html += `<tr class="${rowClass}">
          <td><strong>${item.consumerHming}</strong></td>
          <td>${item.currentAddress}</td>
          <td><span class="badge bg-secondary">${item.dacNumber}</span></td>
          <td><button type="button" class="btn btn-warning btn-sm" onclick="loadUserFieldsToUpdate(${index})">Update Na</button></td>
        </tr>`;
      });
      tbody.innerHTML = html;
      tableWrapper.style.display = "block";
    })
    .catch(() => { statusDiv.innerText = "Error pulling database details."; });
}

function searchExactUserByName() {
  const nameInput = document.getElementById('consumerHming').value.trim();
  const resultZone = document.getElementById('nameQueryResultZone');
  const tbody = document.getElementById('nameQueryResultTableBody');
  const searchBtn = document.getElementById('nameSearchBtn');
  const btnText = document.getElementById('nameSearchBtnText');
  const spinner = document.getElementById('nameSearchSpinner');
  if (!nameInput) {
    alert("Khawngaihin Consumer Hming i zawn tur chhu lut rawh.");
    return;
  }
  
  searchBtn.disabled = true;
  btnText.innerText = "Nghak Lawk Aww...";
  spinner.style.display = "inline-block";
  
  fetch(`${API_URL}?action=getEntriesByNameExact&name=${encodeURIComponent(nameInput)}`)
    .then(res => res.json())
    .then(results => {
      searchBtn.disabled = false;
      btnText.innerText = "Hming Enna";
      spinner.style.display = "none";
      
      if (results.length === 0) {
        alert("He hming hi database-ah a la awm lo nge Consumer Hming i chhu sual zawk aww??");
        resultZone.style.display = "none";
        return;
      }
      
      window.nameQueryResultStore = results;
      let html = "";
      results.forEach((item, index) => {
        html += `<tr>
          <td><small class="text-muted">${item.id}</small></td>
          <td><small class="text-muted">${item.entryDateTime || ''}</small></td>
          <td><strong>${item.consumerHming}</strong></td>
          <td><span class="badge bg-secondary">${item.dacNumber}</span></td>
          <td><small class="text-muted">${item.dacUpdate || '---'}</small></td>
          <td>${item.consumerNumber}</td>
          <td><small>${item.currentAddress}</small></td>
          <td>${item.mobileNumber}</td>
          <td><button type="button" class="btn btn-warning btn-sm" onclick="loadUserFullFieldsToUpdate(${index})">Siam Ṭhatna</button></td>
        </tr>`;
      });
      tbody.innerHTML = html;
      resultZone.style.display = "block";
      resultZone.scrollIntoView({ behavior: 'smooth' });
    });
}

function loadUserFieldsToUpdate(index) {
  const item = userLookupStore[index];
  isUserUpdateMode = true;
  isFullEditMode = false;
  
  document.getElementById('entryId').value = item.id;
  document.getElementById('consumerHming').value = item.consumerHming;
  document.getElementById('dacNumber').value = ''; 
  document.getElementById('consumerNumber').value = item.consumerNumber;
  document.getElementById('mobileNumber').value = item.mobileNumber;
  document.getElementById('currentAddress').value = item.currentAddress;
  document.getElementById('consumerHming').readOnly = true;
  document.getElementById('dacNumber').readOnly = false;
  document.getElementById('mobileNumber').readOnly = true;
  
  const consumerNumInput = document.getElementById('consumerNumber');
  consumerNumInput.disabled = true;
  consumerNumInput.style.backgroundColor = "#e9ecef";
  const addressDropdown = document.getElementById('currentAddress');
  addressDropdown.style.pointerEvents = "none";
  addressDropdown.style.backgroundColor = "#e9ecef";
  
  document.getElementById('formHeader').innerText = "DAC NUMBER UPDATE NA";
  document.getElementById('formHeader').className = "card-header bg-warning text-dark";
  document.getElementById('submitBtn').innerText = "Mizofed Office-a Thawn Lehna";
  document.getElementById('submitBtn').className = "btn btn-warning w-100";
  document.getElementById('cancelBtn').classList.remove('d-none');
  document.getElementById('formColumn').scrollIntoView({ behavior: 'smooth' });
}

function loadUserFullFieldsToUpdate(index) {
  const item = window.nameQueryResultStore ? window.nameQueryResultStore[index] : null;
  if(!item) return;
  isUserUpdateMode = false;
  isFullEditMode = true;
  document.getElementById('entryId').value = item.id;
  document.getElementById('consumerHming').value = item.consumerHming;
  document.getElementById('dacNumber').value = item.dacNumber;
  document.getElementById('consumerNumber').value = item.consumerNumber;
  document.getElementById('mobileNumber').value = item.mobileNumber;
  document.getElementById('currentAddress').value = item.currentAddress;
  document.getElementById('consumerHming').readOnly = false;
  document.getElementById('dacNumber').readOnly = true;
  document.getElementById('mobileNumber').readOnly = true;
  const consumerNumInput = document.getElementById('consumerNumber');
  consumerNumInput.readOnly = false;
  consumerNumInput.disabled = false;
  consumerNumInput.style.backgroundColor = "";
  const addressDropdown = document.getElementById('currentAddress');
  addressDropdown.disabled = false;
  addressDropdown.style.pointerEvents = "auto";
  addressDropdown.style.backgroundColor = "";
  document.getElementById('formHeader').innerText = "DATA SIAMṬHATNA (Consumer Hming, Consumer Number leh Current Address thlakna)";
  document.getElementById('formHeader').className = "card-header bg-warning text-dark";
  document.getElementById('submitBtn').innerText = "Data Siamṭhatna Thawnna";
  document.getElementById('submitBtn').className = "btn btn-warning w-100";
  document.getElementById('cancelBtn').classList.remove('d-none');
  document.getElementById('formColumn').scrollIntoView({ behavior: 'smooth' });
}

function loadDashboardData() {
  if(!isAdminLoggedIn) return;
  document.getElementById('dataTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-muted">Data thar luan luh mek a ni...</td></tr>';
  
  fetch(`${API_URL}?action=getData`)
    .then(res => res.json())
    .then(renderTable);
}

function renderTable(data) {
  localDataStore = data;
  filteredDataStore = [...data];
  document.getElementById('searchHmingInput').value = '';
  currentPage = 1;
  renderPagination();
}

function renderPagination() {
  const tbody = document.getElementById('dataTableBody');
  const totalItems = filteredDataStore.length;
  if(totalItems === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Data engmah a la awm lo.</td></tr>';
    document.getElementById('paginationInfo').innerText = `Showing 0 to 0 of 0 entries`;
    document.getElementById('paginationControls').innerHTML = '';
    return;
  }
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const pageItems = filteredDataStore.slice(startIndex, endIndex);
  let html = '';
  pageItems.forEach(item => {
    let rowStyle = '';
    if (item.isUserUpdated) {
      rowStyle = 'class="table-danger"';
    } else if (item.isFullEdited) {
      rowStyle = 'class="table-success"';
    }
    html += `<tr ${rowStyle}>
      <td><small class="text-muted">${item.entryDateTime || ''}</small></td>
      <td><strong>${item.consumerHming}</strong></td>
      <td><span class="badge bg-secondary">${item.dacNumber}</span></td>
      <td><small class="text-muted">${item.dacUpdate || '---'}</small></td>
      <td>${item.consumerNumber}</td>
      <td><small>${item.currentAddress}</small></td>
      <td>${item.mobileNumber}</td>
      <td>
        <button class="btn btn-warning btn-sm btn-action" onclick="editEntry('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm btn-action" onclick="deleteEntry('${item.id}')">Delete</button>
      </td>
    </tr>`;
  });
  tbody.innerHTML = html;
  document.getElementById('paginationInfo').innerText = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;
  let navHtml = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">Previous</a></li>`;
  for(let i = 1; i <= totalPages; i++) {
    navHtml += `<li class="page-item ${currentPage === i ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a></li>`;
  }
  navHtml += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">Next</a></li>`;
  document.getElementById('paginationControls').innerHTML = navHtml;
}

function changePage(page) {
  currentPage = page;
  renderPagination();
}

function filterByHming() {
  const searchString = document.getElementById('searchHmingInput').value.toLowerCase();
  filteredDataStore = localDataStore.filter(item => item.consumerHming.toLowerCase().includes(searchString));
  currentPage = 1;
  renderPagination();
}

function handleFormSubmit(e) {
  e.preventDefault();
  document.getElementById('submitBtn').disabled = true;
  document.getElementById('formSpinner').style.display = "inline-block";
  
  const payload = {
    action: "saveData",
    formData: {
      id: document.getElementById('entryId').value,
      consumerHming: document.getElementById('consumerHming').value.trim(),
      dacNumber: document.getElementById('dacNumber').value.trim(),
      consumerNumber: document.getElementById('consumerNumber').value.trim(),
      currentAddress: document.getElementById('currentAddress').value,
      mobileNumber: document.getElementById('mobileNumber').value.trim(),
      flagAsUserUpdate: isUserUpdateMode,
      isFullEditMode: isFullEditMode
    }
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(res => {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('formSpinner').style.display = "none";
    if (res.success) {
      alert(res.message);
      resetForm();
      if (isAdminLoggedIn) loadDashboardData();
    } else {
      alert("Error: " + res.message);
    }
  })
  .catch(() => {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('formSpinner').style.display = "none";
    alert("Connection Error to Google Sheets API.");
  });
}

function editEntry(id) {
  const item = localDataStore.find(x => String(x.id) === String(id));
  if (!item) return;
  isUserUpdateMode = false;
  isFullEditMode = true;
  
  document.getElementById('entryId').value = item.id;
  document.getElementById('consumerHming').value = item.consumerHming;
  document.getElementById('dacNumber').value = item.dacNumber;
  document.getElementById('consumerNumber').value = item.consumerNumber;
  document.getElementById('mobileNumber').value = item.mobileNumber;
  document.getElementById('currentAddress').value = item.currentAddress;
  
  document.getElementById('consumerHming').readOnly = false;
  document.getElementById('dacNumber').readOnly = false;
  document.getElementById('mobileNumber').readOnly = false;
  
  const consumerNumInput = document.getElementById('consumerNumber');
  consumerNumInput.disabled = false;
  consumerNumInput.readOnly = false;
  consumerNumInput.style.backgroundColor = "";
  const addressDropdown = document.getElementById('currentAddress');
  addressDropdown.disabled = false;
  addressDropdown.style.pointerEvents = "auto";
  addressDropdown.style.backgroundColor = "";
  
  document.getElementById('formHeader').innerText = "DATA EDIT PANELS (ADMIN)";
  document.getElementById('formHeader').className = "card-header bg-danger text-white";
  document.getElementById('submitBtn').innerText = "Save Admin Changes";
  document.getElementById('submitBtn').className = "btn btn-danger w-100";
  document.getElementById('cancelBtn').classList.remove('d-none');
  document.getElementById('formColumn').scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(id) {
  if (confirm("I paih tak tak duh em?")) {
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "deleteData", id: id })
    })
    .then(res => res.json())
    .then(res => {
      alert(res.message);
      if (res.success) loadDashboardData();
    });
  }
}

function resetForm() {
  document.getElementById('dacForm').reset();
  document.getElementById('entryId').value = '';
  isUserUpdateMode = false;
  isFullEditMode = false;
  
  document.getElementById('consumerHming').readOnly = false;
  document.getElementById('dacNumber').readOnly = false;
  document.getElementById('mobileNumber').readOnly = false;
  
  const consumerNumInput = document.getElementById('consumerNumber');
  consumerNumInput.disabled = false;
  consumerNumInput.readOnly = false;
  consumerNumInput.style.backgroundColor = "";
  const addressDropdown = document.getElementById('currentAddress');
  addressDropdown.disabled = false;
  addressDropdown.style.pointerEvents = "auto";
  addressDropdown.style.backgroundColor = "";
  
  document.getElementById('formHeader').innerText = "ZIAK LUT RAWH LE";
  document.getElementById('formHeader').className = "card-header bg-primary text-white";
  document.getElementById('submitBtn').innerText = "Mizofed Office-a Thawnna";
  document.getElementById('submitBtn').className = "btn btn-primary w-100";
  document.getElementById('cancelBtn').classList.add('d-none');
}