// Data structure
let data = {
    personas: [],
    locales: [],
    dias: ["Lunes", "Martes", "Miércoles", "Jueves"]
};

// DOM Elements
const personInput = document.getElementById('personInput');
const localInput = document.getElementById('localInput');
const personSelect = document.getElementById('personSelect');
const localSelect = document.getElementById('localSelect');
const scheduleTable = document.getElementById('scheduleTable');

// Initialize data
function loadData() {
    const savedData = localStorage.getItem('schedulerData');
    if (savedData) {
        data = JSON.parse(savedData);
    } else {
        data = {
            personas: ["Esther", "Edinson", "Ines", "Yissell", "Lisbeth", "Anderson", 
                      "Ma Jose", "Yujhra", "Danayk", "Maria Victoria", "Fabiola", "Jimmy"],
            locales: ["Corporacion 3150", "Grupo 212 Steak", "Inversiones Pad"],
            dias: ["Lunes", "Martes", "Miércoles", "Jueves"]
        };
        saveData();
    }
    updateUI();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('schedulerData', JSON.stringify(data));
    updateUI();
}

// Update UI elements
function updateUI() {
    updateSelects();
    generateTable();
}

// Update select dropdowns
function updateSelects() {
    // Update person select
    personSelect.innerHTML = '<option value="">Seleccionar persona para eliminar</option>';
    data.personas.forEach(person => {
        const option = document.createElement('option');
        option.value = person;
        option.textContent = person;
        personSelect.appendChild(option);
    });

    // Update local select
    localSelect.innerHTML = '<option value="">Seleccionar local para eliminar</option>';
    data.locales.forEach(local => {
        const option = document.createElement('option');
        option.value = local;
        option.textContent = local;
        localSelect.appendChild(option);
    });
}

// Generate schedule table
function generateTable() {
    const thead = scheduleTable.querySelector('thead tr');
    const tbody = scheduleTable.querySelector('tbody');
    
    // Clear existing content
    thead.innerHTML = '<th>Día</th>';
    tbody.innerHTML = '';

    // Add headers for each local
    data.locales.forEach(local => {
        const th = document.createElement('th');
        th.textContent = local;
        thead.appendChild(th);
    });

    // Generate assignments
    const assignments = generateAssignments();

    // Create table rows
    data.dias.forEach((dia, diaIndex) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${dia}</td>`;
        
        data.locales.forEach((_, localIndex) => {
            const td = document.createElement('td');
            td.textContent = assignments[localIndex][diaIndex].join(', ');
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// Generate random assignments
function generateAssignments() {
    if (!data.personas.length || !data.locales.length) return [];

    const shuffledPeople = [...data.personas].sort(() => Math.random() - 0.5);
    const numLocales = data.locales.length;
    const numDias = data.dias.length;
    const peoplePerDay = Math.max(1, Math.floor(data.personas.length / (numLocales * numDias)));

    const assignments = Array(numLocales)
        .fill(null)
        .map(() => Array(numDias).fill(null).map(() => []));

    shuffledPeople.forEach(person => {
        let assigned = false;
        for (let local = 0; local < numLocales && !assigned; local++) {
            for (let dia = 0; dia < numDias && !assigned; dia++) {
                if (assignments[local][dia].length < peoplePerDay) {
                    assignments[local][dia].push(person);
                    assigned = true;
                }
            }
        }
    });

    return assignments;
}

// Add new person
function addPerson() {
    const person = personInput.value.trim();
    if (person && !data.personas.includes(person)) {
        data.personas.push(person);
        saveData();
        personInput.value = '';
    }
}

// Add new local
function addLocal() {
    const local = localInput.value.trim();
    if (local && !data.locales.includes(local)) {
        data.locales.push(local);
        saveData();
        localInput.value = '';
    }
}

// Remove person
function removePerson() {
    const person = personSelect.value;
    if (person) {
        data.personas = data.personas.filter(p => p !== person);
        saveData();
    }
}

// Remove local
function removeLocal() {
    const local = localSelect.value;
    if (local) {
        data.locales = data.locales.filter(l => l !== local);
        saveData();
    }
}

// Export to Excel with styling
function exportToExcel() {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Get table data
    const table = document.getElementById('scheduleTable');
    const ws = XLSX.utils.table_to_sheet(table);
    
    // Set column widths
    const columnWidths = [];
    for (let i = 0; i < data.locales.length + 1; i++) {
        columnWidths.push({ wch: 20 }); // width in characters
    }
    ws['!cols'] = columnWidths;

    // Color palette for columns
    const columnColors = [
        "E3F2FD", // Light Blue
        "F3E5F5", // Light Purple
        "E8F5E9", // Light Green
        "FFF3E0", // Light Orange
        "FFEBEE", // Light Red
        "F3E5F5"  // Light Purple (repeat if needed)
    ];

    // Apply styles to all cells
    for (let cell in ws) {
        if (cell[0] === '!') continue; // skip special keys

        // Get column letter and row number
        const col = cell.replace(/[0-9]/g, '');
        const row = parseInt(cell.replace(/[^0-9]/g, ''));
        const colIndex = col.charCodeAt(0) - 65; // Convert A->0, B->1, etc.

        // Get the cell style object
        if (!ws[cell].s) ws[cell].s = {};
        
        // Default cell style
        ws[cell].s = {
            font: { 
                name: "Arial", 
                sz: 11,
                color: { rgb: "000000" }
            },
            alignment: { 
                vertical: "center",
                horizontal: "center",
                wrapText: true
            },
            border: {
                top: { style: "thin", color: { rgb: "B0BEC5" } },
                bottom: { style: "thin", color: { rgb: "B0BEC5" } },
                left: { style: "thin", color: { rgb: "B0BEC5" } },
                right: { style: "thin", color: { rgb: "B0BEC5" } }
            },
            fill: {
                fgColor: { rgb: columnColors[colIndex % columnColors.length] },
                patternType: "solid"
            }
        };

        // First column (días) style
        if (colIndex === 0) {
            ws[cell].s.font.bold = true;
            ws[cell].s.fill.fgColor.rgb = "E8EAF6"; // Light Indigo
        }

        // Header row style
        if (row === 1) {
            ws[cell].s = {
                ...ws[cell].s,
                fill: { 
                    fgColor: { rgb: "4472C4" },
                    patternType: "solid"
                },
                font: {
                    name: "Arial",
                    sz: 12,
                    bold: true,
                    color: { rgb: "FFFFFF" }
                },
                border: {
                    top: { style: "medium", color: { rgb: "1A237E" } },
                    bottom: { style: "medium", color: { rgb: "1A237E" } },
                    left: { style: "medium", color: { rgb: "1A237E" } },
                    right: { style: "medium", color: { rgb: "1A237E" } }
                }
            };
        }

        // Add subtle gradient effect for data cells
        if (row > 1) {
            const baseColor = columnColors[colIndex % columnColors.length];
            const darkenAmount = Math.floor((row - 2) * 5); // Gradually darken
            const newColor = adjustColor(baseColor, -darkenAmount);
            ws[cell].s.fill.fgColor.rgb = newColor;
        }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Horarios');
    
    // Generate Excel file with current date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Asignaciones_${date}.xlsx`);
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
    const num = parseInt(color, 16);
    const r = Math.max(Math.min(((num >> 16) + amount), 255), 0);
    const g = Math.max(Math.min((((num >> 8) & 0x00FF) + amount), 255), 0);
    const b = Math.max(Math.min(((num & 0x0000FF) + amount), 255), 0);
    return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadData);