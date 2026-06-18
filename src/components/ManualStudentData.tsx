import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getMadrassaName } from '../config';

interface ManualStudentDataProps {
  onBack: () => void;
}

export default function ManualStudentData({ onBack }: ManualStudentDataProps) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>Jamia Student Management System - Advanced</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    
    <style>
        body { font-family: 'Noto Nastaliq Urdu', serif; background: #f0f2f5; margin: 0; padding: 20px; direction: rtl; }
        .dashboard { max-width: 1200px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        
        .top-nav { background: #2d6df6; padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white; }
        .nav-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        
        .btn { padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; color: white; font-weight: bold; display: flex; align-items: center; gap: 5px; font-family: sans-serif; }
        .btn-print { background: #00bcd4; }
        .btn-excel-export { background: #4caf50; }
        .btn-excel-import { background: #ff9800; }
        .btn-add { background: #673ab7; }
        .btn-save { background: #2196f3; }

        .search-bar { padding: 20px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; gap: 10px; border-bottom: 1px solid #ddd; }
        .search-input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        
        .page-limit-select { padding: 10px; border-radius: 4px; border: 1px solid #ccc; font-weight: bold; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #800000; color: white; padding: 12px; font-size: 14px; }
        td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        
        .student-photo { width: 50px; height: 50px; border: 1px solid #ddd; cursor: pointer; object-fit: cover; border-radius: 4px; background: #eee; }

        .pagination-controls { padding: 20px; display: flex; justify-content: center; gap: 10px; background: #f8f9fa; }
        .page-btn { padding: 5px 15px; background: #2d6df6; color: white; border: none; cursor: pointer; border-radius: 3px; }

        @media print {
            .top-nav, .search-bar, .action-btns, .pagination-controls, .btn { display: none !important; }
            body { padding: 0; }
            .dashboard { box-shadow: none; border: none; width: 100%; }
            .print-header { display: block !important; text-align: center; margin-bottom: 20px; }
        }
        .print-header { display: none; }
    </style>
</head>
<body>

<input type="file" id="photoInput" style="display:none;" accept="image/*">

<div class="dashboard">
    <div class="print-header">
        <h1 style="margin:0;">${getMadrassaName()}</h1>
        <h3>فہرست داخل طلبہ (ریکارڈ)</h3>
    </div>

    <div class="top-nav">
        <div class="nav-buttons">
            <button class="btn btn-print" onclick="window.print()">پرنٹ کریں</button>
            <button class="btn btn-excel-export" onclick="exportToExcel()">ایکسل ایکسپورٹ</button>
            <label class="btn btn-excel-import">
                ایکسل امپورٹ <input type="file" id="importExcel" style="display:none;" accept=".xlsx, .xls" onchange="importExcelData(this)">
            </label>
            <button class="btn btn-add" onclick="addRow()">نیا طالب علم</button>
            <button class="btn btn-save" onclick="saveData()">ڈیٹا سیو کریں</button>
        </div>
        <div style="font-size: 20px; font-weight: bold;">اسٹوڈنٹ مینجمنٹ سسٹم</div>
    </div>

    <div class="search-bar">
        <input type="text" id="searchInput" class="search-input" placeholder="تلاش کریں..." onkeyup="filterTable()">
        
        <label>طلبہ فی صفحہ:</label>
        <select id="pageLimit" class="page-limit-select" onchange="updatePageLimit()">
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
        </select>
    </div>

    <table id="studentTable">
        <thead>
            <tr>
                <th>تصویر</th>
                <th>کلاس</th>
                <th>نام</th>
                <th>ولدیت</th>
                <th>شناختی کارڈ</th>
                <th>فون</th>
                <th>ضلع</th>
                <th>رجسٹریشن</th>
                <th class="action-btns">عمل</th>
            </tr>
        </thead>
        <tbody id="tableBody"></tbody>
    </table>

    <div class="pagination-controls" id="pagination"></div>
</div>

<script>
    let allStudents = [];
    let currentPage = 1;
    let rowsPerPage = 30;
    let currentPhotoTargetIndex = null;

    // --- PHOTO UPLOAD LOGIC ---
    const photoInput = document.getElementById('photoInput');
    
    function triggerPhotoUpload(index) {
        currentPhotoTargetIndex = index;
        photoInput.click();
    }

    photoInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Photo ko array mein update karna
                allStudents[currentPhotoTargetIndex].photo = e.target.result;
                renderTable();
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 1. Excel File Import
    function importExcelData(input) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            json.forEach(item => {
                allStudents.push({
                    photo: item['تصویر'] || 'https://via.placeholder.com/50',
                    class: item['کلاس'] || item['درجہ'] || item['Class'] || item['class'] || item['grade'] || '',
                    name: item['نام'] || item['Name'] || item['name'] || '',
                    father: item['ولدیت'] || item['Father Name'] || item['fatherName'] || '',
                    cnic: item['شناختی کارڈ'] || item['CNIC'] || item['cnic'] || item['شناختی کارڈ نمبر'] || '',
                    phone: item['فون'] || item['رابطہ نمبر'] || item['Phone'] || item['Mobile'] || item['phone'] || '',
                    district: item['ضلع'] || item['موجودہ ضلع'] || item['District'] || item['district'] || '',
                    reg: item['رجسٹریشن'] || item['Reg No'] || item['regNo'] || item['رجسٹریشن نمبر'] || ''
                });
            });
            renderTable();
            alert("ایکسل ڈیٹا کامیابی سے شامل ہو گیا!");
        };
        reader.readAsArrayBuffer(file);
    }

    // 2. Table Render
    function renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = "";
        
        let start = (currentPage - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedItems = allStudents.slice(start, end);

        paginatedItems.forEach((student, index) => {
            const realIndex = start + index;
            let row = tbody.insertRow();
            row.innerHTML = \`
                <td><img src="\${student.photo}" class="student-photo" onclick="triggerPhotoUpload(\${realIndex})" title="تصویر بدلنے کے لیے کلک کریں"></td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'class', this.innerText)">\${student.class}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'name', this.innerText)">\${student.name}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'father', this.innerText)">\${student.father}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'cnic', this.innerText)">\${student.cnic}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'phone', this.innerText)">\${student.phone}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'district', this.innerText)">\${student.district}</td>
                <td contenteditable="true" onblur="updateData(\${realIndex}, 'reg', this.innerText)">\${student.reg}</td>
                <td class="action-btns"><button onclick="deleteRow(\${realIndex})" style="background:red; color:white; border:none; padding:5px; cursor:pointer;">ڈیلیٹ</button></td>
            \`;
        });
        setupPagination();
    }

    function updateData(index, field, value) {
        allStudents[index][field] = value;
    }

    function updatePageLimit() {
        rowsPerPage = parseInt(document.getElementById('pageLimit').value);
        currentPage = 1;
        renderTable();
    }

    function setupPagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = "";
        let pageCount = Math.ceil(allStudents.length / rowsPerPage);
        if(pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            let btn = document.createElement('button');
            btn.innerText = i;
            btn.className = 'page-btn';
            if (i === currentPage) btn.style.background = "#800000";
            btn.onclick = () => { currentPage = i; renderTable(); };
            pagination.appendChild(btn);
        }
    }

    function addRow() {
        allStudents.unshift({ photo: 'https://via.placeholder.com/50', class: '', name: '', father: '', cnic: '', phone: '', district: '', reg: '' });
        renderTable();
    }

    function deleteRow(index) {
        if(confirm("کیا آپ واقعی یہ ریکارڈ ختم کرنا چاہتے ہیں؟")) {
            allStudents.splice(index, 1);
            renderTable();
        }
    }

    function saveData() {
        localStorage.setItem('studentList', JSON.stringify(allStudents));
        alert("ڈیٹا کامیابی سے محفوظ ہو گیا!");
    }

    window.onload = () => {
        let saved = localStorage.getItem('studentList');
        if (saved) {
            allStudents = JSON.parse(saved);
            renderTable();
        }
    };

    function exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(allStudents);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Jamia_Students.xlsx");
    }

    function filterTable() {
        let val = document.getElementById('searchInput').value.toLowerCase();
        const tbody = document.getElementById('tableBody');
        const rows = tbody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            let text = rows[i].innerText.toLowerCase();
            rows[i].style.display = text.includes(val) ? "" : "none";
        }
    }
</script>

</body>
</html>
  `;

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-slate-800 p-4 flex items-center gap-4 text-white">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold font-urdu">مینول ڈیٹا مینجمنٹ</h1>
      </div>
      <iframe 
        srcDoc={htmlContent} 
        className="flex-1 w-full border-none"
        title="Manual Student Data"
      />
    </div>
  );
}
