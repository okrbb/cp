/**
 * MODERNIZOVANÝ SCRIPT.JS - 2025
 * Globálna premenná na uloženie dát o zamestnancoch po načítaní.
 */
let employeesData = [];

// --- ZAČIATOK ÚPRAVY: Nová funkcia pre notifikácie ---
// (Kód funkcie showToast() zostáva bezo zmeny)
function showToast(message, type = 'info', title = '', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const icons = {
        success: `<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        warning: `<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
        error: `<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>`,
        info: `<svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`,
    };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const titleHtml = title ? `<h4 class="toast-title">${title}</h4>` : '';
    toast.innerHTML = `
        <div class="toast-icon">
            ${icons[type] || icons['info']}
        </div>
        <div class="toast-content">
            ${titleHtml}
            <p class="toast-message">${message}</p>
        </div>
        <div class="toast-close">
            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
    `;
    container.appendChild(toast);
    const removeToast = () => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };
    const timer = setTimeout(removeToast, duration);
    toast.addEventListener('click', () => {
        clearTimeout(timer);
        removeToast();
    });
}
// --- KONIEC ÚPRAVY: Nová funkcia pre notifikácie ---

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

// --- ZAČIATOK ÚPRAVY (Názov súboru) ---
/**
 * Pomocná funkcia na "očistenie" textu pre použitie v názve súboru.
 * Odstráni diakritiku, špeciálne znaky, nahradí medzery podčiarkovníkmi
 * a kapitalizuje prvé písmeno.
 * @param {string} text - Vstupný text (napr. názov miesta).
 * @returns {string} - Očistený text.
 */
function sanitizeForFilename(text) {
    // Ak je text prázdny, vrátime upravenú predvolenú hodnotu
    if (!text) return "Nezadane_miesto"; 
    
    // Odstránenie diakritiky (napr. "Žilina" -> "Zilina")
    const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Prevedenie na malé písmená, nahradenie medzier za '_', odstránenie nebezpečných znakov
    let cleanedText = normalizedText
        .toLowerCase() // Najprv všetko na malé písmená
        .replace(/\s+/g, '_') // Nahradí jednu alebo viac medzier za _
        .replace(/[.,\\\/#!$%\^&\*;:{}=\-`~()?<>|"]/g, "") // Odstráni neplatné znaky
        .replace(/_+/g, '_') // Ak vznikli viacnásobné __, nahradí ich jedným
        .replace(/^_|_$/g, ''); // Odstráni prípadný _ na začiatku alebo konci

    // Ak po čistení nezostane nič, vrátime predvolenú hodnotu
    if (!cleanedText) return "Nezadane_miesto";

    // Kapitalizujeme prvé písmeno a vrátime výsledok
    // (napr. "nove_mesto" -> "Nove_mesto")
    return cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
}
// --- KONIEC ÚPRAVY (Názov súboru) ---


/**
 * Načíta zamestnancov z config.json a naplní rozbaľovací zoznam.
 */
async function loadEmployees() {
    // ... (kód funkcie bezo zmeny)
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
        selectElement.style.opacity = '0';
        setTimeout(() => {
            selectElement.style.transition = 'opacity 0.3s ease';
            selectElement.style.opacity = '1';
        }, 100);
    } catch (error) {
        console.error('Nepodarilo sa načítať zamestnancov:', error);
        selectElement.innerHTML = '<option value="">Chyba pri načítaní</option>';
        showToast(`Nepodarilo sa načítať zamestnancov: ${error.message}`, 'error', 'Chyba konfigurácie');
    }
}

/**
 * Naplní rozbaľovacie zoznamy pre čas (00:00 - 23:30).
 */
function populateTimeSelects() {
    // ... (kód funkcie bezo zmeny)
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
    // ... (kód funkcie bezo zmeny)
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
        if (selectedEmployee.ucet && selectedEmployee.ucet.trim() !== "") {
            showToast("Číslo účtu zamestnanca bolo úspešne načítané.", "success", "Info");
        } else {
            showToast("Pre vybraného zamestnanca nebolo nájdené číslo účtu (IBAN).", "warning", "Varovanie");
        }
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
    // ... (kód funkcie bezo zmeny)
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
    // ... (kód funkcie bezo zmeny)
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
            delimiters: { start: "{{", end: "}}" }
        });
        doc.setData(data);
        doc.render();
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        saveAs(out, filename);
        updateProgressIndicator(3);
        setTimeout(() => updateProgressIndicator(2), 2000);
        showToast("Cestovný príkaz bol úspešne vygenerovaný.", "success", "Hotovo");
    } catch (error) {
        console.error('Nastala chyba pri generovaní dokumentu:', error);
        showToast(`Nastala chyba: ${error.message}. Skontrolujte, či súbor files/cp.docx existuje.`, 'error', 'Chyba generovania');
    } finally {
        generateBtn.disabled = false;
        generateBtn.querySelector('span').textContent = 'Generovať Cestovný príkaz';
    }
}

// Pridanie 'listenerov' po načítaní stránky
window.addEventListener('load', function() {
    loadEmployees();
    populateTimeSelects();
    
    flatpickr.localize(flatpickr.l10ns.sk); 
    flatpickr("input[type='date']", {
        "dateFormat": "Y-m-d", 
        "altInput": true,
        "altFormat": "d.m. Y",
        "allowInput": true
    });
    
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
            
            // --- ZAČIATOK ÚPRAVY (Názov súboru - Dátum) ---
            
            // Získanie dátumu (rovnaká logika ako predtým)
            let standardDate = document.getElementById('datum_zc_datum').value;
            let dateForFilename = '';
            
            if (!standardDate) {
                standardDate = document.getElementById('datum_1').value;
            }
            
            if (!standardDate) {
                standardDate = new Date().toISOString().split('T')[0];
            }
            
            try {
                // Formát je VŽDY YYYY-MM-DD vďaka flatpickr
                const [year, month, day] = standardDate.split('-');
                
                // Požadovaný formát je ddmmyyyy (napr. 29102025)
                dateForFilename = `${day}${month}${year}`;
            
            } catch (e) {
                console.error("Chyba pri parsovaní dátumu pre názov súboru:", standardDate, e);
                dateForFilename = "neznamy_datum"; // Bezpečná hodnota
            }
            
            // --- KONIEC ÚPRAVY (Názov súboru - Dátum) ---
            
            // --- ÚPRAVA (Názov súboru - Miesto) ---
            
            // 1. Získame hodnotu 'miesto'
            const miestoValue = document.getElementById('miesto').value;
            
            // 2. Očistíme 'miesto' (funkcia už zabezpečí veľké písmeno)
            const miestoForFilename = sanitizeForFilename(miestoValue);

            // 3. Zostavíme finálny názov v tvare: cestovny_prikaz_Miesto_ddmmyyyy.docx
            const finalFilename = `cestovny_prikaz_${miestoForFilename}_${dateForFilename}.docx`;
            
            // --- KONIEC ÚPRAVY ---
            
            const selectedOEC = document.getElementById('zamestnanec').value;
            const selectedEmployee = employeesData.find(emp => emp.OEC === selectedOEC);
            
            if (!selectedEmployee) {
                showToast("Prosím, vyberte zamestnanca zo zoznamu.", "warning", "Chýbajúce údaje");
                return;
            }
            
            const menoPreSablonu = `${selectedEmployee.priezvisko}, ${selectedEmployee.meno}, ${selectedEmployee.titul}`;
            const oecPreSablonu = selectedEmployee.OEC;
            const adresaPreSablonu = selectedEmployee.adresa;
            const ucetPreSablonu = selectedEmployee.ucet || "";
            
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
                ucet: ucetPreSablonu,
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
