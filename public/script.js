let sviPodaci = [];
let plan = [];

function prikaziTablicu(podaci) {
    const tbody = document.querySelector('#vremenska-tablica tbody');
    tbody.innerHTML = '';
    if (podaci.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12">Nema podataka za odabrane filtere.</td></tr>';
        return;
    }
    for (const podatak of podaci) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${podatak.Temperature}</td>
            <td>${podatak.Humidity}</td>
            <td>${podatak['Wind Speed']}</td>
            <td>${podatak['Precipitation (%)']}</td>
            <td>${podatak['Cloud Cover']}</td>
            <td>${podatak['Atmospheric Pressure']}</td>
            <td>${podatak['UV Index']}</td>
            <td>${podatak.Season}</td>
            <td>${podatak['Visibility (km)']}</td>
            <td>${podatak.Location}</td>
            <td>${podatak['Weather Type']}</td>
            <td><button onclick="dodajUPlan(${sviPodaci.indexOf(podatak)})">Dodaj u plan putovanja</button></td>
        `;
        tbody.appendChild(row);
    }
}

function dodajUPlan(index) {
    const podatak = sviPodaci[index];
    if (!plan.includes(podatak)) {
        plan.push(podatak);
        osvjeziPlan();
    } else {
        alert('Ovaj dan je već u planu!');
    }
}

function osvjeziPlan() {
    const lista = document.getElementById('lista-plana');
    lista.innerHTML = '';
    plan.forEach((podatak, index) => {
        const li = document.createElement('li');
        li.textContent = `Dan: ${podatak.ID}, ${podatak.Temperature}°C, ${podatak.Location}`;
        const ukloniBtn = document.createElement('button');
        ukloniBtn.textContent = 'Ukloni';
        ukloniBtn.addEventListener('click', () => {
            ukloniIzPlana(index);
        });
        li.appendChild(ukloniBtn);
        lista.appendChild(li);
    });
}

function ukloniIzPlana(index) {
    plan.splice(index, 1);
    osvjeziPlan();
}

function filtriraj() {
    const sezona = document.getElementById('filter-season').value;
    const lokacija = document.getElementById('filter-location').value.trim().toLowerCase();
    const temp = parseInt(document.getElementById('filter-temp').value);

    const filtriraniPodaci = sviPodaci.filter(podatak => {
        const sezonaMatch = !sezona || podatak.Season === sezona;
        const lokacijaMatch = !lokacija || podatak.Location.toLowerCase().includes(lokacija);
        const tempMatch = podatak.Temperature >= temp && podatak.Temperature <= 60;
        return sezonaMatch && lokacijaMatch && tempMatch;
    });

    prikaziTablicu(filtriraniPodaci);
}

const tempInput = document.getElementById('filter-temp');
const tempDisplay = document.getElementById('temp-value');
tempInput.addEventListener('input', () => {
    tempDisplay.textContent = `${tempInput.value}°C`;
});

document.getElementById('primijeni-filtere').addEventListener('click', filtriraj);

document.getElementById('potvrdi-plan').addEventListener('click', () => {
    if (plan.length === 0) {
        alert('Plan je prazan!');
    } else {
        alert(`Uspješno ste isplanirali ${plan.length} dana za svoje aktivnosti na otvorenom!`);
        plan = [];
        osvjeziPlan();
    }
});

fetch('vrijeme.csv')
    .then(res => res.text())
    .then(csv => {
        const rezultat = Papa.parse(csv, {
            header: true,
            skipEmptyLines: true
        });
        sviPodaci = rezultat.data.map(podatak => ({
            ID: podatak.ID,
            Temperature: Number(podatak.Temperature),
            Humidity: Number(podatak.Humidity),
            'Wind Speed': Number(podatak['Wind Speed']),
            'Precipitation (%)': Number(podatak['Precipitation (%)']),
            'Cloud Cover': podatak['Cloud Cover'],
            'Atmospheric Pressure': Number(podatak['Atmospheric Pressure']),
            'UV Index': Number(podatak['UV Index']),
            Season: podatak.Season,
            'Visibility (km)': Number(podatak['Visibility (km)']),
            Location: podatak.Location,
            'Weather Type': podatak['Weather Type']
        }))
        prikaziTablicu(sviPodaci.slice(0, 10));
    })
    .catch(err => {
        console.error('Greška pri dohvaćanju CSV-a:', err);
    });