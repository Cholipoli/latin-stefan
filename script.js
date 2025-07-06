let data = [];
let currentWord = null;
let score = 0;

const genPlIum = [
  "canis",
  "hospes",
  "mors",
  "fames",
  "mens",
  "venter",
  "pars",
  "hostis",
  "urbs",      // féminin, attention !
  "arbor",
  "adulescens",
  "finis",
  "fines",     // forme au pluriel, mais accepté
  "panis",
  "aedilis"
];


const genPlUm = [
  "Venus",
  "pes",
  "homo",
  "os",
  "sacerdos",
  "magnitudo",
  "potestas",
  "Caesar",
  "imperator",
  "Iuppiter",
  "rex",
  "Apollo",
  "Mars",
  "miles"
];


function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
}

fetch("vocabulaire.csv")
  .then(response => response.text())
  .then(text => {
    const rows = text.trim().split("\n");
    const headers = parseCSVLine(rows.shift());
    data = rows.map(row => {
      const values = parseCSVLine(row);
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
      return obj;
    });
  });
function startTraining() {
document.getElementById("exercise").style.background = "#fff";
    console.log("startTraining called");
    const mode = document.getElementById("mode").value;

    // Récupère les leçons cochées
    const checkedLessons = Array.from(document.querySelectorAll('.lesson-checkbox:checked')).map(cb => cb.value);

    // Filtre les mots selon les leçons cochées
    let possibleWords = data.filter(word => checkedLessons.includes(word.lesson));

    // Si mode dérivés, filtre encore
    if (mode === "derives") {
        possibleWords = possibleWords.filter(word => word.derives && word.derives.trim() !== "");
    }

    // Si aucun mot possible, affiche un message et stoppe
    if (possibleWords.length === 0) {
        document.getElementById("exercise").innerHTML = "<span style='color:red;'>Aucun mot pour cette sélection de leçons.</span>";
        return;
    }

    // Tire un mot au hasard parmi les possibles
    currentWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];


  const container = document.getElementById("exercise");
  container.innerHTML = "";

  let question = "";
  let correctAnswer = "";

  if (mode === "latinToFr") {
    question = `Que signifie le mot latin : <strong>${currentWord.forme_complete}</strong> ?`;
    correctAnswer = currentWord.traduction_fr;
  } else if (mode === "frToLatin") {
    question = `Quel est le mot latin pour : <strong>${currentWord.traduction_fr}</strong> ?`;
    correctAnswer = currentWord.forme_complete;
  } else if (mode === "derives") {
    question = `Donne un dérivé du mot latin : <strong>${currentWord.forme_complete}</strong>`;
    correctAnswer = currentWord.derives || "(aucun dérivé spécifié)";
  } else if (mode === "declinaison") {
    let motdéclinéeténoncé = decliner(currentWord); //il recoit un mot et le renvoie avec sa déclinaison et la fin de l'énoncé
    question = `Quelle est la déclinaison du mot latin : <strong>${currentWord.forme_complete}</strong> au ${motdéclinéeténoncé[1]}</strong> ?`;
    correctAnswer = motdéclinéeténoncé[0];
  } else {
    container.innerHTML = "Mode à venir...";
    return;
  }

    const safeCorrect = correctAnswer.toLowerCase().replace(/'/g, "\\'");
    container.innerHTML = `
    <p>${question}</p>
    <input type="text" id="answer" placeholder="Ta réponse">
    <button id="checkBtn">Vérifier</button>
    <div id="feedback" style="margin-top: 10px;"></div>
    `;

    document.getElementById("checkBtn").onclick = function() {
    checkAnswer(correctAnswer.toLowerCase());
    };
}


function checkAnswer(correct) {
    const exerciseDiv = document.getElementById("exercise");

  const userAnswer = document.getElementById("answer").value.toLowerCase().trim();
  const feedback = document.getElementById("feedback");
  // Désactive le bouton Vérifier
  document.getElementById("checkBtn").disabled = true;
    if (userAnswer === correct) {
    exerciseDiv.style.background = "#d4ffd4";
    } else {
    exerciseDiv.style.background = "#ffd4d4";
    }
  if (userAnswer === correct) {
    score++;
    updateScore();
    feedback.innerHTML = "<span style='color:green;'>✅ Correct !</span> 🎉<br><button id='nextBtn'>Suivant</button>";
  } else {
    feedback.innerHTML = `
      <span style='color:red;'>❌ Incorrect.</span> 😢<br>
      <strong>Ta réponse :</strong> ${userAnswer || "(vide)"}<br>
      <strong>Bonne réponse :</strong> ${correct}<br>
      <button id='nextBtn'>Suivant</button>
    `;
  }

  document.getElementById("nextBtn").onclick = startTraining;
}

function updateScore() {
  document.getElementById("score").textContent = "Score : " + score;
}

function decliner(mot) {
    console.log("decliner called with mot:", mot);
    //decider le cas et le nombre
    let cas = Math.floor(Math.random() * (6 )); // 0 à 5
    let nombre = "";
    if (mot.sg_pl_lesdeux === "pl"){
        nombre = 1; // 1 pour pluriel
    }
    else {
        nombre = Math.floor(Math.random()* 2); // 0 pour singulier ou 1 pour pluriel
    }
    console.log("cas:", cas, "nombre:", nombre);

    let nomdescas = ["nominatif", "vocatif", "accusatif", "génitif", "datif", "ablatif"];
    let lescas = ["singulier", "pluriel"];

    let finénoncé = `${nomdescas[cas]} ${lescas[nombre]}`;
    console.log("finénoncé:", finénoncé);
    let declinaison = mot.declinaison;
    console.log("declinaison:", typeof(declinaison));
    if (declinaison === '1') {
        radical = mot.mot_latin.slice(0, -1);
        termaisons = [["a", "a", "am", "ae", "ae", "a"], ["ae", "ae", "as", "arum", "is", "is"]];
        let motdécliné = radical + termaisons[nombre][cas];
        console.log("motdécliné:", motdécliné);
        return [motdécliné, finénoncé];
    }
    else if (declinaison === '2') {
        if (mot.genre ==="m"){
            radical = mot.mot_latin.slice(0, -2);
            termaisons = [["us", "e", "um", "i", "o", "o"], ["i", "i", "os", "orum", "is", "is"]];
            let motdécliné = radical + termaisons[nombre][cas];
            console.log("motdécliné:", motdécliné);
            return [motdécliné, finénoncé];
        }
        else if (mot.genre ==="n"){
            radical = mot.mot_latin.slice(0, -2);
            termaisons = [["um", "um", "um", "i", "o", "o"], ["a", "a", "a", "orum", "is", "is"]];
            let motdécliné = radical + termaisons[nombre][cas];
            console.log("motdécliné:", motdécliné);
            return [motdécliné, finénoncé];
        }

    } else if (declinaison === '3') {
        if (mot.genre === "n") { // nom neutre
            if (mot.mot_latin.slice(-2) === "al" || mot.mot_latin.slice(-2) === "ar" || mot.mot_latin.slice(-1) === "e") { // terminaison en -al, -ar ou -e
                if (cas in [0, 1, 2] && nombre === 0) {
                    return [mot.mot_latin, finénoncé]; // nominatif, vocatif, accusatif singulier
                }
                else { 
                    if (mot.mot_latin.slice(-2) === "al") {
                        radical = mot.mot_latin.slice(0, -2);
                        termaisons = [["al", "al", "al", "is", "i", "i"], ["alia", "alia", "alia", "alium", "ibus", "ibus"]];
                        return [radical + termaisons[nombre][cas], finénoncé];
                    }
                    else if (mot.mot_latin.slice(-2) === "ar") {
                        radical = mot.mot_latin.slice(0, -2);
                        termaisons = [["ar", "ar", "ar", "is", "i", "i"], ["aria", "aria", "aria", "arium", "ibus", "ibus"]];
                        return [radical + termaisons[nombre][cas], finénoncé];
                    }
                    else if (mot.mot_latin.slice(-1) === "e") {
                        radical = mot.mot_latin.slice(0, -1);
                        termaisons = [["e", "e", "e", "is", "i", "i"], ["ia", "ia", "ia", "ium", "ibus", "ibus"]];
                        return [radical + termaisons[nombre][cas], finénoncé];
                    }
                }
                
            }
            else { // 3ème déclinaison neutre générique
                if (cas in [0, 1, 2] && nombre === 0) {
                    return [mot.mot_latin, finénoncé]; // nominatif, vocatif, accusatif singulier
                } else {
                    radical = getradical3eme(mot);
                    termaisons = [["", "", "", "is", "i", "e"], ["a", "a", "a", "um", "ibus", "ibus"]];
                    return [radical + termaisons[nombre][cas], finénoncé];
                }
            }
        }
        else { // nom masculin ou féminin
            if (cas in [0, 1] && nombre === 0) {
                return [mot.mot_latin, finénoncé]; // nominatif, vocatif, accusatif singulier
            }

            if (genPlIum.includes(mot.mot_latin.trim())) {
                radical = getradical3eme(mot);
                termaisons = [["", "", "em", "is", "i", "e"], ["es", "es", "es", "ium", "ibus", "ibus"]];
                return [radical + termaisons[nombre][cas], finénoncé];
            }
            else if (genPlUm.includes(mot.mot_latin.trim())) {
                radical = getradical3eme(mot);
                termaisons = [["", "", "em", "is", "i", "e"], ["es", "es", "es", "um", "ibus", "ibus"]];
                return [radical + termaisons[nombre][cas], finénoncé];
            }
            else {
                console.log('...',mot.mot_latin,"n'est pas dans les listes genPlIum ou genPlUm");
                console.log(genPlIum, genPlUm);
            }


        }
    }
}

function getradical3eme(mot) {
    let partiesdulemme = mot.forme_complete.split(", ");
    radical = partiesdulemme[1].slice(0, -2);
    console.log("radical:", radical);
    return radical;
}