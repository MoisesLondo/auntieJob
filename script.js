// Data structure
let data = {
    personas: [],
    locales: [],
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
};

// DOM Elements
const personInput = document.getElementById('personInput');
const localInput = document.getElementById('localInput');
const personSelect = document.getElementById('personSelect');
const localSelect = document.getElementById('localSelect');
const scheduleContainer = document.getElementById('scheduleContainer');

// Initialize data
function loadData() {
    const savedData = localStorage.getItem('schedulerData');
    if (savedData) {
        data = JSON.parse(savedData);
    } else {
        data = {
            personas: ["Esther", "Edinson", "Ines", "Yissell", "Lisbeth", "Anderson", 
                      "Ma Jose", "Yujhra", "Danayk", "Maria Victoria", "Fabiola", "Jimmy", "Graisbi", 
                      "Gerardo", "Cammy", "Johsmar"],
            locales: ["Corporacion 3150", "Grupo 212 Steak", "Inversiones Pad"],
            dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        };
        saveData();
    }
    updateUI();
}

function generateNewSchedule() {
    const assignments = generateAssignments();
    generateTables(assignments);
    // Remove saveData() from here as it's not necessary to save every time we generate a new schedule
}

// Save data to localStorage
function saveData() {
    const assignments = generateAssignments();
    const dataToSave = {
        ...data,
        assignments: assignments
    };
    localStorage.setItem('schedulerData', JSON.stringify(dataToSave));
    updateUI();
}

// Update UI elements
function updateUI() {
    updateSelects();
    // Eliminar la llamada a generateTables() de aquí
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

// Generate schedule tables for a month
function generateTables(assignments) {
    scheduleContainer.innerHTML = '';

    for (let week = 0; week < 4; week++) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Día</th>';
        data.locales.forEach(local => {
            const th = document.createElement('th');
            th.textContent = local;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create body rows
        data.dias.forEach((dia, diaIndex) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${dia}</td>`;
            
            data.locales.forEach((_, localIndex) => {
                const td = document.createElement('td');
                const weekAssignment = assignments[week][localIndex][diaIndex];
                td.textContent = weekAssignment ? weekAssignment.join(', ') : '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        scheduleContainer.appendChild(table);
    }
}



// Generate random assignments with better distribution for a month
function generateAssignments() {
    if (!data.personas.length || !data.locales.length) return [];

    const monthAssignments = [];
    const personAssignments = {};
    data.personas.forEach(person => {
        personAssignments[person] = 0;
    });

    for (let week = 0; week < 4; week++) {
        const weekAssignments = Array(data.locales.length)
            .fill(null)
            .map(() => Array(data.dias.length).fill(null).map(() => []));

        const totalShifts = data.locales.length * data.dias.length;
        const shiftsPerPerson = Math.ceil(totalShifts / data.personas.length);
        const peoplePerShift = Math.ceil(data.personas.length / totalShifts);

        // Shuffle the order of days for each week
        const shuffledDays = [...Array(data.dias.length).keys()].sort(() => Math.random() - 0.5);

        // Distribute people across all shifts for the week
        for (let diaIndex = 0; diaIndex < data.dias.length; diaIndex++) {
            const dia = shuffledDays[diaIndex];
            for (let local = 0; local < data.locales.length; local++) {
                const availablePeople = data.personas
                    .filter(person => personAssignments[person] < shiftsPerPerson * 4)
                    .sort((a, b) => personAssignments[a] - personAssignments[b]);

                for (let i = 0; i < peoplePerShift && i < availablePeople.length; i++) {
                    const person = availablePeople[i];
                    weekAssignments[local][dia].push(person);
                    personAssignments[person]++;
                }
            }
        }

        monthAssignments.push(weekAssignments);
    }

    return monthAssignments;
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
    const wb = XLSX.utils.book_new();
    const tables = document.querySelectorAll('table');
    
    tables.forEach((table, index) => {
        const ws = XLSX.utils.table_to_sheet(table);
        
        // Set column widths
        const columnWidths = [];
        for (let i = 0; i < data.locales.length + 1; i++) {
            columnWidths.push({ wch: 20 });
        }
        ws['!cols'] = columnWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, `Semana ${index + 1}`);
    });
    
    // Generate Excel file with current date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Asignaciones_${date}.xlsx`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Generate initial schedule
    generateNewSchedule();
});