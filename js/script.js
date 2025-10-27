/** * MODERNIZOVANÝ SCRIPT.JS - 2025 
 * Globálna premenná na uloženie dát o zamestnancoch po načítaní. 
 */
let employeesData = [];

/**
 * Pomocná funkcia na formátovanie dátumu z 'YYYY-MM-DD' na 'DD.MM.YYYY'.
 */
function formatDate(dateString) {
    if (!dateString) return "";
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    } catch (e) {
        console.error("Chyba pri formátovaní dátumu:", e);
        return dateString;
    }
}

/**
 * Načíta zamestnancov z config.json a naplní rozbaľovací zoznam.
 */
async function loadEmployees() {
    const selectElement = document.getElementById('zamestnanec');
    try {
        const response = await fetch('files/config.json');
        if (!response.ok) {
            throw new Error(`Chyba pri načítaní config.json: ${response.statusText}`);
        }
        
        employeesData = await response.json();
        selectElement.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "";
        defaultOption.required = true;
        selectElement.appendChild(defaultOption);
        
        employeesData.sort((a, b) => a.priezvisko.localeCompare(b.priezvisko));
        
        employeesData.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.OEC;
            option.textContent = `${emp.priezvisko} ${emp.meno}, ${emp.titul}`;
            selectElement.appendChild(option);
        });
        
        // Animácia načítania
        selectElement.style.opacity = '0';
        setTimeout(() => {
            selectElement.style.transition = 'opacity 0.3s ease';
            selectElement.style.opacity = '1';
        }, 100);
        
    } catch (error) {
        console.error('Nepodarilo sa načítať zamestnancov:', error);
        selectElement.innerHTML = '<option value="">Chyba pri načítaní</option>';
    }
}

/**
 * Naplní rozbaľovacie zoznamy pre čas (00:00 - 23:30).
 */
function populateTimeSelects() {
    const selects = [
        document.getElementById('datum_zc_cas'), 
        document.getElementById('datum_kc_cas')
    ];
    
    selects.forEach(select => {
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                const timeString = `${hour}:${minute}`;
                
                const option = document.createElement('option');
                option.value = timeString;
                option.textContent = timeString;
                select.appendChild(option);
            }
        }
    });
    
    document.getElementById('datum_zc_cas').value = "07:30";
    document.getElementById('datum_kc_cas').value = "15:30";
}

/**
 * Zobrazí detaily vybraného zamestnanca v sidebare.
 */
function displayEmployeeDetails(event) {
    const selectedOEC = event.target.value;
    const detailsContainer = document.getElementById('employee-details');
    
    if (!selectedOEC) {
        detailsContainer.innerHTML = '';
        updateProgressIndicator(1);
        return;
    }
    
    const selectedEmployee = employeesData.find(emp => emp.OEC === selectedOEC);
    
    if (selectedEmployee) {
        detailsContainer.innerHTML = `
            <p><strong>Meno:</strong> ${selectedEmployee.meno} ${selectedEmployee.priezvisko}, ${selectedEmployee.titul}</p>
            <p><strong>Osobné číslo:</strong> ${selectedEmployee.OEC}</p>
            <p><strong>Trvalý pobyt:</strong> ${selectedEmployee.adresa}</p>
        `;
        
        // Animácia zobrazenia
        detailsContainer.style.animation = 'slideIn 0.4s ease-out';
        updateProgressIndicator(2);
    } else {
        detailsContainer.innerHTML = '';
    }
}

/**
 * Aktualizuje progress indicator
 */
function updateProgressIndicator(step) {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

/**
 * Hlavná funkcia na načítanie šablóny, vloženie dát a generovanie súboru.
 */
async function generateDocx(data, filename) {
    const templatePath = 'files/cp.docx';
    const generateBtn = document.getElementById('generate-btn');
    
    generateBtn.disabled = true;
    generateBtn.querySelector('span').textContent = 'Generujem...';
    
    try {
        const response = await fetch(templatePath);
        if (!response.ok) {
            throw new Error(`Chyba pri načítaní šablóny: ${response.statusText}`);
        }
        
        const content = await response.arrayBuffer();
        const zip = new PizZip(content);
        
        const doc = new window.docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: {
                start: "{{",
                end: "}}"
            }
        });
        
        doc.setData(data);
        doc.render();
        
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        
        saveAs(out, filename);
        
        // Success animation
        updateProgressIndicator(3);
        setTimeout(() => updateProgressIndicator(2), 2000);
        
    } catch (error) {
        console.error('Nastala chyba pri generovaní dokumentu:', error);
        alert(`Nastala chyba: ${error.message}. Skontrolujte, či súbor files/cp.docx existuje a je prístupný.`);
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector('span').textContent = 'Generovať cestovný príkaz';
    }
}

// Pridanie 'listenerov' po načítaní stránky
window.addEventListener('load', function() {
    loadEmployees();
    populateTimeSelects();
    
    document.getElementById('zamestnanec').addEventListener('change', displayEmployeeDetails);
    
    const form = document.getElementById('cp-form');
    if (form) {
        form.addEventListener('reset', function() {
            document.getElementById('employee-details').innerHTML = '';
            document.getElementById('main-content-scrollable').scrollTop = 0;
            updateProgressIndicator(1);
            
            setTimeout(() => {
                document.getElementById('datum_zc_cas').value = '07:30';
                document.getElementById('datum_kc_cas').value = '15:30';
            }, 0);
        });
        
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let standardDate = document.getElementById('datum_zc_datum').value;
            let dateForFilename = '';
            
            if (!standardDate) {
                standardDate = document.getElementById('datum_1').value;
            }
            
            if (!standardDate) {
                standardDate = new Date().toISOString().split('T')[0];
            }
            
            try {
                const [year, month, day] = standardDate.split('-');
                dateForFilename = `${day}-${month}-${year}`;
            } catch (e) {
                dateForFilename = standardDate.replace(/\./g, '-');
            }
            
            const finalFilename = `cestovny_prikaz_${dateForFilename}.docx`;
            
            const selectedOEC = document.getElementById('zamestnanec').value;
            const selectedEmployee = employeesData.find(emp => emp.OEC === selectedOEC);
            
            if (!selectedEmployee) {
                alert("Prosím, vyberte zamestnanca zo zoznamu.");
                return;
            }
            
            const menoPreSablonu = `${selectedEmployee.priezvisko}, ${selectedEmployee.meno}, ${selectedEmployee.titul}`;
            const oecPreSablonu = selectedEmployee.OEC;
            const adresaPreSablonu = selectedEmployee.adresa;
            
            const datum_zc_formatted = formatDate(document.getElementById('datum_zc_datum').value);
            const cas_zc = document.getElementById('datum_zc_cas').value;
            const datum_zc_final = `${datum_zc_formatted}, ${cas_zc}`;
            
            const datum_kc_formatted = formatDate(document.getElementById('datum_kc_datum').value);
            const cas_kc = document.getElementById('datum_kc_cas').value;
            const datum_kc_final = `${datum_kc_formatted}, ${cas_kc}`;
            
            const formData = {
                meno: menoPreSablonu,
                OEC: oecPreSablonu,
                adresa: adresaPreSablonu,
                ucel: document.getElementById('ucel').value,
                miesto: document.getElementById('miesto').value,
                datum_zc: datum_zc_final,
                datum_kc: datum_kc_final,
                spolucestujuci: document.getElementById('spolucestujuci').value,
                datum_1: formatDate(document.getElementById('datum_1').value),
                datum_2: formatDate(document.getElementById('datum_2').value),
                cesta_z1: document.getElementById('cesta_z1').value,
                miesto_1: document.getElementById('miesto_1').value,
                cesta_k1: document.getElementById('cesta_k1').value,
                cesta_z2: document.getElementById('cesta_z2').value,
                miesto_2: document.getElementById('miesto_2').value,
                cesta_k2: document.getElementById('cesta_k2').value,
                cesta_z3: document.getElementById('cesta_z3').value,
                miesto_3: document.getElementById('miesto_3').value,
                cesta_k3: document.getElementById('cesta_k3').value,
            };
            
            generateDocx(formData, finalFilename);
        });
    }
});