const API_KEY = "bf310dcab41a6fea93bcbb94cdbc143b";

const preBtn = document.getElementById("preMatchBtn");
const liveBtn = document.getElementById("liveMatchBtn");

const preContainer = document.getElementById("preMatches");
const liveContainer = document.getElementById("liveMatches");
const statusText = document.getElementById("statusText");

let liveInterval = null;

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

        <div>
          <span class="tag">Canlı Analiz</span>
          <span class="tag">Dakika ${minute}</span>
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

function prepareSite() {
  preContainer.innerHTML = `
    <div class="card">
      <h3>Maç Öncesi Analiz</h3>
      <div class="meta">Bu bölüm bir sonraki aşamada açılacak.</div>
      <div class="ai-box">
        <strong>Bilgi:</strong>
        <p>Şimdilik canlı analiz sistemi aktif bırakıldı.</p>
      </div>
    </div>
  `;
}

preBtn.addEventListener("click", () => {
  prepareSite();
  statusText.textContent = "Maç öncesi bölümü hazırlık aşamasında";
});

liveBtn.addEventListener("click", () => {
  loadLiveMatches();

  if (liveInterval) clearInterval(liveInterval);
  liveInterval = setInterval(loadLiveMatches, 30000);
});

prepareSite();
loadLiveMatches();
liveInterval = setInterval(loadLiveMatches, 30000);