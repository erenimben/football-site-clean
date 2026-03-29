const API_KEY = "bf310dcab41a6fea93bcbb94cdbc143b";

const preBtn = document.getElementById("preMatchBtn");
const liveBtn = document.getElementById("liveMatchBtn");

const preContainer = document.getElementById("preMatches");
const liveContainer = document.getElementById("liveMatches");
const statusText = document.getElementById("statusText");

let liveInterval = null;

function analyzeMatch(match) {
  const homePower = Math.random() * 3;
  const awayPower = Math.random() * 3;

  let prediction = "";

  if (homePower + awayPower > 2.5) {
    prediction += "2.5 ÜST ⚽ ";
  } else {
    prediction += "2.5 ALT 🧊 ";
  }

  if (homePower > 0.8 && awayPower > 0.8) {
    prediction += "| KG VAR ✅ ";
  } else {
    prediction += "| KG YOK ❌ ";
  }

  if (homePower > awayPower) {
    prediction += "| MS 1 🏠";
  } else if (awayPower > homePower) {
    prediction += "| MS 2 🚀";
  } else {
    prediction += "| BERABER 🤝";
  }

  return prediction;
}

function getLiveComment(minute, homeGoals, awayGoals) {
  const totalGoals = (homeGoals || 0) + (awayGoals || 0);

  if (minute < 20 && totalGoals === 0) {
    return "Maç yeni başladı. Temkinli başlangıç var.";
  }

  if (minute >= 20 && minute < 45 && totalGoals === 0) {
    return "İlk yarıda gol baskısı artabilir.";
  }

  if (totalGoals >= 3) {
    return "Maç tempolu gidiyor. Üst seçenekleri öne çıkabilir.";
  }

  if (homeGoals === awayGoals) {
    return "Maç dengede. Beraberlik riski sürüyor.";
  }

  if (homeGoals > awayGoals) {
    return "Ev sahibi şu an üstün oynuyor gibi görünüyor.";
  }

  return "Deplasman tarafı skor avantajını koruyor.";
}

async function loadPreMatches() {
  statusText.textContent = "Maç öncesi yükleniyor...";

  try {
    const res = await fetch("https://v3.football.api-sports.io/fixtures?next=10", {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    const data = await res.json();
    preContainer.innerHTML = "";

    if (!data.response || data.response.length === 0) {
      statusText.textContent = "Maç bulunamadı ❌";
      return;
    }

    data.response.forEach((match) => {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const date = match.fixture.date;
      const league = match.league.name;

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${home} vs ${away}</h3>
        <div class="meta">${league}</div>
        <div class="meta">${new Date(date).toLocaleString("tr-TR")}</div>

        <div class="ai-box">
          <strong>Maç Öncesi Tahmin:</strong>
          <p>${analyzeMatch(match)}</p>
        </div>
      `;

      preContainer.appendChild(div);
    });

    statusText.textContent = "Maç öncesi yüklendi ✅";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Maç öncesi hata ❌";
  }
}

async function loadLiveMatches() {
  statusText.textContent = "Canlı maçlar yükleniyor...";

  try {
    const res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY
      }
    });

    const data = await res.json();
    liveContainer.innerHTML = "";

    if (!data.response || data.response.length === 0) {
      statusText.textContent = "Şu anda canlı maç yok";
      return;
    }

    data.response.forEach((match) => {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const minute = match.fixture.status.elapsed ?? 0;
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;
      const league = match.league.name;

      const comment = getLiveComment(minute, homeGoals, awayGoals);

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${home} vs ${away}</h3>
        <div class="meta">${league}</div>
        <div class="meta">Dakika: ${minute} | Skor: ${homeGoals} - ${awayGoals}</div>

        <div class="ai-box">
          <strong>Canlı Yorum:</strong>
          <p>${comment}</p>
        </div>
      `;

      liveContainer.appendChild(div);
    });

    statusText.textContent = "Canlı veriler güncellendi ✅";
  } catch (error) {
    console.error(error);
    statusText.textContent = "Bağlantı hatası ❌";
  }
}

preBtn.addEventListener("click", loadPreMatches);

liveBtn.addEventListener("click", () => {
  loadLiveMatches();

  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(loadLiveMatches, 30000);
});

loadLiveMatches();
liveInterval = setInterval(loadLiveMatches, 30000);
loadPreMatches();
