let data = [];
let currentWord = null;
let score = 0;

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
    console.log("startTraining called");
  const mode = document.getElementById("mode").value;
  if (mode === "derives") {
    let pickagain = true ;
    while (pickagain) {
        currentWord = data[Math.floor(Math.random() * data.length)];
        if (currentWord.derives === "") {
            pickagain = true;
        } else {
            pickagain = false;
        }
    }
  }
  else{
    currentWord = data[Math.floor(Math.random() * data.length)];
  }

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
  const userAnswer = document.getElementById("answer").value.toLowerCase().trim();
  const feedback = document.getElementById("feedback");
  // Désactive le bouton Vérifier
  document.getElementById("checkBtn").disabled = true;

  if (userAnswer === correct) {
    score++;
    updateScore();
    feedback.innerHTML = "<span style='color:green;'>✅ Correct !</span><br><button id='nextBtn'>Suivant</button>";
  } else {
    feedback.innerHTML = `
      <span style='color:red;'>❌ Incorrect.</span><br>
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