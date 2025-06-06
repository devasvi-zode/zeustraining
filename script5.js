const stateFips = {
  AL: "01", AK: "02", AZ: "04", AR: "05", CA: "06",
  CO: "08", CT: "09", DE: "10", DC: "11", FL: "12", GA: "13",
  HI: "15", ID: "16", IL: "17", IN: "18", IA: "19",
  KS: "20", KY: "21", LA: "22", ME: "23", MD: "24",
  MA: "25", MI: "26", MN: "27", MS: "28", MO: "29",
  MT: "30", NE: "31", NV: "32", NH: "33", NJ: "34",
  NM: "35", NY: "36", NC: "37", ND: "38", OH: "39",
  OK: "40", OR: "41", PA: "42", RI: "44", SC: "45",
  SD: "46", TN: "47", TX: "48", UT: "49", VT: "50",
  VA: "51", WA: "53", WV: "54", WI: "55", WY: "56"
};

document.getElementById('states').addEventListener('change', async function() {
  const stateAbbr = this.value;
  const districtsSelect = document.getElementById('districts');
  districtsSelect.innerHTML = '<option value="">Loading...</option>';
  
  if (!stateAbbr) {
    districtsSelect.innerHTML = '<option value="">Select District</option>';
    return;
  }

  const fips = stateFips[stateAbbr];
  if (!fips) {
    districtsSelect.innerHTML = '<option value="">No data available</option>';
    return;
  }

  try {
    const response = await fetch(`https://api.census.gov/data/2019/pep/population?get=NAME&for=county:*&in=state:${fips}`);
    const data = await response.json();

    districtsSelect.innerHTML = '<option value="">Select District</option>';
    
    for (let i = 1; i < data.length; i++) {
      const countyName = data[i][0];
      const countyCode = data[i][2];
      
      const option = document.createElement('option');
      option.value = countyCode;
      option.textContent = countyName;
      districtsSelect.appendChild(option);
    }
  } catch (error) {
    districtsSelect.innerHTML = '<option value="">Error loading districts</option>';
    console.error("Error fetching counties:", error);
  }
});
