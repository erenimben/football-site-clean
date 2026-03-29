const API_KEY = "bf310dcab41a6fea93bcbb94cdbc143b";

// ELEMENTLER
const preBtn = document.getElementById("preMatchBtn");
const liveBtn = document.getElementById("liveMatchBtn");

const preContainer = document.getElementById("preMatches");
const liveContainer = document.getElementById("liveMatches");
const statusText = document.getElementById("statusText");

let liveInterval = null;

// 🎯 MAÇ ANALİZİ (AI basit)
function analyzeMatch(match) {
  const homePower = Math.random() * 3;
  const awayPower = Math.random() * 3;

  let prediction = "";

  prediction += (homePower + awayPower > 2.5) ? "2.5 ÜST ⚽ " : "2.5 ALT 🧊 ";
  prediction += (homePower > 0.8 && awayPower > 0.8) ? "| KG VAR ✅ " : "| KG YOK ❌ ";

  if (homePower > awayPower) prediction += "| MS 1 🏠";
  else if (awayPower > homePower) prediction += "| MS 2 🚀";
  else prediction += "| BERABER 🤝";

  return prediction;
}

// 🎯 CANLI YORUM
function getLiveComment(minute, homeGoals, awayGoals) {
  const totalGoals = (homeGoals || 0) + (awayGoals || 0);

  if (minute < 20 && totalGoals === 0)
    return "Maç yeni başladı. Temkinli başlangıç var.";

  if (minute < 45 && totalGoals === 0)
    return "İlk yarıda gol baskısı artabilir.";

  if (totalGoals >= 3)
    return "Maç tempolu gidiyor. Üst seçenekleri öne çıkabilir.";

  if (homeGoals === awayGoals)
    return "Maç dengede. Beraberlik riski sürüyor.";

  if (homeGoals > awayGoals)
    return "Ev sahibi üstün oynuyor.";

  return "Deplasman avantajlı.";
}

// 📊 MAÇ ÖNCESİ
async function loadPreMatches() {
  statusText.textContent = "Maç öncesi yükleniyor...";

  try {
    const res = await fetch("https://v3.football.api-sports.io/fixtures?next=10", {
      headers: { "x-apisports-key": API_KEY }
    });

    const data = await res.json();
    preContainer.innerHTML = "";

    if (!data.response || data.response.length === 0) {
      statusText.textContent = "Maç bulunamadı ❌";
      return;
    }

    data.response.forEach(match => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
        <div class="meta">${match.league.name}</div>
        <div class="meta">${new Date(match.fixture.date).toLocaleString("tr-TR")}</div>

        <div class="ai-box">
          <strong>Tahmin:</strong>
          <p>${analyzeMatch(match)}</p>
        </div>
      `;

      preContainer.appendChild(div);
    });

    statusText.textContent = "Maç öncesi yüklendi ✅";

  } catch (err) {
    console.error(err);
    statusText.textContent = "Hata ❌";
  }
}

// 🔴 CANLI + BUGÜN
async function loadLiveMatches() {
  statusText.textContent = "Maçlar yükleniyor...";

  try {
    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ CANLI
    let res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": API_KEY }
    });

    let data = await res.json();

    // 2️⃣ CANLI YOKSA BUGÜN
    if (!data.response || data.response.length === 0) {
      res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: { "x-apisports-key": API_KEY }
      });

      data = await res.json();
    }

    liveContainer.innerHTML = "";

    if (!data.response || data.response.length === 0) {
      statusText.textContent = "Bugün maç yok ❌";
      return;
    }

    data.response.forEach(match => {
      const minute = match.fixture.status.elapsed ?? "-";
      const homeGoals = match.goals.home ?? 0;
      const awayGoals = match.goals.away ?? 0;

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
        <div class="meta">${match.league.name}</div>
        <div class="meta">Dakika: ${minute} | ${homeGoals} - ${awayGoals}</div>

        <div class="ai-box">
          <strong>Yorum:</strong>
          <p>${getLiveComment(
            typeof minute === "number" ? minute : 0,
            homeGoals,
            awayGoals
          )}</p>
        </div>
      `;

      liveContainer.appendChild(div);
    });

    statusText.textContent = "Veriler yüklendi ✅";

  } catch (err) {
    console.error(err);
    statusText.textContent = "API hata ❌";
  }
}

// 🎯 EVENTLER
preBtn.addEventListener("click", loadPreMatches);

liveBtn.addEventListener("click", () => {
  loadLiveMatches();

  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(loadLiveMatches, 30000);
});

// 🚀 OTOMATİK BAŞLAT
loadLiveMatches();
loadPreMatches();
liveInterval = setInterval(loadLiveMatches, 30000);
