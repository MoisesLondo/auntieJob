// Data structure
let data = {
    personas: [],
    locales: [],
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    horarios: {
        "Lunes": "9:00 - 17:00",
        "Martes": "9:00 - 17:00",
        "Miércoles": "9:00 - 17:00",
        "Jueves": "9:00 - 17:00",
        "Viernes": "9:00 - 17:00",
        "Sábado": "10:00 - 15:00",
        "Domingo": "10:00 - 15:00"
    }
};

// Global variable to track assignments
let assignmentTracker = {};

// DOM Elements
const personInput = document.getElementById('personInput');
const localInput = document.getElementById('localInput');
const personSelect = document.getElementById('personSelect');
const localSelect = document.getElementById('localSelect');
const scheduleContainer = document.getElementById('scheduleContainer');
const scheduleInputs = document.getElementById('scheduleInputs');

// Initialize data
function loadData() {
    console.log('Loading data');
    data = {
        personas: ["Esther", "Edinson", "Ines", "Yissell", "Lisbeth", "Anderson", 
                  "Ma Jose", "Yujhra", "Danayk", "Maria Victoria", "Fabiola", "Jimmy", "Graisbi", 
                  "Gerardo", "Cammy", "Johsmar"],
        locales: ["Corporacion 3150", "Grupo 212 Steak", "Inversiones Pad"],
        dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
        horarios: {
            "Lunes": "9:00 - 17:00",
            "Martes": "9:00 - 17:00",
            "Miércoles": "9:00 - 17:00",
            "Jueves": "9:00 - 17:00",
            "Viernes": "9:00 - 17:00",
            "Sábado": "10:00 - 15:00",
            "Domingo": "10:00 - 15:00"
        }
    };
    saveData();
    initializeAssignmentTracker();
    updateUI();
    generateScheduleInputs();
    generateNewSchedule();
}

function initializeAssignmentTracker() {
    assignmentTracker = {};
    data.personas.forEach(person => {
        assignmentTracker[person] = {
            lastAssignedDay: -2,
            lastAssignedWeekend: -1,
            totalAssignments: 0
        };
    });
}

function generateNewSchedule() {
    try {
        const assignments = generateAssignments();
        console.log('Generated assignments:', assignments);
        generateTables(assignments);
    } catch (error) {
        console.error('Error generating new schedule:', error);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('schedulerData', JSON.stringify(data));
    updateUI();
}

function generateScheduleInputs() {
    console.log('Generating schedule inputs');
    scheduleInputs.innerHTML = '';
    data.dias.forEach(dia => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'schedule-input';
        inputGroup.innerHTML = `
            <label for="schedule-${dia}">${dia}:</label>
            <input type="text" id="schedule-${dia}" value="${data.horarios[dia]}">
        `;
        scheduleInputs.appendChild(inputGroup);
    });
}

function updateSchedules() {
    data.dias.forEach(dia => {
        const input = document.getElementById(`schedule-${dia}`);
        data.horarios[dia] = input.value;
    });
    saveData();
    generateNewSchedule();
}

// Update UI elements
function updateUI() {
    updateSelects();
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
    console.log('Generating tables with assignments:', assignments);
    scheduleContainer.innerHTML = '';

    for (let week = 0; week < 4; week++) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Create header row
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Día</th><th>Horario</th>';
        data.locales.forEach(local => {
            const th = document.createElement('th');
            th.textContent = local;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        
        // Create body rows
        data.dias.forEach((dia, diaIndex) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${dia}</td><td>${data.horarios[dia]}</td>`;
            
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
    initializeAssignmentTracker();

    for (let week = 0; week < 4; week++) {
        const weekAssignments = Array(data.locales.length)
            .fill(null)
            .map(() => Array(data.dias.length).fill(null).map(() => []));

        const totalShifts = data.locales.length * data.dias.length;
        const shiftsPerPerson = Math.ceil(totalShifts / data.personas.length);
        const peoplePerShift = Math.ceil(data.personas.length / totalShifts);

        // Distribute people across all shifts for the week
        for (let dia = 0; dia < data.dias.length; dia++) {
            const isWeekend = dia === 5 || dia === 6; // Assuming 5 is Saturday and 6 is Sunday

            for (let local = 0; local < data.locales.length; local++) {
                let availablePeople = data.personas
                    .filter(person => {
                        const tracker = assignmentTracker[person];
                        const notConsecutiveDay = (week * 7 + dia) - tracker.lastAssignedDay > 1 || tracker.lastAssignedDay === -2;
                        const notConsecutiveWeekend = !isWeekend || week - tracker.lastAssignedWeekend > 1 || tracker.lastAssignedWeekend === -1;
                        return tracker.totalAssignments < shiftsPerPerson * 4 && notConsecutiveDay && notConsecutiveWeekend;
                    })
                    .sort((a, b) => assignmentTracker[a].totalAssignments - assignmentTracker[b].totalAssignments);

                // If no one is available, relax the consecutive day constraint
                if (availablePeople.length === 0) {
                    availablePeople = data.personas
                        .filter(person => {
                            const tracker = assignmentTracker[person];
                            const notConsecutiveWeekend = !isWeekend || week - tracker.lastAssignedWeekend > 1 || tracker.lastAssignedWeekend === -1;
                            return tracker.totalAssignments < shiftsPerPerson * 4 && notConsecutiveWeekend;
                        })
                        .sort((a, b) => assignmentTracker[a].totalAssignments - assignmentTracker[b].totalAssignments);
                }

                for (let i = 0; i < peoplePerShift && i < availablePeople.length; i++) {
                    const person = availablePeople[i];
                    weekAssignments[local][dia].push(person);
                    assignmentTracker[person].lastAssignedDay = week * 7 + dia;
                    assignmentTracker[person].totalAssignments++;
                    if (isWeekend) {
                        assignmentTracker[person].lastAssignedWeekend = week;
                    }
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
        for (let i = 0; i < data.locales.length + 2; i++) {
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
    console.log('DOM fully loaded');
    loadData();
});